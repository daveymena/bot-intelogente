@echo off
echo ========================================
echo APLICAR SISTEMA DE INTERPRETE
echo ========================================
echo.

echo [1/4] Generando cliente de Prisma...
npx prisma generate
echo.

echo [2/4] Creando migracion de base de datos...
npx prisma migrate dev --name add_custom_category_and_interpreter
echo.

echo [3/4] Agregando archivos al repositorio...
git add .
echo.

echo [4/4] Creando commit...
git commit -m "feat: Sistema de Interprete + Categorias Personalizadas

NUEVO SISTEMA DE INTERPRETACION:
- Agente interprete que reinterpreta consultas ambiguas
- Detecta intencion real del cliente (busqueda general vs especifica)
- Identifica presupuesto, metodos de pago, disponibilidad
- Integrado con razonamiento profundo
- Sin confusiones ni malentendidos

CATEGORIAS PERSONALIZADAS:
- Campo customCategory en schema
- Cliente puede crear sus propias categorias
- Mejor organizacion de productos
- Personalizable por negocio

MEJORAS EN BUSQUEDA:
- Interprete detecta si cliente quiere ver opciones o producto especifico
- Pregunta uso y presupuesto cuando es busqueda general
- Muestra producto directo cuando es busqueda especifica
- Entiende metodos de pago especificos

EJEMPLOS:
- 'portatiles' → Pregunta uso y presupuesto
- 'curso de piano' → Muestra ese curso especifico
- 'quiero pagar por Nequi' → Envia numero Nequi
- 'tengo 500mil' → Busca en ese rango

Archivos:
- src/agents/interpreter-agent.ts (NUEVO)
- src/agents/orchestrator.ts (MODIFICADO)
- src/agents/deep-reasoning-agent.ts (MODIFICADO)
- prisma/schema.prisma (MODIFICADO)
- .env (MODIFICADO)

Resuelve: Confusiones en busquedas y malentendidos de intencion"
echo.

echo ========================================
echo LISTO PARA SUBIR
echo ========================================
echo.
echo Siguiente paso:
echo 1. Revisar que todo este correcto
echo 2. Ejecutar: git push origin main
echo 3. En Easypanel: Pull + Rebuild + Migrate
echo.
pause
