import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

/**
 * Base Provider Class
 * Tüm LLM provider'ların inherit edeceği base class
 */
export class BaseProvider {
    constructor(config = {}) {
        this.config = {
            apiKey: config.apiKey,
            backendUrl: config.backendUrl || 'http://localhost:3000/api',
            projectId: config.projectId || 'default',
            environment: config.environment || 'production',
            sendToBackend: config.sendToBackend !== false, // default true
            debug: config.debug || false,
        };

        if (this.config.debug) {
            console.log('[LLM Monitor] Initialized with config:', {
                backendUrl: this.config.backendUrl,
                projectId: this.config.projectId,
                environment: this.config.environment,
            });
        }
    }

    /**
     * Her çağrıyı loglamak için temel metod
     */
    async logUsage(data) {
        const logEntry = {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            projectId: this.config.projectId,
            environment: this.config.environment,
            ...data,
        };

        if (this.config.debug) {
            console.log('[LLM Monitor] Logging:', {
                provider: data.provider,
                model: data.model,
                tokens: data.totalTokens,
                cost: data.cost,
                duration: data.duration,
            });
        }

        // Backend'e gönder (fire and forget - non-blocking)
        if (this.config.sendToBackend) {
            this._sendToBackend(logEntry).catch(err => {
                if (this.config.debug) {
                    console.error('[LLM Monitor] Failed to send log:', err.message);
                }
            });
        }

        return logEntry;
    }

    /**
     * Backend'e HTTP POST ile log gönder
     */
    async _sendToBackend(logEntry) {
        try {
            await axios.post(`${this.config.backendUrl}/logs`, logEntry, {
                timeout: 30000, // 30 saniye timeout (MongoDB Atlas için)
                headers: {
                    'Content-Type': 'application/json',
                    'X-Project-ID': this.config.projectId,
                },
            });

            if (this.config.debug) {
                console.log('[LLM Monitor] ✅ Log sent to backend');
            }
        } catch (error) {
            // Silent fail - uygulamayı etkilemez
            if (this.config.debug) {
                console.error('[LLM Monitor] ❌ Backend error:', error.message);
            }
        }
    }

    /**
     * Soyut metod - her provider override edecek
     */
    async createCompletion(params) {
        throw new Error('createCompletion must be implemented by provider');
    }
}
