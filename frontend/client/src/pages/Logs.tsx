import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, RefreshCcw, X, Copy, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/formatters";

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Formatters for this specific view
const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatLatencySec = (ms: number) => (ms / 1000).toFixed(3) + 's';

export default function Logs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLog, setSelectedLog] = useState<any>(null); // For Detail Panel

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

    const filteredLogs = logs.filter((log: any) => {
        const matchesSearch =
            (log.model || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (JSON.stringify(log.request || "")).toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <DashboardLayout>
            <div className="relative h-[calc(100vh-100px)] flex flex-col">

                {/* Header & Filter */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search requests..."
                                className="pl-9 pr-4 py-1.5 bg-black/20 border border-white/10 rounded-md text-xs text-foreground focus:outline-none focus:border-indigo-500 w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={fetchLogs}>
                        <RefreshCcw className="w-3.5 h-3.5 mr-2" /> Refresh
                    </Button>
                </div>

                {/* TABLE CONTAINER */}
                <div className="flex-1 overflow-hidden border border-white/10 rounded-lg bg-[#0a0a0a] flex">

                    {/* Main Table */}
                    <div className={`flex-1 overflow-auto transition-all duration-300 ${selectedLog ? 'pr-[400px]' : ''}`}>
                        <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-white/5 text-muted-foreground font-semibold sticky top-0 z-10 backdrop-blur-sm">
                                <tr>
                                    <th className="px-4 py-3 min-w-[140px]">Created At</th>
                                    <th className="px-4 py-3 w-24">Status</th>
                                    <th className="px-4 py-3 w-24">Provider</th>
                                    <th className="px-4 py-3 max-w-[200px]">Request</th>
                                    <th className="px-4 py-3 max-w-[200px]">Response</th>
                                    <th className="px-4 py-3 w-32">Model</th>
                                    <th className="px-4 py-3 text-right">Total Tokens</th>
                                    <th className="px-4 py-3 text-right">Prompt</th>
                                    <th className="px-4 py-3 text-right">Completion</th>
                                    <th className="px-4 py-3 text-right">Reasoning</th>
                                    <th className="px-4 py-3 text-right w-24">Latency</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredLogs.map((log: any) => (
                                    <tr
                                        key={log.id}
                                        onClick={() => setSelectedLog(log)}
                                        className={`hover:bg-white/5 cursor-pointer transition-colors ${selectedLog?.id === log.id ? 'bg-white/[0.08]' : ''}`}
                                    >
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {formatDate(log.timestamp)} <span className="opacity-60">{formatTime(log.timestamp)}</span>
                                        </td>

                                        <td className="px-4 py-3">
                                            {log.status === 'success' ? (
                                                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                                                    Success
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
                                                    {log.status === 'failed' ? 'Error' : log.status}
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase font-bold tracking-wider">
                                                {log.provider}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 max-w-[200px] truncate text-muted-foreground/80">
                                            {/* Gerçek veride request body buraya gelecek */}
                                            {log.model === 'gemini-1.5-flash' ? 'Explain quantum computing...' : 'What is the capital of...'}
                                        </td>

                                        <td className="px-4 py-3 max-w-[200px] truncate text-muted-foreground/80">
                                            {/* Gerçek veride response buraya gelecek */}
                                            {log.status === 'success' ? 'Quantum computing is a field...' : 'Error processing request...'}
                                        </td>

                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                                {log.model}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-right font-mono text-foreground">{log.totalTokens}</td>
                                        <td className="px-4 py-3 text-right font-mono text-muted-foreground">{log.promptTokens}</td>
                                        <td className="px-4 py-3 text-right font-mono text-muted-foreground">{log.completionTokens}</td>
                                        <td className="px-4 py-3 text-right font-mono text-muted-foreground">0</td>

                                        <td className="px-4 py-3 text-right font-mono text-foreground">
                                            {formatLatencySec(log.duration)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* DETAIL SIDE PANEL (Right Drawer) */}
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
                                        <div className={`font-mono text-xs font-bold ${selectedLog.status === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
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
                                            <div className="text-foreground font-mono">{selectedLog.model}</div>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded border border-white/5">
                                            <div className="text-muted-foreground mb-1">Provider</div>
                                            <div className="text-foreground font-mono">{selectedLog.provider}</div>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded border border-white/5">
                                            <div className="text-muted-foreground mb-1">Project ID</div>
                                            <div className="text-foreground font-mono">{selectedLog.projectId || 'N/A'}</div>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded border border-white/5">
                                            <div className="text-muted-foreground mb-1">Timestamp</div>
                                            <div className="text-foreground font-mono">{new Date(selectedLog.timestamp).toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* JSON Viewers */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        <span>Full Log Object</span>
                                        <Copy className="w-3 h-3 cursor-pointer hover:text-white" />
                                    </div>
                                    <div className="bg-black border border-white/10 rounded-lg p-3 overflow-x-auto text-xs font-mono">
                                        <pre className="text-green-400/80 leading-relaxed">
                                            {JSON.stringify(selectedLog, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            {/* Panel Footer */}
                            <div className="p-4 border-t border-white/10 bg-black flex justify-end">
                                <Button variant="outline" size="sm" className="text-xs border-white/10 bg-white/5 hover:bg-white/10">
                                    Open in Playground
                                </Button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </DashboardLayout>
    );
}
