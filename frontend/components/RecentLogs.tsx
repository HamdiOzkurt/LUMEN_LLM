import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale'; // Türkçe yerine global standart için EN kullandım, istenirse TR dönebiliriz.
import { FileText, Clock, DollarSign, Activity, CheckCircle2, XCircle } from 'lucide-react';

interface Log {
    id: string;
    timestamp: string;
    provider: string;
    model: string;
    projectId: string;
    environment: string;
    totalTokens: number;
    duration: number;
    status: string;
    cost: number;
}

export default function RecentLogs({ logs }: { logs: Log[] }) {
    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/50 py-16 text-center">
                <div className="mb-4 rounded-full bg-slate-800 p-4 text-slate-500">
                    <FileText size={32} />
                </div>
                <h3 className="text-lg font-medium text-slate-200">No logs found</h3>
                <p className="mt-1 text-sm text-slate-500">Run some requests to populate this table.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 shadow-sm backdrop-blur-sm overflow-hidden">
            <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                <h3 className="font-semibold text-white">Recent Transactions</h3>
                <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-400">
                    Live
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-950/50 text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-6 py-3 font-medium">Status</th>
                            <th className="px-6 py-3 font-medium">Provider / Model</th>
                            <th className="px-6 py-3 font-medium">Tokens</th>
                            <th className="px-6 py-3 font-medium">Latency</th>
                            <th className="px-6 py-3 font-medium">Cost</th>
                            <th className="px-6 py-3 font-medium">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className={`flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border
                                ${log.status === 'success'
                                            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                            : 'border-rose-500/20 bg-rose-500/10 text-rose-400'
                                        }`}>
                                        {log.status === 'success' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                        {log.status}
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-200">{log.provider}</span>
                                        <span className="text-xs text-slate-500">{log.model}</span>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center gap-1.5">
                                        <Activity size={14} className="text-slate-600" />
                                        {log.totalTokens.toLocaleString()}
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={14} className="text-slate-600" />
                                        <span className={log.duration > 2000 ? 'text-amber-400' : 'text-slate-300'}>
                                            {log.duration}ms
                                        </span>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-200">
                                    ${log.cost.toFixed(6)}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-500">
                                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
