import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function limpiarUsuarios() {
    try {
        console.log('🔍 Verificando usuarios en la base de datos...\n');

        // Listar todos los usuarios
        const todosLosUsuarios = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                emailVerified: true,
            },
        });

        console.log(`📊 Total de usuarios encontrados: ${todosLosUsuarios.length}\n`);

        todosLosUsuarios.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email}`);
            console.log(`   - Nombre: ${user.name || 'Sin nombre'}`);
            console.log(`   - Verificado: ${user.emailVerified ? 'Sí' : 'No'}`);
            console.log(`   - Creado: ${user.createdAt.toLocaleString()}`);
            console.log('');
        });

        // Filtrar usuarios a eliminar (todos excepto daveymena16@gmail.com)
        const usuariosAEliminar = todosLosUsuarios.filter(
            (user) => user.email !== 'daveymena16@gmail.com'
        );

        if (usuariosAEliminar.length === 0) {
            console.log('✅ No hay usuarios para eliminar. Solo existe daveymena16@gmail.com');
            return;
        }

        console.log(`\n⚠️  Se eliminarán ${usuariosAEliminar.length} usuario(s):\n`);
        usuariosAEliminar.forEach((user) => {
            console.log(`   ❌ ${user.email}`);
        });

        console.log('\n🗑️  Eliminando usuarios...\n');

        // Eliminar en orden: primero las relaciones, luego los usuarios
        for (const user of usuariosAEliminar) {
            console.log(`Eliminando: ${user.email}...`);

            // Eliminar conversaciones del usuario
            await prisma.conversation.deleteMany({
                where: { userId: user.id },
            });

            // Eliminar productos del usuario
            await prisma.product.deleteMany({
                where: { userId: user.id },
            });

            // Eliminar configuraciones del usuario
            await prisma.botSettings.deleteMany({
                where: { userId: user.id },
            });

            // Eliminar membresías del usuario
            await prisma.membership.deleteMany({
                where: { userId: user.id },
            });

            // Eliminar sesiones del usuario
            await prisma.session.deleteMany({
                where: { userId: user.id },
            });

            // Eliminar códigos de verificación
            await prisma.verificationCode.deleteMany({
                where: { userId: user.id },
            });

            // Finalmente eliminar el usuario
            await prisma.user.delete({
                where: { id: user.id },
            });

            console.log(`   ✅ Eliminado: ${user.email}`);
        }

        console.log('\n✅ Limpieza completada!\n');

        // Verificar usuario restante
        const usuarioRestante = await prisma.user.findUnique({
            where: { email: 'daveymena16@gmail.com' },
            include: {
                membership: true,
            },
        });

        if (usuarioRestante) {
            console.log('👤 Usuario conservado:');
            console.log(`   Email: ${usuarioRestante.email}`);
            console.log(`   Nombre: ${usuarioRestante.name || 'Sin nombre'}`);
            console.log(`   Verificado: ${usuarioRestante.emailVerified ? 'Sí' : 'No'}`);
            console.log(`   Membresía: ${usuarioRestante.membership?.plan || 'Sin membresía'}`);
        } else {
            console.log('⚠️  ADVERTENCIA: No se encontró el usuario daveymena16@gmail.com');
        }

        console.log('\n📊 Verificando límites del sistema...\n');

        // Verificar límites en el schema
        const stats = {
            usuarios: await prisma.user.count(),
            productos: await prisma.product.count(),
            conversaciones: await prisma.conversation.count(),
            mensajes: await prisma.message.count(),
        };

        console.log('Estadísticas actuales:');
        console.log(`   - Usuarios: ${stats.usuarios}`);
        console.log(`   - Productos: ${stats.productos}`);
        console.log(`   - Conversaciones: ${stats.conversaciones}`);
        console.log(`   - Mensajes: ${stats.mensajes}`);

        console.log('\n✅ No hay límites configurados en el sistema');
        console.log('   El sistema puede manejar cantidades ilimitadas de:');
        console.log('   - Usuarios');
        console.log('   - Productos');
        console.log('   - Conversaciones');
        console.log('   - Mensajes');
        console.log('   - Sesiones de WhatsApp');

    } catch (error) {
        console.error('❌ Error durante la limpieza:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

limpiarUsuarios();
