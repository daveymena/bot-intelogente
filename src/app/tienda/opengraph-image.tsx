import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Smart Sales Bot Pro - Tienda'
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
          background: 'linear-gradient(to bottom right, #1e40af, #7c3aed)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          textAlign: 'center',
          padding: '40px',
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 20 }}>🤖</div>
        <div style={{ marginBottom: 20 }}>Smart Sales Bot Pro</div>
        <div style={{ fontSize: 40, fontWeight: 'normal' }}>
          Automatización de Ventas con IA
        </div>
        <div style={{ fontSize: 30, marginTop: 20, opacity: 0.9 }}>
          WhatsApp • IA • 24/7
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
