#!/usr/bin/env tsx
/**
 * 🚀 GENERAR CATÁLOGO COMPLETO
 * Combina productos de MegaComputer y SmartJoys con tags inteligentes
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

interface ProductoMegaComputer {
    nombre: string
    precio: string
    imagen: string
    link: string
    categoria: string
}

interface ProductoFinal {
    name: string
    description: string
    price: number
    currency: string
    category: 'PHYSICAL' | 'DIGITAL' | 'SERVICE'
    status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED'
    images: string[]
    tags: string[]
    stock: number | null
    paymentLinkMercadoPago: string
    paymentLinkPayPal: string
    paymentLinkCustom: string
}

function limpiarPrecio(precioStr: string): number {
    // Extraer el precio actual (después de "El precio actual es:")
    const match = precioStr.match(/El precio actual es: \$?([\d.,]+)/i)
    if (match) {
        return parseInt(match[1].replace(/[.,]/g, ''))
    }

    // Si no hay precio actual, buscar cualquier número
    const numMatch = precioStr.match(/\$?([\d.,]+)/)
    if (numMatch) {
        return parseInt(numMatch[1].replace(/[.,]/g, ''))
    }

    return 0
}

function generarTags(nombre: string, categoria: string): string[] {
    const tags: string[] = []
    const nombreLower = nombre.toLowerCase()

    // Tags de categoría
    if (categoria.toLowerCase().includes('portátil') || categoria.toLowerCase().includes('laptop')) {
        tags.push('laptop', 'portatil', 'computador', 'notebook')
    }
    if (categoria.toLowerCase().includes('monitor')) {
        tags.push('monitor', 'pantalla', 'display')
    }
    if (categoria.toLowerCase().includes('accesorio')) {
        tags.push('accesorio', 'periférico')
    }

    // Tags de marca
    if (nombreLower.includes('asus')) tags.push('asus')
    if (nombreLower.includes('acer')) tags.push('acer')
    if (nombreLower.includes('hp')) tags.push('hp')
    if (nombreLower.includes('dell')) tags.push('dell')
    if (nombreLower.includes('lenovo')) tags.push('lenovo')
    if (nombreLower.includes('macbook') || nombreLower.includes('mac')) tags.push('macbook', 'mac', 'apple')
    if (nombreLower.includes('lg')) tags.push('lg')
    if (nombreLower.includes('samsung')) tags.push('samsung')

    // Tags de procesador
    if (nombreLower.includes('intel') || nombreLower.includes('i3') || nombreLower.includes('i5') || nombreLower.includes('i7') || nombreLower.includes('i9')) {
        tags.push('intel')
        if (nombreLower.includes('i3')) tags.push('i3', 'core i3')
        if (nombreLower.includes('i5')) tags.push('i5', 'core i5')
        if (nombreLower.includes('i7')) tags.push('i7', 'core i7')
        if (nombreLower.includes('i9')) tags.push('i9', 'core i9')
    }
    if (nombreLower.includes('ryzen') || nombreLower.includes('amd')) {
        tags.push('amd', 'ryzen')
        if (nombreLower.includes('ryzen 3')) tags.push('ryzen 3')
        if (nombreLower.includes('ryzen 5')) tags.push('ryzen 5')
        if (nombreLower.includes('ryzen 7')) tags.push('ryzen 7')
        if (nombreLower.includes('ryzen 9')) tags.push('ryzen 9')
    }
    if (nombreLower.includes('m1') || nombreLower.includes('m2') || nombreLower.includes('m3') || nombreLower.includes('m4')) {
        tags.push('apple silicon')
        if (nombreLower.includes('m1')) tags.push('m1')
        if (nombreLower.includes('m2')) tags.push('m2')
        if (nombreLower.includes('m3')) tags.push('m3')
        if (nombreLower.includes('m4')) tags.push('m4')
    }

    // Tags de RAM
    if (nombreLower.includes('8gb')) tags.push('8gb ram')
    if (nombreLower.includes('16gb')) tags.push('16gb ram')
    if (nombreLower.includes('32gb')) tags.push('32gb ram')
    if (nombreLower.includes('64gb')) tags.push('64gb ram')

    // Tags de almacenamiento
    if (nombreLower.includes('256gb') || nombreLower.includes('256 gb')) tags.push('256gb ssd')
    if (nombreLower.includes('512gb') || nombreLower.includes('512 gb')) tags.push('512gb ssd')
    if (nombreLower.includes('1tb') || nombreLower.includes('1 tb')) tags.push('1tb ssd')
    if (nombreLower.includes('2tb') || nombreLower.includes('2 tb')) tags.push('2tb ssd')
    if (nombreLower.includes('ssd')) tags.push('ssd')

    // Tags de pantalla
    if (nombreLower.includes('13') || nombreLower.includes('13.3')) tags.push('13 pulgadas', 'compacto')
    if (nombreLower.includes('14')) tags.push('14 pulgadas')
    if (nombreLower.includes('15') || nombreLower.includes('15.6')) tags.push('15 pulgadas')
    if (nombreLower.includes('16')) tags.push('16 pulgadas')
    if (nombreLower.includes('17')) tags.push('17 pulgadas', 'grande')
    if (nombreLower.includes('fhd') || nombreLower.includes('full hd')) tags.push('full hd', 'fhd')
    if (nombreLower.includes('4k') || nombreLower.includes('uhd')) tags.push('4k', 'ultra hd')
    if (nombreLower.includes('oled')) tags.push('oled')
    if (nombreLower.includes('ips')) tags.push('ips')
    if (nombreLower.includes('curvo')) tags.push('curvo', 'curved')

    // Tags de uso
    if (nombreLower.includes('gaming') || nombreLower.includes('gamer')) {
        tags.push('gaming', 'gamer', 'juegos')
    }
    if (nombreLower.includes('vivobook') || nombreLower.includes('ideapad') || nombreLower.includes('inspiron')) {
        tags.push('estudiante', 'trabajo', 'oficina')
    }
    if (nombreLower.includes('pro') || nombreLower.includes('profesional')) {
        tags.push('profesional', 'trabajo', 'diseño')
    }
    if (nombreLower.includes('ultrabook') || nombreLower.includes('slim')) {
        tags.push('delgado', 'ligero', 'portatil')
    }

    // Tags generales
    tags.push('nuevo', 'original', 'garantia')

    // Remover duplicados
    return [...new Set(tags)]
}

function generarDescripcion(nombre: string, precio: number): string {
    const nombreLower = nombre.toLowerCase()
    let desc = nombre + '. '

    // Agregar características destacadas
    if (nombreLower.includes('gaming')) {
        desc += 'Diseñado para gaming de alto rendimiento. '
    }
    if (nombreLower.includes('profesional') || nombreLower.includes('pro')) {
        desc += 'Ideal para profesionales y creadores de contenido. '
    }
    if (nombreLower.includes('estudiante') || nombreLower.includes('vivobook')) {
        desc += 'Perfecto para estudiantes y trabajo diario. '
    }

    desc += 'Producto original con garantía. Envío a toda Colombia.'

    return desc
}

async function generarCatalogo() {
    console.log('🚀 GENERANDO CATÁLOGO COMPLETO\n')

    try {
        // Leer productos de MegaComputer
        const megaPath = join(process.cwd(), 'scripts', 'productos-megacomputer-completo.json')
        const productosMega: ProductoMegaComputer[] = JSON.parse(readFileSync(megaPath, 'utf-8'))

        console.log(`📦 Productos MegaComputer: ${productosMega.length}`)

        const productosFinal: ProductoFinal[] = []

        // Procesar productos de MegaComputer
        for (const prod of productosMega) {
            const precio = limpiarPrecio(prod.precio)

            if (precio === 0) {
                console.log(`⚠️  Precio inválido para: ${prod.nombre}`)
                continue
            }

            const productoFinal: ProductoFinal = {
                name: prod.nombre.substring(0, 200), // Limitar longitud
                description: generarDescripcion(prod.nombre, precio),
                price: precio,
                currency: 'COP',
                category: 'PHYSICAL',
                status: 'AVAILABLE',
                images: prod.imagen ? [prod.imagen] : [],
                tags: generarTags(prod.nombre, prod.categoria),
                stock: 5, // Stock por defecto
                paymentLinkMercadoPago: '',
                paymentLinkPayPal: '',
                paymentLinkCustom: prod.link
            }

            productosFinal.push(productoFinal)
        }

        console.log(`✅ Productos procesados: ${productosFinal.length}`)

        // Guardar JSON
        const outputPath = join(process.cwd(), 'catalogo-completo-importar.json')
        writeFileSync(outputPath, JSON.stringify(productosFinal, null, 2), 'utf-8')

        console.log(`\n💾 Archivo generado: catalogo-completo-importar.json`)
        console.log(`📊 Total productos: ${productosFinal.length}`)

        // Estadísticas
        const categorias = productosFinal.reduce((acc, p) => {
            const cat = p.name.toLowerCase().includes('monitor') ? 'Monitores' : 'Portátiles'
            acc[cat] = (acc[cat] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        console.log('\n📈 ESTADÍSTICAS:')
        Object.entries(categorias).forEach(([cat, count]) => {
            console.log(`   ${cat}: ${count}`)
        })

        console.log('\n✨ PRÓXIMO PASO:')
        console.log('   npx tsx scripts/importar-productos-completos-con-tags.ts')
        console.log('   (Actualiza el script para usar catalogo-completo-importar.json)')

    } catch (error) {
        console.error('❌ Error:', error)
    }
}

generarCatalogo()
