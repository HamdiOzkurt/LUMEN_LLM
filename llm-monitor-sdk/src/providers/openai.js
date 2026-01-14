import OpenAI from 'openai';
import { BaseProvider } from './base.js';
import { calculateCost } from '../cost-calculator.js';

/**
 * OpenAI Provider
 * OpenAI API çağrılarını wrap eder ve otomatik loglama yapar
 */
export class OpenAIProvider extends BaseProvider {
    constructor(config) {
        super(config);
        this.client = new OpenAI({ apiKey: config.apiKey });
    }

    /**
     * Chat completion oluştur (monitörlü)
     */
    async createCompletion(params) {
        const startTime = Date.now();
        let usage = null;
        let error = null;
        let response = null;
        let promptText = '';
        let responseText = '';

        try {
            // Extract prompt from messages
            if (params.messages && params.messages.length > 0) {
                promptText = params.messages.map(m => `${m.role}: ${m.content}`).join('\n');
            }

            // Gerçek OpenAI çağrısı
            response = await this.client.chat.completions.create(params);

            // Extract response text
            if (response.choices && response.choices.length > 0) {
                responseText = response.choices[0].message?.content || '';
            }

            usage = {
                promptTokens: response.usage.prompt_tokens,
                completionTokens: response.usage.completion_tokens,
                totalTokens: response.usage.total_tokens,
            };

        } catch (err) {
            error = {
                message: err.message,
                type: err.type || 'unknown',
                code: err.code || err.status || 'unknown',
            };
            responseText = `Error: ${err.message}`;
            throw err;
        } finally {
            const duration = Date.now() - startTime;

            // Extract HTTP status code
            const statusCode = error ? (typeof error.code === 'number' ? error.code : 500) : 200;

            // Log kaydı oluştur
            await this.logUsage({
                provider: 'openai',
                model: params.model,
                prompt: promptText,
                response: responseText,
                promptTokens: usage?.promptTokens || 0,
                completionTokens: usage?.completionTokens || 0,
                totalTokens: usage?.totalTokens || 0,
                duration,
                status: error ? 'failed' : 'success',
                statusCode: statusCode,
                error: error || undefined,
                cost: usage ? calculateCost('openai', params.model, usage) : 0,
                metadata: {
                    temperature: params.temperature,
                    maxTokens: params.max_tokens,
                    messagesCount: params.messages?.length,
                    functions: params.functions?.length,
                    streaming: params.stream || false,
                },
            });

            // Eğer sessionId varsa, mesajı session'a da ekle
            if (this.config.sessionId && !error) {
                await this._addToSession({
                    role: 'assistant',
                    content: responseText,
                    promptTokens: usage?.promptTokens || 0,
                    completionTokens: usage?.completionTokens || 0,
                    cost: usage ? calculateCost('openai', params.model, usage) : 0,
                    duration
                });
            }
        }

        return response;
    }

    /**
     * Orijinal OpenAI client'a erişim (advanced kullanım için)
     */
    getClient() {
        return this.client;
    }

    /**
     * Direct chat completion (alias)
     */
    async chat(params) {
        return this.createCompletion(params);
    }
}
