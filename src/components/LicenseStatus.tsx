'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, Clock, Key } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LicenseInfo {
  valid: boolean;
  message: string;
  daysRemaining?: number;
  type?: string;
  license?: {
    type: string;
    email: string;
    expiresAt: string;
    features: string[];
    activatedAt: string;
  };
}

export function LicenseStatus() {
  const router = useRouter();
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLicense();
    // Verificar cada hora
    const interval = setInterval(checkLicense, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkLicense = async () => {
    try {
      const response = await fetch('/api/license/check');
      const data = await response.json();
      setLicenseInfo(data);
    } catch (error) {
      console.error('Error checking license:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="h-4 w-4 animate-spin" />
            <span className="text-sm">Verificando licencia...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!licenseInfo) return null;

  const getStatusColor = () => {
    if (!licenseInfo.valid) return 'text-red-600 bg-red-50 border-red-200';
    if (licenseInfo.daysRemaining && licenseInfo.daysRemaining <= 7) {
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getStatusIcon = () => {
    if (!licenseInfo.valid) return <AlertTriangle className="h-5 w-5" />;
    if (licenseInfo.daysRemaining && licenseInfo.daysRemaining <= 7) {
      return <Clock className="h-5 w-5" />;
    }
    return <CheckCircle className="h-5 w-5" />;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      trial: 'Prueba',
      monthly: 'Mensual',
      yearly: 'Anual',
      lifetime: 'Permanente',
    };
    return labels[type] || type;
  };

  return (
    <Card className={`border-2 ${getStatusColor()}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5" />
          Estado de Licencia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          {getStatusIcon()}
          <div className="flex-1">
            <p className="font-medium">{licenseInfo.message}</p>
            
            {licenseInfo.valid && licenseInfo.license && (
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {getTypeLabel(licenseInfo.license.type)}
                  </Badge>
                  {licenseInfo.daysRemaining && (
                    <span className="text-gray-600">
                      {licenseInfo.daysRemaining} días restantes
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600">
                  Email: {licenseInfo.license.email}
                </p>
                
                <p className="text-gray-600">
                  Expira: {new Date(licenseInfo.license.expiresAt).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}

            {licenseInfo.valid && licenseInfo.type === 'trial' && licenseInfo.daysRemaining && licenseInfo.daysRemaining <= 3 && (
              <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs">
                ⚠️ Tu período de prueba está por expirar. Activa una licencia para continuar usando el sistema.
              </div>
            )}
          </div>
        </div>

        {!licenseInfo.valid && (
          <Button
            onClick={() => router.push('/activate-license')}
            className="w-full"
            size="sm"
          >
            <Key className="h-4 w-4 mr-2" />
            Activar Licencia
          </Button>
        )}

        {licenseInfo.valid && licenseInfo.type === 'trial' && (
          <Button
            onClick={() => router.push('/activate-license')}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <Key className="h-4 w-4 mr-2" />
            Actualizar a Licencia Completa
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
