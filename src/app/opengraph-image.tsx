import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Smart Sales Bot Pro - Automatización de Ventas con IA'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'white',
            borderRadius: '24px',
            padding: '60px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            Smart Sales Bot Pro
          </div>
          <div
            style={{
              fontSize: 32,
              color: '#666',
              textAlign: 'center',
              maxWidth: '800px',
            }}
          >
            Automatización de Ventas con IA para WhatsApp
          </div>
          <div
            style={{
              fontSize: 24,
              color: '#999',
              marginTop: '20px',
              textAlign: 'center',
            }}
          >
            Bot inteligente • IA avanzada • Respuestas 24/7
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
