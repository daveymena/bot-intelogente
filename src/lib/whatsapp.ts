import { db } from './db'
import QRCode from 'qrcode'
import { v4 as uuidv4 } from 'uuid'

export interface WhatsAppConnection {
  id: string
  userId: string
  phoneNumber: string
  status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR' | 'QR_PENDING' | 'QR_EXPIRED'
  qrCode?: string
  qrExpiresAt?: Date
  sessionId?: string
  isConnected: boolean
  lastConnectedAt?: Date
  lastMessageAt?: Date
  connectionAttempts: number
  lastError?: string
  lastErrorAt?: Date
}

export interface WhatsAppMessage {
  from: string
  to: string
  content: string
  type: 'text' | 'image' | 'audio' | 'video' | 'document'
  timestamp: Date
  messageId?: string
}

export class WhatsAppService {
  private static connections: Map<string, any> = new Map()
  private static qrCallbacks: Map<string, (qr: string) => void> = new Map()

  // Initialize WhatsApp connection for user
  static async initializeConnection(userId: string, phoneNumber: string): Promise<WhatsAppConnection> {
    try {
      // Check if connection already exists
      const existingConnection = await db.whatsAppConnection.findUnique({
        where: { userId }
      })

      if (existingConnection) {
        // Update status to connecting
        const updatedConnection = await db.whatsAppConnection.update({
          where: { userId },
          data: {
            status: 'CONNECTING',
            connectionAttempts: existingConnection.connectionAttempts + 1,
            lastError: null,
            lastErrorAt: null
          }
        })

        return {
          ...updatedConnection,
          qrCode: updatedConnection.qrCode ?? undefined,
          qrExpiresAt: updatedConnection.qrExpiresAt ?? undefined,
          sessionId: updatedConnection.sessionId ?? undefined,
          lastConnectedAt: updatedConnection.lastConnectedAt ?? undefined,
          lastMessageAt: updatedConnection.lastMessageAt ?? undefined,
          lastError: updatedConnection.lastError ?? undefined,
          lastErrorAt: updatedConnection.lastErrorAt ?? undefined
        }
      }

      // Create new connection record
      const connection = await db.whatsAppConnection.create({
        data: {
          userId,
          phoneNumber,
          status: 'CONNECTING',
          sessionId: uuidv4(),
          connectionAttempts: 1
        }
      })

      // Generate QR code for connection
      await this.generateQRCode(connection.id, phoneNumber)

      return {
        ...connection,
        qrCode: connection.qrCode ?? undefined,
        qrExpiresAt: connection.qrExpiresAt ?? undefined,
        sessionId: connection.sessionId ?? undefined,
        lastConnectedAt: connection.lastConnectedAt ?? undefined,
        lastMessageAt: connection.lastMessageAt ?? undefined,
        lastError: connection.lastError ?? undefined,
        lastErrorAt: connection.lastErrorAt ?? undefined
      }
    } catch (error) {
      console.error('Error initializing WhatsApp connection:', error)
      throw error
    }
  }

  // Generate QR code for WhatsApp connection
  static async generateQRCode(connectionId: string, phoneNumber: string): Promise<string> {
    try {
      // In a real implementation, this would integrate with WhatsApp Business API
      // For now, we'll simulate QR code generation
      
      const qrData = {
        connectionId,
        phoneNumber,
        timestamp: new Date().toISOString(),
        sessionId: uuidv4()
      }

      // Generate QR code
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 256,
        margin: 2,
        color: {
          dark: '#25D366',
          light: '#FFFFFF'
        }
      })

      // Update connection with QR code
      const qrExpiresAt = new Date()
      qrExpiresAt.setMinutes(qrExpiresAt.getMinutes() + 5) // QR expires in 5 minutes

      await db.whatsAppConnection.update({
        where: { id: connectionId },
        data: {
          status: 'QR_PENDING',
          qrCode: qrCodeDataURL,
          qrExpiresAt
        }
      })

      // Simulate QR scan after 30 seconds (for demo purposes)
      setTimeout(() => {
        this.simulateQRScan(connectionId)
      }, 30000)

