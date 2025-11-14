const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 🎓 MEGA PACKS - 40 productos digitales
const megaPacks = [
    { name: 'Mega Pack 01: Cursos Diseño Gráfico', price: 20000, category: 'DIGITAL', description: 'Cursos completos de diseño gráfico profesional con herramientas Adobe' },
    { name: 'Mega Pack 02: Cursos Microsoft Office', price: 20000, category: 'Oficina y Productividad', description: 'Domina Word, Excel, PowerPoint y más herramientas de Office' },
    { name: 'Mega Pack 03: Cursos Inglés', price: 20000, category: 'Educación y Desarrollo Personal', description: 'Aprende inglés desde cero hasta nivel avanzado' },
    { name: 'Mega Pack 04: Cursos Excel', price: 20000, category: 'Oficina y Productividad', description: 'Excel avanzado, macros, tablas dinámicas y más' },
    { name: 'Mega Pack 05: Cursos Hacking Ético', price: 20000, category: 'Tecnología y Programación', description: 'Seguridad informática y hacking ético profesional' },
    { name: 'Mega Pack 06: Mega Pack Infografías', price: 20000, category: 'Diseño y Creatividad', description: 'Plantillas y recursos para crear infografías profesionales' },
    { name: 'Mega Pack 07: Archivos editables de diseño gráfico', price: 20000, category: 'Diseño y Creatividad', description: 'Miles de archivos PSD, AI y editables para diseño' },
    { name: 'Mega Pack 08: Instaladores', price: 20000, category: 'Tecnología y Programación', description: 'Software y herramientas profesionales' },
    { name: 'Mega Pack 09: Curso Memoria Poderosa', price: 20000, category: 'Educación y Desarrollo Personal', description: 'Técnicas para mejorar tu memoria y concentración' },
    { name: 'Mega Pack 10: 3700 Libros Digitales', price: 20000, category: 'Libros y Contenido', description: 'Biblioteca digital con miles de libros en PDF' },
    { name: 'Mega Pack 11: Cursos Marketing Digital', price: 20000, category: 'Marketing y Negocios', description: 'SEO, SEM, redes sociales y marketing online' },
    { name: 'Mega Pack 12: Gastronomía Internacional en PDF', price: 20000, category: 'Gastronomía y Oficios', description: 'Recetas y técnicas culinarias de todo el mundo' },
    { name: 'Mega Pack 13: Pack cursos Ingeniería y Arquitectura', price: 20000, category: 'Arquitectura y Construcción', description: 'AutoCAD, Revit, SketchUp y más' },
    { name: 'Mega Pack 14: Pack Plantillas 100% Editables', price: 20000, category: 'Diseño y Creatividad', description: 'Plantillas para Photoshop, Illustrator y más' },
    { name: 'Mega Pack 15: Mega Pack FX Presets After Effects y Premiere', price: 20000, category: 'Diseño y Creatividad', description: 'Efectos y presets profesionales para video' },
    { name: 'Mega Pack 16: Cursos Premium +900 GB de cursos', price: 20000, category: 'Tecnología y Programación', description: 'Biblioteca masiva de cursos de programación' },
    { name: 'Mega Pack 17: Apps Android Premium', price: 20000, category: 'Tecnología y Programación', description: 'Aplicaciones Android premium desbloqueadas' },
    { name: 'Mega Pack 18: Reparación de teléfonos y tablets', price: 20000, category: 'Tecnología y Programación', description: 'Cursos de reparación de dispositivos móviles' },
    { name: 'Mega Pack 19: Wordpress – Landing Page, Plugin y Themes', price: 20000, category: 'Tecnología y Programación', description: 'Recursos completos para WordPress' },
    { name: 'Mega Pack 20: AudioLibros – AudioBooks', price: 20000, category: 'Libros y Contenido', description: 'Colección de audiolibros en español' },
    { name: 'Mega Pack 21: Pack Sublimado', price: 20000, category: 'Sublimado y Manualidades', description: 'Diseños y recursos para sublimación' },
    { name: 'Mega Pack 22: Curso Crecimiento Personal', price: 20000, category: 'Educación y Desarrollo Personal', description: 'Desarrollo personal y liderazgo' },
    { name: 'Mega Pack 23: Curso Ensamblaje y Mantenimiento', price: 20000, category: 'Tecnología y Programación', description: 'Ensamblaje y reparación de computadoras' },
    { name: 'Mega Pack 24: Recursos para diseño Arquitectura', price: 20000, category: 'Diseño y Creatividad', description: 'Bloques, texturas y recursos para arquitectura' },
    { name: 'Mega Pack 25: Cursos Construcción en Drywall', price: 20000, category: 'Gastronomía y Oficios', description: 'Técnicas profesionales de construcción en seco' },
    { name: 'Mega Pack 26: Macros', price: 20000, category: 'Oficina y Productividad', description: 'Macros avanzadas para Excel y automatización' },
    { name: 'Mega Pack 27: Cursos MultiProfesiones', price: 20000, category: 'Gastronomía y Oficios', description: 'Múltiples oficios y profesiones' },
    { name: 'Mega Pack 28: PreUniversitario-Psicología', price: 20000, category: 'Educación y Desarrollo Personal', description: 'Preparación universitaria y psicología' },
    { name: 'Mega Pack 29: Curso Resina', price: 20000, category: 'Gastronomía y Oficios', description: 'Trabajos en resina epóxica' },
    { name: 'Mega Pack 30: Cursos BODA, Bartender y Producción Musical', price: 20000, category: 'Gastronomía y Oficios', description: 'Organización de eventos y producción' },
    { name: 'Mega Pack 31: 550 Planos de Muebles de Melamina', price: 20000, category: 'Arquitectura y Construcción', description: 'Planos detallados para carpintería' },
    { name: 'Mega Pack 32: Universitario', price: 20000, category: 'Educación y Desarrollo Personal', description: 'Recursos para estudiantes universitarios' },
    { name: 'Mega Pack 33: Filmora 9', price: 20000, category: 'Diseño y Creatividad', description: 'Curso completo de edición de video' },
    { name: 'Mega Pack 34: Plantillas Canva MEGA Pro', price: 20000, category: 'Diseño y Creatividad', description: 'Miles de plantillas profesionales para Canva' },
    { name: 'Mega Pack 35: Álbumes digitales de colección', price: 20000, category: 'Libros y Contenido', description: 'Colección de álbumes digitales' },
    { name: 'Mega Pack 36: Libros de Pedagogía', price: 20000, category: 'Educación y Desarrollo Personal', description: 'Biblioteca de pedagogía y educación' },
    { name: 'Mega Pack 37: Marketing & Ventas', price: 20000, category: 'Marketing y Negocios', description: 'Estrategias de marketing y ventas' },
    { name: 'Mega Pack 38: Redes Sociales', price: 20000, category: 'Marketing y Negocios', description: 'Gestión profesional de redes sociales' },
    { name: 'Mega Pack 39: Trading', price: 20000, category: 'Marketing y Negocios', description: 'Trading y análisis de mercados financieros' },
    { name: 'Mega Pack 40: Educación', price: 20000, category: 'Educación y Desarrollo Personal', description: 'Recursos educativos completos' },
    { name: 'Mega Pack Completo (40 productos)', price: 60000, category: 'Paquete Completo', description: 'TODOS los 40 Mega Packs incluidos. Ahorra $740.000 COP. Acceso de por vida con actualizaciones.' }
];

