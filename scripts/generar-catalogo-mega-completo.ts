#!/usr/bin/env tsx
/**
 * 🚀 GENERAR CATÁLOGO MEGA COMPLETO
 * MegaComputer (82) + Productos Dropshipping (20) = 102 productos
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

// Primero ejecutar el generador de MegaComputer
import('./generar-catalogo-completo').then(async () => {
  console.log('\n🔄 Agregando productos de dropshipping...\n')
  
  // Leer el catálogo de MegaComputer generado
  const catalogoPath = join(process.cwd(), 'catalogo-completo-importar.json')
  const productosMega = JSON.parse(readFileSync(catalogoPath, 'utf-8'))
  
  // Productos de dropshipping (tipo SmartJoys)
  const productosDropshipping = [
    {
      name: "Smartwatch Reloj Inteligente Deportivo Bluetooth",
      description: "Smartwatch con monitor de frecuencia cardíaca, contador de pasos, notificaciones, resistente al agua IP67. Compatible con Android e iOS. Perfecto para fitness y deporte.",
      price: 89900,
      currency: "COP",
      category: "PHYSICAL",
      status: "AVAILABLE",
      images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"],
      tags: ["smartwatch", "reloj", "inteligente", "deportivo", "fitness", "bluetooth", "android", "ios", "salud", "ejercicio"],
      stock: 50,
      paymentLinkMercadoPago: "",
      paymentLinkPayPal: "",
      paymentLinkCustom: ""
    },
    {
      name: "Auriculares Inalámbricos TWS Bluetooth 5.0 Cancelación Ruido",
      description: "Auriculares inalámbricos con cancelación de ruido activa, estuche de carga, 24 horas de batería, sonido Hi-Fi, resistentes al agua IPX7.",
      price: 79900,
      currency: "COP",
      category: "PHYSICAL",
      status: "AVAILABLE",
      images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"],
      tags: ["auriculares", "audifonos", "bluetooth", "inalambricos", "tws", "cancelacion ruido", "musica", "deportivos"],
      stock: 100,
      paymentLinkMercadoPago: "",
      paymentLinkPayPal: "",
      paymentLinkCustom: ""
    },
    {
      name: "Cámara Web HD 1080p con Micrófono para PC Streaming",
      description: "Webcam Full HD 1080p con micrófono integrado, enfoque automático, ideal para videollamadas, streaming, clases online, trabajo remoto.",
      price: 69900,
      currency: "COP",
      category: "PHYSICAL",
      status: "AVAILABLE",
      images: ["https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800"],
      tags: ["webcam", "camara", "web", "hd", "1080p", "streaming", "zoom", "videollamada", "trabajo"],
      stock: 75,
      paymentLinkMercadoPago: "",
      paymentLinkPayPal: "",
      paymentLinkCustom: ""
    },
    {
      name: "Teclado y Mouse Inalámbrico Combo Recargable Silencioso",
      description: "Combo de teclado y mouse inalámbrico, recargable, silencioso, diseño ergonómico. Compatible con Windows, Mac, Linux. Ideal para oficina.",
      price: 89900,
      currency: "COP",
      category: "PHYSICAL",
      status: "AVAILABLE",
      images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800"],
      tags: ["teclado", "mouse", "inalambrico", "combo", "recargable", "oficina", "trabajo", "silencioso"],
      stock: 60,
      paymentLinkMercadoPago: "",
      paymentLinkPayPal: "",
      paymentLinkCustom: ""
    },
    {
      name: "Soporte para Laptop Ajustable Aluminio Ergonómico",
      description: "Soporte elevador para laptop, ajustable en altura y ángulo, aluminio resistente, mejora postura, ventilación óptima. Compatible con laptops de 10-17 pulgadas.",
      price: 59900,
      currency: "COP",
      category: "PHYSICAL",
      status: "AVAILABLE",
      images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800"],
      tags: ["soporte", "laptop", "ajustable", "aluminio", "ergonomico", "escritorio", "accesorio", "portatil"],
      stock: 40,
      paymentLinkMercadoPago: "",
      paymentLinkPayPal: "",
      paymentLinkCustom: ""
    },
    {
      name: "Lámpara LED Escritorio USB Recargable Táctil 3 Niveles",
      description: "Lámpara LED de escritorio con control táctil, 3 niveles de brillo, recargable por USB, luz blanca cálida, cuello flexible 360°.",
      price: 49900,
      currency: "COP",
      category: "PHYSICAL",
      status: "AVAILABLE",
      images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800"],
      tags: ["lampara", "led", "escritorio", "usb", "recargable", "tactil", "estudio", "lectura"],
      stock: 80,
      paymentLinkMercadoPago: "",
      paymentLinkPayPal: "",
      paymentLinkCustom: ""
    },
    {
      name: "Hub USB 3.0 7 Puertos Alta Velocidad con Interruptor",
      description: "Hub USB 3.0 de 7 puertos, alta velocidad 5Gbps, interruptores individuales, LED indicador, compatible con todos los dispositivos USB.",
      price: 39900,
      currency: "COP",
      category: "PHYSICAL",
      status: "AVAILABLE",
      images: ["https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800"],
      tags: ["hub", "usb", "3.0", "puertos", "adaptador", "pc", "accesorio", "alta velocidad"],
      stock: 90,
      paymentLinkMercadoPago: "",
      paymentLinkPayPal: "",
      paymentLinkCustom: ""
    },
    {
      name: "Mousepad Gamer XXL RGB LED Grande 80x30cm Antideslizante",
      description: "Mousepad gamer extra grande con iluminación RGB LED, superficie antideslizante, base de goma, bordes reforzados. Ideal para gaming profesional.",
      price: 45900,
      currency: "COP",
      category: "PHYSICAL",
      status: "AVAILABLE",
      images: ["https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800"],
      tags: ["mousepad", "gamer", "rgb", "led", "grande", "gaming", "accesorio", "xxl"],
      stock: 70,
      paymentLinkMercadoPago: "",
      paymentLinkPayPal: "",
      paymentLinkCustom: ""
    },
    {
      name: "Cargador Inalámbrico Rápido 15W Qi Compatible iPhone Samsung",
      description: "Cargador inalámbrico de carga rápida 15W, compatible con iPhone, Samsung, Xiaomi. Protección contra sobrecalentamiento, sobrecarga y cortocircuito.",
      price: 54900,
      currency: "COP",
      category: "PHYSICAL",
      status: "AVAILABLE",
      images: ["https://images.unsplash.com/photo-1591290619762-d71b5e0e5b98?w=800"],
      tags: ["cargador", "inalambrico", "rapido", "qi", "iphone", "samsung", "xiaomi", "15w"],
      stock: 85,
      paymentLinkMercadoPago: "",
      paymentLinkPayPal: "",
      paymentLinkCustom: ""
    },
    {
      name: "Organizador de Cables Clips Adhesivos 20 Piezas 3M",
      description: "Set de 20 clips organizadores de cables con adhesivo 3M ultra fuerte, mantén tu escritorio ordenado, fácil instalación, reutilizables.",
      price: 19900,
      currency: "COP",
      category: "PHYSICAL",
      status: "AVAILABLE",
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"],
      tags: ["organizador", "cables", "clips", "adhesivo", "escritorio", "orden", "accesorio", "3m"],
      stock: 150,
      paymentLinkMercadoPago: "",
      paymentLinkPayPal: "",
      paymentLinkCustom: ""
    },
    {
      name: "Mouse Gamer RGB 7200 DPI Programable 7 Botones",
      description: "Mouse gamer con iluminación RGB, 7200 DPI ajustables, 7 botones programables, diseño ergonómico. Perfecto para FPS, MOBA y MMO.",
      price: 79900,
      currency: "COP",
      category: "PHYSICAL",
      status: "AVAILABLE",
      images: ["https://images.unsplash.com/photo-1527814050087-3793815479db?w=800"],
      tags: ["mouse", "gamer", "gaming", "rgb", "dpi", "programable", "fps", "moba"],
      stock: 65,
      paymentLinkMercadoPago: "",
      paymentLinkPayPal: "",
      paymentLinkCustom: ""
    },
    {
      name: "Teclado Mecánico RGB Gaming Switches Azules Anti-Ghosting",
      description: "Teclado mecánico con switches azules, iluminación RGB personalizable, anti-ghosting completo, reposamuñecas desmontable. Ideal para gaming y productividad.",
      price: 189900,
      currency: "COP",
      category: "PHYSICAL",
      status: "AVAILABLE",
      images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800"],
      tags: ["teclado", "mecanico", "gaming", "rgb", "switches", "gamer", "pc", "azul"],
      stock: 45,
      paymentLinkMercadoPago: "",
      paymentLinkPayPal: "",
      paymentLinkCustom: ""
    },
    {
      name: "Micrófono USB Condensador Profesional Streaming Podcast",
      description: "Micrófono USB de condensador profesional, patrón cardioide, filtro anti-pop incluido, ideal para streaming, podcast, grabación vocal.",
      price: 129900,
      currency: "COP",
      category: "PHYSICAL",
      status: "AVAILABLE",
      images: ["https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800"],
      tags: ["microfono", "usb", "condensador", "streaming", "podcast", "grabacion", "profesional"],
      stock: 55,
      paymentLinkMercadoPago: "",
      paymentLinkPayPal: "",
      paymentLinkCustom: ""
    },
    {
      name: "Adaptador HDMI a VGA con Audio Convertidor 1080p",
      description: "Adaptador HDMI a VGA con salida de audio 3.5mm, soporta resolución 1080p, compatible con PC, laptop, proyector, monitor.",
      price: 29900,
      currency: "COP",
      category: "PHYSICAL",
      status: "AVAILABLE",
      images: ["https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800"],
      tags: ["adaptador", "hdmi", "vga", "convertidor", "audio", "1080p", "proyector"],
      stock: 100,
      paymentLinkMercadoPago: "",
      paymentLinkPayPal: "",
      paymentLinkCustom: ""
    },
    {
      name: "Cable HDMI 2.0 4K 60Hz 3 Metros Alta Velocidad",
      description: "Cable HDMI 2.0 de 3 metros, soporta 4K@60Hz, HDR, ARC, compatible con PS5, Xbox, TV, monitor, proyector. Conectores chapados en oro.",
      price: 34900,
      currency: "COP",
      category: "PHYSICAL",
      status: "AVAILABLE",
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"],
      tags: ["cable", "hdmi", "4k", "60hz", "alta velocidad", "ps5", "xbox", "tv"],
      stock: 120,
      paymentLinkMercadoPago: "",
      paymentLinkPayPal: "",
      paymentLinkCustom: ""
    },
    {
      name: "Ventilador USB Portátil Recargable Silencioso 3 Velocidades",
      description: "Ventilador USB portátil recargable, 3 velocidades ajustables, ultra silencioso, batería de larga duración. Ideal para escritorio, viajes.",
      price: 39900,
      currency: "COP",
      category: "PHYSICAL",
      status: "AVAILABLE",
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"],
      tags: ["ventilador", "usb", "portatil", "recargable", "silencioso", "escritorio", "viaje"],
      stock: 95,
      paymentLinkMercadoPago: "",
      paymentLinkPayPal: "",
      paymentLinkCustom: ""
    },
    {
      name: "Base Enfriadora para Laptop 6 Ventiladores LED RGB",
      description: "Base enfriadora para laptop con 6 ventiladores silenciosos, iluminación LED RGB, 5 ángulos ajustables, 2 puertos USB. Compatible con laptops de 12-17 pulgadas.",
      price: 79900,
      currency: "COP",
      category: "PHYSICAL",
      status: "AVAILABLE",
      images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800"],
      tags: ["base", "enfriadora", "laptop", "ventiladores", "led", "rgb", "cooling", "gamer"],
      stock: 50,
      paymentLinkMercadoPago: "",
      paymentLinkPayPal: "",
      paymentLinkCustom: ""
    },
    {
      name: "Memoria USB 3.0 64GB Alta Velocidad Metal Resistente",
      description: "Memoria USB 3.0 de 64GB, alta velocidad de transferencia, carcasa metálica resistente, compatible con PC, Mac, TV, auto.",
      price: 29900,
      currency: "COP",
      category: "PHYSICAL",
      status: "AVAILABLE",
      images: ["https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800"],
      tags: ["memoria", "usb", "3.0", "64gb", "pendrive", "almacenamiento", "metal", "rapido"],
      stock: 150,
      paymentLinkMercadoPago: "",
      paymentLinkPayPal: "",
      paymentLinkCustom: ""
    },
    {
      name: "Tarjeta Micro SD 128GB Clase 10 UHS-I Alta Velocidad",
      description: "Tarjeta Micro SD de 128GB, Clase 10, UHS-I, velocidad de lectura 100MB/s, ideal para cámaras, drones, smartphones, Nintendo Switch.",
      price: 44900,
      currency: "COP",
      category: "PHYSICAL",
      status: "AVAILABLE",
      images: ["https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800"],
      tags: ["micro sd", "128gb", "memoria", "clase 10", "almacenamiento", "camara", "drone", "switch"],
      stock: 130,
      paymentLinkMercadoPago: "",
      paymentLinkPayPal: "",
      paymentLinkCustom: ""
    },
    {
      name: "Protector de Pantalla Privacidad Laptop 15.6 Pulgadas",
      description: "Protector de pantalla con filtro de privacidad para laptop de 15.6 pulgadas, bloquea visión lateral, anti-reflejo, fácil instalación.",
      price: 54900,
      currency: "COP",
      category: "PHYSICAL",
      status: "AVAILABLE",
      images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800"],
      tags: ["protector", "pantalla", "privacidad", "laptop", "15.6", "anti reflejo", "seguridad"],
      stock: 60,
      paymentLinkMercadoPago: "",
      paymentLinkPayPal: "",
      paymentLinkCustom: ""
    }
  ]
  
  // Combinar ambos catálogos
  const catalogoCompleto = [...productosMega, ...productosDropshipping]
  
  // Guardar catálogo completo
  writeFileSync(catalogoPath, JSON.stringify(catalogoCompleto, null, 2), 'utf-8')
  
  console.log(`✅ Catálogo completo generado!`)
  console.log(`📦 Total productos: ${catalogoCompleto.length}`)
  console.log(`   - MegaComputer: ${productosMega.length}`)
  console.log(`   - Dropshipping: ${productosDropshipping.length}`)
  console.log(`\n💾 Archivo: catalogo-completo-importar.json`)
  console.log(`\n✨ Listo para importar con:`)
  console.log(`   npx tsx scripts/importar-productos-completos-con-tags.ts`)
})
