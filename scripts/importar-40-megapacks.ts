import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const megapacks = [
    { name: 'Mega Pack 01: Cursos Diseño Gráfico', description: 'Cursos completos de Photoshop, Illustrator, InDesign y técnicas profesionales de diseño gráfico', tags: ['diseño', 'grafico', 'photoshop', 'illustrator', 'curso'] },
    { name: 'Mega Pack 02: Cursos Microsoft Office', description: 'Cursos completos de Word, Excel, PowerPoint y Access desde básico hasta avanzado', tags: ['office', 'word', 'excel', 'powerpoint', 'curso'] },
    { name: 'Mega Pack 03: Cursos Inglés', description: 'Cursos de inglés desde básico hasta avanzado incluyendo conversación y negocios', tags: ['ingles', 'idiomas', 'conversacion', 'curso'] },
    { name: 'Mega Pack 04: Cursos Excel', description: 'Excel desde básico hasta avanzado con fórmulas, tablas dinámicas y macros', tags: ['excel', 'office', 'formulas', 'macros', 'curso'] },
    { name: 'Mega Pack 05: Cursos Hacking Ético', description: 'Seguridad informática, pentesting y auditorías de sistemas', tags: ['hacking', 'seguridad', 'pentesting', 'curso'] },
    { name: 'Mega Pack 06: Mega Pack Infografías', description: 'Plantillas y técnicas para crear infografías profesionales', tags: ['infografias', 'diseño', 'plantillas'] },
    { name: 'Mega Pack 07: Archivos editables de diseño gráfico', description: 'Archivos fuente editables para diseño gráfico profesional', tags: ['diseño', 'editables', 'plantillas'] },
    { name: 'Mega Pack 08: Instaladores', description: 'Software y herramientas de instalación profesionales', tags: ['software', 'instaladores', 'herramientas'] },
    { name: 'Mega Pack 09: Curso Memoria Poderosa', description: 'Técnicas de memorización y aprendizaje acelerado', tags: ['memoria', 'aprendizaje', 'tecnicas', 'curso'] },
    { name: 'Mega Pack 10: 3700 Libros Digitales', description: 'Biblioteca digital con 3700 libros en diversos temas', tags: ['libros', 'digital', 'biblioteca'] },
    { name: 'Mega Pack 11: Cursos Marketing Digital', description: 'SEO, SEM, Google Ads y estrategias de redes sociales', tags: ['marketing', 'digital', 'seo', 'sem', 'curso'] },
    { name: 'Mega Pack 12: Gastronomía Internacional', description: 'Recetas y técnicas culinarias de cocina internacional', tags: ['gastronomia', 'cocina', 'recetas'] },
    { name: 'Mega Pack 13: Ingeniería y Arquitectura', description: 'Cursos especializados en ingeniería y arquitectura', tags: ['ingenieria', 'arquitectura', 'curso'] },
    { name: 'Mega Pack 14: Pack Plantillas 100% Editables', description: 'Plantillas completamente personalizables para diversos usos', tags: ['plantillas', 'editables', 'diseño'] },
    { name: 'Mega Pack 15: FX Presets After Effects y Premiere', description: 'Efectos y presets para edición de video profesional', tags: ['video', 'efectos', 'premiere', 'aftereffects'] },
    { name: 'Mega Pack 16: Cursos Premium +900 GB', description: 'Python, JavaScript, Java, C++, desarrollo web y móvil', tags: ['programacion', 'python', 'javascript', 'curso'] },
    { name: 'Mega Pack 17: Apps Android Premium', description: 'Desarrollo de aplicaciones Android profesionales', tags: ['android', 'apps', 'desarrollo', 'curso'] },
    { name: 'Mega Pack 18: Reparación de teléfonos y tablets', description: 'Técnicas de reparación de dispositivos móviles', tags: ['reparacion', 'moviles', 'tablets', 'curso'] },
    { name: 'Mega Pack 19: WordPress', description: 'Landing Pages, Plugins y Themes para WordPress', tags: ['wordpress', 'web', 'plugins', 'themes'] },
    { name: 'Mega Pack 20: AudioLibros', description: 'Colección de audiolibros profesionales en diversos temas', tags: ['audiolibros', 'audio', 'libros'] },
    { name: 'Mega Pack 21: Pack Sublimado', description: 'Técnicas y recursos para sublimación profesional', tags: ['sublimado', 'diseño', 'tecnicas'] },
    { name: 'Mega Pack 22: Curso Crecimiento Personal', description: 'Desarrollo personal y profesional completo', tags: ['desarrollo', 'personal', 'motivacion', 'curso'] },
    { name: 'Mega Pack 23: Ensamblaje y Mantenimiento', description: 'Ensamblaje y mantenimiento de computadores', tags: ['computadores', 'ensamblaje', 'mantenimiento', 'curso'] },
    { name: 'Mega Pack 24: Recursos para diseño Arquitectura', description: 'Recursos especializados en diseño arquitectónico', tags: ['arquitectura', 'diseño', 'recursos'] },
    { name: 'Mega Pack 25: Construcción en Drywall', description: 'Técnicas de construcción en drywall paso a paso', tags: ['drywall', 'construccion', 'tecnicas'] },
    { name: 'Mega Pack 26: Macros', description: 'Automatización con macros en Excel y Office', tags: ['macros', 'excel', 'automatizacion'] },
    { name: 'Mega Pack 27: Cursos MultiProfesiones', description: 'Diversos oficios y profesiones en un solo pack', tags: ['oficios', 'profesiones', 'curso'] },
    { name: 'Mega Pack 28: PreUniversitario-Psicología', description: 'Preparación universitaria especializada en psicología', tags: ['psicologia', 'universidad', 'curso'] },
    { name: 'Mega Pack 29: Curso Resina', description: 'Trabajo con resinas y manualidades profesionales', tags: ['resina', 'manualidades', 'curso'] },
    { name: 'Mega Pack 30: BODA Bartender y Producción Musical', description: 'Organización de eventos y producción musical', tags: ['eventos', 'bartender', 'musica', 'curso'] },
    { name: 'Mega Pack 31: 550 Planos de Muebles de Melamina', description: 'Planos detallados para fabricación de muebles', tags: ['muebles', 'planos', 'melamina'] },
    { name: 'Mega Pack 32: Universitario', description: 'Recursos completos para estudios universitarios', tags: ['universidad', 'recursos', 'estudio'] },
    { name: 'Mega Pack 33: Filmora 9', description: 'Recursos y tutoriales completos para Filmora', tags: ['filmora', 'video', 'edicion'] },
    { name: 'Mega Pack 34: Plantillas Canva MEGA Pro', description: 'Plantillas profesionales premium para Canva', tags: ['canva', 'plantillas', 'diseño'] },
    { name: 'Mega Pack 35: Álbumes digitales de colección', description: 'Álbumes digitales especializados y de colección', tags: ['albumes', 'digital', 'coleccion'] },
    { name: 'Mega Pack 36: Libros de Pedagogía', description: 'Recursos pedagógicos y educativos profesionales', tags: ['pedagogia', 'educacion', 'libros'] },
    { name: 'Mega Pack 37: Marketing & Ventas', description: 'Estrategias de marketing y técnicas de ventas', tags: ['marketing', 'ventas', 'estrategias'] },
    { name: 'Mega Pack 38: Redes Sociales', description: 'Gestión profesional de redes sociales', tags: ['redes', 'sociales', 'marketing'] },
    { name: 'Mega Pack 39: Trading', description: 'Trading Forex y análisis técnico profesional', tags: ['trading', 'forex', 'inversiones'] },
    { name: 'Mega Pack 40: Educación', description: 'Recursos educativos generales y especializados', tags: ['educacion', 'recursos', 'curso'] }
];