      return qrCodeDataURL
    } catch (error) {
      console.error('Error generating QR code:', error)
      throw error
    }
  }

  // Simulate QR code scan (for demo purposes)
  static async simulateQRScan(connectionId: string): Promise<void> {
    try {
      await db.whatsAppConnection.update({
        where: { id: connectionId },
        data: {
          status: 'CONNECTED',
          isConnected: true,
          lastConnectedAt: new Date(),
          qrCode: null,
          qrExpiresAt: null,
          connectionAttempts: 0,
          lastError: null,
          lastErrorAt: null
        }
      })

      console.log(`WhatsApp connection ${connectionId} established successfully`)
    } catch (error) {
      console.error('Error simulating QR scan:', error)
    }
  }

  // Get connection status
  static async getConnectionStatus(userId: string): Promise<WhatsAppConnection | null> {
    try {
      const connection = await db.whatsAppConnection.findUnique({
        where: { userId }
      })

      if (!connection) {
        return null
      }

      // Check if QR code has expired
      if (connection.status === 'QR_PENDING' && connection.qrExpiresAt && connection.qrExpiresAt < new Date()) {
        const updated = await db.whatsAppConnection.update({
          where: { id: connection.id },
          data: {
            status: 'QR_EXPIRED',
            qrCode: null,
            qrExpiresAt: null
          }
        })

        return {
          ...updated,
          status: 'QR_EXPIRED',
          qrCode: undefined,
          qrExpiresAt: undefined,
          sessionId: updated.sessionId ?? undefined,
          lastConnectedAt: updated.lastConnectedAt ?? undefined,
          lastMessageAt: updated.lastMessageAt ?? undefined,
          lastError: updated.lastError ?? undefined,
          lastErrorAt: updated.lastErrorAt ?? undefined
        }
      }

      return {
        ...connection,
        qrCode: connection.qrCode ?? undefined,
        qrExpiresAt: connection.qrExpiresAt ?? undefined,
        sessionId: connection.sessionId ?? undefined,
        lastConnectedAt: connection.lastConnectedAt ?? undefined,
        lastMessageAt: connection.lastMessageAt ?? undefined,
        lastError: connection.lastError ?? undefined,
        lastErrorAt: connection.lastErrorAt ?? undefined
      }
    } catch (error) {
      console.error('Error getting connection status:', error)
      return null
    }
  }

  // Disconnect WhatsApp
  static async disconnect(userId: string): Promise<void> {
    try {
      await db.whatsAppConnection.update({
        where: { userId },
        data: {
          status: 'DISCONNECTED',
          isConnected: false,
          sessionId: null,
          qrCode: null,
          qrExpiresAt: null
        }
      })

      // Remove from active connections
      this.connections.delete(userId)
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error)
      throw error
    }
  }

  // Send message via WhatsApp
  static async sendMessage(userId: string, to: string, content: string, type: 'text' | 'image' | 'audio' | 'video' | 'document' = 'text'): Promise<boolean> {
    try {
      const connection = await this.getConnectionStatus(userId)

      if (!connection || !connection.isConnected) {
        throw new Error('WhatsApp not connected')
      }

      // In a real implementation, this would use the WhatsApp Business API
      // For now, we'll simulate message sending
      
      const message: WhatsAppMessage = {
        from: connection.phoneNumber,
        to,
        content,
        type,
        timestamp: new Date(),
        messageId: uuidv4()
      }

      // Simulate sending message
      console.log(`Sending WhatsApp message:`, message)

      // Update last message timestamp
      await db.whatsAppConnection.update({
        where: { userId },
        data: {
          lastMessageAt: new Date()
        }
      })

      // Simulate response after 2 seconds
      setTimeout(() => {
        this.simulateIncomingMessage(userId, to, connection.phoneNumber, "¡Gracias por tu mensaje! Te responderé pronto. 🤖")
      }, 2000)

      return true
    } catch (error) {
      console.error('Error sending WhatsApp message:', error)
      
      // Update connection error
      await db.whatsAppConnection.update({
        where: { userId },
        data: {
          lastError: error instanceof Error ? error.message : 'Unknown error',
          lastErrorAt: new Date()
        }
      })

      return false
    }
  }

  // Simulate incoming message (for demo purposes)
  static async simulateIncomingMessage(userId: string, from: string, to: string, content: string): Promise<void> {
    try {
      // Create conversation if it doesn't exist
      let conversation = await db.conversation.findFirst({
        where: {
          userId,
          customerPhone: from
        }
      })

      if (!conversation) {
        conversation = await db.conversation.create({
          data: {
            userId,
            customerPhone: from,
            customerName: `Customer ${from.slice(-4)}`,
            status: 'ACTIVE'
          }
        })
      }

      // Create incoming message
      await db.message.create({
        data: {
          content,
          direction: 'INCOMING',
          conversationId: conversation.id,
          type: 'TEXT'
        }
      })

      // Update conversation timestamp
      await db.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: new Date()
        }
      })

      // Update connection last message timestamp
      await db.whatsAppConnection.update({
        where: { userId },
        data: {
          lastMessageAt: new Date()
        }
      })

      console.log(`Simulated incoming message from ${from}: ${content}`)
    } catch (error) {
      console.error('Error simulating incoming message:', error)
    }
  }

  // Reconnect automatically
  static async autoReconnect(userId: string): Promise<boolean> {
    try {
      const connection = await this.getConnectionStatus(userId)

      if (!connection) {
        return false
      }

      // Only attempt reconnection if we have too many failed attempts
      if (connection.connectionAttempts >= 3) {
        console.log(`Too many connection attempts for user ${userId}, skipping auto-reconnect`)
        return false
      }

      // Wait before reconnecting (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, connection.connectionAttempts), 30000)
      await new Promise(resolve => setTimeout(resolve, delay))

      // Attempt reconnection
      await this.initializeConnection(userId, connection.phoneNumber)

      return true
    } catch (error) {
      console.error('Error in auto-reconnect:', error)
      return false
    }
  }

  // Check connection health
  static async checkConnectionHealth(userId: string): Promise<{
    isHealthy: boolean
    lastActivity?: Date
    issues: string[]
  }> {
    try {
      const connection = await this.getConnectionStatus(userId)

      if (!connection) {
        return {
          isHealthy: false,
          issues: ['No connection found']
        }
      }

      const issues: string[] = []
      const now = new Date()

      // Check if connected
      if (!connection.isConnected) {
        issues.push('Not connected to WhatsApp')
      }

      // Check last activity
      const lastActivity = connection.lastMessageAt || connection.lastConnectedAt
      if (lastActivity) {
        const timeSinceLastActivity = now.getTime() - lastActivity.getTime()
        const hoursSinceLastActivity = timeSinceLastActivity / (1000 * 60 * 60)

        if (hoursSinceLastActivity > 24) {
          issues.push('No activity for over 24 hours')
        }
      } else {
        issues.push('No recorded activity')
      }

      // Check for recent errors
      if (connection.lastError && connection.lastErrorAt) {
        const timeSinceLastError = now.getTime() - connection.lastErrorAt.getTime()
        const hoursSinceLastError = timeSinceLastError / (1000 * 60 * 60)

        if (hoursSinceLastError < 1) {
          issues.push(`Recent error: ${connection.lastError}`)
        }
      }

      return {
        isHealthy: issues.length === 0,
        lastActivity,
        issues
      }
    } catch (error) {
      console.error('Error checking connection health:', error)
      return {
        isHealthy: false,
        issues: ['Failed to check connection health']
      }
    }
  }

  // Get connection statistics
  static async getConnectionStats(userId: string): Promise<{
    totalMessages: number
    connectedAt?: Date
    lastActivity?: Date
    uptimeHours?: number
  }> {
    try {
      const connection = await this.getConnectionStatus(userId)

      if (!connection) {
        return {
          totalMessages: 0
        }
      }

      // Count messages sent through this connection
      const totalMessages = await db.message.count({
        where: {
          conversation: {
            userId
          },
          direction: 'OUTGOING'
        }
      })

      let uptimeHours = 0
      if (connection.lastConnectedAt) {
        const now = new Date()
        const uptime = now.getTime() - connection.lastConnectedAt.getTime()
        uptimeHours = uptime / (1000 * 60 * 60)
      }

      return {
        totalMessages,
        connectedAt: connection.lastConnectedAt,
        lastActivity: connection.lastMessageAt || connection.lastConnectedAt,
        uptimeHours
      }
    } catch (error) {
      console.error('Error getting connection stats:', error)
      return {
        totalMessages: 0
      }
    }
  }
}