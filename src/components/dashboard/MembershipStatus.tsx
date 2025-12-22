'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface MembershipData {
  type: string;
  endsAt: string | null;
  isActive: boolean;
  daysRemaining: number | null;
}

export default function MembershipStatus() {
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembership();
  }, []);

  const fetchMembership = async () => {
    try {
      const response = await fetch('/api/memberships/status');
      const data = await response.json();
      setMembership(data);
    } catch (error) {
      console.error('Error fetching membership:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (!membership) return null;

  const getMembershipColor = () => {
    if (!membership.isActive) return 'red';
    if (membership.type === 'TRIAL') return 'blue';
    if (membership.type === 'FREE') return 'gray';
    return 'green';
  };

  const getMembershipLabel = () => {
    const labels: Record<string, string> = {
      FREE: 'Gratuito',
      TRIAL: 'Prueba Gratuita',
      BASIC: 'Plan Mensual',
      PROFESSIONAL: 'Plan Trimestral',
      ENTERPRISE: 'Plan Anual',
    };
    return labels[membership.type] || membership.type;
  };

  const color = getMembershipColor();
  const bgColor = `bg-${color}-50`;
  const textColor = `text-${color}-700`;
  const borderColor = `border-${color}-200`;

  return (
    <div className={`rounded-lg shadow p-6 border-2 ${
      color === 'red' ? 'bg-red-50 border-red-200' :
      color === 'blue' ? 'bg-blue-50 border-blue-200' :
      color === 'gray' ? 'bg-gray-50 border-gray-200' :
      'bg-green-50 border-green-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-600">Tu Membresía</h3>
          <p className={`text-2xl font-bold ${
            color === 'red' ? 'text-red-700' :
            color === 'blue' ? 'text-blue-700' :
            color === 'gray' ? 'text-gray-700' :
            'text-green-700'
          }`}>
            {getMembershipLabel()}
          </p>
        </div>
        <div className={`p-3 rounded-full ${
          color === 'red' ? 'bg-red-100' :
          color === 'blue' ? 'bg-blue-100' :
          color === 'gray' ? 'bg-gray-100' :
          'bg-green-100'
        }`}>
          {membership.isActive ? (
            <svg className={`w-6 h-6 ${
              color === 'red' ? 'text-red-600' :
              color === 'blue' ? 'text-blue-600' :
              color === 'gray' ? 'text-gray-600' :
              'text-green-600'
            }`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>

      {membership.endsAt && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {membership.isActive ? 'Vence en:' : 'Venció el:'}
          </p>
          <p className="text-lg font-semibold text-gray-900">
            {new Date(membership.endsAt).toLocaleDateString('es-CO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          {membership.daysRemaining !== null && membership.daysRemaining >= 0 && (
            <p className={`text-sm font-medium ${
              membership.daysRemaining <= 3 ? 'text-red-600' :
              membership.daysRemaining <= 7 ? 'text-orange-600' :
              'text-gray-600'
            }`}>
              {membership.daysRemaining === 0 ? 'Vence hoy' :
               membership.daysRemaining === 1 ? 'Vence mañana' :
               `${membership.daysRemaining} días restantes`}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        {!membership.isActive || (membership.daysRemaining !== null && membership.daysRemaining <= 7) ? (
          <Link
            href="/membresias"
            className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {!membership.isActive ? 'Renovar Membresía' : 'Renovar Ahora'}
          </Link>
        ) : (
          <Link
            href="/membresias"
            className="block w-full text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
          >
            Ver Planes
          </Link>
        )}
      </div>
    </div>
  );
}
