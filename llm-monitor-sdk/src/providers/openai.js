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

        try {
            // Gerçek OpenAI çağrısı
            response = await this.client.chat.completions.create(params);

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
            throw err; // Hatayı yukarı fırlat (uygulamayı etkilemeden log at)
        } finally {
            const duration = Date.now() - startTime;

            // Log kaydı oluştur
            await this.logUsage({
                provider: 'openai',
                model: params.model,
                promptTokens: usage?.promptTokens || 0,
                completionTokens: usage?.completionTokens || 0,
                totalTokens: usage?.totalTokens || 0,
                duration,
                status: error ? 'error' : 'success',
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
