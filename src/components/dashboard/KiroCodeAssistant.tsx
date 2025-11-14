'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, CheckCircle2, XCircle, Clock, Code2 } from 'lucide-react';

interface ChangeRequest {
  id: string;
  instruction: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: Date;
  result?: string;
  filesChanged?: string[];
}

export function KiroCodeAssistant() {
  const [instruction, setInstruction] = useState('');
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    if (!instruction.trim()) return;

    const newRequest: ChangeRequest = {
      id: Date.now().toString(),
      instruction: instruction.trim(),
      status: 'pending',
      timestamp: new Date(),
    };

    setRequests(prev => [newRequest, ...prev]);
    setInstruction('');
    setIsProcessing(true);

    try {
      // Enviar instrucción a Kiro
      const response = await fetch('/api/kiro/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: newRequest.instruction }),
      });

      const data = await response.json();

      setRequests(prev =>
        prev.map(req =>
          req.id === newRequest.id
            ? {
                ...req,
                status: data.success ? 'completed' : 'failed',
                result: data.message,
                filesChanged: data.filesChanged,
              }
            : req
        )
      );
    } catch (error) {
      setRequests(prev =>
        prev.map(req =>
          req.id === newRequest.id
            ? {
                ...req,
                status: 'failed',
                result: 'Error al conectar con Kiro',
              }
            : req
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: ChangeRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: ChangeRequest['status']) => {
    const variants = {
      pending: 'secondary',
      processing: 'default',
      completed: 'default',
      failed: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status]} className="ml-2">
        {status === 'pending' && 'Pendiente'}
        {status === 'processing' && 'Procesando'}
        {status === 'completed' && 'Completado'}
        {status === 'failed' && 'Fallido'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Asistente de Código Kiro
          </CardTitle>
          <CardDescription>
            Describe los cambios que quieres hacer en el código y Kiro los ejecutará automáticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Instrucciones para Kiro</label>
            <Textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Ejemplo: Agrega un campo 'stock' al modelo Product y actualiza el formulario de productos para incluirlo"
              className="min-h-[120px]"
              disabled={isProcessing}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!instruction.trim() || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar a Kiro
                </>
              )}
            </Button>
          </div>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              💡 Ejemplos de instrucciones:
            </p>
            <ul className="space-y-1 text-blue-800 dark:text-blue-200">
              <li>• "Agrega validación de email en el formulario de registro"</li>
              <li>• "Cambia el color del botón principal a verde"</li>
              <li>• "Crea un endpoint para exportar productos a Excel"</li>
              <li>• "Agrega paginación a la lista de conversaciones"</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Cambios</CardTitle>
            <CardDescription>
              Últimas instrucciones enviadas a Kiro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(request.status)}
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">
                          {request.instruction}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {request.timestamp.toLocaleString('es-CO')}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  {request.result && (
                    <div className="ml-7 text-sm">
                      <p className={
                        request.status === 'completed'
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-red-700 dark:text-red-300'
                      }>
                        {request.result}
                      </p>
                    </div>
                  )}

                  {request.filesChanged && request.filesChanged.length > 0 && (
                    <div className="ml-7">
                      <p className="text-xs font-medium mb-1">
                        Archivos modificados:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {request.filesChanged.map((file, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {file}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
