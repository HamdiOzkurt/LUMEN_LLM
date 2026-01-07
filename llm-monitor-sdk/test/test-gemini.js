import { GeminiProvider } from '../src/providers/gemini.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Gemini Provider Test
 * Backend'in çalıştığından emin ol: npm run dev
 */
async function testGemini() {
    console.log('🧪 Testing Gemini Provider...\n');

    const llm = new GeminiProvider({
        apiKey: process.env.GEMINI_API_KEY,
        backendUrl: 'http://localhost:3000/api',
        projectId: 'test-app',
        environment: 'development',
        debug: true,
    });

    try {
        console.log('📤 Sending request to Gemini...');

        const response = await llm.generateContent({
            model: 'gemini-2.5-flash',
            prompt: 'Say "Hello from Gemini Monitor!" in exactly 5 words.',
            temperature: 0.7,
            maxOutputTokens: 20,
        });

        const text = response.response.text();
        console.log('\n✅ Response:', text);

        const usage = response.response.usageMetadata;
        console.log('\n📊 Usage:');
        console.log('  - Prompt tokens:', usage.promptTokenCount);
        console.log('  - Completion tokens:', usage.candidatesTokenCount);
        console.log('  - Total tokens:', usage.totalTokenCount);
        console.log('\n✅ Test completed! Check backend logs and database.');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
    }
}

testGemini();
