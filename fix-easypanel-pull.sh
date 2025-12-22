#!/bin/bash

echo "=========================================="
echo "  ARREGLAR PULL EN EASYPANEL"
echo "=========================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar directorio
echo -e "${YELLOW}1. Verificando directorio...${NC}"
pwd
echo ""

# 2. Ver estado actual
echo -e "${YELLOW}2. Estado actual de Git:${NC}"
git status
echo ""

# 3. Ver últimos commits
echo -e "${YELLOW}3. Últimos commits:${NC}"
git log --oneline -5
echo ""

# 4. Guardar cambios locales (por si acaso)
echo -e "${YELLOW}4. Guardando cambios locales...${NC}"
git stash
echo ""

# 5. Descartar cambios
echo -e "${YELLOW}5. Descartando cambios locales...${NC}"
git reset --hard origin/main
echo ""

# 6. Limpiar archivos no rastreados
echo -e "${YELLOW}6. Limpiando archivos no rastreados...${NC}"
git clean -fd
echo ""

# 7. Hacer pull
echo -e "${YELLOW}7. Haciendo pull desde origin/main...${NC}"
git pull origin main
echo ""

# 8. Verificar resultado
echo -e "${YELLOW}8. Verificando resultado:${NC}"
git log --oneline -3
echo ""

# 9. Instalar dependencias
echo -e "${YELLOW}9. Instalando dependencias...${NC}"
npm install
echo ""

# 10. Generar Prisma Client
echo -e "${YELLOW}10. Generando Prisma Client...${NC}"
npx prisma generate
echo ""

echo "=========================================="
echo -e "${GREEN}  PULL COMPLETADO${NC}"
echo "=========================================="
echo ""
echo "Próximos pasos:"
echo "1. Reinicia la aplicación desde Easypanel UI"
echo "2. Verifica los logs"
echo "3. Prueba el dashboard"
echo ""
