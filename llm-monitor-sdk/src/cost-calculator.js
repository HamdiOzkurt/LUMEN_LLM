/**
 * Güncel LLM Fiyatlandırması (USD / 1M token)
 * Son güncelleme: 2026-01-07
 */
const PRICING = {
    openai: {
        'gpt-4': { input: 30, output: 60 },
        'gpt-4-32k': { input: 60, output: 120 },
        'gpt-4-turbo': { input: 10, output: 30 },
        'gpt-4-turbo-preview': { input: 10, output: 30 },
        'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
        'gpt-3.5-turbo-16k': { input: 3, output: 4 },
        'gpt-4o': { input: 5, output: 15 },
        'gpt-4o-mini': { input: 0.15, output: 0.6 },
        'o1-preview': { input: 15, output: 60 },
        'o1-mini': { input: 3, output: 12 },
    },
    gemini: {
        'gemini-pro': { input: 0.5, output: 1.5 },
        'gemini-1.5-pro': { input: 3.5, output: 10.5 },
        'gemini-1.5-flash': { input: 0.075, output: 0.3 },
        'gemini-1.5-flash-8b': { input: 0.0375, output: 0.15 },
        'gemini-2.0-flash-exp': { input: 0, output: 0 },
        'gemini-2.5-flash': { input: 0, output: 0 }, // Free experimental model
    },
    anthropic: {
        'claude-3-opus-20240229': { input: 15, output: 75 },
        'claude-3-sonnet-20240229': { input: 3, output: 15 },
        'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
        'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
    },
};

/**
 * LLM çağrısı maliyetini hesapla
 */
export function calculateCost(provider, model, usage) {
    const pricing = PRICING[provider]?.[model];

    if (!pricing) {
        console.warn(`[LLM Monitor] Unknown model: ${provider}/${model}, cost will be 0`);
        return 0;
    }

    const inputCost = (usage.promptTokens / 1_000_000) * pricing.input;
    const outputCost = (usage.completionTokens / 1_000_000) * pricing.output;

    return Number((inputCost + outputCost).toFixed(6));
}

/**
 * Toplu maliyet hesaplama
 */
export function calculateBatchCost(logs) {
    return logs.reduce((total, log) => total + (log.cost || 0), 0);
}

/**
 * Fiyat listesini al
 */
export function getPricing(provider = null) {
    if (provider) {
        return PRICING[provider] || null;
    }
    return PRICING;
}