// 🏍️ MOTO NS-160
const motoNS160 = [
    {
        name: 'Moto NS-160 2024',
        price: 8500000,
        category: 'Motos',
        description: 'Moto deportiva NS-160 modelo 2024, motor 160cc, frenos ABS, tablero digital, excelente estado'
    },
    {
        name: 'Moto NS-160 Usada',
        price: 6500000,
        category: 'Motos',
        description: 'Moto NS-160 usada en buen estado, papeles al día, revisión técnico-mecánica vigente'
    },
    {
        name: 'Repuestos Moto NS-160',
        price: 150000,
        category: 'Motos',
        description: 'Repuestos originales y genéricos para Moto NS-160. Consulta disponibilidad'
    }
];

async function agregarProductos() {
    console.log('🎓 AGREGANDO MEGA PACKS Y MOTO NS-160\n');

    // Obtener el primer usuario
    const usuario = await prisma.user.findFirst();
    if (!usuario) {
        console.error('❌ No hay usuarios en la base de datos');
        await prisma.$disconnect();
        return;
    }

    console.log(`✅ Usuario encontrado: ${usuario.email}\n`);

    let agregados = 0;
    let existentes = 0;
    let errores = 0;

    // Agregar Mega Packs
    console.log('📦 Agregando Mega Packs...');
    for (const pack of megaPacks) {
        try {
            const existe = await prisma.product.findFirst({
                where: { name: pack.name }
            });

            if (!existe) {
                await prisma.product.create({
                    data: {
                        name: pack.name,
                        description: pack.description,
                        price: pack.price,
                        category: pack.category,
                        stock: 999,
                        status: 'AVAILABLE',
                        images: JSON.stringify([]),
                        userId: usuario.id
                    }
                });
                console.log(`  ✅ ${pack.name}`);
                agregados++;
            } else {
                console.log(`  ⏭️  ${pack.name} (ya existe)`);
                existentes++;
            }
        } catch (error) {
            console.error(`  ❌ ${pack.name}: ${error.message}`);
            errores++;
        }
    }

    // Agregar Moto NS-160
    console.log('\n🏍️  Agregando Moto NS-160...');
    for (const moto of motoNS160) {
        try {
            const existe = await prisma.product.findFirst({
                where: { name: moto.name }
            });

            if (!existe) {
                await prisma.product.create({
                    data: {
                        name: moto.name,
                        description: moto.description,
                        price: moto.price,
                        category: moto.category,
                        stock: moto.name.includes('Repuestos') ? 50 : 1,
                        status: 'AVAILABLE',
                        images: JSON.stringify([]),
                        userId: usuario.id
                    }
                });
                console.log(`  ✅ ${moto.name}`);
                agregados++;
            } else {
                console.log(`  ⏭️  ${moto.name} (ya existe)`);
                existentes++;
            }
        } catch (error) {
            console.error(`  ❌ ${moto.name}: ${error.message}`);
            errores++;
        }
    }

    console.log('\n📊 RESUMEN:');
    console.log(`✅ Agregados: ${agregados}`);
    console.log(`⏭️  Ya existían: ${existentes}`);
    console.log(`❌ Errores: ${errores}`);

    // Contar total de productos
    const total = await prisma.product.count();
    console.log(`\n📦 Total de productos en BD: ${total}`);

    await prisma.$disconnect();
    console.log('\n🎉 ¡Completado!');
}

agregarProductos().catch(console.error);
