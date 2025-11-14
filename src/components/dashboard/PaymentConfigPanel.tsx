'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PaymentConfig {
  // MercadoPago
  mercadoPagoEnabled: boolean
  mercadoPagoPublicKey?: string
  mercadoPagoAccessToken?: string
  
  // PayPal
  paypalEnabled: boolean
  paypalClientId?: string
  paypalClientSecret?: string
  
  // Transferencias
  bankTransferEnabled: boolean
  bankName?: string
  bankAccountNumber?: string
  bankAccountType?: string
  bankAccountHolder?: string
  
  // Nequi
  nequiEnabled: boolean
  nequiPhone?: string
  
  // Daviplata
  daviplataEnabled: boolean
  daviplataPhone?: string
  
  // Contacto
  contactPhone?: string
  contactEmail?: string
  contactAddress?: string
}

export default function PaymentConfigPanel() {
  const [config, setConfig] = useState<PaymentConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const res = await fetch('/api/payment-config')
      if (res.ok) {
        const data = await res.json()
        setConfig(data)
      }
    } catch (error) {
      console.error('Error cargando configuración:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    if (!config) return
    
    setSaving(true)
    try {
      const res = await fetch('/api/payment-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      
      if (res.ok) {
        alert('✅ Configuración guardada exitosamente')
      } else {
        alert('❌ Error guardando configuración')
      }
    } catch (error) {
      console.error('Error guardando:', error)
      alert('❌ Error guardando configuración')
    } finally {
      setSaving(false)
    }
  }

  const updateConfig = (field: keyof PaymentConfig, value: any) => {
    setConfig(prev => prev ? { ...prev, [field]: value } : null)
  }

  if (loading) {
    return <div className="p-4">Cargando configuración...</div>
  }

  if (!config) {
    return <div className="p-4">Error cargando configuración</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Configuración de Pagos</h2>
          <p className="text-gray-600">Configura tus métodos de pago sin tocar código</p>
        </div>
        <Button onClick={saveConfig} disabled={saving}>
          {saving ? 'Guardando...' : '💾 Guardar Cambios'}
        </Button>
      </div>

      <Tabs defaultValue="mercadopago" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="mercadopago">MercadoPago</TabsTrigger>
          <TabsTrigger value="paypal">PayPal</TabsTrigger>
          <TabsTrigger value="bank">Transferencias</TabsTrigger>
          <TabsTrigger value="mobile">Nequi/Daviplata</TabsTrigger>
          <TabsTrigger value="contact">Contacto</TabsTrigger>
        </TabsList>

      </Tabs>
    </div>
  )
}
