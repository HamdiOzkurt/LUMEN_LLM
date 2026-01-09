/**
 * Format cost for display
 * - Shows at least 2 significant digits
 * - Uses more decimals for very small numbers (easier to read than scientific notation)
 */
export function formatCost(cost: number): string {
    if (cost === 0) return '$0.00';

    // For costs >= $0.01, show 2 decimals
    if (cost >= 0.01) {
        return `$${cost.toFixed(2)}`;
    }

    // For costs >= $0.0001, show 4 decimals
    if (cost >= 0.0001) {
        return `$${cost.toFixed(4)}`;
    }

    // For very small costs, show 6 decimals (more readable than scientific notation)
    return `$${cost.toFixed(6)}`;
}

/**
 * Format latency for display
 */
export function formatLatency(ms: number): string {
    if (ms < 1000) {
        return `${Math.round(ms)}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatNumber(num: number): string {
    if (num >= 1_000_000_000) {
        return `${(num / 1_000_000_000).toFixed(1)}B`;
    }
    if (num >= 1_000_000) {
        return `${(num / 1_000_000).toFixed(1)}M`;
    }
    if (num >= 1_000) {
        return `${(num / 1_000).toFixed(1)}K`;
    }
    return num.toString();
}
