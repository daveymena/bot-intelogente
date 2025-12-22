'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Key, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function ActivateLicensePage() {
  const router = useRouter();
  const [licenseKey, setLicenseKey] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [licenseStatus, setLicenseStatus] = useState<any>(null);
  const [machineId, setMachineId] = useState('');

  useEffect(() => {
    checkLicenseStatus();
  }, []);

  const checkLicenseStatus = async () => {
    try {
      const response = await fetch('/api/license/check');
      const data = await response.json();
      setLicenseStatus(data);
      setMachineId(data.machineId || '');

      // Si la licencia es válida, redirigir al dashboard
      if (data.valid) {
        setTimeout(() => router.push('/'), 2000);
      }
    } catch (error) {
      console.error('Error checking license:', error);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/license/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: licenseKey, email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setTimeout(() => router.push('/'), 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al activar licencia' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/license/trial', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setTimeout(() => router.push('/'), 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al iniciar prueba' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const formatLicenseKey = (value: string) => {
    // Remover caracteres no válidos
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // Agregar guiones cada 4 caracteres
    const parts: string[] = [];
    for (let i = 0; i < cleaned.length && i < 16; i += 4) {
      parts.push(cleaned.substring(i, i + 4));
    }
    
    return parts.join('-');
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatLicenseKey(e.target.value);
    setLicenseKey(formatted);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-indigo-600" />
          </div>
          <CardTitle className="text-3xl">Activación de Licencia</CardTitle>
          <CardDescription>
            Smart Sales Bot Pro - Sistema de Ventas Inteligente
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Estado actual de licencia */}
          {licenseStatus && (
            <Alert className={`mb-6 ${licenseStatus.valid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-start gap-3">
                {licenseStatus.valid ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <AlertDescription>
                    <strong>{licenseStatus.message}</strong>
                    {licenseStatus.daysRemaining && (
                      <p className="mt-1 text-sm">
                        Días restantes: <strong>{licenseStatus.daysRemaining}</strong>
                      </p>
                    )}
                    {licenseStatus.type && (
                      <p className="mt-1 text-sm">
                        Tipo: <strong className="uppercase">{licenseStatus.type}</strong>
                      </p>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          {/* Machine ID */}
          {machineId && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">ID de Máquina:</p>
              <code className="text-xs bg-white px-2 py-1 rounded border break-all">
                {machineId}
              </code>
              <p className="text-xs text-gray-500 mt-2">
                Proporciona este ID al adquirir una licencia vinculada a esta máquina
              </p>
            </div>
          )}

          <Tabs defaultValue="activate" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="activate">
                <Key className="h-4 w-4 mr-2" />
                Activar Licencia
              </TabsTrigger>
              <TabsTrigger value="trial">
                <Clock className="h-4 w-4 mr-2" />
                Prueba Gratuita
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activate">
              <form onSubmit={handleActivate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Clave de Licencia
                  </label>
                  <Input
                    type="text"
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    value={licenseKey}
                    onChange={handleKeyChange}
                    maxLength={19}
                    className="font-mono text-center text-lg"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ingresa la clave de 16 caracteres que recibiste
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Debe coincidir con el email de compra
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || licenseKey.length < 19}
                >
                  {loading ? 'Activando...' : 'Activar Licencia'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="trial">
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Período de Prueba Gratuito
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✓ 10 días de acceso completo</li>
                    <li>✓ Todas las funcionalidades incluidas</li>
                    <li>✓ Sin tarjeta de crédito requerida</li>
                    <li>✓ Vinculado a esta máquina</li>
                  </ul>
                </div>

                <Button
                  onClick={handleStartTrial}
                  className="w-full"
                  variant="outline"
                  disabled={loading || (licenseStatus?.type === 'trial')}
                >
                  {loading ? 'Iniciando...' : 'Iniciar Prueba Gratuita'}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  Solo puedes usar el período de prueba una vez por máquina
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Mensaje de resultado */}
          {message && (
            <Alert className={`mt-4 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {/* Información de compra */}
          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-gray-600 mb-2">
              ¿Necesitas una licencia?
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button variant="link" size="sm">
                Comprar Licencia Mensual
              </Button>
              <Button variant="link" size="sm">
                Comprar Licencia Anual
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
