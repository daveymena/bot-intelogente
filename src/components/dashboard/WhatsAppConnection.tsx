'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    Smartphone,
    QrCode,
    CheckCircle,
    XCircle,
    Loader2,
    RefreshCw,
    AlertCircle,
    Wifi,
    WifiOff
} from 'lucide-react'
import { toast } from 'sonner'

export function WhatsAppConnection() {
    const [status, setStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'QR_PENDING' | 'CONNECTED' | 'ERROR'>('DISCONNECTED')
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [phoneNumber, setPhoneNumber] = useState<string | null>(null)
    const [lastConnected, setLastConnected] = useState<Date | null>(null)
    const [autoReconnecting, setAutoReconnecting] = useState(false)
    const [reconnectAttempts, setReconnectAttempts] = useState(0)
    const [previousStatus, setPreviousStatus] = useState<string>('DISCONNECTED')

    useEffect(() => {
        checkStatus()
        // Poll status every 5 seconds
        const interval = setInterval(checkStatus, 5000)
        return () => clearInterval(interval)
    }, [])

    // 🔄 Detectar desconexión y reconectar automáticamente
    useEffect(() => {
        // Si el estado cambió de CONNECTED a DISCONNECTED, intentar reconectar
        if (previousStatus === 'CONNECTED' && status === 'DISCONNECTED' && !autoReconnecting) {
            console.log('[WhatsApp] 🔄 Desconexión detectada, iniciando reconexión automática...')
            toast.info('Desconexión detectada. Reconectando automáticamente...')
            handleAutoReconnect()
        }
        setPreviousStatus(status)
    }, [status])

    const handleAutoReconnect = async () => {
        if (autoReconnecting) return
        
        setAutoReconnecting(true)
        const maxAttempts = 3
        let attempts = 0

        const attemptReconnect = async () => {
            attempts++
            setReconnectAttempts(attempts)
            
            console.log(`[WhatsApp] 🔄 Intento de reconexión ${attempts}/${maxAttempts}`)
            toast.info(`Reconectando... (Intento ${attempts}/${maxAttempts})`)

            try {
                const response = await fetch('/api/whatsapp/reconnect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                })

                const data = await response.json()

                if (data.success) {
                    console.log('[WhatsApp] ✅ Reconexión exitosa')
                    toast.success('¡Reconectado exitosamente!')
                    setAutoReconnecting(false)
                    setReconnectAttempts(0)
                    await checkStatus()
                    return true
                } else {
                    throw new Error(data.error || 'Error en reconexión')
                }
            } catch (error) {
                console.error(`[WhatsApp] ❌ Error en intento ${attempts}:`, error)
                
                if (attempts < maxAttempts) {
                    // Esperar antes del siguiente intento (5 segundos)
                    await new Promise(resolve => setTimeout(resolve, 5000))
                    return attemptReconnect()
                } else {
                    // Máximo de intentos alcanzado
                    console.log('[WhatsApp] ❌ Máximo de intentos de reconexión alcanzado')
                    toast.error('No se pudo reconectar automáticamente. Por favor, reconecta manualmente.')
                    setAutoReconnecting(false)
                    setReconnectAttempts(0)
                    return false
                }
            }
        }

        await attemptReconnect()
    }

    const checkStatus = async () => {
        try {
            // Crear timeout manual compatible con todos los navegadores
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos
            
            const response = await fetch('/api/whatsapp/status', {
                signal: controller.signal
            })
            
            clearTimeout(timeoutId)
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            
            const data = await response.json()

            console.log('[WhatsApp] Status response:', data)

            if (data.success) {
                // Actualizar estado
                const currentStatus = data.status || 'DISCONNECTED'
                setStatus(currentStatus)

                // Actualizar QR si existe
                if (data.qrCode) {
                    console.log('[WhatsApp] QR Code encontrado, actualizando UI')
                    setQrCode(data.qrCode)
                } else if (currentStatus !== 'QR_PENDING') {
                    setQrCode(null)
                }

                // Actualizar info de conexión
                if (data.connection) {
                    setPhoneNumber(data.connection.phoneNumber)
                    setLastConnected(data.connection.lastConnectedAt)
                }
            }
        } catch (error) {
            // Silenciar errores de red para no molestar al usuario
            // Solo loguear en consola
            if (error instanceof Error) {
                // No mostrar errores de timeout o abort
                if (error.name !== 'AbortError') {
                    console.error('[WhatsApp] Error checking status:', error.message)
                }
            }
            // No cambiar el estado si hay error de red
            // Mantener el último estado conocido
        }
    }

    const handleConnect = async () => {
        setLoading(true)
        setStatus('CONNECTING')
        setQrCode(null)

        try {
            console.log('[WhatsApp] 🧹 Limpiando QR anterior antes de conectar...')
            toast.info('Preparando conexión...')

            // 🧹 LIMPIEZA AUTOMÁTICA: Limpiar QR anterior antes de generar uno nuevo
            // Esto previene que el QR se pegue o cause bloqueos
            try {
                await fetch('/api/whatsapp/reset', {
                    method: 'POST'
                })
                console.log('[WhatsApp] ✅ Limpieza previa completada')
                // Pequeña pausa para asegurar que la limpieza se completó
                await new Promise(resolve => setTimeout(resolve, 500))
            } catch (cleanupError) {
                console.log('[WhatsApp] ⚠️ Error en limpieza previa (continuando):', cleanupError)
                // Continuar de todos modos
            }

            setStatus('QR_PENDING')
            console.log('[WhatsApp] Iniciando conexión...')
            toast.info('Generando código QR real de WhatsApp...')

            // Llamar a la API para iniciar conexión con Baileys
            const response = await fetch('/api/whatsapp/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })

            const data = await response.json()
            console.log('[WhatsApp] Respuesta de connect:', data)

            if (!data.success) {
                throw new Error(data.error || 'Error al conectar')
            }

            // Si el QR viene inmediatamente, mostrarlo
            if (data.qr) {
                console.log('[WhatsApp] QR recibido inmediatamente')
                setQrCode(data.qr)
                setLoading(false)
                toast.success('¡Código QR generado! Escanéalo con WhatsApp')
            } else {
                // Si no viene inmediatamente, hacer polling cada segundo
                console.log('[WhatsApp] QR no disponible, iniciando polling...')
                toast.info('Esperando código QR...')

                let attempts = 0
                const maxAttempts = 15 // 15 segundos máximo

                const pollInterval = setInterval(async () => {
                    attempts++
                    console.log(`[WhatsApp] Polling intento ${attempts}/${maxAttempts}`)

                    try {
                        const statusResponse = await fetch('/api/whatsapp/status')
                        const statusData = await statusResponse.json()

                        console.log(`[WhatsApp] Status polling:`, statusData)

                        if (statusData.qrCode) {
                            // QR encontrado!
                            console.log('[WhatsApp] ✅ QR encontrado en polling!')
                            setQrCode(statusData.qrCode)
                            setLoading(false)
                            clearInterval(pollInterval)
                            toast.success('¡Código QR generado! Escanéalo con WhatsApp')
                        } else if (statusData.status === 'CONNECTED') {
                            // Ya se conectó sin necesidad de QR
                            console.log('[WhatsApp] ✅ Ya conectado!')
                            setStatus('CONNECTED')
                            setLoading(false)
                            clearInterval(pollInterval)
                            toast.success('¡WhatsApp conectado!')
                        } else if (attempts >= maxAttempts) {
                            // Timeout
                            console.log('[WhatsApp] ❌ Timeout esperando QR')
                            clearInterval(pollInterval)
                            setLoading(false)
                            setStatus('ERROR')
                            toast.error('Timeout esperando QR. Intenta de nuevo.')
                        }
                    } catch (error) {
                        console.error('[WhatsApp] Error polling status:', error)
                    }
                }, 1000) // Revisar cada segundo
            }

        } catch (error) {
            console.error('[WhatsApp] Error connecting:', error)
            toast.error(error instanceof Error ? error.message : 'Error al generar QR')
            setLoading(false)
            setStatus('ERROR')
        }
    }

    const handleDisconnect = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/whatsapp/disconnect', {
                method: 'POST'
            })

            const data = await response.json()

            if (data.success) {
                setStatus('DISCONNECTED')
                setQrCode(null)
                setPhoneNumber(null)
                toast.success('Desconectado exitosamente')
            } else {
                toast.error(data.error || 'Error al desconectar')
            }
        } catch (error) {
            console.error('Error disconnecting:', error)
            toast.error('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    const handleResetSession = async () => {
        if (!confirm('¿Estás seguro? Esto eliminará COMPLETAMENTE la sesión actual (memoria, archivos y base de datos) y generará un nuevo código QR.')) {
            return
        }

        setLoading(true)
        toast.info('🧹 Iniciando limpieza robusta...')

        try {
            console.log('[WhatsApp] 🧹 Iniciando limpieza robusta completa...')

            // Paso 1: Limpieza robusta (memoria + archivos + DB)
            const cleanupResponse = await fetch('/api/whatsapp/cleanup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    action: 'cleanup',
                    force: true
                })
            })

            const cleanupData = await cleanupResponse.json()

            console.log('[WhatsApp] Resultado de limpieza:', cleanupData)

            if (!cleanupData.success) {
                // Si es error de autorización, intentar limpieza alternativa
                if (cleanupData.error === 'No autorizado') {
                    console.warn('[WhatsApp] ⚠️ Error de autorización, usando limpieza alternativa')
                    toast.warning('Usando limpieza alternativa...')
                    
                    // Intentar limpieza directa sin autenticación
                    const altResponse = await fetch('/api/whatsapp/reset', {
                        method: 'POST',
                        credentials: 'include'
                    })
                    
                    if (altResponse.ok) {
                        console.log('[WhatsApp] ✅ Limpieza alternativa exitosa')
                        toast.success('✅ Limpieza exitosa')
                    } else {
                        console.warn('[WhatsApp] ⚠️ Limpieza alternativa falló, continuando...')
                        toast.warning('Limpieza parcial. Intenta reconectar.')
                    }
                } else {
                    // Limpieza parcial o fallida
                    console.warn('[WhatsApp] ⚠️ Limpieza parcial:', cleanupData.details)
                    toast.warning('Limpieza parcial. Algunos archivos pueden no haberse eliminado.')
                    
                    // Continuar de todos modos si al menos algo se limpió
                    if (!cleanupData.details?.memoryCleared && !cleanupData.details?.filesDeleted) {
                        throw new Error(cleanupData.error || 'Error en limpieza robusta')
                    }
                }
            } else {
                console.log('[WhatsApp] ✅ Limpieza robusta exitosa')
                toast.success('✅ Limpieza completa exitosa')
            }

            // Paso 2: Limpiar estado local del componente
            console.log('[WhatsApp] 🧹 Limpiando estado local...')
            setQrCode(null)
            setStatus('DISCONNECTED')
            setPhoneNumber(null)
            setLastConnected(null)
            setAutoReconnecting(false)
            setReconnectAttempts(0)

            // Paso 3: Esperar 3 segundos para asegurar que todo se limpió
            console.log('[WhatsApp] ⏳ Esperando 3 segundos...')
            toast.info('Esperando limpieza completa...')
            await new Promise(resolve => setTimeout(resolve, 3000))

            // Paso 4: Generar nuevo QR desde cero
            console.log('[WhatsApp] 🔄 Generando nuevo QR...')
            toast.info('Generando nuevo código QR...')
            await handleConnect()

            console.log('[WhatsApp] ✅ Proceso de reseteo completo exitoso')

        } catch (error) {
            console.error('[WhatsApp] ❌ Error en reseteo completo:', error)
            toast.error(error instanceof Error ? error.message : 'Error al limpiar sesión')
            setStatus('ERROR')
            
            // Intentar limpiar estado local de todos modos
            setQrCode(null)
            setStatus('DISCONNECTED')
            setPhoneNumber(null)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = () => {
        switch (status) {
            case 'CONNECTED':
                return <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Conectado</Badge>
            case 'QR_PENDING':
                return <Badge variant="secondary"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Esperando escaneo</Badge>
            case 'ERROR':
                return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Error</Badge>
            default:
                return <Badge variant="outline"><WifiOff className="w-3 h-3 mr-1" /> Desconectado</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Conexión WhatsApp</h1>
                    <p className="text-gray-600 mt-2">Conecta tu cuenta de WhatsApp para activar el bot</p>
                </div>
                {getStatusBadge()}
            </div>

            {/* 🔄 Indicador de Reconexión Automática */}
            {autoReconnecting && (
                <Alert className="bg-blue-50 border-blue-200">
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                    <AlertDescription className="text-blue-800">
                        <strong>Reconexión automática en progreso...</strong>
                        <br />
                        Intento {reconnectAttempts} de 3. El bot se reconectará automáticamente.
                    </AlertDescription>
                </Alert>
            )}

            {/* Connection Status Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5" />
                        Estado de Conexión
                    </CardTitle>
                    <CardDescription>
                        {status === 'CONNECTED'
                            ? 'Tu bot está activo y respondiendo mensajes'
                            : 'Conecta WhatsApp para activar las respuestas automáticas'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {(status === 'DISCONNECTED' || status === 'CONNECTING') && (
                        <div className="space-y-4">
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Para conectar WhatsApp, necesitarás tu teléfono con WhatsApp instalado.
                                </AlertDescription>
                            </Alert>

                            <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                                <h3 className="font-semibold text-gray-900">Pasos para conectar:</h3>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                                    <li>Haz clic en "Conectar WhatsApp"</li>
                                    <li>Aparecerá un código QR en pantalla</li>
                                    <li>Abre WhatsApp en tu teléfono</li>
                                    <li>Ve a Configuración → Dispositivos vinculados</li>
                                    <li>Toca "Vincular un dispositivo"</li>
                                    <li>Escanea el código QR</li>
                                </ol>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    onClick={handleConnect}
                                    disabled={loading}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                    size="lg"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Iniciando...
                                        </>
                                    ) : (
                                        <>
                                            <Wifi className="mr-2 h-4 w-4" />
                                            Conectar WhatsApp
                                        </>
                                    )}
                                </Button>

                                {/* Botón de Limpieza Profunda cuando está desconectado */}
                                <Button
                                    onClick={handleResetSession}
                                    variant="outline"
                                    className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                                    disabled={loading}
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    🧹 Limpieza Profunda
                                </Button>
                                <p className="text-xs text-gray-500 text-center">
                                    Si tuviste problemas de conexión, haz limpieza profunda primero
                                </p>
                            </div>
                        </div>
                    )}

                    {status === 'QR_PENDING' && (
                        <div className="space-y-4">
                            <Alert>
                                <QrCode className="h-4 w-4" />
                                <AlertDescription>
                                    {qrCode ? 'Escanea este código QR con tu WhatsApp para conectar' : 'Generando código QR...'}
                                </AlertDescription>
                            </Alert>

                            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                                {qrCode ? (
                                    <>
                                        <img
                                            src={qrCode}
                                            alt="QR Code"
                                            className="w-64 h-64 mb-4"
                                        />
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Esperando escaneo...
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
                                        <p className="text-gray-600">Generando código QR...</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm text-blue-900 font-medium mb-2">💡 Instrucciones:</p>
                                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                                    <li>Abre WhatsApp en tu teléfono</li>
                                    <li>Ve a Configuración → Dispositivos vinculados</li>
                                    <li>Toca "Vincular un dispositivo"</li>
                                    <li>Apunta tu cámara a este código QR</li>
                                </ol>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleResetSession}
                                    variant="destructive"
                                    className="flex-1"
                                    disabled={loading}
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Limpiar y Generar Nuevo QR
                                </Button>
                                <Button
                                    onClick={handleDisconnect}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    )}

                    {status === 'CONNECTED' && (
                        <div className="space-y-4">
                            <Alert className="bg-green-50 border-green-200">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-800">
                                    ¡WhatsApp conectado exitosamente! Tu bot está activo.
                                </AlertDescription>
                            </Alert>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Número conectado</p>
                                    <p className="font-semibold text-gray-900">{phoneNumber || 'Cargando...'}</p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Última conexión</p>
                                    <p className="font-semibold text-gray-900">
                                        {lastConnected
                                            ? new Date(lastConnected).toLocaleString('es-ES')
                                            : 'Ahora'}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg space-y-2">
                                <h3 className="font-semibold text-green-900">✅ Bot Activo</h3>
                                <p className="text-sm text-green-800">
                                    Tu bot está respondiendo mensajes automáticamente. Los clientes recibirán respuestas
                                    inteligentes basadas en tus productos y configuración de IA.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={checkStatus}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Actualizar Estado
                                </Button>

                                <Button
                                    onClick={handleDisconnect}
                                    variant="destructive"
                                    className="flex-1"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Desconectando...
                                        </>
                                    ) : (
                                        <>
                                            <WifiOff className="mr-2 h-4 w-4" />
                                            Desconectar
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Botón de Limpieza Profunda */}
                            <div className="border-t pt-4">
                                <Button
                                    onClick={handleResetSession}
                                    variant="outline"
                                    className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                                    disabled={loading}
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    🧹 Limpieza Profunda (si hay problemas)
                                </Button>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    Usa esto si el bot no responde o hay errores de conexión
                                </p>
                            </div>
                        </div>
                    )}

                    {status === 'ERROR' && (
                        <div className="space-y-4">
                            <Alert variant="destructive">
                                <XCircle className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Error al conectar WhatsApp.</strong>
                                    <br />
                                    Si el problema persiste, limpia la sesión y genera un nuevo QR.
                                </AlertDescription>
                            </Alert>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleConnect}
                                    disabled={loading}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    size="lg"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Reintentando...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            Reintentar
                                        </>
                                    )}
                                </Button>

                                <Button
                                    onClick={handleResetSession}
                                    variant="destructive"
                                    className="flex-1"
                                    size="lg"
                                    disabled={loading}
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Limpiar Sesión
                                </Button>
                            </div>

                            <Button
                                onClick={() => {
                                    setStatus('DISCONNECTED')
                                    setQrCode(null)
                                }}
                                variant="outline"
                                className="w-full"
                            >
                                Volver
                            </Button>
                        </div>
                    )}

                    {/* Caso por defecto si el estado no coincide */}
                    {status !== 'DISCONNECTED' && status !== 'CONNECTING' && status !== 'QR_PENDING' && status !== 'CONNECTED' && status !== 'ERROR' && (
                        <div className="space-y-4">
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Estado desconocido: {status}. Intenta refrescar la página.
                                </AlertDescription>
                            </Alert>
                            <Button onClick={() => window.location.reload()} className="w-full">
                                Refrescar Página
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Respuestas automáticas</p>
                                <p className="font-semibold">
                                    {status === 'CONNECTED' ? 'Activas' : 'Inactivas'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Smartphone className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Dispositivo</p>
                                <p className="font-semibold">
                                    {status === 'CONNECTED' ? 'Conectado' : 'Sin conectar'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <Wifi className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Estado</p>
                                <p className="font-semibold">
                                    {status === 'CONNECTED' ? 'En línea' : 'Fuera de línea'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
