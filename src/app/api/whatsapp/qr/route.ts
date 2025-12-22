import { NextRequest, NextResponse } from 'next/server'
import { WhatsAppService } from '@/lib/whatsapp'
import { AuthService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await AuthService.validateSession(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const connection = await WhatsAppService.getConnectionStatus(user.id)

    if (!connection) {
      return NextResponse.json(
        { error: 'No connection found' },
        { status: 404 }
      )
    }

    if (connection.status === 'CONNECTED') {
      return NextResponse.json({
        success: true,
        status: 'CONNECTED',
        message: 'Already connected to WhatsApp'
      })
    }

    if (connection.status === 'QR_PENDING' && connection.qrCode) {
      return NextResponse.json({
        success: true,
        status: 'QR_PENDING',
        qrCode: connection.qrCode,
        expiresAt: connection.qrExpiresAt,
        message: 'QR code ready for scanning'
      })
    }

    if (connection.status === 'QR_EXPIRED') {
      // Generate new QR code
      const newQrCode = await WhatsAppService.generateQRCode(connection.id, connection.phoneNumber)
      const updatedConnection = await WhatsAppService.getConnectionStatus(user.id)

      return NextResponse.json({
        success: true,
        status: 'QR_PENDING',
        qrCode: newQrCode,
        expiresAt: updatedConnection?.qrExpiresAt,
        message: 'New QR code generated'
      })
    }

    return NextResponse.json({
      success: false,
      status: connection.status,
      message: 'Connection not ready for QR code'
    })
  } catch (error) {
    console.error('Error getting QR code:', error)
    return NextResponse.json(
      { error: 'Failed to get QR code' },
      { status: 500 }
    )
  }
}