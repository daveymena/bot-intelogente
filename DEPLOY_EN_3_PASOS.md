# 🚀 DEPLOY EN 3 PASOS

## El bot está listo. Solo necesitas 15 minutos.

---

## Paso 1: Preparar (5 min)
```bash
.\PREPARAR_DEPLOY_COMPLETO.bat
```
✅ Limpia código  
✅ Ejecuta tests  
✅ Verifica todo

---

## Paso 2: Subir a GitHub (2 min)
```bash
.\SUBIR_A_REPO_PRIVADO.bat
```
✅ Crea repo privado  
✅ Sube código  
✅ Configura Git

---

## Paso 3: Deploy en Easypanel (8 min)

### A. Crear App (2 min)
1. Easypanel → "Create App"
2. Conectar con GitHub
3. Seleccionar repo

### B. Configurar (3 min)
```
Build: npm install && npm run build
Start: npm start
Port: 3000
```

### C. Variables (2 min)
Copiar de `VARIABLES_EASYPANEL_SUPER_SALES_AI.env`

### D. PostgreSQL (1 min)
1. Crear servicio PostgreSQL
2. Copiar `DATABASE_URL`
3. Pegar en variables

### E. Deploy
Click "Deploy" y esperar 2-3 minutos

---

## Paso 4: Conectar WhatsApp (2 min)
1. Ir a tu dominio
2. Login: `admin@example.com` / `admin123`
3. Click "Conectar WhatsApp"
4. Escanear QR

---

## ✅ ¡Listo!

Tu bot está funcionando 24/7 🎉

### Probar
Envía a tu WhatsApp:
- "Hola"
- "megapack de idiomas"
- "Tienes fotos?"
- "Como puedo pagar?"

---

## 📚 Más Info

- **Guía completa**: [INICIO_RAPIDO_PRODUCCION.md](INICIO_RAPIDO_PRODUCCION.md)
- **Checklist**: [CHECKLIST_FINAL_DEPLOY.md](CHECKLIST_FINAL_DEPLOY.md)
- **Menú interactivo**: `.\COMANDOS_RAPIDOS_DEPLOY.bat`

---

**Tiempo total**: 15 minutos  
**Costo**: $10-15/mes  
**Resultado**: Bot en producción ✅
