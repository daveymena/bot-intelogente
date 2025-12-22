@echo off
echo.
echo ========================================
echo   VERIFICAR LINKS GUARDADOS EN BD
echo ========================================
echo.

npx tsx -e "import { db } from './src/lib/db'; (async () => { const products = await db.product.findMany({ where: { status: 'AVAILABLE' }, select: { name: true, price: true, paymentLinkMercadoPago: true, paymentLinkPayPal: true } }); console.log('\n📦 PRODUCTOS CON LINKS:\n'); let conLinks = 0; let sinLinks = 0; products.forEach(p => { const tieneMercadoPago = p.paymentLinkMercadoPago ? '✅' : '❌'; const tienePayPal = p.paymentLinkPayPal ? '✅' : '❌'; console.log(`${p.name}`); console.log(`   💰 Precio: ${p.price.toLocaleString('es-CO')} COP`); console.log(`   💳 MercadoPago: ${tieneMercadoPago}`); console.log(`   💙 PayPal: ${tienePayPal}\n`); if (p.paymentLinkMercadoPago || p.paymentLinkPayPal) conLinks++; else sinLinks++; }); console.log('📊 RESUMEN:'); console.log(`   ✅ Con links: ${conLinks}`); console.log(`   ❌ Sin links: ${sinLinks}`); console.log(`   📦 Total: ${products.length}\n`); process.exit(0); })();"

echo.
pause
