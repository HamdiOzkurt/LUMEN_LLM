import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, Filter, RefreshCcw, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber, formatCost, formatLatency } from "@/lib/formatters";

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Logs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [providerFilter, setProviderFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/logs?limit=100`);
            const data = await res.json();
            setLogs(data.logs || []);
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, []);

    // Filtreleme
    const filteredLogs = logs.filter((log: any) => {
        const matchesProvider = providerFilter === "all" || log.provider === providerFilter;
        const matchesSearch = log.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (log.error?.message || "").toLowerCase().includes(searchQuery.toLowerCase());
        return matchesProvider && matchesSearch;
    });

    // Helper: Badge Colors
    const getStatusColor = (status: string) => {
        if (status === 'failed' || status === 'error') return 'bg-red-500/10 text-red-400 border-red-500/20';
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    };

    const getProviderColor = (provider: string) => {
        if (provider?.includes('openai')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        if (provider?.includes('gemini')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        if (provider?.includes('anthropic') || provider?.includes('claude')) return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    };

    const getLatencyColor = (ms: number) => {
        if (ms < 500) return 'text-emerald-400';
        if (ms < 1500) return 'text-amber-400';
        return 'text-red-400';
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">

                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Request Logs</h1>
                        <p className="text-muted-foreground text-sm">Detailed trace of every interaction with your LLMs.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search models, errors..."
                                className="pl-9 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500 w-64 transition-colors"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            className="px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500"
                            value={providerFilter}
                            onChange={(e) => setProviderFilter(e.target.value)}
                        >
                            <option value="all">All Providers</option>
                            <option value="gemini">Gemini</option>
                            <option value="openai">OpenAI</option>
                            <option value="ollama">Ollama</option>
                        </select>
                        <Button variant="ghost" size="icon" onClick={fetchLogs} className="text-muted-foreground hover:text-white">
                            <RefreshCcw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* LOGS TABLE (Resim 3 Style) */}
                <div className="glassmorphic rounded-xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-white/5 text-xs uppercase text-muted-foreground font-semibold">
                                <tr>
                                    <th className="px-6 py-4 w-40">Created At</th>
                                    <th className="px-6 py-4 w-28">Status</th>
                                    <th className="px-6 py-4 w-32">Provider</th>
                                    <th className="px-6 py-4">Request</th>
                                    <th className="px-6 py-4 w-32">Model</th>
                                    <th className="px-6 py-4 text-right w-32">Tokens</th>
                                    <th className="px-6 py-4 text-right w-24">Latency</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-muted-foreground">
                                            <div className="flex items-center justify-center gap-2">
                                                <RefreshCcw className="w-4 h-4 animate-spin" /> Loading logs...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-muted-foreground">No logs found matching your filters.</td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log: any) => (
                                        <tr key={log.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                                            {/* Date */}
                                            <td className="px-6 py-4 text-muted-foreground text-xs font-mono">
                                                {new Date(log.timestamp).toLocaleDateString()} <span className="text-white/50">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex w-fit items-center gap-1.5 ${getStatusColor(log.status)}`}>
                                                    {log.status === 'success' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                    <span className="capitalize">{log.status}</span>
                                                </span>
                                            </td>

                                            {/* Provider Badge */}
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getProviderColor(log.provider)}`}>
                                                    {log.provider}
                                                </span>
                                            </td>

                                            {/* Request (Truncated) */}
                                            <td className="px-6 py-4 max-w-xs truncate text-muted-foreground group-hover:text-foreground transition-colors" title={JSON.stringify(log)}>
                                                {log.error ? (
                                                    <span className="text-red-400 flex items-center gap-2">
                                                        <AlertCircle className="w-3 h-3" />
                                                        {log.error.message || "Unknown Error"}
                                                    </span>
                                                ) : (
                                                    "Request Details available on click" // Backend henüz full prompt'u dönmüyor olabilir, özet geçiyoruz
                                                )}
                                            </td>

                                            {/* Model */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-foreground font-medium">{log.model}</span>
                                                    <span className="text-[10px] text-muted-foreground">{log.projectId || 'default'}</span>
                                                </div>
                                            </td>

                                            {/* Tokens */}
                                            <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                                                {formatNumber(log.totalTokens || 0)}
                                            </td>

                                            {/* Latency */}
                                            <td className={`px-6 py-4 text-right font-mono font-medium ${getLatencyColor(log.duration)}`}>
                                                {formatLatency(log.duration)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Footer (Mock) */}
                    <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground bg-white/[0.02]">
                        <span>Showing {filteredLogs.length} results</span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled className="h-7 text-xs bg-transparent border-white/10">Previous</Button>
                            <Button variant="outline" size="sm" disabled className="h-7 text-xs bg-transparent border-white/10">Next</Button>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
