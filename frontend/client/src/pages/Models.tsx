import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { formatCost, formatLatency } from "@/lib/formatters";
import { Zap, DollarSign, Clock, CheckCircle, AlertTriangle } from "lucide-react";

// --- MOCK DATA GENERATOR ---
const generateMockModelsData = () => {
    return [
        {
            model: 'gpt-4',
            provider: 'openai',
            calls: 12450,
            tokens: 4500000,
            cost: 135.50,
            avgLatency: 1200, // 1.2s
            errorRate: 0.5, // %
            lastActive: new Date().toISOString()
        },
        {
            model: 'gpt-3.5-turbo',
            provider: 'openai',
            calls: 8540,
            tokens: 2100000,
            cost: 4.20,
            avgLatency: 450, // 0.45s
            errorRate: 0.2,
            lastActive: new Date(Date.now() - 3600000).toISOString()
        },
        {
            model: 'gemini-2.5-flash',
            provider: 'google',
            calls: 5600,
            tokens: 3200000,
            cost: 2.10, // Very cheap
            avgLatency: 350, // Super fast
            errorRate: 0.1,
            lastActive: new Date().toISOString()
        },
        {
            model: 'claude-3-opus',
            provider: 'anthropic',
            calls: 310,
            tokens: 850000,
            cost: 12.75, // Expensive
            avgLatency: 2800, // Slow
            errorRate: 0.8,
            lastActive: new Date(Date.now() - 7200000).toISOString()
        },
        {
            model: 'ollama-llama3',
            provider: 'ollama',
            calls: 120,
            tokens: 54000,
            cost: 0.00, // Free
            avgLatency: 150, // Local fast
            errorRate: 0.0,
            lastActive: new Date(Date.now() - 86400000).toISOString()
        }
    ];
};
// ----------------------------

export default function Models() {
    const [loading, setLoading] = useState(true);
    const [models, setModels] = useState<any[]>([]);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await fetch(`${API_BASE}/api/logs?limit=10000`);
                const json = await res.json();
                const logs = json.logs || [];

                // Aggregate by model
                const modelGroups: any = {};
                logs.forEach((log: any) => {
                    const model = log.model || 'unknown';
                    const provider = log.provider || 'unknown';
                    if (!modelGroups[model]) {
                        modelGroups[model] = {
                            model,
                            provider,
                            calls: 0,
                            tokens: 0,
                            cost: 0,
                            totalLatency: 0,
                            errors: 0,
                            lastActive: log.timestamp || log.createdAt
                        };
                    }
                    modelGroups[model].calls++;
                    modelGroups[model].tokens += (log.totalTokens || 0);
                    modelGroups[model].cost += (log.cost || 0);
                    modelGroups[model].totalLatency += (log.duration || 0);
                    if (log.status === 'error' || log.status === 'failed') {
                        modelGroups[model].errors++;
                    }
                    if (new Date(log.timestamp || log.createdAt) > new Date(modelGroups[model].lastActive)) {
                        modelGroups[model].lastActive = log.timestamp || log.createdAt;
                    }
                });

                const modelData = Object.values(modelGroups).map((m: any) => ({
                    ...m,
                    avgLatency: m.calls > 0 ? m.totalLatency / m.calls : 0,
                    errorRate: m.calls > 0 ? (m.errors / m.calls) * 100 : 0
                }));

                setModels(modelData);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch models", error);
                setLoading(false);
            }
        };
        fetchModels();
    }, []);

    // Helper for efficiency badge
    const getEfficiencyBadge = (cost: number, latency: number) => {
        if (cost === 0 && latency < 500) return <span className="px-2 py-0.5 rounded textxs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">Ultra Efficient</span>;
        if (cost < 5 && latency < 600) return <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">High Performance</span>;
        if (cost > 50) return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">Premium</span>;
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-400">Standard</span>;
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Zap className="w-8 h-8 text-amber-500" />
                        Model Performance
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Comparative analysis of latency, cost, and reliability across all active models.
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {models.map((model) => (
                            <div key={model.model} className="bg-white dark:bg-[#16161A] p-6 rounded-xl border border-gray-200 dark:border-white/5 hover:border-amber-500/30 transition-all shadow-sm group">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                                    {/* Left: Model Info */}
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-lg ${model.provider === 'openai' ? 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400' :
                                            model.provider === 'google' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                                                model.provider === 'anthropic' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' :
                                                    'bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400'
                                            }`}>
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{model.model}</h3>
                                                {getEfficiencyBadge(model.cost, model.avgLatency)}
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono capitalize">{model.provider}</p>
                                        </div>
                                    </div>

                                    {/* Right: Metrics Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 w-full md:w-auto">

                                        <div className="text-center md:text-right">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center justify-center md:justify-end gap-1">
                                                <DollarSign className="w-3 h-3" /> Cost
                                            </p>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white font-mono">{formatCost(model.cost)}</p>
                                        </div>

                                        <div className="text-center md:text-right">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center justify-center md:justify-end gap-1">
                                                <Clock className="w-3 h-3" /> Latency
                                            </p>
                                            <p className={`text-lg font-bold font-mono ${model.avgLatency < 500 ? 'text-emerald-600 dark:text-emerald-400' :
                                                model.avgLatency > 2000 ? 'text-rose-600 dark:text-rose-400' :
                                                    'text-amber-600 dark:text-amber-400'
                                                }`}>
                                                {formatLatency(model.avgLatency)}
                                            </p>
                                        </div>

                                        <div className="text-center md:text-right">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Requests</p>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white font-mono">{model.calls.toLocaleString()}</p>
                                        </div>

                                        <div className="text-center md:text-right">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reliability</p>
                                            <div className="flex items-center justify-center md:justify-end gap-1">
                                                {(100 - model.errorRate) > 99 ? (
                                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                ) : (
                                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                                )}
                                                <p className="text-lg font-bold text-gray-900 dark:text-white font-mono">{(100 - model.errorRate).toFixed(1)}%</p>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
