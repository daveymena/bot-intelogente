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
          fontWeight: 'bold',
          textAlign: 'center',
          padding: '60px',
        }}
      >
        {/* Logo/Icon */}
        <div 
          style={{ 
            fontSize: 120, 
            marginBottom: 30,
            background: 'white',
            borderRadius: '30px',
            padding: '20px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: '#667eea' }}>🤖</span>
        </div>
        
        {/* Title */}
        <div style={{ 
          fontSize: 70, 
          marginBottom: 20,
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        }}>
          Smart Sales Bot Pro
        </div>
        
        {/* Subtitle */}
        <div style={{ 
          fontSize: 40, 
          fontWeight: 'normal',
          opacity: 0.95,
          marginBottom: 30,
        }}>
          Automatización de Ventas con IA
        </div>
        
        {/* Features */}
        <div style={{ 
          fontSize: 32, 
          display: 'flex',
          gap: '30px',
          opacity: 0.9,
        }}>
          <span>✅ WhatsApp</span>
          <span>✅ IA Avanzada</span>
          <span>✅ 24/7</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
