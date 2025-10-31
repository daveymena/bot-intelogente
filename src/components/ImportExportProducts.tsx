'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Download, FileJson, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ImportExportProductsProps {
    userId: string
}

export function ImportExportProducts({ userId }: ImportExportProductsProps) {
    const [importing, setImporting] = useState(false)
    const [exporting, setExporting] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const { toast } = useToast()

    // Exportar productos
    const handleExport = async (format: 'json' | 'csv') => {
        setExporting(true)
        try {
            const response = await fetch(`/api/import-export?format=${format}`)

            if (!response.ok) throw new Error('Error al exportar')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `productos-${new Date().toISOString().split('T')[0]}.${format}`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            toast({
                title: '✅ Exportación exitosa',
                description: `Productos exportados en formato ${format.toUpperCase()}`
            })
        } catch (error) {
            toast({
                title: '❌ Error al exportar',
                description: 'No se pudieron exportar los productos',
                variant: 'destructive'
            })
        } finally {
            setExporting(false)
        }
    }

    // Importar productos
    const handleImport = async (file: File) => {
        setImporting(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('userId', userId)

            const response = await fetch('/api/import-export', {
                method: 'POST',
                body: formData
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error al importar')
            }

            toast({
                title: '✅ Importación exitosa',
                description: `${data.imported} productos importados correctamente`
            })

            // Recargar la página para ver los nuevos productos
            setTimeout(() => window.location.reload(), 1500)
        } catch (error: any) {
            toast({
                title: '❌ Error al importar',
                description: error.message || 'No se pudieron importar los productos',
                variant: 'destructive'
            })
        } finally {
            setImporting(false)
        }
    }

    // Drag & Drop handlers
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImport(e.dataTransfer.files[0])
        }
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleImport(e.target.files[0])
        }
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Importar */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Importar Productos
                    </CardTitle>
                    <CardDescription>
                        Sube un archivo JSON o CSV con tus productos
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Zona de Drag & Drop */}
                    <div
                        className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
              ${importing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'}
            `}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => !importing && document.getElementById('file-input')?.click()}
                    >
                        <input
                            id="file-input"
                            type="file"
                            accept=".json,.csv"
                            onChange={handleFileInput}
                            className="hidden"
                            disabled={importing}
                        />

                        {importing ? (
                            <div className="space-y-2">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-sm text-gray-600">Importando productos...</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex justify-center gap-4">
                                    <FileJson className="h-12 w-12 text-blue-500" />
                                    <FileSpreadsheet className="h-12 w-12 text-green-500" />
                                </div>
                                <p className="text-sm font-medium">
                                    Arrastra tu archivo aquí o haz click para seleccionar
                                </p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                        .JSON
                                    </span>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                        .CSV
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Instrucciones */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                        <p className="text-sm font-medium text-blue-900">📋 Formato del archivo:</p>
                        <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
                            <li>JSON: Array de objetos con campos name, price, description, etc.</li>
                            <li>CSV: Primera fila con encabezados, luego los datos</li>
                            <li>Campos requeridos: name, price, category</li>
                        </ul>
                    </div>

                    {/* Ejemplo de JSON */}
                    <details className="text-xs">
                        <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                            Ver ejemplo de JSON
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-100 rounded overflow-x-auto">
                            {`[
  {
    "name": "Producto 1",
    "description": "Descripción",
    "price": 10000,
    "currency": "COP",
    "category": "PHYSICAL",
    "status": "AVAILABLE"
  }
]`}
                        </pre>
                    </details>
                </CardContent>
            </Card>

            {/* Exportar */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Exportar Productos
                    </CardTitle>
                    <CardDescription>
                        Descarga todos tus productos en el formato que prefieras
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Botones de exportación */}
                    <div className="space-y-3">
                        <Button
                            onClick={() => handleExport('json')}
                            disabled={exporting}
                            className="w-full justify-start"
                            variant="outline"
                        >
                            <FileJson className="mr-2 h-4 w-4" />
                            Exportar como JSON
                            <span className="ml-auto text-xs text-gray-500">Recomendado</span>
                        </Button>

                        <Button
                            onClick={() => handleExport('csv')}
                            disabled={exporting}
                            className="w-full justify-start"
                            variant="outline"
                        >
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Exportar como CSV
                            <span className="ml-auto text-xs text-gray-500">Para Excel</span>
                        </Button>
                    </div>

                    {/* Información */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                        <p className="text-sm font-medium text-green-900 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Ventajas de exportar:
                        </p>
                        <ul className="text-xs text-green-800 space-y-1 ml-4 list-disc">
                            <li>Respaldo de seguridad de tus productos</li>
                            <li>Edición masiva en Excel o editor de texto</li>
                            <li>Migración a otro sistema</li>
                            <li>Compartir catálogo con tu equipo</li>
                        </ul>
                    </div>

                    {/* Tips */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
                        <p className="text-sm font-medium text-yellow-900 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Tip:
                        </p>
                        <p className="text-xs text-yellow-800">
                            Exporta regularmente tus productos como respaldo. Puedes editarlos en Excel y volver a importarlos.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
