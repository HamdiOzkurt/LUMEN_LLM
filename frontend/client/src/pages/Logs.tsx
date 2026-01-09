import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, RefreshCcw, FileText, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCost } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
        month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true
    });
};

const formatLatencySec = (ms: number) => (ms / 1000).toFixed(2) + 's';

export default function Logs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
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

    const filteredLogs = logs.filter((log: any) => {
        const matchesSearch =
            (log.model || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (JSON.stringify(log.request || "")).toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const getPromptText = (log: any) => {
        try {
            if (typeof log.request === 'string') return log.request;
            if (log.request?.messages) return log.request.messages.map((m: any) => m.content).join(' ');
            if (log.request?.prompt) return log.request.prompt;
            return JSON.stringify(log.request);
        } catch (e) { return ""; }
    };

    const getResponseText = (log: any) => {
        try {
            if (log.error) return log.error.message || "Error";
            if (typeof log.response === 'string') return log.response;
            if (log.response?.choices) return log.response.choices[0]?.message?.content || "";
            return JSON.stringify(log.response);
        } catch (e) { return ""; }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col h-[calc(100vh-40px)] space-y-6"> {/* Full viewport height utilization */}

                {/* Header & Controls */}
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <FileText className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Request Logs</h1>
                            <p className="text-gray-400 text-sm mt-1">Real-time trace of all LLM interactions.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search logs..."
                                className="pl-10 pr-4 py-2.5 bg-[#11131f] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 w-72 transition-all shadow-lg"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" onClick={fetchLogs} className="h-10 px-4 bg-[#11131f] border-white/10 text-gray-300 hover:text-white hover:bg-white/5 hover:border-white/20 rounded-xl transition-all">
                            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
                        </Button>
                    </div>
                </div>

                {/* Main Table Container - Enhanced Visibility */}
                <div className="flex-1 rounded-2xl border border-white/10 bg-[#11131f] shadow-2xl overflow-hidden flex flex-col relative group">

                    {/* Horizontal Scroll Area */}
                    <div className="overflow-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-[#0b0c15] sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider min-w-[180px] border-b border-white/5">Created At</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-white/5">Status</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-white/5">Provider</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider min-w-[400px] border-b border-white/5">Request Preview</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider min-w-[400px] border-b border-white/5">Response Preview</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-white/5">Model</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right border-b border-white/5">Tot. Tokens</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right border-b border-white/5">Latency</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 bg-[#11131f]">
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500 animate-pulse">
                                            Loading log data...
                                        </td>
                                    </tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                            No logs found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log: any) => (
                                        <tr key={log.id} className="hover:bg-white/[0.03] transition-colors group/row">
                                            {/* Date */}
                                            <td className="px-6 py-5 text-sm text-gray-300 font-mono border-r border-transparent group-hover/row:border-white/5">
                                                {formatDate(log.timestamp)}
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-5 border-r border-transparent group-hover/row:border-white/5">
                                                {log.status === 'success' ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        SUCCESS
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                                        {log.status?.toUpperCase() || 'ERROR'}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Provider */}
                                            <td className="px-6 py-5 text-sm font-medium text-white capitalize flex items-center gap-3 border-r border-transparent group-hover/row:border-white/5">
                                                <span className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${log.provider === 'openai' ? 'bg-green-500 shadow-green-500/50' :
                                                    log.provider === 'anthropic' ? 'bg-orange-500 shadow-orange-500/50' :
                                                        log.provider === 'gemini' ? 'bg-blue-500 shadow-blue-500/50' :
                                                            'bg-purple-500'
                                                    }`}></span>
                                                {log.provider}
                                            </td>

                                            {/* Prompt Preview */}
                                            <td className="px-6 py-5 text-sm text-gray-400 max-w-[400px] border-r border-transparent group-hover/row:border-white/5">
                                                <div className="truncate font-normal" title={getPromptText(log)}>
                                                    {getPromptText(log) || <span className="text-gray-600 italic">No content</span>}
                                                </div>
                                            </td>

                                            {/* Response Preview */}
                                            <td className="px-6 py-5 text-sm text-gray-400 max-w-[400px] border-r border-transparent group-hover/row:border-white/5">
                                                <div className="truncate font-normal" title={getResponseText(log)}>
                                                    {getResponseText(log) || <span className="text-gray-600 italic">No content</span>}
                                                </div>
                                            </td>

                                            {/* Model */}
                                            <td className="px-6 py-5 text-sm font-medium text-blue-300 border-r border-transparent group-hover/row:border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <Activity className="w-3.5 h-3.5 opacity-50" />
                                                    {log.model}
                                                </div>
                                            </td>

                                            {/* Tokens */}
                                            <td className="px-6 py-5 text-sm text-right font-mono text-gray-300 border-r border-transparent group-hover/row:border-white/5">
                                                {log.totalTokens > 0 ? log.totalTokens.toLocaleString() : '-'}
                                                <span className="text-gray-600 text-xs ml-1">tk</span>
                                            </td>

                                            {/* Latency */}
                                            <td className="px-6 py-5 text-right border-r border-transparent group-hover/row:border-white/5">
                                                <span className={`text-sm font-mono font-medium px-2 py-1 rounded ${log.duration > 2000
                                                    ? 'bg-yellow-500/10 text-yellow-500'
                                                    : 'bg-emerald-500/10 text-emerald-500'
                                                    }`}>
                                                    {formatLatencySec(log.duration)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Legend / Info (Optional, adds professional touch) */}
                <div className="flex items-center justify-between px-2 text-xs text-gray-600">
                    <div>Showing {filteredLogs.length} recent requests</div>
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> OpenAI</span>
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Gemini</span>
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Anthropic</span>
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Ollama</span>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
