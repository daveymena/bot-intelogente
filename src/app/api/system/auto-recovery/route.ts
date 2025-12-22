import { NextRequest, NextResponse } from 'next/server'
import { AutoRecoveryService } from '@/lib/auto-recovery-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { component, action } = body

    if (action === 'full') {
      // Recuperación completa del sistema
      await AutoRecoveryService.fullSystemRecovery()
      
      return NextResponse.json({
        success: true,
        message: 'Recuperación completa ejecutada'
      })
    }

    // Recuperación de componente específico
    let result = false
    
    switch (component) {
      case 'whatsapp':
        result = await AutoRecoveryService.recoverWhatsApp()
        break
      case 'database':
        result = await AutoRecoveryService.recoverDatabase()
        break
      case 'payments':
        result = await AutoRecoveryService.recoverPayments()
        break
      case 'ai':
        result = await AutoRecoveryService.recoverAI()
        break
      default:
        return NextResponse.json({
          success: false,
          error: 'Componente no válido'
        }, { status: 400 })
    }

    return NextResponse.json({
      success: result,
      component,
      message: result ? 'Recuperación exitosa' : 'Recuperación fallida'
    })
  } catch (error) {
    console.error('Error en auto-recovery API:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const logs = AutoRecoveryService.getRecoveryLogs()
    
    return NextResponse.json({
      success: true,
      logs,
      count: logs.length
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
