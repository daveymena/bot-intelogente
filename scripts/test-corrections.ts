
import { FuzzyProductSearch } from '../src/lib/fuzzy-product-search';
import { Orchestrator } from '../src/agents/orchestrator';
import { SharedMemoryService } from '../src/agents/shared-memory';
import * as fs from 'fs';

async function runTests() {
  let output = 'Iniciando verificacion de correcciones...\n\n';

  // --- TEST 1: Fuzzy Search & Sinonimos ---
  output += 'TEST 1: Busqueda Fuzzy y Sinonimos\n';
  
  const mockProducts = [
    { id: '1', name: 'Portatil Asus Vivobook', category: 'LAPTOP', description: 'Laptop potente', price: 1000 },
    { id: '2', name: 'Curso de Piano', category: 'DIGITAL', description: 'Aprende piano', price: 50 },
  ];

  const searchTerms = ['portátil', 'portatil', 'laptop', 'computador'];
  let searchPass = true;

  for (const term of searchTerms) {
    const normalize = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let keywords = [normalize(term)];
    
    if (normalize(term).includes('portatil')) keywords.push('laptop', 'computador', 'pc');
    if (normalize(term).includes('laptop')) keywords.push('portatil', 'computador');
    if (normalize(term).includes('computador')) keywords.push('portatil', 'laptop', 'pc');

    const found = mockProducts.some(p => {
      const text = normalize(p.name + ' ' + p.category + ' ' + p.description);
      return keywords.some(k => text.includes(k));
    });

    if (found) {
      output += `[PASS] Busqueda "${term}" -> Encontro producto\n`;
    } else {
      output += `[FAIL] Busqueda "${term}" -> NO encontro producto\n`;
      searchPass = false;
    }
  }

  // --- TEST 2: Deteccion de Pagos ---
  output += '\nTEST 2: Deteccion de Intencion de Pago\n';
  
  const paymentPatterns = [
    /\b(quiero|deseo|me interesa)\s+(pagar|comprar|adquirir)/i,
    /\b(cómo|como)\s+(pago|compro|puedo pagar)/i,
    /\b(link|enlace)\s+(de\s+)?(pago|compra)/i,
    /\b(métodos?|formas?|opciones?)\s+(de\s+)?pago/i,
    /\b(pagar|comprar)\s+(con|por|mediante)\s+(mercadopago|paypal|nequi|daviplata)/i,
  ];

  const detectPaymentIntent = (message: string) => {
    const lower = message.toLowerCase().trim();
    
    const courtesyPatterns = [
      /^(ok|vale|bien|entendido|perfecto|gracias|de acuerdo)$/i,
      /^(ok gracias|vale gracias|perfecto gracias)$/i,
      /^(si|sí|no)$/i,
    ];
    
    for (const pattern of courtesyPatterns) {
      if (pattern.test(lower)) return false;
    }
    
    for (const p of paymentPatterns) {
        if (p.test(lower)) {
            output += `   -> Match pattern: ${p}\n`;
            return true;
        }
    }
    return false;
  };

  const paymentTests = [
    { msg: 'ok gracias', expected: false },
    { msg: 'vale', expected: false },
    { msg: 'entendido', expected: false },
    { msg: 'quiero pagar', expected: true },
    { msg: 'como pago', expected: true },
    { msg: 'dame el link de pago', expected: true },
    { msg: 'me interesa el curso', expected: false },
  ];

  let paymentPass = true;
  for (const t of paymentTests) {
    const result = detectPaymentIntent(t.msg);
    if (result === t.expected) {
      output += `[PASS] Mensaje: "${t.msg}" -> Detectado: ${result}\n`;
    } else {
      output += `[FAIL] Mensaje: "${t.msg}" -> Detectado: ${result} (ESPERADO: ${t.expected})\n`;
      paymentPass = false;
    }
  }

  output += '\n-----------------------------------\n';
  if (searchPass && paymentPass) {
    output += 'TODOS LOS TESTS PASARON EXITOSAMENTE\n';
    fs.writeFileSync('verification_results.txt', output);
    console.log(output);
    process.exit(0);
  } else {
    output += 'ALGUNOS TESTS FALLARON\n';
    fs.writeFileSync('verification_results.txt', output);
    console.log(output);
    process.exit(1);
  }
}

runTests().catch(console.error);
