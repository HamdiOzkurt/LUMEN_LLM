import { OpenAIProvider } from '../src/providers/openai.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * OpenAI Provider Test
 * Backend'in çalıştığından emin ol: npm run dev
 */
async function testOpenAI() {
    console.log('🧪 Testing OpenAI Provider...\n');

    const llm = new OpenAIProvider({
        apiKey: process.env.OPENAI_API_KEY,
        backendUrl: 'http://localhost:3000/api',
        projectId: 'test-app',
        environment: 'development',
        debug: true,
    });

    try {
        console.log('📤 Sending request to OpenAI...');

        const response = await llm.createCompletion({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Say "Hello from LLM Monitor!" in 5 words.' }
            ],
            temperature: 0.7,
            max_tokens: 20,
        });

        console.log('\n✅ Response:', response.choices[0].message.content);
        console.log('\n📊 Usage:');
        console.log('  - Prompt tokens:', response.usage.prompt_tokens);
        console.log('  - Completion tokens:', response.usage.completion_tokens);
        console.log('  - Total tokens:', response.usage.total_tokens);
        console.log('\n✅ Test completed! Check backend logs and database.');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
    }
}

testOpenAI();
