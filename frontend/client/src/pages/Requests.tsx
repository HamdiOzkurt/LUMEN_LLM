import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, Filter, ChevronRight, ChevronLeft } from "lucide-react";

// --- MOCK DATA ---
const EXAMPLE_LOGS = [
    {
        id: "req_1",
        timestamp: new Date().toISOString(),
        status: "success",
        request: "You are an expert technical writer. Create a summary of...",
        response: "Great choice! Costa Rica in June offers lush landscapes...",
        model: "gpt-3.5-turbo-0125",
        total_tokens: 339,
        prompt_tokens: 234,
        completion_tokens: 105,
        cost: 0.0012
    },
    {
        id: "req_2",
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        status: 200,
        request: "Translate the following JSON object to Typescript in...",
        response: "Here is the interface definition for the provided JSON...",
        model: "gpt-4-turbo-preview",
        total_tokens: 1250,
        prompt_tokens: 1000,
        completion_tokens: 250,
        cost: 0.015
    },
    {
        id: "req_3",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        status: "error",
        request: "Explain quantum entanglement to a 5 year old...",
        response: "Error: 429 Too Many Requests",
        model: "claude-3-opus",
        total_tokens: 0,
        prompt_tokens: 45,
        completion_tokens: 0,
        cost: 0
    },
    ...Array.from({ length: 45 }).map((_, i) => ({
        id: `req_${i + 4}`,
        timestamp: new Date(Date.now() - 1000 * 60 * (20 + i * 10)).toISOString(),
        status: Math.random() > 0.1 ? (Math.random() > 0.5 ? "success" : 200) : "error",
        request: i % 2 === 0 ? "Refactor this React component to use hooks..." : "Write a SQL query to find top users...",
        response: i % 2 === 0 ? "Certainly! Here is the refactored functional component..." : "SELECT user_id, count(*) FROM orders GROUP BY...",
        model: Math.random() > 0.5 ? "gpt-4" : "gemini-2.5-flash",
        total_tokens: Math.floor(Math.random() * 1000) + 100,
        prompt_tokens: Math.floor(Math.random() * 800) + 50,
        completion_tokens: Math.floor(Math.random() * 200) + 50,
        cost: Math.random() * 0.01
    }))
];

export default function Requests() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState<any | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 15;

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLogs(EXAMPLE_LOGS);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch logs", error);
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    // Filter Logic
    const filteredLogs = logs.filter(log => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            log.request.toLowerCase().includes(query) ||
            log.response.toLowerCase().includes(query) ||
            log.model.toLowerCase().includes(query) ||
            String(log.status).toLowerCase().includes(query)
        );
    });

    // Pagination Logic (Applied on filtered logs)
    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    const StatusBadge = ({ status }: { status: string | number }) => {
        const isSuccess = String(status).toLowerCase() === 'success' || String(status) === '200';
        return (
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border border-opacity-20 ${isSuccess
                    ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-500 border-green-200 dark:border-green-500'
                    : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-500 border-red-200 dark:border-red-500'
                }`}>
                {isSuccess ? 'Success' : 'Error'}
            </div>
        );
    };

    const ModelBadge = ({ model }: { model: string }) => (
        <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
            {model}
        </div>
    );

    return (
        <DashboardLayout isFullWidth={true}>
            <div className="flex flex-col h-[calc(100vh-80px)]">

                {/* Header Toolbar */}
                <div className="flex-none flex flex-col border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#0B0E14]">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Requests</h1>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Start Live
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 border rounded-lg px-3 py-1.5 text-xs transition-colors ${showFilters
                                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30'
                                        : 'bg-gray-50 dark:bg-[#16161A] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5'
                                    }`}
                            >
                                <Filter className="w-3.5 h-3.5" />
                                Filters
                            </button>
                        </div>
                    </div>

                    {/* Filter Bar (Conditional) */}
                    {showFilters && (
                        <div className="px-6 py-3 bg-gray-50/50 dark:bg-[#16161A]/50 border-t border-gray-200 dark:border-white/5 flex items-center gap-4 animate-in slide-in-from-top-2 duration-200">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by request, response, model or status..."
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                    className="w-full pl-9 pr-4 py-2 rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
                                    autoFocus
                                />
                            </div>
                            <div className="text-xs text-gray-500">
                                Showing {filteredLogs.length} results
                            </div>
                        </div>
                    )}
                </div>

                {/* Table Container */}
                <div className="flex-1 overflow-auto bg-white dark:bg-[#0B0E14]">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-[#12141a] sticky top-0 z-10 text-xs font-semibold text-gray-500 uppercase tracking-wider shadow-sm border-b border-gray-200 dark:border-white/5">
                            <tr>
                                <th className="px-6 py-4 font-medium w-[180px]">Created At</th>
                                <th className="px-6 py-4 font-medium w-[100px]">Status</th>
                                <th className="px-6 py-4 font-medium max-w-[300px]">Request</th>
                                <th className="px-6 py-4 font-medium max-w-[300px]">Response</th>
                                <th className="px-6 py-4 font-medium w-[180px]">Model</th>
                                <th className="px-6 py-4 font-medium text-right w-[100px]">Total</th>
                                <th className="px-6 py-4 font-medium text-right w-[100px]">Prompt</th>
                                <th className="px-6 py-4 font-medium text-right w-[100px]">Completion</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
                            {currentLogs.map((log) => (
                                <tr
                                    key={log.id}
                                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                    onClick={() => setSelectedLog(log)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400 font-mono text-xs">
                                        {new Date(log.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={log.status} />
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300 truncate max-w-[300px] font-mono text-xs text-opacity-90">
                                        {log.request}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 truncate max-w-[300px] font-mono text-xs text-opacity-80">
                                        {log.response}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <ModelBadge model={log.model} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700 dark:text-gray-300 font-mono">
                                        {log.total_tokens || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500 dark:text-gray-500 font-mono text-xs">
                                        {log.prompt_tokens || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500 dark:text-gray-500 font-mono text-xs">
                                        {log.completion_tokens || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                <div className="flex-none border-t border-gray-200 dark:border-white/5 px-6 py-3 flex items-center justify-between bg-white dark:bg-[#16161A] text-xs text-gray-500">
                    <div>Showing {Math.min(indexOfFirstLog + 1, filteredLogs.length)}-{Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length}</div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="font-mono">{currentPage} of {totalPages || 1}</span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage >= totalPages}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
