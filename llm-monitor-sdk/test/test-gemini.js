import { GeminiProvider } from '../src/providers/gemini.js';
import dotenv from 'dotenv';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const API_URL = 'http://localhost:5000/api';

/**
 * Creates a new session on the backend
 */
async function createSession() {
    const sessionId = uuidv4();
    try {
        console.log('🔄 Creating new session:', sessionId);
        await axios.post(`${API_URL}/sessions`, {
            sessionId,
            userId: 'Ahmet',
            projectId: 'super-ai-botu',
            provider: 'gemini',
            model: 'gemini-2.5-flash',
            metadata: { source: 'test-script' }
        });
        console.log('✅ Session created successfully');
        return sessionId;
    } catch (e) {
        console.error('❌ Failed to create session:', e.message);
        return null;
    }
}

/**
 * Gemini Provider Test
 * Backend'in çalıştığından emin ol: npm run dev
 */
async function testGemini() {
    console.log('🧪 Testing Gemini Provider with Session Tracking...\n');

    // 1. Create a session first
    const sessionId = await createSession();

    if (!sessionId) {
        console.error('❌ Aborting test due to session creation failure.');
        return;
    }

    // 2. Initialize Provider with sessionId
    const llm = new GeminiProvider({
        apiKey: process.env.GEMINI_API_KEY,
        backendUrl: API_URL,
        projectId: 'super-ai-botu',
        environment: 'development',
        sessionId: sessionId, // Critical for session tracking
        debug: true,
    });

    try {
        console.log('📤 Sending request to Gemini...');

        const response = await llm.generateContent({
            model: 'gemini-2.5-flash', // Switching to stable 1.5-flash
            prompt: 'Write a detailed 200-word explanation about the importance of monitoring LLM costs and performance in production applications. Include specific metrics that should be tracked.',
            temperature: 0.7,
            maxOutputTokens: 1000,
        });

        const candidates = response.response.candidates;
        const finishReason = candidates && candidates[0] ? candidates[0].finishReason : 'UNKNOWN';

        const text = response.response.text();
        console.log('---------------------------------------------------');
        console.log(`✅ Response Length: ${text.length} characters`);
        console.log(`ℹ️ Finish Reason: ${finishReason}`);
        console.log('✅ Response content preview:', text.substring(0, 100) + '...');
        console.log('---------------------------------------------------');
        console.log('\nFULL RESPONSE:\n', text);
        console.log('---------------------------------------------------');

        const usage = response.response.usageMetadata;
        console.log('\n📊 Usage:');
        console.log('  - Prompt tokens:', usage.promptTokenCount);
        console.log('  - Completion tokens:', usage.candidatesTokenCount);
        console.log('  - Total tokens:', usage.totalTokenCount);
        console.log('\n✅ Test completed! Check "Sessions" page in the dashboard.');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (error.response) {
            console.error('Error details:', error.response);
        }
    }
}

testGemini();
