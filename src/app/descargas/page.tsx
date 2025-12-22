'use client';

import { Download, Monitor, Apple, Smartphone, CheckCircle2, Shield, Zap, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PageTransition from '@/components/PageTransition';

export default function DescargasPage() {
  const version = '1.0.0';
  const releaseDate = '20 de Noviembre 2025';

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* Header */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-4">
              Descarga Smart Sales Bot Pro
            </h1>
            <p className="text-xl text-blue-200 mb-2">
              Versión {version} - {releaseDate}
            </p>
            <p className="text-lg text-slate-300">
              Aplicación de escritorio profesional para automatizar tus ventas por WhatsApp
            </p>
          </div>

          {/* Opciones de Descarga */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Windows */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500 transition-all">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <Monitor className="w-16 h-16 text-blue-400" />
                </div>
                <CardTitle className="text-white text-center">Windows</CardTitle>
                <CardDescription className="text-center">
                  Windows 10/11 (64-bit)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.open('https://github.com/daveymena/bot-intelogente/releases/latest/download/Smart-Sales-Bot-Pro-1.0.0-x64.exe', '_blank')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Instalador (150 MB)
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => window.open('https://github.com/daveymena/bot-intelogente/releases/latest/download/Smart-Sales-Bot-Pro-1.0.0-portable.exe', '_blank')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Portable (150 MB)
                </Button>
                <p className="text-xs text-slate-400 text-center">
                  Instalador: Requiere instalación<br/>
                  Portable: Ejecutar sin instalar
                </p>
              </CardContent>
            </Card>

            {/* macOS */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500 transition-all">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <Apple className="w-16 h-16 text-blue-400" />
                </div>
                <CardTitle className="text-white text-center">macOS</CardTitle>
                <CardDescription className="text-center">
                  macOS 10.15+ (Intel/Apple Silicon)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.open('https://github.com/daveymena/bot-intelogente/releases/latest/download/Smart-Sales-Bot-Pro-1.0.0.dmg', '_blank')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  DMG (150 MB)
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => window.open('https://github.com/daveymena/bot-intelogente/releases/latest/download/Smart-Sales-Bot-Pro-1.0.0-mac.zip', '_blank')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  ZIP (150 MB)
                </Button>
                <p className="text-xs text-slate-400 text-center">
                  Compatible con Intel y Apple Silicon
                </p>
              </CardContent>
            </Card>

            {/* Linux */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500 transition-all">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <Monitor className="w-16 h-16 text-blue-400" />
                </div>
                <CardTitle className="text-white text-center">Linux</CardTitle>
                <CardDescription className="text-center">
                  Ubuntu/Debian/Fedora (64-bit)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.open('https://github.com/daveymena/bot-intelogente/releases/latest/download/Smart-Sales-Bot-Pro-1.0.0.AppImage', '_blank')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  AppImage (150 MB)
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs"
                    onClick={() => window.open('https://github.com/daveymena/bot-intelogente/releases/latest/download/Smart-Sales-Bot-Pro-1.0.0.deb', '_blank')}
                  >
                    DEB
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs"
                    onClick={() => window.open('https://github.com/daveymena/bot-intelogente/releases/latest/download/Smart-Sales-Bot-Pro-1.0.0.rpm', '_blank')}
                  >
                    RPM
                  </Button>
                </div>
                <p className="text-xs text-slate-400 text-center">
                  AppImage: Universal<br/>
                  DEB: Ubuntu/Debian | RPM: Fedora
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Características */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              ¿Por qué usar la versión de escritorio?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <Zap className="w-12 h-12 text-blue-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Más Rápido
                  </h3>
                  <p className="text-slate-300 text-sm">
                    Rendimiento optimizado sin depender del navegador
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <Shield className="w-12 h-12 text-blue-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Más Seguro
                  </h3>
                  <p className="text-slate-300 text-sm">
                    Datos locales encriptados, sin exponer puertos
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <Monitor className="w-12 h-12 text-blue-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Más Profesional
                  </h3>
                  <p className="text-slate-300 text-sm">
                    Aplicación nativa con icono en bandeja del sistema
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <Cloud className="w-12 h-12 text-blue-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Siempre Activo
                  </h3>
                  <p className="text-slate-300 text-sm">
                    Funciona en segundo plano sin navegador abierto
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Requisitos del Sistema */}
          <Card className="bg-slate-800/50 border-slate-700 mb-16">
            <CardHeader>
              <CardTitle className="text-white">Requisitos del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-blue-400 font-semibold mb-3">Windows</h4>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-400" />
                      Windows 10/11 (64-bit)
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-400" />
                      4 GB RAM mínimo
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-400" />
                      500 MB espacio en disco
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-blue-400 font-semibold mb-3">macOS</h4>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-400" />
                      macOS 10.15 o superior
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-400" />
                      4 GB RAM mínimo
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-400" />
                      500 MB espacio en disco
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-blue-400 font-semibold mb-3">Linux</h4>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-400" />
                      Ubuntu 18.04+ / Debian 10+
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-400" />
                      4 GB RAM mínimo
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-400" />
                      500 MB espacio en disco
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Versión Web */}
          <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <Smartphone className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  ¿Prefieres la versión web?
                </h3>
                <p className="text-slate-300 mb-6">
                  Accede desde cualquier dispositivo sin instalar nada
                </p>
                <Button 
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.location.href = '/'}
                >
                  Ir al Dashboard Web
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Soporte */}
          <div className="text-center mt-16">
            <p className="text-slate-400 mb-4">
              ¿Necesitas ayuda con la instalación?
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={() => window.open('https://github.com/daveymena/bot-intelogente/issues', '_blank')}
              >
                Reportar Problema
              </Button>
              <Button 
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={() => window.open('https://wa.me/573136174267', '_blank')}
              >
                Contactar Soporte
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
