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
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
            padding: '60px 80px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            maxWidth: '1000px',
          }}
        >
          {/* Logo/Icon */}
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '30px',
              boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
            }}
          >
            <div
              style={{
                fontSize: 64,
                color: 'white',
              }}
            >
              🤖
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: '20px',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            Smart Sales Bot Pro
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 28,
              color: '#666',
              textAlign: 'center',
              marginBottom: '20px',
            }}
          >
            Automatización de Ventas con IA para WhatsApp
          </div>

          {/* Features */}
          <div
            style={{
              display: 'flex',
              gap: '30px',
              fontSize: 20,
              color: '#999',
              marginTop: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              ✅ Bot Inteligente
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              ✅ IA Avanzada
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              ✅ 24/7
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
