import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, RefreshCcw, X, Copy, Check, ChevronRight, Download, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Formatters
const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
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
    reasoningTokens?: number;
    duration: number;
    ttft?: number;
    cost: number;
    request?: any;
    response?: any;
}

export default function Requests() {
    const [logs, setLogs] = useState<RequestLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLog, setSelectedLog] = useState<RequestLog | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'timestamp' | 'latency' | 'cost'>('timestamp');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [showRawJson, setShowRawJson] = useState(false);

    // Advanced filters
    const [filters, setFilters] = useState<Record<string, string>>({});

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/logs?limit=1000`);
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

    // Parse key:value filters
    const parseFilters = (query: string) => {
        const filterMap: Record<string, string> = {};
        const keyValueRegex = /(\w+):(\w+)/g;
        let match;

        while ((match = keyValueRegex.exec(query)) !== null) {
            filterMap[match[1].toLowerCase()] = match[2].toLowerCase();
        }

        return filterMap;
    };

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        setFilters(parseFilters(query));
    };

    // Get unique values for quick filters
    const uniqueModels = Array.from(new Set(logs.map(log => log.model)));
    const uniqueProviders = Array.from(new Set(logs.map(log => log.provider)));

    // Filter and sort logs
    const filteredLogs = logs
        .filter((log) => {
            // Text search
            const searchText = searchQuery.replace(/\w+:\w+/g, '').toLowerCase();
            const matchesSearch = !searchText ||
                (log.model || "").toLowerCase().includes(searchText) ||
                (log.id || "").toLowerCase().includes(searchText);

            // Key:value filters
            let matchesFilters = true;
            if (filters.model && log.model.toLowerCase() !== filters.model) matchesFilters = false;
            if (filters.provider && log.provider.toLowerCase() !== filters.provider) matchesFilters = false;
            if (filters.status && log.status !== filters.status) matchesFilters = false;

            return matchesSearch && matchesFilters;
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success':
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'failed':
                return 'bg-red-500/10 text-red-400 border-red-500/20';
            default:
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        }
    };

    const getProviderColor = (provider: string) => {
        const colors: Record<string, string> = {
            'openai': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
            'anthropic': 'bg-amber-500/10 text-amber-300 border-amber-500/20',
            'google': 'bg-blue-500/10 text-blue-300 border-blue-500/20',
            'ollama': 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
        };
        return colors[provider] || 'bg-slate-500/10 text-slate-300 border-slate-500/20';
    };

    return (
        <DashboardLayout>
            <div className="relative h-[calc(100vh-100px)] flex flex-col">

                {/* Header */}
                <div className="mb-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                <ChevronRight className="w-6 h-6 text-primary" />
                                Requests
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {filteredLogs.length} of {logs.length} requests
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

                    {/* Search with key:value support */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search requests... (Try: model:gemini status:error provider:openai)"
                            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                            key:value filtering enabled
                        </span>
                    </div>
                </div>

                {/* TABLE CONTAINER */}
                <div className="flex-1 overflow-hidden border border-border rounded-lg bg-card flex">

                    {/* Main Table */}
                    <div className={`flex-1 overflow-auto transition-all duration-300 ${selectedLog ? 'pr-[550px]' : ''}`}>
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
                                <thead className="bg-secondary/50 text-muted-foreground font-semibold sticky top-0 z-10 backdrop-blur-sm border-b border-border">
                                    <tr>
                                        <th className="px-4 py-3 min-w-[160px] cursor-pointer hover:text-foreground" onClick={() => setSortBy('timestamp')}>
                                            <div className="flex items-center gap-2">
                                                Created At {sortBy === 'timestamp' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 w-20">Status</th>
                                        <th className="px-4 py-3 w-20">Provider</th>
                                        <th className="px-4 py-3 w-32">Model</th>
                                        <th className="px-4 py-3 text-right w-32">Tokens</th>
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
                                <tbody className="divide-y divide-border">
                                    {filteredLogs.map((log) => (
                                        <tr
                                            key={log.id}
                                            onClick={() => setSelectedLog(log)}
                                            className={`terminal-row cursor-pointer ${selectedLog?.id === log.id ? 'bg-primary/[0.08]' : ''}`}
                                        >
                                            <td className="px-4 py-3 text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <span className="opacity-60">{formatDate(log.timestamp)}</span>
                                                    <span className="font-mono text-xs text-foreground">{formatTime(log.timestamp)}</span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] border font-medium ${getStatusColor(log.status)}`}>
                                                    {log.status === 'success' ? 'Success' : log.status === 'failed' ? 'Error' : 'Pending'}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] border font-bold tracking-wider uppercase ${getProviderColor(log.provider)}`}>
                                                    {log.provider}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20">
                                                    {log.model}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-right font-mono text-foreground text-[11px]">
                                                <div className="flex flex-col items-end gap-0.5">
                                                    <span>{log.totalTokens}</span>
                                                    <span className="text-muted-foreground text-[9px]">
                                                        {log.promptTokens}p {log.completionTokens}c {log.reasoningTokens ? `${log.reasoningTokens}r` : ''}
                                                    </span>
                                                </div>
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
                        <div className="absolute top-0 right-0 h-full w-[550px] bg-card border-l border-border shadow-2xl flex flex-col z-20 animate-in slide-in-from-right duration-300">
                            {/* Panel Scroll Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                                {/* Panel Header */}
                                <div className="flex items-center justify-between sticky top-0 bg-card pb-4 border-b border-border">
                                    <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                                        Request Details
                                        <span className="text-xs font-normal text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full font-mono">
                                            {selectedLog.id.slice(0, 8)}...
                                        </span>
                                    </h3>
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedLog(null)} className="h-8 w-8 hover:bg-secondary">
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Summary Stats */}
                                <div className="grid grid-cols-4 gap-2 text-center py-4 border border-border rounded-lg bg-secondary/30">
                                    <div>
                                        <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1 label-silence">Latency</div>
                                        <div className="font-mono text-sm text-emerald-400 metrics-display">{formatLatencySec(selectedLog.duration)}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1 label-silence">Tokens</div>
                                        <div className="font-mono text-sm text-purple-400 metrics-display">{selectedLog.totalTokens}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1 label-silence">Cost</div>
                                        <div className="font-mono text-sm text-amber-400 metrics-display">${(selectedLog.cost || 0).toFixed(6)}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1 label-silence">Status</div>
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
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="p-3 bg-secondary/50 rounded border border-border">
                                            <div className="text-muted-foreground mb-1">Model</div>
                                            <div className="font-mono text-foreground font-semibold">{selectedLog.model}</div>
                                        </div>
                                        <div className="p-3 bg-secondary/50 rounded border border-border">
                                            <div className="text-muted-foreground mb-1">Provider</div>
                                            <div className="font-mono text-foreground font-semibold capitalize">{selectedLog.provider}</div>
                                        </div>
                                        <div className="p-3 bg-secondary/50 rounded border border-border">
                                            <div className="text-muted-foreground mb-1">Prompt Tokens</div>
                                            <div className="font-mono text-foreground font-semibold">{selectedLog.promptTokens}</div>
                                        </div>
                                        <div className="p-3 bg-secondary/50 rounded border border-border">
                                            <div className="text-muted-foreground mb-1">Completion Tokens</div>
                                            <div className="font-mono text-foreground font-semibold">{selectedLog.completionTokens}</div>
                                        </div>
                                        {selectedLog.reasoningTokens !== undefined && (
                                            <div className="p-3 bg-secondary/50 rounded border border-border">
                                                <div className="text-muted-foreground mb-1">Reasoning Tokens</div>
                                                <div className="font-mono text-foreground font-semibold">{selectedLog.reasoningTokens}</div>
                                            </div>
                                        )}
                                        {selectedLog.ttft && (
                                            <div className="p-3 bg-secondary/50 rounded border border-border">
                                                <div className="text-muted-foreground mb-1">TTFT</div>
                                                <div className="font-mono text-foreground font-semibold">{formatLatencySec(selectedLog.ttft)}</div>
                                            </div>
                                        )}
                                        <div className="col-span-2 p-3 bg-secondary/50 rounded border border-border">
                                            <div className="text-muted-foreground mb-1">Request ID</div>
                                            <div className="flex items-center justify-between">
                                                <div className="font-mono text-foreground text-[11px] break-all">{selectedLog.id}</div>
                                                <button
                                                    onClick={() => copyToClipboard(selectedLog.id, selectedLog.id)}
                                                    className="ml-2 p-1 hover:bg-primary/10 rounded transition-colors flex-shrink-0"
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
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                            <ChevronRight className="w-3 h-3" /> Request/Response
                                        </h4>
                                        <button
                                            onClick={() => setShowRawJson(!showRawJson)}
                                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showRawJson ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                            {showRawJson ? 'Formatted' : 'Raw'}
                                        </button>
                                    </div>

                                    {selectedLog.request && (
                                        <div className="space-y-2">
                                            <h5 className="text-xs font-semibold text-foreground">Request</h5>
                                            <div className="p-3 bg-secondary/50 rounded border border-border font-mono text-[10px] text-muted-foreground overflow-auto max-h-[150px]">
                                                <pre className="whitespace-pre-wrap break-words">
                                                    {showRawJson
                                                        ? JSON.stringify(selectedLog.request)
                                                        : JSON.stringify(selectedLog.request, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    )}

                                    {selectedLog.response && (
                                        <div className="space-y-2">
                                            <h5 className="text-xs font-semibold text-foreground">Response</h5>
                                            <div className="p-3 bg-secondary/50 rounded border border-border font-mono text-[10px] text-muted-foreground overflow-auto max-h-[150px]">
                                                <pre className="whitespace-pre-wrap break-words">
                                                    {showRawJson
                                                        ? JSON.stringify(selectedLog.response)
                                                        : JSON.stringify(selectedLog.response, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Panel Footer */}
                            <div className="p-4 border-t border-border flex gap-2 bg-card">
                                <Button variant="outline" size="sm" className="flex-1">
                                    <Copy className="w-3.5 h-3.5 mr-2" /> Copy
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
