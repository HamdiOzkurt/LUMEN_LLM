# 🎯 LLM Monitor SDK

Lightweight SDK for monitoring LLM usage, cost, and performance across OpenAI, Gemini, and more.

## 🚀 Quick Start

### Installation

```bash
npm install @llm-dashboard/monitor-sdk
```

### OpenAI Example

```javascript
import { OpenAIProvider } from '@llm-dashboard/monitor-sdk';

const llm = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY,
  backendUrl: 'http://localhost:3000/api',
  projectId: 'my-app',
  environment: 'production',
});

// Aynı OpenAI API kullanımı - otomatik loglama!
const response = await llm.createCompletion({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'user', content: 'Hello!' }
  ],
});

console.log(response.choices[0].message.content);
```

### Gemini Example

```javascript
import { GeminiProvider } from '@llm-dashboard/monitor-sdk';

const llm = new GeminiProvider({
  apiKey: process.env.GEMINI_API_KEY,
  backendUrl: 'http://localhost:3000/api',
  projectId: 'my-app',
});

const response = await llm.generateContent({
  model: 'gemini-1.5-flash',
  prompt: 'Explain quantum computing',
});

console.log(response.response.text());
```

## 📦 Features

- ✅ **Zero Configuration** - Minimal code changes
- ✅ **Automatic Logging** - Tokens, cost, latency tracked automatically
- ✅ **Provider Agnostic** - OpenAI, Gemini (Anthropic coming soon)
- ✅ **Cost Calculation** - Real-time cost tracking
- ✅ **Non-blocking** - Logging doesn't slow down your app
- ✅ **Error Resilient** - Backend failures don't affect your app

## 🔧 Configuration

```javascript
const config = {
  apiKey: 'your-llm-api-key',        // Required: LLM provider API key
  backendUrl: 'http://...api',       // Optional: Backend URL (default: localhost:3000)
  projectId: 'my-app',               // Optional: Project identifier
  environment: 'production',         // Optional: Environment name
  sendToBackend: true,               // Optional: Enable/disable logging
  debug: false,                      // Optional: Debug mode
};
```

## 📊 What Gets Logged

Every LLM call automatically logs:

- Provider name (openai, gemini, etc.)
- Model name
- Token usage (prompt, completion, total)
- Request duration (ms)
- Cost (USD)
- Success/error status
- Timestamp
- Custom metadata

## 🧪 Testing

```bash
# Install dependencies
npm install

# Test OpenAI (make sure backend is running)
npm test

# Test Gemini
npm run test:gemini
```

## 📖 API Reference

### OpenAIProvider

```javascript
const llm = new OpenAIProvider(config);

// Chat completion
const response = await llm.createCompletion(params);

// Alias
const response = await llm.chat(params);

// Access original client
const client = llm.getClient();
```

### GeminiProvider

```javascript
const llm = new GeminiProvider(config);

// Single generation
const response = await llm.generateContent(params);

// Chat session
const chat = await llm.startChat(params);
await chat.sendMessage('Hello!');

// Access original client
const client = llm.getClient();
```

### Cost Utilities

```javascript
import { calculateCost, getPricing } from '@llm-dashboard/monitor-sdk';

// Calculate cost
const cost = calculateCost('openai', 'gpt-4o-mini', {
  promptTokens: 100,
  completionTokens: 50,
});

// Get pricing table
const pricing = getPricing('openai');
```

## 🎯 Use Cases

- Track LLM costs across multiple apps
- Monitor performance and latency
- Debug API errors
- A/B test different models
- Set budget alerts
- Generate usage reports

## 📝 License

ISC

## 👨‍💻 Author

Ahmet Hamdi Özkurt
