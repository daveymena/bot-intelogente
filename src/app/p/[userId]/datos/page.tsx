import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import BorrowerForm from './borrower-form';

export default async function BorrowerRegistrationPage({
  params
}: {
  params: { userId: string }
}) {
  const { userId } = params;

  // Buscar al prestamista
  const lender = await db.user.findUnique({
    where: { id: userId },
    select: { 
      id: true, 
      businessName: true, 
      name: true 
    }
  });

  if (!lender) {
    return notFound();
  }

  const lenderName = lender.businessName || lender.name || 'Prestamista';

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-100">
        <div className="px-6 py-8 bg-gradient-to-br from-indigo-600 to-violet-700 text-white text-center">
          <h1 className="text-2xl font-bold">Registro de Información</h1>
          <p className="mt-2 text-indigo-100 opacity-90">
            Para: <span className="font-semibold">{lenderName}</span>
          </p>
        </div>
        
        <div className="px-6 py-8">
          <p className="text-sm text-neutral-500 mb-8 text-center italic">
            Por favor ingresa tus datos de forma precisa para agilizar el proceso de desembolso.
          </p>
          
          <BorrowerForm userId={userId} />
        </div>
      </div>
      
      <div className="mt-8 text-center text-neutral-400 text-xs">
        <p>&copy; {new Date().getFullYear()} Bot Inteligente - Sistema de Automatización</p>
      </div>
    </div>
  );
}
