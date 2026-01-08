import dotenv from 'dotenv';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api';

async function testOllama() {
    console.log('🧪 Testing Ollama (Local LLM)...\n');

    const startTime = Date.now();

    try {
        // Ollama API'ye istek gönder
        console.log('📤 Sending request to Ollama...');

        const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
            model: 'gemma3:4b',  // veya 'mistral', 'codellama' gibi yüklü modeliniz
            prompt: 'Say "Hello from Ollama!" in exactly 5 words.',
            stream: false
        });

        const duration = Date.now() - startTime;
        const responseText = response.data.response;

        console.log('\n✅ Response:', responseText);

        // Token sayısını hesapla (yaklaşık)
        const promptTokens = 10;
        const completionTokens = responseText.split(' ').length;
        const totalTokens = promptTokens + completionTokens;

        console.log('\n📊 Usage:');
        console.log(`  - Prompt tokens: ${promptTokens} (estimated)`);
        console.log(`  - Completion tokens: ${completionTokens} (estimated)`);
        console.log(`  - Total tokens: ${totalTokens}`);
        console.log(`  - Duration: ${duration}ms`);

        // Backend'e log gönder
        const logEntry = {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            projectId: 'test-app',
            environment: 'development',
            provider: 'ollama',
            model: 'gemma3:4b',
            promptTokens: promptTokens,
            completionTokens: completionTokens,
            totalTokens: totalTokens,
            duration: duration,
            status: 'success',
            cost: 0, // Local model, no cost
            metadata: {
                test: true,
                local: true
            }
        };

        console.log('\n📤 Sending log to backend...');
        await axios.post(`${BACKEND_URL}/logs`, logEntry, {
            timeout: 30000,
            headers: { 'Content-Type': 'application/json' }
        });

        console.log('✅ Log sent successfully!');
        console.log('\n✅ Test completed! Check backend logs and database.');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.error('\n⚠️  Make sure Ollama is running:');
            console.error('   Run: ollama serve');
            console.error('   Or download from: https://ollama.ai');
        }

        process.exit(1);
    }
}

testOllama();
