import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, RefreshCcw, X, Copy, Check, ChevronRight, Download, Eye, EyeOff, Filter, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

interface FilterTag {
    key: string;
    value: string;
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
    const [filterTags, setFilterTags] = useState<FilterTag[]>([]);
    const [activeTab, setActiveTab] = useState<'view' | 'json' | 'metadata'>('view');

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

    const uniqueModels = Array.from(new Set(logs.map(log => log.model)));
    const uniqueProviders = Array.from(new Set(logs.map(log => log.provider)));
    const uniqueStatuses = ['success', 'failed', 'pending'];

    const addFilterTag = (key: string, value: string) => {
        const exists = filterTags.some(tag => tag.key === key && tag.value === value);
        if (!exists) {
            setFilterTags([...filterTags, { key, value }]);
        }
    };

    const removeFilterTag = (index: number) => {
        setFilterTags(filterTags.filter((_, i) => i !== index));
    };

    const filteredLogs = logs
        .filter((log) => {
            const searchText = searchQuery.toLowerCase();
            const matchesSearch = !searchText ||
                log.model.toLowerCase().includes(searchText) ||
                log.id.toLowerCase().includes(searchText);

            let matchesFilters = true;
            for (const tag of filterTags) {
                if (tag.key === 'model' && log.model !== tag.value) matchesFilters = false;
                if (tag.key === 'provider' && log.provider !== tag.value) matchesFilters = false;
                if (tag.key === 'status' && log.status !== tag.value) matchesFilters = false;
            }

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

    const exportData = (format: 'csv' | 'json') => {
        const data = filteredLogs.map(log => ({
            timestamp: log.timestamp,
            status: log.status,
            provider: log.provider,
            model: log.model,
            tokens: log.totalTokens,
            latency: log.duration,
            cost: log.cost
        }));

        if (format === 'json') {
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `requests-${new Date().toISOString()}.json`;
            a.click();
        } else {
            const csv = [
                ['Timestamp', 'Status', 'Provider', 'Model', 'Tokens', 'Latency (ms)', 'Cost'],
                ...data.map(d => [d.timestamp, d.status, d.provider, d.model, d.tokens, d.latency, d.cost])
            ].map(row => row.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `requests-${new Date().toISOString()}.csv`;
            a.click();
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success':
                return 'status-badge-success';
            case 'failed':
                return 'status-badge-error';
            default:
                return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
        }
    };

    const getProviderColor = (provider: string) => {
        const colors: Record<string, string> = {
            'openai': 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
            'anthropic': 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
            'google': 'bg-blue-500/10 text-blue-300 border border-blue-500/20',
            'ollama': 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20',
        };
        return colors[provider] || 'bg-slate-500/10 text-slate-300 border border-slate-500/20';
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
                            <div className="relative group">
                                <Button variant="outline" size="sm">
                                    <Download className="w-3.5 h-3.5 mr-2" /> Export
                                </Button>
                                <div className="absolute right-0 mt-2 w-32 bg-card border border-border rounded-[0.75rem] shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
                                    <button
                                        onClick={() => exportData('csv')}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors first:rounded-t-[0.75rem]"
                                    >
                                        Export as CSV
                                    </button>
                                    <button
                                        onClick={() => exportData('json')}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors last:rounded-b-[0.75rem]"
                                    >
                                        Export as JSON
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by model or request ID..."
                            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-[0.75rem] text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Filter Tags */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {filterTags.length > 0 && (
                            <>
                                {filterTags.map((tag, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-[0.5rem] text-sm">
                                        <span className="text-muted-foreground">{tag.key}:</span>
                                        <span className="font-medium text-foreground">{tag.value}</span>
                                        <button
                                            onClick={() => removeFilterTag(idx)}
                                            className="ml-1 hover:bg-primary/20 rounded p-0.5 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => setFilterTags([])}
                                    className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Clear all
                                </button>
                            </>
                        )}

                        {/* Quick Filter Buttons */}
                        <div className="flex items-center gap-2 ml-auto">
                            <div className="text-xs text-muted-foreground">Quick filters:</div>
                            {uniqueStatuses.map(status => (
                                <button
                                    key={status}
                                    onClick={() => addFilterTag('status', status)}
                                    className="px-2 py-1 text-xs rounded-[0.5rem] bg-secondary hover:bg-secondary/80 transition-colors capitalize"
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* TABLE CONTAINER */}
                <div className="flex-1 overflow-hidden border border-border rounded-[0.75rem] bg-card flex">

                    {/* Main Table */}
                    <div className={`flex-1 overflow-auto transition-all duration-300 ${selectedLog ? 'pr-[600px]' : ''}`}>
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : filteredLogs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">No Requests Found</h3>
                                <p className="text-muted-foreground">Try adjusting your filters or search query</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-xs whitespace-nowrap">
                                <thead className="bg-secondary/50 text-muted-foreground font-semibold sticky top-0 z-10 backdrop-blur-sm border-b border-border">
                                    <tr>
                                        <th className="px-4 py-3 min-w-[140px] cursor-pointer hover:text-foreground" onClick={() => setSortBy('timestamp')}>
                                            Created At {sortBy === 'timestamp' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-4 py-3 w-16">Status</th>
                                        <th className="px-4 py-3 w-20">Provider</th>
                                        <th className="px-4 py-3 w-28">Model</th>
                                        <th className="px-4 py-3 text-right w-28">Tokens</th>
                                        <th className="px-4 py-3 text-right w-24 cursor-pointer hover:text-foreground" onClick={() => setSortBy('latency')}>
                                            Latency {sortBy === 'latency' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-4 py-3 text-right w-20 cursor-pointer hover:text-foreground" onClick={() => setSortBy('cost')}>
                                            Cost {sortBy === 'cost' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredLogs.map((log) => (
                                        <tr
                                            key={log.id}
                                            onClick={() => setSelectedLog(log)}
                                            className={`terminal-row cursor-pointer transition-colors ${selectedLog?.id === log.id ? 'bg-primary/[0.08]' : ''}`}
                                        >
                                            <td className="px-4 py-2.5 text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <span className="opacity-60 text-[10px]">{formatDate(log.timestamp)}</span>
                                                    <span className="font-mono text-xs text-foreground">{formatTime(log.timestamp)}</span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-2.5">
                                                <span className={`px-2 py-0.5 rounded-[0.4rem] text-[10px] border font-medium ${getStatusColor(log.status)}`}>
                                                    {log.status === 'success' ? '✓' : log.status === 'failed' ? '✕' : '◐'}
                                                </span>
                                            </td>

                                            <td className="px-4 py-2.5">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addFilterTag('provider', log.provider);
                                                    }}
                                                    className={`px-2 py-0.5 rounded-[0.4rem] text-[10px] border font-bold tracking-wider uppercase hover:opacity-80 transition-opacity ${getProviderColor(log.provider)}`}
                                                >
                                                    {log.provider}
                                                </button>
                                            </td>

                                            <td className="px-4 py-2.5">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addFilterTag('model', log.model);
                                                    }}
                                                    className="px-2 py-0.5 rounded-[0.4rem] text-[10px] bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                                                >
                                                    {log.model}
                                                </button>
                                            </td>

                                            <td className="px-4 py-2.5 text-right font-mono text-foreground text-[11px]">
                                                <div className="flex flex-col items-end gap-0.5">
                                                    <span>{log.totalTokens}</span>
                                                    <span className="text-muted-foreground text-[9px]">
                                                        {log.promptTokens}p {log.completionTokens}c {log.reasoningTokens ? `${log.reasoningTokens}r` : ''}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-2.5 text-right font-mono text-muted-foreground text-[11px]">
                                                {formatLatencySec(log.duration)}
                                            </td>

                                            <td className="px-4 py-2.5 text-right font-mono text-amber-400 text-[11px]">
                                                ${(log.cost || 0).toFixed(6)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* DETAIL SHEET (Right Drawer) */}
                    {selectedLog && (
                        <div className="absolute top-0 right-0 h-full w-[600px] bg-card border-l border-border shadow-2xl flex flex-col z-20 animate-in slide-in-from-right duration-300">
                            {/* Sheet Header */}
                            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
                                <div className="flex items-center gap-3">
                                    <div className={`px-3 py-1.5 rounded-[0.5rem] text-xs font-bold border ${getStatusColor(selectedLog.status)}`}>
                                        {selectedLog.status.toUpperCase()}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {selectedLog.model} • {selectedLog.provider}
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setSelectedLog(null)} className="h-8 w-8 hover:bg-secondary">
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Quick Stats */}
                            <div className="px-6 py-4 border-b border-border grid grid-cols-3 gap-4">
                                <div>
                                    <div className="text-[10px] text-muted-foreground label-silence mb-1">Latency</div>
                                    <div className="font-mono text-sm font-bold text-emerald-400">{formatLatencySec(selectedLog.duration)}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-muted-foreground label-silence mb-1">Tokens</div>
                                    <div className="font-mono text-sm font-bold text-primary">{selectedLog.totalTokens}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-muted-foreground label-silence mb-1">Cost</div>
                                    <div className="font-mono text-sm font-bold text-amber-400">${(selectedLog.cost || 0).toFixed(6)}</div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex items-center gap-1 px-6 pt-4 border-b border-border">
                                {(['view', 'json', 'metadata'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                            activeTab === tab
                                                ? 'border-primary text-foreground'
                                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {tab === 'view' ? 'View' : tab === 'json' ? 'JSON' : 'Metadata'}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {activeTab === 'view' && (
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-xs font-bold text-muted-foreground label-silence mb-3">User Prompt</h4>
                                            <div className="bg-secondary/50 rounded-[0.75rem] border border-border p-4 text-sm text-foreground">
                                                {selectedLog.request?.messages?.[0]?.content || 'No prompt data'}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-muted-foreground label-silence mb-3">Assistant Response</h4>
                                            <div className="bg-secondary/50 rounded-[0.75rem] border border-border p-4 text-sm text-foreground">
                                                {selectedLog.response?.choices?.[0]?.message?.content || 'No response data'}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'json' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold text-muted-foreground label-silence">Request/Response JSON</h4>
                                            <button
                                                onClick={() => setShowRawJson(!showRawJson)}
                                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showRawJson ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                                {showRawJson ? 'Formatted' : 'Raw'}
                                            </button>
                                        </div>
                                        <div className="bg-secondary/50 rounded-[0.75rem] border border-border p-4 font-mono text-[10px] text-muted-foreground overflow-auto max-h-[300px]">
                                            <pre className="whitespace-pre-wrap break-words">
                                                {showRawJson
                                                    ? JSON.stringify({ request: selectedLog.request, response: selectedLog.response })
                                                    : JSON.stringify({ request: selectedLog.request, response: selectedLog.response }, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'metadata' && (
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="p-3 bg-secondary/50 rounded-[0.75rem] border border-border">
                                            <div className="text-muted-foreground mb-1">Model</div>
                                            <div className="font-mono text-foreground font-semibold">{selectedLog.model}</div>
                                        </div>
                                        <div className="p-3 bg-secondary/50 rounded-[0.75rem] border border-border">
                                            <div className="text-muted-foreground mb-1">Provider</div>
                                            <div className="font-mono text-foreground font-semibold capitalize">{selectedLog.provider}</div>
                                        </div>
                                        <div className="p-3 bg-secondary/50 rounded-[0.75rem] border border-border">
                                            <div className="text-muted-foreground mb-1">Prompt Tokens</div>
                                            <div className="font-mono text-foreground font-semibold">{selectedLog.promptTokens}</div>
                                        </div>
                                        <div className="p-3 bg-secondary/50 rounded-[0.75rem] border border-border">
                                            <div className="text-muted-foreground mb-1">Completion Tokens</div>
                                            <div className="font-mono text-foreground font-semibold">{selectedLog.completionTokens}</div>
                                        </div>
                                        {selectedLog.reasoningTokens !== undefined && (
                                            <div className="p-3 bg-secondary/50 rounded-[0.75rem] border border-border">
                                                <div className="text-muted-foreground mb-1">Reasoning Tokens</div>
                                                <div className="font-mono text-amber-400 font-semibold">{selectedLog.reasoningTokens}</div>
                                            </div>
                                        )}
                                        {selectedLog.ttft && (
                                            <div className="p-3 bg-secondary/50 rounded-[0.75rem] border border-border">
                                                <div className="text-muted-foreground mb-1">TTFT</div>
                                                <div className="font-mono text-foreground font-semibold">{formatLatencySec(selectedLog.ttft)}</div>
                                            </div>
                                        )}
                                        <div className="col-span-2 p-3 bg-secondary/50 rounded-[0.75rem] border border-border">
                                            <div className="text-muted-foreground mb-2">Request ID</div>
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="font-mono text-foreground text-[10px] break-all">{selectedLog.id}</div>
                                                <button
                                                    onClick={() => copyToClipboard(selectedLog.id, selectedLog.id)}
                                                    className="p-1 hover:bg-primary/10 rounded transition-colors flex-shrink-0"
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
                                )}
                            </div>

                            {/* Sheet Footer */}
                            <div className="p-4 border-t border-border flex gap-2 bg-card">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => copyToClipboard(JSON.stringify(selectedLog, null, 2), 'full')}
                                >
                                    <Copy className="w-3.5 h-3.5 mr-2" /> Copy All
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

const AlertCircle = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
