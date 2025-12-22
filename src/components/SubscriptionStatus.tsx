'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Zap
} from 'lucide-react';

interface SubscriptionInfo {
  valid: boolean;
  subscription?: {
    plan: string;
    status: string;
    expiresAt: string;
    features: string[];
    limits: {
      maxMessages: number;
      maxProducts: number;
      maxConversations: number;
    };
  };
  message: string;
  daysRemaining?: number;
}

interface UsageStats {
  messages: { current: number; limit: number };
  products: { current: number; limit: number };
  conversations: { current: number; limit: number };
}

export function SubscriptionStatus() {
  const router = useRouter();
  const [subInfo, setSubInfo] = useState<SubscriptionInfo | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionInfo();
    // Actualizar cada hora
    const interval = setInterval(loadSubscriptionInfo, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadSubscriptionInfo = async () => {
    try {
      // Cargar info de suscripción
      const subResponse = await fetch('/api/subscription/status');
      
      if (!subResponse.ok) {
        // Si no está autenticado o hay error, no mostrar nada
        setLoading(false);
        return;
      }
      
      const subData = await subResponse.json();
      setSubInfo(subData);

      // Cargar estadísticas de uso
      const usageResponse = await fetch('/api/subscription/usage');
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setUsage(usageData);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      // No mostrar el componente si hay error
      setSubInfo(null);
    } finally {
      setLoading(false);
    }
  };

  // No mostrar nada mientras carga o si no hay info
  if (loading || !subInfo) {
    return null;
  }

  const getPlanColor = (plan: string) => {
    const colors: Record<string, string> = {
      free: 'bg-gray-100 text-gray-800',
      basic: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-orange-100 text-orange-800',
    };
    return colors[plan] || colors.free;
  };

  const getPlanIcon = (plan: string) => {
    const icons: Record<string, any> = {
      free: Clock,
      basic: Zap,
      pro: Crown,
      enterprise: TrendingUp,
    };
    const Icon = icons[plan] || Clock;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusColor = () => {
    if (!subInfo.valid) return 'border-red-200 bg-red-50';
    if (subInfo.daysRemaining && subInfo.daysRemaining <= 7) {
      return 'border-yellow-200 bg-yellow-50';
    }
    return 'border-green-200 bg-green-50';
  };

  const calculatePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // Ilimitado
    return Math.min((current / limit) * 100, 100);
  };

  return (
    <Card className={`border-2 ${getStatusColor()}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {subInfo.valid ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            Estado de Suscripción
          </CardTitle>
          
          {subInfo.subscription && (
            <Badge className={getPlanColor(subInfo.subscription.plan)}>
              {getPlanIcon(subInfo.subscription.plan)}
              <span className="ml-1 uppercase">{subInfo.subscription.plan}</span>
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mensaje de estado */}
        <div className="text-sm">
          <p className="font-medium">{subInfo.message}</p>
          {subInfo.daysRemaining !== undefined && (
            <p className="text-gray-600 mt-1">
              {subInfo.daysRemaining} días restantes
            </p>
          )}
        </div>

        {/* Advertencia de expiración */}
        {subInfo.valid && 
         subInfo.subscription?.status === 'trial' && 
         subInfo.daysRemaining && 
         subInfo.daysRemaining <= 3 && (
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ Tu período de prueba está por expirar. Actualiza tu plan para continuar usando el sistema.
            </p>
          </div>
        )}

        {/* Uso de recursos */}
        {usage && subInfo.subscription && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Uso del mes:</p>
            
            {/* Mensajes */}
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>📨 Mensajes</span>
                <span>
                  {usage.messages.current} / {usage.messages.limit === -1 ? '∞' : usage.messages.limit}
                </span>
              </div>
              {usage.messages.limit !== -1 && (
                <Progress 
                  value={calculatePercentage(usage.messages.current, usage.messages.limit)} 
                  className="h-2"
                />
              )}
            </div>

            {/* Productos */}
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>📦 Productos</span>
                <span>
                  {usage.products.current} / {usage.products.limit === -1 ? '∞' : usage.products.limit}
                </span>
              </div>
              {usage.products.limit !== -1 && (
                <Progress 
                  value={calculatePercentage(usage.products.current, usage.products.limit)} 
                  className="h-2"
                />
              )}
            </div>

            {/* Conversaciones */}
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>💬 Conversaciones</span>
                <span>
                  {usage.conversations.current} / {usage.conversations.limit === -1 ? '∞' : usage.conversations.limit}
                </span>
              </div>
              {usage.conversations.limit !== -1 && (
                <Progress 
                  value={calculatePercentage(usage.conversations.current, usage.conversations.limit)} 
                  className="h-2"
                />
              )}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="space-y-2 pt-2">
          {!subInfo.valid && (
            <Button
              onClick={() => router.push('/pricing')}
              className="w-full"
              size="sm"
            >
              <Crown className="h-4 w-4 mr-2" />
              Activar Suscripción
            </Button>
          )}

          {subInfo.valid && subInfo.subscription?.plan !== 'enterprise' && (
            <Button
              onClick={() => router.push('/pricing')}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Actualizar Plan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
