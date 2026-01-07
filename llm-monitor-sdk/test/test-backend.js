import axios from 'axios';

console.log('🧪 Testing Backend API directly...\n');

const testLog = {
    id: 'test-' + Date.now(),
    timestamp: new Date().toISOString(),
    projectId: 'direct-test',
    environment: 'development',
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    promptTokens: 14,
    completionTokens: 16,
    totalTokens: 30,
    duration: 1000,
    status: 'success',
    cost: 0,
    metadata: { test: true }
};

try {
    console.log('📤 Sending log to backend...');
    const startTime = Date.now();

    const response = await axios.post('http://localhost:3000/api/logs', testLog, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Success! (${duration}ms)`);
    console.log('Response:', response.data);
} catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
    }
}
