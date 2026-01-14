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

        // 🔒 API Key Validasyonu
        if (!config.apiKey) {
            throw new Error('❌ GeminiProvider: API key is undefined! Check your .env file for GEMINI_API_KEY or GOOGLE_API_KEY');
        }

        if (config.debug) {
            console.log('[GeminiProvider] API Key:', config.apiKey.substring(0, 10) + '...');
        }

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
        let responseText = '';

        try {
            const model = this.client.getGenerativeModel({
                model: params.model,
                generationConfig: {
                    temperature: params.temperature,
                    maxOutputTokens: params.maxOutputTokens,
                }
            });

            response = await model.generateContent(params.prompt);
            responseText = response.response.text();

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
            responseText = `Error: ${err.message}`;
            throw err;
        } finally {
            const duration = Date.now() - startTime;

            // Extract HTTP status code
            const statusCode = error ? (error.code && typeof error.code === 'number' ? error.code : 500) : 200;

            // Fallback token calculation for errors (input only)
            if (!usage && params.prompt) {
                const estTokens = Math.ceil(params.prompt.length / 4);
                usage = {
                    promptTokens: estTokens,
                    completionTokens: 0,
                    totalTokens: estTokens
                };
            }

            await this.logUsage({
                provider: 'gemini',
                model: params.model,
                prompt: params.prompt || '',
                response: responseText,
                promptTokens: usage?.promptTokens || 0,
                completionTokens: usage?.completionTokens || 0,
                totalTokens: usage?.totalTokens || 0,
                duration,
                status: error ? 'failed' : 'success',
                statusCode: statusCode,
                error: error || undefined,
                cost: (usage && !error) ? calculateCost('gemini', params.model, usage) : 0,
                metadata: {
                    temperature: params.temperature,
                    maxOutputTokens: params.maxOutputTokens,
                },
            });

            // Eğer sessionId varsa, mesajları session'a ekle
            if (this.config.sessionId && !error) {
                // 1. Kullanıcı mesajı (Prompt)
                await this._addToSession({
                    role: 'user',
                    content: params.prompt || '',
                    promptTokens: usage?.promptTokens || 0, // Prompt token user mesajına aittir
                    completionTokens: 0,
                    cost: 0, // Prompt maliyeti genelde assistant yanıtıyla hesaplanır ama burada ayırabiliriz, şimdilik 0
                    duration: 0
                });

                // 2. Asistan mesajı (Response)
                await this._addToSession({
                    role: 'assistant',
                    content: responseText,
                    promptTokens: 0,
                    completionTokens: usage?.completionTokens || 0,
                    cost: (usage && !error) ? calculateCost('gemini', params.model, usage) : 0,
                    duration
                });
            }
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
            let responseText = '';

            try {
                response = await originalSendMessage(message);
                responseText = response.response.text();

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
                responseText = `Error: ${err.message}`;
                throw err;
            } finally {
                const duration = Date.now() - startTime;

                // Extract HTTP status code
                const statusCode = error ? (error.code && typeof error.code === 'number' ? error.code : 500) : 200;

                // Fallback token calculation
                if (!usage && message) {
                    const estTokens = Math.ceil(message.length / 4);
                    usage = {
                        promptTokens: estTokens,
                        completionTokens: 0,
                        totalTokens: estTokens
                    };
                }

                await this.logUsage({
                    provider: 'gemini',
                    model: params.model,
                    prompt: message || '',
                    response: responseText,
                    promptTokens: usage?.promptTokens || 0,
                    completionTokens: usage?.completionTokens || 0,
                    totalTokens: usage?.totalTokens || 0,
                    duration,
                    status: error ? 'failed' : 'success',
                    statusCode: statusCode,
                    error: error || undefined,
                    cost: usage ? calculateCost('gemini', params.model, usage) : 0,
                    metadata: {
                        chatMode: true,
                        temperature: params.temperature,
                    },
                });

                // Eğer sessionId varsa, mesajı session'a da ekle
                if (this.config.sessionId && !error) {
                    await this._addToSession({
                        role: 'assistant',
                        content: responseText,
                        promptTokens: usage?.promptTokens || 0,
                        completionTokens: usage?.completionTokens || 0,
                        cost: usage ? calculateCost('gemini', params.model, usage) : 0,
                        duration
                    });
                }
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
