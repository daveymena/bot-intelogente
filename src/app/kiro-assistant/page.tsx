import { KiroCodeAssistant } from '@/components/dashboard/KiroCodeAssistant';
import { Code2, Sparkles, Zap } from 'lucide-react';

export default function KiroAssistantPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Asistente de Código Kiro</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Describe los cambios que quieres hacer y Kiro los ejecutará automáticamente
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Code2 className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Lenguaje Natural</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Escribe en español lo que quieres cambiar, sin necesidad de código
          </p>
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold">Ejecución Rápida</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Kiro procesa y aplica los cambios en segundos
          </p>
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold">Historial Completo</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Revisa todos los cambios realizados y archivos modificados
          </p>
        </div>
      </div>

      <KiroCodeAssistant />
    </div>
  );
}
