import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, RefreshCcw, X, Copy, Check, ChevronRight, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/formatters";

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Formatters
const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatLatencySec = (ms: number) => (ms / 1000).toFixed(3) + 's';

interface RequestLog {
    id: string;
    timestamp: string;
    status: 'success' | 'failed' | 'pending';
    provider: string;
    model: string;
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    duration: number;
    cost: number;
    request?: any;
    response?: any;
}

export default function Requests() {
    const [logs, setLogs] = useState<RequestLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLog, setSelectedLog] = useState<RequestLog | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [modelFilter, setModelFilter] = useState<string>("all");
    const [providerFilter, setProviderFilter] = useState<string>("all");
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'timestamp' | 'latency' | 'cost'>('timestamp');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/logs?limit=500`);
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

    // Get unique values for filters
    const uniqueModels = Array.from(new Set(logs.map(log => log.model)));
    const uniqueProviders = Array.from(new Set(logs.map(log => log.provider)));

    // Filter and sort logs
    const filteredLogs = logs
        .filter((log) => {
            const matchesSearch =
                (log.model || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (log.id || "").toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || log.status === statusFilter;
            const matchesModel = modelFilter === "all" || log.model === modelFilter;
            const matchesProvider = providerFilter === "all" || log.provider === providerFilter;
            return matchesSearch && matchesStatus && matchesModel && matchesProvider;
        })
        .sort((a, b) => {
            let aVal: any = a.timestamp;
            let bVal: any = b.timestamp;

            if (sortBy === 'latency') {
                aVal = a.duration;
                bVal = b.duration;
            } else if (sortBy === 'cost') {
                aVal = a.cost;
                bVal = b.cost;
            }

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <DashboardLayout>
            <div className="relative h-[calc(100vh-100px)] flex flex-col">

                {/* Header & Filters */}
                <div className="mb-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                <ChevronRight className="w-6 h-6 text-indigo-500" />
                                Requests
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {filteredLogs.length} requests found
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={fetchLogs}>
                                <RefreshCcw className="w-3.5 h-3.5 mr-2" /> Refresh
                            </Button>
                            <Button variant="outline" size="sm">
                                <Download className="w-3.5 h-3.5 mr-2" /> Export
                            </Button>
                        </div>
                    </div>

                    {/* Filter Row */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="relative flex-1 min-w-[250px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by model or request ID..."
                                className="w-full pl-9 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500 transition-colors"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500 transition-colors"
                        >
                            <option value="all">All Status</option>
                            <option value="success">Success</option>
                            <option value="failed">Failed</option>
                            <option value="pending">Pending</option>
                        </select>

                        {/* Model Filter */}
                        <select
                            value={modelFilter}
                            onChange={(e) => setModelFilter(e.target.value)}
                            className="px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500 transition-colors"
                        >
                            <option value="all">All Models</option>
                            {uniqueModels.map(model => (
                                <option key={model} value={model}>{model}</option>
                            ))}
                        </select>

                        {/* Provider Filter */}
                        <select
                            value={providerFilter}
                            onChange={(e) => setProviderFilter(e.target.value)}
                            className="px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500 transition-colors"
                        >
                            <option value="all">All Providers</option>
                            {uniqueProviders.map(provider => (
                                <option key={provider} value={provider}>{provider}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* TABLE CONTAINER */}
                <div className="flex-1 overflow-hidden border border-white/10 rounded-lg bg-[#0a0a0a] flex">

                    {/* Main Table */}
                    <div className={`flex-1 overflow-auto transition-all duration-300 ${selectedLog ? 'pr-[500px]' : ''}`}>
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : filteredLogs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <div className="text-4xl mb-4">📭</div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">No Requests Found</h3>
                                <p className="text-muted-foreground">Try adjusting your filters or search query</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-xs whitespace-nowrap">
                                <thead className="bg-white/5 text-muted-foreground font-semibold sticky top-0 z-10 backdrop-blur-sm border-b border-white/10">
                                    <tr>
                                        <th className="px-4 py-3 min-w-[160px] cursor-pointer hover:text-foreground" onClick={() => setSortBy('timestamp')}>
                                            <div className="flex items-center gap-2">
                                                Timestamp {sortBy === 'timestamp' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 w-20">Status</th>
                                        <th className="px-4 py-3 w-20">Provider</th>
                                        <th className="px-4 py-3 w-32">Model</th>
                                        <th className="px-4 py-3 text-right w-24">Tokens</th>
                                        <th className="px-4 py-3 text-right w-24 cursor-pointer hover:text-foreground" onClick={() => setSortBy('latency')}>
                                            <div className="flex items-center justify-end gap-2">
                                                Latency {sortBy === 'latency' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-right w-20 cursor-pointer hover:text-foreground" onClick={() => setSortBy('cost')}>
                                            <div className="flex items-center justify-end gap-2">
                                                Cost {sortBy === 'cost' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 w-8"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredLogs.map((log) => (
                                        <tr
                                            key={log.id}
                                            onClick={() => setSelectedLog(log)}
                                            className={`hover:bg-white/5 cursor-pointer transition-colors ${selectedLog?.id === log.id ? 'bg-white/[0.08]' : ''}`}
                                        >
                                            <td className="px-4 py-3 text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <span className="opacity-60">{formatDate(log.timestamp)}</span>
                                                    <span className="font-mono text-xs text-foreground">{formatTime(log.timestamp)}</span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">
                                                {log.status === 'success' ? (
                                                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                                                        Success
                                                    </span>
                                                ) : log.status === 'failed' ? (
                                                    <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
                                                        Error
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-medium">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase font-bold tracking-wider">
                                                    {log.provider}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                                    {log.model}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-right font-mono text-foreground">
                                                {log.totalTokens}
                                            </td>

                                            <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                                                {formatLatencySec(log.duration)}
                                            </td>

                                            <td className="px-4 py-3 text-right font-mono text-amber-400">
                                                ${(log.cost || 0).toFixed(6)}
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* DETAIL SIDE PANEL */}
                    {selectedLog && (
                        <div className="absolute top-0 right-0 h-full w-[500px] bg-[#0c0c0c] border-l border-white/10 shadow-2xl flex flex-col z-20 animate-in slide-in-from-right duration-300">
                            {/* Panel Scroll Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                                {/* Panel Header */}
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                                        Request Details
                                        <span className="text-xs font-normal text-muted-foreground bg-white/10 px-2 py-0.5 rounded-full font-mono">
                                            {selectedLog.id.slice(0, 8)}...
                                        </span>
                                    </h3>
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedLog(null)} className="h-8 w-8 hover:bg-white/10">
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Summary Stats */}
                                <div className="grid grid-cols-4 gap-2 text-center py-4 border-b border-white/10">
                                    <div>
                                        <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Latency</div>
                                        <div className="font-mono text-sm text-emerald-400">{formatLatencySec(selectedLog.duration)}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Tokens</div>
                                        <div className="font-mono text-sm text-purple-400">{selectedLog.totalTokens}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Cost</div>
                                        <div className="font-mono text-sm text-amber-400">${(selectedLog.cost || 0).toFixed(6)}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Status</div>
                                        <div className={`font-mono text-xs font-bold ${selectedLog.status === 'success' ? 'text-emerald-500' : selectedLog.status === 'failed' ? 'text-red-500' : 'text-yellow-500'}`}>
                                            {selectedLog.status.toUpperCase()}
                                        </div>
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <ChevronRight className="w-3 h-3" /> Metadata
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div className="p-3 bg-white/5 rounded border border-white/5">
                                            <div className="text-muted-foreground mb-1">Model</div>
                                            <div className="font-mono text-foreground">{selectedLog.model}</div>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded border border-white/5">
                                            <div className="text-muted-foreground mb-1">Provider</div>
                                            <div className="font-mono text-foreground">{selectedLog.provider}</div>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded border border-white/5">
                                            <div className="text-muted-foreground mb-1">Prompt Tokens</div>
                                            <div className="font-mono text-foreground">{selectedLog.promptTokens}</div>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded border border-white/5">
                                            <div className="text-muted-foreground mb-1">Completion Tokens</div>
                                            <div className="font-mono text-foreground">{selectedLog.completionTokens}</div>
                                        </div>
                                        <div className="col-span-2 p-3 bg-white/5 rounded border border-white/5">
                                            <div className="text-muted-foreground mb-1">Request ID</div>
                                            <div className="flex items-center justify-between">
                                                <div className="font-mono text-foreground text-[11px] break-all">{selectedLog.id}</div>
                                                <button
                                                    onClick={() => copyToClipboard(selectedLog.id, selectedLog.id)}
                                                    className="ml-2 p-1 hover:bg-white/10 rounded transition-colors"
                                                >
                                                    {copiedId === selectedLog.id ? (
                                                        <Check className="w-3 h-3 text-emerald-400" />
                                                    ) : (
                                                        <Copy className="w-3 h-3 text-muted-foreground" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Request/Response JSON */}
                                {selectedLog.request && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                            <ChevronRight className="w-3 h-3" /> Request
                                        </h4>
                                        <div className="p-3 bg-black/40 rounded border border-white/5 font-mono text-[11px] text-muted-foreground overflow-auto max-h-[150px]">
                                            <pre>{JSON.stringify(selectedLog.request, null, 2)}</pre>
                                        </div>
                                    </div>
                                )}

                                {selectedLog.response && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                            <ChevronRight className="w-3 h-3" /> Response
                                        </h4>
                                        <div className="p-3 bg-black/40 rounded border border-white/5 font-mono text-[11px] text-muted-foreground overflow-auto max-h-[150px]">
                                            <pre>{JSON.stringify(selectedLog.response, null, 2)}</pre>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Panel Footer */}
                            <div className="p-4 border-t border-white/10 flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1">
                                    <Copy className="w-3.5 h-3.5 mr-2" /> Copy Details
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1">
                                    <Download className="w-3.5 h-3.5 mr-2" /> Export
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
