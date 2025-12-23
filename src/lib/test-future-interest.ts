
import { SalesAgentSimple } from './sales-agent-simple';

async function testFutureInterest() {
  const agent = new SalesAgentSimple();
  
  // Access private method
  const detectIntent = (agent as any).detectIntent.bind(agent);

  const testCases = [
    { input: "Te aviso mañana", expected: "future_interest" },
    { input: "Pago la próxima semana", expected: "future_interest" },
    { input: "Cuando me paguen lo compro", expected: "future_interest" },
    { input: "Me interesa pero no tengo dinero", expected: "price_objection" }, // Should overlap or be price_objection
    { input: "Mañana te envio el comprobante", expected: "will_send_receipt" },
    { input: "Te escribo luego", expected: "future_interest" },
    { input: "El lunes te confirmo", expected: "future_interest" },
    { input: "Si, pero pago despues", expected: "future_interest" }
  ];

  console.log("Starting Tests...");
  let passed = 0;
  
  for (const test of testCases) {
    const result = detectIntent(test.input);
    const success = result === test.expected;
    if (success) {
      console.log(`✅ Input: "${test.input}" -> Detected: ${result}`);
      passed++;
    } else {
      console.log(`❌ Input: "${test.input}" -> Expected: ${test.expected}, Got: ${result}`);
    }
  }

  console.log(`\nResults: ${passed}/${testCases.length} passed.`);
}

testFutureInterest();
