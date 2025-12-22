import { Orchestrator } from './src/agents/orchestrator';

(async () => {
  const orchestrator = new Orchestrator();
  const testCases = [
    { message: 'Hola', description: 'Greeting' },
    { message: 'Quiero un portátil', description: 'Product search' },
    { message: '¿Cómo pago?', description: 'Payment question' },
  ];
  for (const tc of testCases) {
    console.log(`\n=== ${tc.description} ===`);
    try {
      const response = await orchestrator.processMessage({
        chatId: 'testChat',
        userId: 'testUser',
        message: tc.message,
        userName: 'Tester',
      });
      console.log('Response:', response);
    } catch (err) {
      console.error('Error during', tc.description, err);
    }
  }
})();
