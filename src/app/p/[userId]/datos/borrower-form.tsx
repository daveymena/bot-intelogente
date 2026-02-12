'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLOMBIAN_BANKS, ACCOUNT_TYPES, COUNTRIES } from '@/lib/bank-data';
import { CheckCircle2, Loader2, AlertCircle, Banknote, User, Phone, Mail, CreditCard, MapPin, Globe } from 'lucide-react';

interface BorrowerFormProps {
  userId: string;
}

export default function BorrowerForm({ userId }: BorrowerFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    idNumber: '',
    address: '',
    country: 'CO',
    bankName: '',
    accountNumber: '',
    accountType: 'ahorros',
    customBank: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const dataToSend = {
      ...formData,
      userId,
      bankName: formData.country === 'CO' && formData.bankName !== 'otro' 
        ? formData.bankName 
        : formData.customBank
    };

    try {
      const response = await fetch('/api/borrowers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(result.error || 'Ocurrió un error inesperado');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-neutral-800">¡Registro Exitoso!</h2>
        <p className="mt-4 text-neutral-600">
          Tu información ha sido enviada al prestamista correctamente. 
          Pronto se pondrán en contacto contigo.
        </p>
        <button 
          onClick={() => window.close()} 
          className="mt-8 px-6 py-2 bg-neutral-100 text-neutral-600 rounded-lg hover:bg-neutral-200 transition-colors"
        >
          Cerrar Ventana
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sección: Datos Personales */}
      <div className="space-y-4">
        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">Información Personal</label>
        
        <div className="relative">
          <User className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
          <input
            required
            type="text"
            name="name"
            placeholder="Nombre completo"
            value={formData.name}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
            <input
              required
              type="tel"
              name="phone"
              placeholder="WhatsApp"
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="relative">
            <CreditCard className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              name="idNumber"
              placeholder="Cédula / ID"
              value={formData.idNumber}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico (Opcional)"
            value={formData.email}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            name="address"
            placeholder="Dirección de residencia"
            value={formData.address}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {/* Sección: Datos Bancarios */}
      <div className="space-y-4 pt-4">
        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">Información para Desembolso</label>
        
        <div className="relative">
          <Globe className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
          >
            {COUNTRIES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {formData.country === 'CO' ? (
          <div className="relative">
            <Banknote className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
            <select
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
            >
              <option value="">Selecciona tu banco</option>
              {COLOMBIAN_BANKS.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
              <option value="otro">Otro banco...</option>
            </select>
          </div>
        ) : null}

        {(formData.country !== 'CO' || formData.bankName === 'otro') && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="relative"
          >
            <Banknote className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
            <input
              required
              type="text"
              name="customBank"
              placeholder="Nombre del Banco"
              value={formData.customBank}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-2.5 bg-neutral-100 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </motion.div>
        )}

        <div className="relative">
          <CreditCard className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
          <input
            required
            type="text"
            name="accountNumber"
            placeholder="Número de cuenta o celular"
            value={formData.accountNumber}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="flex gap-2">
          {ACCOUNT_TYPES.map(type => (
            <button
              key={type.id}
              type="button"
              onClick={() => setFormData(p => ({ ...p, accountType: type.id }))}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                formData.accountType === type.id 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' 
                  : 'bg-white border-neutral-200 text-neutral-500'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:scale-100 transition-all flex items-center justify-center gap-3 mt-8"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Enviando datos...
          </>
        ) : (
          <>
            Enviar Información
            <CheckCircle2 className="w-5 h-5" />
          </>
        )}
      </button>

      <p className="text-[10px] text-neutral-400 text-center leading-relaxed">
        Al enviar este formulario acepto que mis datos sean tratados únicamente con fines de gestión de préstamos y verificación de identidad por parte del prestamista.
      </p>
    </form>
  );
}
