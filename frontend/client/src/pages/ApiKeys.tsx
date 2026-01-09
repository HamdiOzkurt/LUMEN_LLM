import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Key, ShieldCheck, Activity, DollarSign, Clock } from "lucide-react";
import { formatCost } from "@/lib/formatters";

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ApiKeys() {
    const [keyStats, setKeyStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchKeyUsage = async () => {
            try {
                // Logları çek (Limit yüksek tutulmalı ki tüm keyleri görelim)
                const res = await fetch(`${API_BASE}/api/logs?limit=2000`);
                const data = await res.json();
                const logs = data.logs || [];

                // Key Mask'e göre grupla
                const statsMap = logs.reduce((acc: any, log: any) => {
                    const mask = log.apiKeyMask || 'Unknown Key';

                    if (!acc[mask]) {
                        acc[mask] = {
                            id: mask,
                            provider: log.provider,
                            count: 0,
                            totalCost: 0,
                            lastUsed: 0,
                            errorCount: 0,
                            projectIds: new Set()
                        };
                    }

                    acc[mask].count += 1;
                    acc[mask].totalCost += (log.cost || 0);
                    acc[mask].lastUsed = Math.max(acc[mask].lastUsed, new Date(log.timestamp).getTime());
                    if (log.status === 'failed' || log.statusCode >= 400) acc[mask].errorCount += 1;
                    if (log.projectId) acc[mask].projectIds.add(log.projectId);

                    // Eğer mask 'Unknown' ise ve provider varsa onu güncellemeye çalış
                    if (mask === 'Unknown Key' && log.provider) acc[mask].provider = log.provider;

                    return acc;
                }, {});

                // Array'e çevir ve işle
                const processedStats = Object.values(statsMap).map((k: any) => ({
                    ...k,
                    projects: Array.from(k.projectIds).length,
                    status: (Date.now() - k.lastUsed) < (24 * 60 * 60 * 1000) ? 'Active' : 'Idle', // 24 saattir kullanılmadıysa Idle
                    lastUsedPretty: timeAgo(k.lastUsed)
                })).sort((a: any, b: any) => b.lastUsed - a.lastUsed);

                setKeyStats(processedStats);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching key stats:", error);
                setLoading(false);
            }
        };

        fetchKeyUsage();
    }, []);

    // Helper: Time Ago
    const timeAgo = (timestamp: number) => {
        if (timestamp === 0) return 'Never';
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return "Just now";
        if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <Key className="w-8 h-8 text-amber-500" />
                            API Keys Usage
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Track usage and cost distribution across different API keys detected in your logs.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : keyStats.length === 0 ? (
                    <div className="glassmorphic p-12 text-center rounded-xl border border-white/10">
                        <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold mb-2">No API Keys Detected</h3>
                        <p className="text-muted-foreground">
                            Run some requests to start tracking API key usage. Masked keys will appear here automatically.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {/* Table Header */}
                        <div className="glassmorphic rounded-xl border border-white/10 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white/5 text-xs uppercase font-bold text-muted-foreground">
                                    <tr>
                                        <th className="px-6 py-4">Key ID (Masked)</th>
                                        <th className="px-6 py-4">Provider</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right">Projects</th>
                                        <th className="px-6 py-4 text-right">Calls</th>
                                        <th className="px-6 py-4 text-right">Errors</th>
                                        <th className="px-6 py-4 text-right">Total Cost</th>
                                        <th className="px-6 py-4 text-right">Last Used</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {keyStats.map((key, idx) => (
                                        <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 font-mono font-bold text-amber-500">
                                                <div className="flex items-center gap-2">
                                                    <Key className="w-4 h-4 opacity-50" />
                                                    {key.id}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="capitalize px-2 py-1 rounded bg-white/5 text-xs font-bold">
                                                    {key.provider}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${key.status === 'Active'
                                                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                                        : "bg-gray-500/10 text-gray-500 border border-gray-500/20"
                                                    }`}>
                                                    {key.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>}
                                                    {key.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-muted-foreground">{key.projects}</td>
                                            <td className="px-6 py-4 text-right font-mono font-medium text-foreground">{key.count}</td>
                                            <td className="px-6 py-4 text-right font-mono text-red-400">
                                                {key.errorCount > 0 ? key.errorCount : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-bold text-indigo-400">
                                                {formatCost(key.totalCost)}
                                            </td>
                                            <td className="px-6 py-4 text-right text-muted-foreground text-xs">
                                                {key.lastUsedPretty}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