async function importar() {
    console.log('📦 IMPORTANDO 40 MEGAPACKS INDIVIDUALES');
    console.log('='.repeat(70));

    const usuario = await prisma.user.findFirst();

    if (!usuario) {
        console.log('❌ No hay usuarios en la BD');
        return;
    }

    console.log(`✅ Usuario: ${usuario.email}\n`);

    let importados = 0;
    let actualizados = 0;

    for (const pack of megapacks) {
        try {
            const existente = await prisma.product.findFirst({
                where: { name: pack.name }
            });

            const data = {
                name: pack.name,
                description: pack.description,
                price: 20000,
                currency: 'COP',
                category: 'DIGITAL',
                status: 'AVAILABLE',
                images: JSON.stringify(['/fotos/megapack2.jpg']),
                tags: JSON.stringify(pack.tags),
                stock: null,
                userId: usuario.id,
            };

            if (existente) {
                await prisma.product.update({
                    where: { id: existente.id },
                    data
                });
                console.log(`🔄 ${pack.name}`);
                actualizados++;
            } else {
                await prisma.product.create({ data });
                console.log(`✅ ${pack.name}`);
                importados++;
            }

        } catch (error: any) {
            console.log(`❌ Error: ${pack.name}`);
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN:');
    console.log(`✅ Importados: ${importados}`);
    console.log(`🔄 Actualizados: ${actualizados}`);
    console.log(`📦 Total: ${importados + actualizados}/40`);
    console.log(`💰 Precio individual: $20.000 COP`);

    await prisma.$disconnect();
}

importar().catch(console.error);
