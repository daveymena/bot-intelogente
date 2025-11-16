import * as fs from 'fs'
import * as path from 'path'

interface MegaflujoEjemplo {
  entrada: string
  salida: string
  intención: string
  categoría: string
  complejidad: string
  sentimiento?: string
  acciones?: string[]
  contexto?: any
}

export class MegaflujoService {
  private static ejemplos: MegaflujoEjemplo[] = []
  private static cargado = false

  /**
   * Cargar ejemplos de megaflujos
   */
  static cargarEjemplos(): MegaflujoEjemplo[] {
    if (this.cargado && this.ejemplos.length > 0) {
      return this.ejemplos
    }

    try {
      const rutaArchivo = path.join(
        process.cwd(),
        'data',
        'megaflujos-integracion-bot.json'
      )

      if (fs.existsSync(rutaArchivo)) {
        const contenido = fs.readFileSync(rutaArchivo, 'utf-8')
        const datos = JSON.parse(contenido)
        this.ejemplos = datos.ejemplos || []
        this.cargado = true
        console.log(`✅ Cargados ${this.ejemplos.length} ejemplos de megaflujos`)
      }
    } catch (error) {
      console.error('❌ Error cargando megaflujos:', error)
    }

    return this.ejemplos
  }

  /**
   * Buscar ejemplos similares a la entrada del usuario
   */
  static buscarSimilares(
    entrada: string,
    topK: number = 3
  ): MegaflujoEjemplo[] {
    const ejemplos = this.cargarEjemplos()
    if (ejemplos.length === 0) return []

    const palabrasEntrada = entrada.toLowerCase().split(' ')

    return ejemplos
      .map((e) => ({
        ...e,
        similitud: palabrasEntrada.filter((p) =>
          e.entrada.toLowerCase().includes(p)
        ).length
      }))
      .filter((e: any) => e.similitud > 0)
      .sort((a: any, b: any) => b.similitud - a.similitud)
      .slice(0, topK)
      .map(({ similitud, ...rest }: any) => rest)
  }

  /**
   * Obtener contexto de megaflujos para el prompt
   */
  static obtenerContextoParaPrompt(entrada: string): string {
    const similares = this.buscarSimilares(entrada, 2)

    if (similares.length === 0) return ''

    const contexto = similares
      .map(
        (e) =>
          `Ejemplo similar:\nUsuario: ${e.entrada}\nBot: ${e.salida}\nIntención: ${e.intención}`
      )
      .join('\n\n')

    return `Aquí hay ejemplos de conversaciones similares que pueden ayudarte:\n\n${contexto}\n\n`
  }

  /**
   * Detectar intención basada en megaflujos
   */
  static detectarIntención(entrada: string): string | null {
    const similares = this.buscarSimilares(entrada, 1)
    return similares.length > 0 ? similares[0].intención : null
  }

  /**
   * Obtener acciones recomendadas
   */
  static obtenerAcciones(entrada: string): string[] {
    const similares = this.buscarSimilares(entrada, 1)
    return similares.length > 0 && similares[0].acciones
      ? similares[0].acciones
      : []
  }

  /**
   * Obtener estadísticas de megaflujos
   */
  static obtenerEstadísticas() {
    const ejemplos = this.cargarEjemplos()

    const porCategoría: Record<string, number> = {}
    const porComplejidad: Record<string, number> = {}
    const porIntención: Record<string, number> = {}

    ejemplos.forEach((e) => {
      porCategoría[e.categoría] = (porCategoría[e.categoría] || 0) + 1
      porComplejidad[e.complejidad] = (porComplejidad[e.complejidad] || 0) + 1
      porIntención[e.intención] = (porIntención[e.intención] || 0) + 1
    })

    return {
      total: ejemplos.length,
      porCategoría,
      porComplejidad,
      porIntención
    }
  }
}
