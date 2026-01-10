import dotenv from 'dotenv';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api';

async function testOllama() {
    console.log('🧪 Testing Ollama (Local LLM)...\n');

    const startTime = Date.now();
    const promptText = 'Explain the importance of monitoring LLM applications in production in exactly 50 words.';

    try {
        // Ollama API'ye istek gönder
        console.log('📤 Sending request to Ollama...');

        const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
            model: 'gemma3:4b',
            prompt: promptText,
            stream: false
        });

        const duration = Date.now() - startTime;
        const responseText = response.data.response;

        console.log('\n✅ Response:', responseText);

        // Token sayısını hesapla (yaklaşık)
        const promptTokens = Math.ceil(promptText.split(' ').length * 1.3);
        const completionTokens = Math.ceil(responseText.split(' ').length * 1.3);
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
            projectId: 'ollama-test-project',
            environment: 'development',
            provider: 'ollama',
            model: 'gemma3:4b',
            prompt: promptText,
            response: responseText,
            promptTokens: promptTokens,
            completionTokens: completionTokens,
            totalTokens: totalTokens,
            duration: duration,
            status: 'success',
            statusCode: 200,
            cost: 0, // Local model, no cost
            metadata: {
                test: true,
                local: true,
                ollamaVersion: response.data.model || 'unknown'
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
