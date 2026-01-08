import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

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

export default function LogsList({ logs }: { logs: Log[] }) {
    if (logs.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No logs yet</h3>
                <p className="text-gray-600 mb-4">Run a test to see logs appear here</p>
                <code className="bg-gray-100 px-4 py-2 rounded-lg text-sm text-indigo-600">
                    node llm-monitor-sdk/test/test-gemini.js
                </code>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                📜 Recent Logs
                <span className="text-sm font-normal text-gray-500">
                    ({logs.length} latest)
                </span>
            </h2>

            <div className="space-y-3">
                {logs.map((log) => (
                    <div
                        key={log.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <span className="font-semibold text-indigo-600">
                                    {log.provider}
                                </span>
                                <span className="text-gray-400 mx-2">/</span>
                                <span className="text-gray-700">{log.model}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                                {formatDistanceToNow(new Date(log.timestamp), {
                                    addSuffix: true,
                                    locale: tr,
                                })}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
                            <div>
                                <span className="text-gray-500">Status:</span>
                                <span
                                    className={`ml-2 font-semibold ${log.status === 'success' ? 'text-green-600' : 'text-red-600'
                                        }`}
                                >
                                    {log.status === 'success' ? '✅' : '❌'} {log.status}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">Tokens:</span>
                                <span className="ml-2 font-medium">{log.totalTokens}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Duration:</span>
                                <span className="ml-2 font-medium">{log.duration}ms</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Cost:</span>
                                <span className="ml-2 font-medium">${log.cost.toFixed(6)}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Project:</span>
                                <span className="ml-2 font-medium">{log.projectId}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Env:</span>
                                <span className="ml-2 font-medium">{log.environment}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
