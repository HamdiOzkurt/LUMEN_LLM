// Cost utilities
import { calculateCost, calculateBatchCost, getPricing } from './cost-calculator.js';

// Providers
import { OpenAIProvider } from './providers/openai.js';
import { GeminiProvider } from './providers/gemini.js';
import { BaseProvider } from './providers/base.js';

// Re-export providers
export { OpenAIProvider, GeminiProvider, BaseProvider };

// Re-export cost utilities
export { calculateCost, calculateBatchCost, getPricing };

/**
 * Factory fonksiyon - provider oluştur
 * @param {string} provider - 'openai' veya 'gemini'
 * @param {object} config - Provider konfigürasyonu
 * @returns {OpenAIProvider|GeminiProvider}
 */
export function createMonitor(provider, config) {
    switch (provider) {
        case 'openai':
            return new OpenAIProvider(config);
        case 'gemini':
            return new GeminiProvider(config);
        default:
            throw new Error(`Unknown provider: ${provider}. Supported: openai, gemini`);
    }
}

/**
 * Default export
 */
export default {
    createMonitor,
    OpenAIProvider,
    GeminiProvider,
    calculateCost,
    calculateBatchCost,
    getPricing,
};
