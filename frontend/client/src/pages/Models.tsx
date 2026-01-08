import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Shield, Zap, TrendingDown, DollarSign } from "lucide-react";

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Models() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                // Fetch logs to calculate stats
                const res = await fetch(`${API_BASE}/api/logs?limit=500`); // Fetch 500 for better stats
                const data = await res.json();
                setLogs(data.logs || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching logs for models:', error);
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    // Calculate model performance from real logs
    const modelStats = logs.reduce((acc: any, log: any) => {
        if (!acc[log.model]) {
            acc[log.model] = {
                count: 0,
                totalLatency: 0,
                totalCost: 0,
                totalTokens: 0,
                provider: log.provider,
                minLatency: Infinity,
                maxLatency: -Infinity
            };
        }
        const duration = log.duration || 0;
        acc[log.model].count += 1;
        acc[log.model].totalLatency += duration;
        acc[log.model].totalCost += log.cost || 0;
        acc[log.model].totalTokens += (log.prompt_tokens || 0) + (log.completion_tokens || 0);
        acc[log.model].minLatency = Math.min(acc[log.model].minLatency, duration);
        acc[log.model].maxLatency = Math.max(acc[log.model].maxLatency, duration);
        return acc;
    }, {});

    const dynamicModelData = Object.keys(modelStats).map(model => {
        const stat = modelStats[model];
        const avgLatency = Math.round(stat.totalLatency / stat.count);
        const avgTokens = Math.round(stat.totalTokens / stat.count);

        // Calculate efficiency score (Arbitrary algo for demo)
        const efficiency = Math.max(10, Math.min(100, 100 - (avgLatency / 30)));

        return {
            model: model,
            costPer1k: (stat.totalCost / stat.count) * 1000,
            avgCost: (stat.totalCost / stat.count),
            latency: avgLatency,
            minLatency: stat.minLatency,
            maxLatency: stat.maxLatency,
            avgTokens: avgTokens,
            efficiency: Math.round(efficiency),
            provider: stat.provider,
            totalRequests: stat.count
        };
    });

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Shield className="w-8 h-8 text-indigo-500" />
                        Model Benchmark
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Comparative analysis of cost, latency, and throughput across different AI models.
                    </p>
                </div>

                {/* Models Grid */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : dynamicModelData.length === 0 ? (
                    <div className="glassmorphic p-12 text-center rounded-xl border border-white/10">
                        <p className="text-muted-foreground">No traffic data available to benchmark models yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {dynamicModelData.map((model, i) => (
                            <div key={i} className="glassmorphic p-0 rounded-xl border border-white/10 overflow-hidden flex flex-col hover:border-indigo-500/30 transition-all duration-300">
                                {/* Card Header */}
                                <div className="bg-white/5 p-6 border-b border-white/5 flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold text-foreground">{model.model}</h3>
                                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/20">{model.provider}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-mono">{model.totalRequests} samples analyzed</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-foreground">{model.efficiency}</div>
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Score</div>
                                    </div>
                                </div>

                                {/* Metrics */}
                                <div className="p-6 space-y-6 flex-1">

                                    {/* Latency Section */}
                                    <div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                                            <Zap className="w-3 h-3" /> Latency
                                        </div>
                                        <div className="relative pt-1">
                                            <div className="flex items-end gap-2 mb-1">
                                                <span className="text-2xl font-mono text-foreground font-bold">{model.latency}<span className="text-sm text-muted-foreground font-normal">ms</span></span>
                                            </div>
                                            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (model.latency / 1000) * 100)}%` }}></div>
                                            </div>
                                            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground font-mono">
                                                <span>Min: {model.minLatency}ms</span>
                                                <span>Max: {model.maxLatency}ms</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cost Section */}
                                    <div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                                            <DollarSign className="w-3 h-3" /> Cost Efficiency
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-secondary/30 p-3 rounded-lg border border-white/5">
                                                <div className="text-[10px] text-muted-foreground mb-1">Per 1k Req</div>
                                                <div className="font-mono text-indigo-400 font-bold">${model.costPer1k.toFixed(4)}</div>
                                            </div>
                                            <div className="bg-secondary/30 p-3 rounded-lg border border-white/5">
                                                <div className="text-[10px] text-muted-foreground mb-1">Avg Request</div>
                                                <div className="font-mono text-indigo-400 font-bold">${model.avgCost.toFixed(5)}</div>
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
