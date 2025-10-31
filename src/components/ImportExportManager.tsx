'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  FileJson,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

interface ImportResult {
  message: string
  imported: number
  failed: number
  total: number
  errors?: Array<{ row: number; error: string }>
}

export default function ImportExportManager() {
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Obtener userId real del usuario autenticado
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    // Obtener el usuario autenticado
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.user?.id) {
          setUserId(data.user.id)
        }
      })
      .catch(err => console.error('Error obteniendo sesión:', err))
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast.error('Por favor, selecciona un archivo CSV')
      return
    }

    setIsImporting(true)
    setImportResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', userId)

      const response = await fetch('/api/import-export', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setImportResult(result)
        toast.success(`Importación completada: ${result.imported} productos importados`)
      } else {
        setImportResult(result)
        toast.error(`Error en importación: ${result.error}`)
      }
    } catch (error) {
      console.error('Error importing products:', error)
      toast.error('Error al importar productos')
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const response = await fetch(`/api/import-export?userId=${userId}&format=${exportFormat}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `products-export-${new Date().toISOString().split('T')[0]}.${exportFormat}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast.success(`Productos exportados en formato ${exportFormat.toUpperCase()}`)
      } else {
        const error = await response.json()
        toast.error(`Error al exportar: ${error.error}`)
      }
    } catch (error) {
      console.error('Error exporting products:', error)
      toast.error('Error al exportar productos')
    } finally {
      setIsExporting(false)
    }
  }

  const downloadTemplate = () => {
    const csvTemplate = `name,description,price,currency,category,status,images,tags,autoResponse,stock
"Ejemplo: Laptop Gaming","Laptop de alto rendimiento para gaming",3200000,COP,PHYSICAL,AVAILABLE,"https://ejemplo.com/laptop.jpg","laptop,gaming,tecnologia","Laptop ideal para gaming con procesador de última generación",10
"Ejemplo: Curso de Piano","Curso completo de piano para principiantes",60000,COP,DIGITAL,AVAILABLE,"","piano,musica,curso","Aprende piano desde cero con más de 76 clases en HD",`

    const blob = new Blob([csvTemplate], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = 'products-template.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    
    toast.success('Plantilla descargada')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">Importar/Exportar Productos</h3>
        <p className="text-sm text-gray-500">Gestiona tu catálogo mediante archivos CSV o JSON</p>
      </div>

      <Tabs defaultValue="import" className="space-y-6">
        <TabsList>
          <TabsTrigger value="import">Importar Productos</TabsTrigger>
          <TabsTrigger value="export">Exportar Productos</TabsTrigger>
        </TabsList>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Importar Productos
              </CardTitle>
              <CardDescription>
                Sube un archivo CSV para importar múltiples productos a tu catálogo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template Download */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  ¿Primera vez? Descarga nuestra plantilla CSV para ver el formato requerido.
                  <Button 
                    variant="link" 
                    className="p-0 h-auto ml-2"
                    onClick={downloadTemplate}
                  >
                    Descargar plantilla
                  </Button>
                </AlertDescription>
              </Alert>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="csv-file">Archivo CSV</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={isImporting}
                    ref={fileInputRef}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    onClick={downloadTemplate}
                    disabled={isImporting}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Plantilla
                  </Button>
                </div>
              </div>

              {/* Import Progress */}
              {isImporting && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Importando productos...</span>
                  </div>
                  <Progress value={undefined} className="w-full" />
                </div>
              )}

              {/* Import Results */}
              {importResult && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
                      <div className="text-sm text-green-700">Importados</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                      <div className="text-sm text-red-700">Fallidos</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <FileSpreadsheet className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">{importResult.total}</div>
                      <div className="text-sm text-blue-700">Total</div>
                    </div>
                  </div>

                  {importResult.errors && importResult.errors.length > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <strong>Errores encontrados:</strong>
                          <ul className="list-disc list-inside space-y-1">
                            {importResult.errors.slice(0, 5).map((error, index) => (
                              <li key={index} className="text-sm">
                                Fila {error.row}: {error.error}
                              </li>
                            ))}
                            {importResult.errors.length > 5 && (
                              <li className="text-sm">
                                ... y {importResult.errors.length - 5} errores más
                              </li>
                            )}
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Format Instructions */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Formato del archivo CSV:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li><strong>name:</strong> Nombre del producto (requerido)</li>
                  <li><strong>description:</strong> Descripción del producto</li>
                  <li><strong>price:</strong> Precio (requerido, solo números)</li>
                  <li><strong>currency:</strong> Moneda (default: COP)</li>
                  <li><strong>category:</strong> PHYSICAL, DIGITAL, o SERVICE</li>
                  <li><strong>status:</strong> AVAILABLE, OUT_OF_STOCK, o DISCONTINUED</li>
                  <li><strong>images:</strong> URLs de imágenes separadas por comas</li>
                  <li><strong>tags:</strong> Etiquetas separadas por comas</li>
                  <li><strong>autoResponse:</strong> Respuesta automática predefinida</li>
                  <li><strong>stock:</strong> Cantidad en stock (solo productos físicos)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Exportar Productos
              </CardTitle>
              <CardDescription>
                Descarga tu catálogo completo en formato CSV o JSON
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="format">Formato de exportación</Label>
                  <Select value={exportFormat} onValueChange={(value: 'csv' | 'json') => setExportFormat(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4" />
                          CSV (Excel)
                        </div>
                      </SelectItem>
                      <SelectItem value="json">
                        <div className="flex items-center gap-2">
                          <FileJson className="w-4 h-4" />
                          JSON
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button 
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Exportando...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Exportar Productos
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Export Progress */}
              {isExporting && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Preparando exportación...</span>
                  </div>
                  <Progress value={undefined} className="w-full" />
                </div>
              )}

              {/* Format Description */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Diferencias entre formatos:</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileSpreadsheet className="w-4 h-4" />
                      <strong>CSV:</strong>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">
                      Formato compatible con Excel y hojas de cálculo. Ideal para análisis de datos y edición masiva.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileJson className="w-4 h-4" />
                      <strong>JSON:</strong>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">
                      Formato estructurado ideal para integraciones con otros sistemas y respaldos de datos.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              onClick={downloadTemplate}
              className="h-16 flex-col gap-2"
            >
              <FileSpreadsheet className="w-6 h-6" />
              <span>Descargar Plantilla</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              className="h-16 flex-col gap-2"
            >
              <Upload className="w-6 h-6" />
              <span>Importar CSV</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExport}
              disabled={isExporting}
              className="h-16 flex-col gap-2"
            >
              <Download className="w-6 h-6" />
              <span>Exportar Catálogo</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}