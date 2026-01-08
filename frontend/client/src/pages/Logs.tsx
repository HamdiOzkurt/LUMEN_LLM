import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Terminal, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Logs() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                // Fetch more logs for the dedicated page (e.g., 50)
                const res = await fetch(`${API_BASE}/api/logs?limit=50`);
                const data = await res.json();
                setLogs(data.logs || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching logs:', error);
                setLoading(false);
            }
        };

        fetchLogs();
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6 h-[calc(100vh-140px)]">

                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <Terminal className="w-8 h-8 text-indigo-500" />
                            Live Logs
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Real-time stream of all LLM requests, completions, and errors.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="gap-2">
                            <Filter className="w-4 h-4" />
                            Filter
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <Search className="w-4 h-4" />
                            Search
                        </Button>
                    </div>
                </div>

                {/* Logs Table Container */}
                <div className="flex-1 glassmorphic rounded-xl border border-white/10 overflow-hidden flex flex-col shadow-2xl">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-white/5 text-muted-foreground uppercase text-[10px] tracking-widest font-bold sticky top-0 backdrop-blur-md z-10">
                                    <tr>
                                        <th className="px-6 py-4 font-medium border-b border-white/5">Status</th>
                                        <th className="px-6 py-4 font-medium border-b border-white/5">Time</th>
                                        <th className="px-6 py-4 font-medium border-b border-white/5">Provider</th>
                                        <th className="px-6 py-4 font-medium border-b border-white/5">Model</th>
                                        <th className="px-6 py-4 font-medium border-b border-white/5 text-right w-32">Tokens (In/Out)</th>
                                        <th className="px-6 py-4 font-medium border-b border-white/5 text-right w-24">Latency</th>
                                        <th className="px-6 py-4 font-medium border-b border-white/5 text-right w-24">Cost</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                                No logs found yet. Waiting for requests...
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map((log: any, idx: number) => (
                                            <tr key={log._id || idx} className="hover:bg-white/5 transition-colors group cursor-pointer">
                                                <td className="px-6 py-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${log.status === "failed" || log.statusCode >= 400
                                                            ? "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                                                            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                                        }`}>
                                                        {log.status === "failed" || log.statusCode >= 400 ? "Failed" : "200 OK"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 font-mono text-muted-foreground text-xs">
                                                    {new Date(log.timestamp).toLocaleTimeString()}
                                                    <span className="opacity-50 text-[10px] ml-1">.{new Date(log.timestamp).getMilliseconds()}</span>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                                        <span className="capitalize font-medium text-foreground">{log.provider}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className="font-mono text-xs bg-white/5 px-2 py-1 rounded text-foreground/80">{log.model}</span>
                                                </td>
                                                <td className="px-6 py-3 text-right font-mono text-xs text-muted-foreground">
                                                    {log.prompt_tokens}/{log.completion_tokens}
                                                </td>
                                                <td className="px-6 py-3 text-right font-mono text-[#06b6d4]">
                                                    {Math.round(log.duration)}ms
                                                </td>
                                                <td className="px-6 py-3 text-right font-mono text-[#6366f1] font-bold">
                                                    ${(log.cost || 0).toFixed(5)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
