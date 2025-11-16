'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MegaflujoStats {
  total: number
  porCategoría: Record<string, number>
  porComplejidad: Record<string, number>
  porIntención: Record<string, number>
}

export function MegaflujosDashboard() {
  const [stats, setStats] = useState<MegaflujoStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])

  useEffect(() => {
    cargarEstadísticas()
  }, [])

  const cargarEstadísticas = async () => {
    try {
      const res = await fetch('/api/megaflujos?action=stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const buscar = async () => {
    if (!searchQuery.trim()) return

    try {
      const res = await fetch(`/api/megaflujos?action=search&q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setSearchResults(data.resultados || [])
    } catch (error) {
      console.error('Error buscando:', error)
    }
  }

  if (loading) {
    return <div className="p-4">Cargando megaflujos...</div>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>📚 Megaflujos de Entrenamiento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-gray-600">Ejemplos totales</div>
              </div>

              <div className="p-3 bg-green-50 rounded">
                <div className="text-2xl font-bold">{Object.keys(stats.porCategoría).length}</div>
                <div className="text-sm text-gray-600">Categorías</div>
              </div>

              <div className="col-span-2 space-y-2">
                <h3 className="font-semibold">Por Complejidad:</h3>
                <div className="space-y-1 text-sm">
                  {Object.entries(stats.porComplejidad).map(([comp, count]) => (
                    <div key={comp} className="flex justify-between">
                      <span>{comp}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-2 space-y-2">
                <h3 className="font-semibold">Por Categoría:</h3>
                <div className="space-y-1 text-sm">
                  {Object.entries(stats.porCategoría).map(([cat, count]) => (
                    <div key={cat} className="flex justify-between">
                      <span>{cat}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🔍 Buscar Ejemplos Similares</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Escribe una pregunta de cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && buscar()}
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              onClick={buscar}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Buscar
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-3">
              {searchResults.map((resultado, idx) => (
                <div key={idx} className="p-3 border rounded bg-gray-50">
                  <div className="font-semibold text-sm mb-2">
                    👤 Usuario: {resultado.entrada.substring(0, 60)}...
                  </div>
                  <div className="text-sm mb-2">
                    🤖 Bot: {resultado.salida.substring(0, 80)}...
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="bg-blue-100 px-2 py-1 rounded">
                      {resultado.intención}
                    </span>
                    <span className="bg-green-100 px-2 py-1 rounded">
                      {resultado.categoría}
                    </span>
                    <span className="bg-yellow-100 px-2 py-1 rounded">
                      {resultado.complejidad}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
