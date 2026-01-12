
import { SalesAgentSimple } from '../src/lib/sales-agent-simple';

async function test() {
    const agent = new SalesAgentSimple();
    await agent.loadProducts();
    const phone = '573000000000';
    
    console.log('\n--- TEST PIANO ---');
    const res = await agent.processMessage('me interesa el curso de piano', phone);
    console.log('BOT:', res.text);
    
    console.log('\n--- TEST GREETING ---');
    const res2 = await agent.processMessage('hola david, como vas?', phone);
    console.log('BOT:', res2.text);
}

test();
