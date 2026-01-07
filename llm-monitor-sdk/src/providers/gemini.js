import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseProvider } from './base.js';
import { calculateCost } from '../cost-calculator.js';

/**
 * Gemini Provider
 * Google Gemini API çağrılarını wrap eder ve otomatik loglama yapar
 */
export class GeminiProvider extends BaseProvider {
    constructor(config) {
        super(config);
        this.client = new GoogleGenerativeAI(config.apiKey);
    }

    /**
     * Content generation (monitörlü)
     */
    async generateContent(params) {
        const startTime = Date.now();
        let usage = null;
        let error = null;
        let response = null;

        try {
            const model = this.client.getGenerativeModel({
                model: params.model,
                generationConfig: {
                    temperature: params.temperature,
                    maxOutputTokens: params.maxOutputTokens,
                }
            });

            response = await model.generateContent(params.prompt);

            // Token kullanımı
            const usageMetadata = response.response?.usageMetadata;
            usage = {
                promptTokens: usageMetadata?.promptTokenCount || 0,
                completionTokens: usageMetadata?.candidatesTokenCount || 0,
                totalTokens: usageMetadata?.totalTokenCount || 0,
            };

        } catch (err) {
            error = {
                message: err.message,
                type: err.name || 'unknown',
                code: err.status || 'unknown',
            };
            throw err;
        } finally {
            const duration = Date.now() - startTime;

            await this.logUsage({
                provider: 'gemini',
                model: params.model,
                promptTokens: usage?.promptTokens || 0,
                completionTokens: usage?.completionTokens || 0,
                totalTokens: usage?.totalTokens || 0,
                duration,
                status: error ? 'error' : 'success',
                error: error || undefined,
                cost: usage ? calculateCost('gemini', params.model, usage) : 0,
                metadata: {
                    temperature: params.temperature,
                    maxOutputTokens: params.maxOutputTokens,
                },
            });
        }

        return response;
    }

    /**
     * Chat session oluştur (multi-turn conversation)
     */
    async startChat(params) {
        const model = this.client.getGenerativeModel({ model: params.model });
        const chat = model.startChat({
            history: params.history || [],
            generationConfig: {
                temperature: params.temperature,
                maxOutputTokens: params.maxOutputTokens,
            },
        });

        // Chat wrapper - her mesajı loglayacak
        const originalSendMessage = chat.sendMessage.bind(chat);
        chat.sendMessage = async (message) => {
            const startTime = Date.now();
            let usage = null;
            let error = null;
            let response = null;

            try {
                response = await originalSendMessage(message);

                const usageMetadata = response.response?.usageMetadata;
                usage = {
                    promptTokens: usageMetadata?.promptTokenCount || 0,
                    completionTokens: usageMetadata?.candidatesTokenCount || 0,
                    totalTokens: usageMetadata?.totalTokenCount || 0,
                };
            } catch (err) {
                error = {
                    message: err.message,
                    type: err.name || 'unknown',
                };
                throw err;
            } finally {
                const duration = Date.now() - startTime;

                await this.logUsage({
                    provider: 'gemini',
                    model: params.model,
                    promptTokens: usage?.promptTokens || 0,
                    completionTokens: usage?.completionTokens || 0,
                    totalTokens: usage?.totalTokens || 0,
                    duration,
                    status: error ? 'error' : 'success',
                    error: error || undefined,
                    cost: usage ? calculateCost('gemini', params.model, usage) : 0,
                    metadata: {
                        chatMode: true,
                        temperature: params.temperature,
                    },
                });
            }

            return response;
        };

        return chat;
    }

    /**
     * Orijinal Gemini client'a erişim
     */
    getClient() {
        return this.client;
    }
}
