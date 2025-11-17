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
          fontSize: 60,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          padding: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '30px',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '70px',
              fontWeight: 'bold',
              color: '#667eea',
              marginRight: '30px',
            }}
          >
            SSB
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ fontSize: '72px', fontWeight: 'bold', lineHeight: 1.1 }}>
              Smart Sales Bot
            </div>
            <div style={{ fontSize: '48px', fontWeight: 'normal', opacity: 0.9 }}>
              Pro
            </div>
          </div>
        </div>
        
        <div
          style={{
            fontSize: '32px',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.4,
            opacity: 0.95,
          }}
        >
          Bot inteligente de WhatsApp con IA avanzada
        </div>
        
        <div
          style={{
            fontSize: '24px',
            textAlign: 'center',
            marginTop: '20px',
            opacity: 0.85,
          }}
        >
          Automatiza ventas • Gestiona productos • Atiende clientes 24/7
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
