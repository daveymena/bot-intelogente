import { BotPersonalityConfig } from '@/components/BotPersonalityConfig'

export default function BotConfigPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configuración del Bot</h1>
        <p className="text-muted-foreground">
          Personaliza cómo se comporta y comunica tu bot de WhatsApp con los clientes
        </p>
      </div>

      <BotPersonalityConfig />
    </div>
  )
}
