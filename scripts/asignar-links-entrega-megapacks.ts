/**
 * Script para asignar links de entrega de Google Drive a cada Mega Pack
 * Los links se enviarán automáticamente después del pago
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// Mapeo de Mega Packs con sus links de Google Drive
const megapackLinks: { [key: string]: string } = {
  // 1-10
  '1. CURSOS DISEÑO GRÁFICO': 'https://drive.google.com/open?id=1OfYcPn5UnlwBZ15GNGCyToVCv4xhaEUb',
  '2 OFFICE': 'https://drive.google.com/open?id=154AjtnTpPp8Xy7gqClutmEA5ByV3UELe',
  '3. INGLES': 'https://drive.google.com/open?id=1-RIJyRowZR_Wvh7tmg6A7p4kI8bspqrJ',
  '4. EXCEL': 'https://drive.google.com/open?id=1udXRUHpa_pPPusFaF8zHpJTrcv_1iFF5',
  '5. CURSO HACKING ÉTICO': 'https://drive.google.com/open?id=1zSaSxFPK2OVx8XlXc3Exw2LhNizdk5r3',
  '6. INFOGRAFÍAS': 'https://drive.google.com/open?id=1DhqmwTVl1pRgkz2fUBVassqi7TfCy2Ko',
  '7. DISEÑO GRÁFICO': 'https://drive.google.com/open?id=1YnIPCyHnYkSsqhihaeEC_tqXPm5YNxfE',
  '8. MARKETING DIGITAL': 'https://drive.google.com/open?id=1cC2KxNIKN0cNywfqKnmHvWVuyOI-F4k9',
  '9. INSTALADORES': 'https://drive.google.com/open?id=1BwOD8G8DNRIFEOu97mBqdMtohyT8tNl5',
  '10. KID IMPRIMIBLE': 'https://drive.google.com/open?id=1fg_SpIlaJ59bH-jH91nT_pTjGfshuXop',
  
  // 11-20
  '11. CUADROS EDITABLES': 'https://drive.google.com/open?id=1YFZ3IjUZjiBFYkgKyuADHVseSOQ7w0EF',
  '12. PORTADAS EDITABLES': 'https://drive.google.com/open?id=196SMTqFc91IW0pxXhWj0fiYGxJYCzF8m',
  '13. LIBROS MARKETING': 'https://drive.google.com/open?id=1KY5XUrO8VuIkvflY-yFqLudIxBjhglHS',
  '14. GASTRONOMÍA': 'https://drive.google.com/open?id=1G1LVh9ENN7UoROGm-zXla9YkYydHpNzh',
  '15. SÚPER MEMORIA': 'https://drive.google.com/open?id=1GlFylHZSijsVv7ibX0Qf6armpasr9oDj',
  '16. SUBLIMADOS': 'https://drive.google.com/open?id=1Rxc7dwMcUB54HLjsbzW7cQIW31nXrnzw',
  '17. FX PREMIERE': 'https://drive.google.com/open?id=1f2fpt8pA535h5EDGBTA8Bxu0wmEIOHZy',
  '18. DJ PRODUCCIÓN MUSICAL': 'https://drive.google.com/open?id=1LmnN1URGfJgJ_c0yQ682y2rpfrznGriy',
  '19. PROYECTOS': 'https://drive.google.com/open?id=18BBOqD7rZzqLOtmkrTOWXtQCBVki9Fdy',
  '20. ARQUITECTURA': 'https://drive.google.com/open?id=1DHfAMFXd9u_F7AHmpMLeOYouHLNNTiMs',
  
  // 21-30
  '21. CONSOLA EN MÓVIL - REPARACIÓN': 'https://drive.google.com/open?id=1jyqiiV6lELw7wfPVe5Oaq2TliSwwhAGs',
  '22. DESARROLLO WEB': 'https://drive.google.com/open?id=1gdyCA5It2qtpyMD4jF_sGfX63Do8bmKW',
  '23. PACK DE LIBROS': 'https://drive.google.com/open?id=1cnkyxl_sy4xwxx6pxtRmcceYGHsRwQYO',
  '24. INGENIERÍA': 'https://drive.google.com/open?id=1k8YJ1_VLfStY3VTAr5NXM5150EHDhB_Z',
  '25. ARMADO DE COMPUTADORA': 'https://drive.google.com/open?id=1L9ibzLVoC4ui05TPVHKSH1xwe2UnTwX3',
  '26. GUITARRA ACÚSTICA': 'https://drive.google.com/open?id=1I6NboyUItOOcqiaNDgo44nwQqCkd9e_l',
  '27. PREUNIVERSITARIO': 'https://drive.google.com/open?id=1uVXzzL_aJAcc9WfNwNvLztoHTX_Ebosd',
  '28. FOTOGRAFÍA PROFESIONAL': 'https://drive.google.com/open?id=1A7HNo0Udc8GDGRwL75illMjkhUXBlMsT',
  '29. AULA VIRTUAL': 'https://drive.google.com/open?id=1_yU91jX7qhFoAZotKxFSQp97Df1yWJIq',
  '30. PSICOLOGÍA PROFESIONAL': 'https://drive.google.com/open?id=11yNE6hP-O3plYkJ51uEnqqAUSDpeIHcR',
  
  // 31-40
  '31. EXPEDIENTES OBRAS RESIDENTE DE OBRAS': 'https://drive.google.com/open?id=1TYkP23mP2XwusI610eDzU-b6UkXdH039',
  '32. CURSO REVIT BIM': 'https://drive.google.com/open?id=17wfcNztBCJKH76KkyQ0Y3dTRo_1Yvv9m',
  '33. CURSO METRADOS LECTURA DE PLANOS': 'https://drive.google.com/open?id=18bLJSGnUktHpQCkrhgxNbmdLoVQ3Uw8j',
  '34. EXPEDIENTES TECNICOS VIVIENDAS': 'https://drive.google.com/open?id=1c8WbPa5DUn60kOFQDnzYIJ4konRonYBb',
  '35. PACK CONTABILIDAD': 'https://drive.google.com/open?id=1wKh-TGJG5Xns9AN2mUbfgWQ5VgM4gtpf',
  '36. PACK TERAPIA LENGUAJE Y AUTISMO': 'https://drive.google.com/open?id=1mNtIyWf4OcJE6mBZYuWI3GJoKu5kjMGs',
  '37. PACK CANVA': 'https://drive.google.com/open?id=1FJRHM-F1DSQPCMUZ_XZVRNYdiUYYwvBd',
  '38. COLECCION ALBUMES': 'https://drive.google.com/open?id=1FlbQPrKD9Xnl-s12b_IwYfXbnH-lGITy',
  '39. CURSO MECANICA DE MOTOS': 'https://drive.google.com/open?id=1VM5FV7rWMYhZiG5sNUNIkudqagm3Qedp',
  '40. PACK DRYWALL DESDE CERO': 'https://drive.google.com/open?id=1GUzgDNtq43nkJQYPc_EnUAajansWw9mS',
  
  // 41-50
  '41. CURSO FUERZA FIT': 'https://drive.google.com/open?id=12cf-oPboTkEcNnQswHtulpiOd5mjp-rU',
  '42. CURSO INGLES OXFORD': 'https://drive.google.com/open?id=1IzcVPqeJFviIj1adOG5Wevv-A3ue3rce',
  '43. CURSO FITNESS EL CAMINO DEL GUERRERO': 'https://drive.google.com/open?id=1lwkmabZu6_tueSkTbD8tqjW_s5pQ-G9j',
  '44. ENSAMBLAJE DE COMPUTADORAS': 'https://drive.google.com/open?id=1IliKLCntPplMNUCGs_5inAkCufOwXBis',
  '45. PACK FILMORA': 'https://drive.google.com/open?id=1oXsN2hX8byp7n9czuCRaDUONILxYdlml',
  '46. PACK EDUCA A TU PERRO': 'https://drive.google.com/open?id=1gmsr943dcsgm5y1AcAoXOD_vGRRKhVr2',
  '47. CURSO CINEMA 4D': 'https://drive.google.com/open?id=1lIYXk7__af6HRWzXx3V-mlTYHUJpE4fY',
  '48. PACK SEO MARKETING DESDE CERO': 'https://drive.google.com/open?id=1rCmKvDqhSqAYLXDhow-QieKTd_1vYE-Z',
  '49. PACK MARKETING DIGITAL': 'https://drive.google.com/open?id=1oha877iB_Z6Kmh7uC0jYuzCGzpvfDDp_',
  '50. PACK PROGRAMACIÓN': 'https://drive.google.com/open?id=1OpQx43DWRLZsJ3nt9iYOniidr_nUAeL3',

  // 51-60
  '51. CURSO REPARACIÓN DE CELULARES': 'https://drive.google.com/open?id=1tKE4GiFq3N3odeGjTuU0nrQgOWZUhNgF',
  '52. CURSO REPARACIÓN DE PLAY STATION': 'https://drive.google.com/open?id=1qq6HGOrZRAJ4_lCdAlEIzH6LUq9tQBsw',
  '53. PRESETS LIGHTROOM': 'https://drive.google.com/open?id=15Fmu2UaqGv2GEXplj91M6FQouARkR8dV',
  '54. CURSO CAR AUDIO DESDE CERO': 'https://drive.google.com/open?id=1KEUL5j1HDT8J-J1MqmQ2jaGKyxlMDW_9',
  '55. CURSO SERVIDORES LINUX': 'https://drive.google.com/open?id=1uPiwtsCDryHF-LyHaHvXpv0Ebl1ck9a9',
  '56. CURSO LOCUCIÓN PROFESIONAL': 'https://drive.google.com/open?id=1xM6IylsuIHADmfVftmHYsAmRJfnwuNJo',
  '57. CURSO CIBERSEGURIDAD': 'https://drive.google.com/open?id=1fHSoabb6hBQmQTSs_4NzvAhk11uvrBkX',
  '58. CURSO PILATES PARA UN CUERPO DE 10': 'https://drive.google.com/open?id=1ZU6ofJ6e67Lwvt8CKnqCWwMvzUoYKncQ',
  '59. CURSO MASTER EN WORDPRESS': 'https://drive.google.com/open?id=1tarxNsTUxXLtSzifWe3P2RUhkpoemAxj',
  '60. CURSO PHOTOSHOP PARA RETOQUE DE RETRATOS': 'https://drive.google.com/open?id=1q4y8bAH-NXlu7AvswF4P3VYymxVHQ9hq',
  
  // 61-70
  '61. CURSO MASTER EN ANIMACIÓN 3D': 'https://drive.google.com/open?id=1Ya5jGHKBPjxIxRZndLrb-iukOWbvkf21',
  '62. CURSO CREACIÓN DE VIDEOJUEGOS': 'https://drive.google.com/open?id=1xz8l8aAiIdLDasBThWQ_puHG8ZalDg90',
  '63. 15 MIL PLANOS PARA MUEBLES DE CARPINTERIA': 'https://drive.google.com/open?id=1kd7aqgo_cGbpfUs4Vwb7Lae5UiKaPVsU',
  '64. CURSO DISEÑO VISUAL DE MARCAS': 'https://drive.google.com/open?id=1FZcxqQe9VF4DCZ0rIb3GGGZo1_NMojCn',
  '65. CURSO DE DESARROLLO WEB': 'https://drive.google.com/open?id=1qbS_Lv1F7JX1xxkQ0tOMpbXV0v1w68VC',
  '66. CURSO DISEÑO DE INTERFACES MOVILES': 'https://drive.google.com/open?id=1THAdOVZlonWGlnrM_6rPL6jVi7WBniAk',
  '67. CURSO DE ECOMMERCE': 'https://drive.google.com/open?id=1w_HG4r7vLkwIKjVZzzHIRp6FCxTUD6Iz',
  '68. CURSO PHOTOSHOP PARA DISEÑO WEB': 'https://drive.google.com/open?id=1xJh1wJav3yt8-sIJ-eYllP5M_cHmil97',
  '69. CURSO DE FOTOGRAFIA PROFESIONAL': 'https://drive.google.com/open?id=1h5X8ksJXZGSqdXO6Gp4y6lD1O-Gux7tQ',
  '70. CURSO PRODUCCIÓN Y EDICIÓN DE VIDEO CON CAMARA': 'https://drive.google.com/open?id=1Mb04K4e0CfYZ5qkdpqQgbE-qsd5IPnVk',
  
  // 71-81
  '71. CURSO DE DIBUJO A ILUSTRACIÓN DIGITAL': 'https://drive.google.com/open?id=1XqIgPh-dnpmhed1qT59WVCsIvLcmrr6e',
  '72. CURSO DISEÑO DE APLICACIÓN MOVIL': 'https://drive.google.com/open?id=1Z-wlfVEa2QAdzVQ1K_ksdUpFSQePKQ9S',
  '73. CURSO ANIMACIÓN EXPRESS PARA REDES SOCIALES': 'https://drive.google.com/open?id=1wMqUIP3AQxh2mMn_6syfzbp-fHWNqO3e',
  '74. CURSO ADOBE INDESIGN DESDE CERO': 'https://drive.google.com/open?id=1RFj8bTpKmpn35VH4sRhcT-ATwLE3bVwM',
  '75. CURSO CREA Y GESTIONA UNA MARCA': 'https://drive.google.com/open?id=1G8ZP5Vg_3Vn1nRtVSkjxYwjXOLzw-XvU',
  '76. DISEÑO DE LOGOTIPOS CON RETICULAS': 'https://drive.google.com/open?id=1OkiLvS4Jlfohj7f0F9914lnfSfkedM9p',
  '77. DISEÑO EDITORIAL DESDE CERO': 'https://drive.google.com/open?id=1QNbNa7FFOUjU2Wd8fmpAOBJi5XYsPgvJ',
  '78. CURSO FOTOMONTAJE PUBLICITARIO': 'https://drive.google.com/open?id=11UWOG_OjzWAZyyoxl3vpu56_DxLkepqU',
  '79. CURSO LETTERING DESDE CERO': 'https://drive.google.com/open?id=1HZi8eI8TO7N6x7ld6Z8x4nIlUs1o3tpQ',
  '80. PACK IDIOMAS': 'https://drive.google.com/open?id=1_wuy7nghjwjf_pJg_IbFWf4fVjfdt_91',
  '81. COMICS CONDORITO': 'https://drive.google.com/open?id=15A_20cdxgXwDCUEWddY6JMvFjxuwL-8c',
}

// Link del MEGA PACK COMPLETO (todos los 81 cursos)
const MEGAPACK_COMPLETO_LINK = 'https://drive.google.com/drive/folders/1nyGxtM-0gOy98e4bAHd50VooPhicvM_8'

async function main() {
  console.log('🚀 Asignando links de entrega a Mega Packs...\n')
  
  let actualizados = 0
  let noEncontrados: string[] = []
  
  // Buscar todos los productos digitales (Mega Packs)
  const productos = await db.product.findMany({
    where: {
      OR: [
        { name: { contains: 'Mega Pack' } },
        { name: { contains: 'MEGA PACK' } },
        { name: { contains: 'mega pack' } },
        { category: 'DIGITAL' }
      ]
    }
  })
  
  console.log(`📦 Encontrados ${productos.length} productos digitales\n`)
  
  for (const producto of productos) {
    // Buscar el link correspondiente
    let linkEncontrado: string | null = null
    
    for (const [nombreCarpeta, link] of Object.entries(megapackLinks)) {
      // Extraer número y nombre del curso
      const match = nombreCarpeta.match(/^(\d+)\.\s*(.+)$/i)
      if (match) {
        const numero = match[1]
        const nombreCurso = match[2].toLowerCase()
        
        // Buscar coincidencia en el nombre del producto
        const nombreProducto = producto.name.toLowerCase()
        
        if (
          nombreProducto.includes(nombreCurso) ||
          nombreProducto.includes(`pack ${numero}`) ||
          nombreProducto.includes(`mega pack ${numero}`) ||
          nombreProducto.includes(numero + ':') ||
          nombreProducto.includes(numero + '.')
        ) {
          linkEncontrado = link
          break
        }
      }
    }
    
    if (linkEncontrado) {
      await db.product.update({
        where: { id: producto.id },
        data: { deliveryLink: linkEncontrado }
      })
      console.log(`✅ ${producto.name} → Link asignado`)
      actualizados++
    } else {
      noEncontrados.push(producto.name)
    }
  }
  
  // Crear o actualizar el MEGA PACK COMPLETO
  const megapackCompleto = await db.product.findFirst({
    where: {
      OR: [
        { name: { contains: 'MEGA PACK COMPLETO' } },
        { name: { contains: 'Mega Pack Completo' } },
        { name: { contains: '81 cursos' } }
      ]
    }
  })
  
  if (megapackCompleto) {
    await db.product.update({
      where: { id: megapackCompleto.id },
      data: {
        deliveryLink: MEGAPACK_COMPLETO_LINK,
        price: 60000,
        description: '🎓 MEGA PACK COMPLETO - 81 Cursos Profesionales\n\n✅ Acceso de por vida\n✅ Actualizaciones incluidas\n✅ Entrega inmediata por Google Drive\n\nIncluye: Diseño Gráfico, Marketing Digital, Programación, Excel, Inglés, Hacking Ético, Fotografía, y 74 cursos más!'
      }
    })
    console.log(`\n🎉 MEGA PACK COMPLETO actualizado (60,000 COP)`)
  } else {
    // Buscar el userId del admin
    const admin = await db.user.findFirst({
      where: { email: 'daveymena16@gmail.com' }
    })
    
    if (admin) {
      await db.product.create({
        data: {
          name: 'MEGA PACK COMPLETO - 81 Cursos Profesionales',
          description: '🎓 MEGA PACK COMPLETO - 81 Cursos Profesionales\n\n✅ Acceso de por vida\n✅ Actualizaciones incluidas\n✅ Entrega inmediata por Google Drive\n\nIncluye: Diseño Gráfico, Marketing Digital, Programación, Excel, Inglés, Hacking Ético, Fotografía, y 74 cursos más!',
          price: 60000,
          currency: 'COP',
          category: 'DIGITAL',
          status: 'AVAILABLE',
          deliveryLink: MEGAPACK_COMPLETO_LINK,
          userId: admin.id,
          tags: JSON.stringify(['mega pack', 'completo', '81 cursos', 'todos', 'bundle', 'oferta'])
        }
      })
      console.log(`\n🎉 MEGA PACK COMPLETO creado (60,000 COP)`)
    }
  }
  
  console.log(`\n📊 RESUMEN:`)
  console.log(`   ✅ Actualizados: ${actualizados}`)
  console.log(`   ⚠️ Sin link: ${noEncontrados.length}`)
  
  if (noEncontrados.length > 0) {
    console.log(`\n⚠️ Productos sin link asignado:`)
    noEncontrados.slice(0, 10).forEach(n => console.log(`   - ${n}`))
    if (noEncontrados.length > 10) {
      console.log(`   ... y ${noEncontrados.length - 10} más`)
    }
  }
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
