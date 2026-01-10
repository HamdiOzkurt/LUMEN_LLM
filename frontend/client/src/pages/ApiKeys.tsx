import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Key, ShieldCheck, Activity, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- MOCK DATA GENERATOR ---
const generateMockApiKeysData = () => {
    return [
        {
            id: 'key-1',
            name: 'Production Key (OpenAI)',
            provider: 'openai',
            preview: 'sk-proj...8f9a',
            status: 'active',
            usage: {
                current: 135.50,
                limit: 500.00
            },
            requests: 12450,
            lastUsed: '2 mins ago',
            created: 'Jan 1, 2024'
        },
        {
            id: 'key-2',
            name: 'Dev Key (Gemini)',
            provider: 'google',
            preview: 'AIzaSy...5kqp',
            status: 'active',
            usage: {
                current: 2.10,
                limit: 100.00
            },
            requests: 5600,
            lastUsed: 'Just now',
            created: 'Jan 3, 2024'
        },
        {
            id: 'key-3',
            name: 'Test Key (Claude)',
            provider: 'anthropic',
            preview: 'sk-ant...90op',
            status: 'warning', // Near limit
            usage: {
                current: 48.00,
                limit: 50.00
            },
            requests: 310,
            lastUsed: '2 hours ago',
            created: 'Jan 5, 2024'
        }
    ];
};
// ----------------------------

export default function ApiKeys() {
    const [loading, setLoading] = useState(true);
    const [keys, setKeys] = useState<any[]>([]);

    useEffect(() => {
        // --- MOCK MODE ---
        setTimeout(() => {
            setKeys(generateMockApiKeysData());
            setLoading(false);
        }, 800);

        // --- REAL MODE ---
        // Not implemented yet on backend as per instructions
    }, []);

    const getProgressColor = (current: number, limit: number) => {
        const percentage = (current / limit) * 100;
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 70) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Key className="w-8 h-8 text-indigo-500" />
                            API Keys
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Monitor usage limits and status of your active API keys.
                        </p>
                    </div>
                    {/* 
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="w-4 h-4 mr-2" /> Add Key
                    </Button>
                    */}
                </div>

                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg p-4 flex items-start gap-4">
                    <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-amber-900 dark:text-amber-400">Security Note</h3>
                        <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                            For security, actual API keys are never stored in the dashboard database.
                            They are managed via your <code className="bg-amber-100 dark:bg-black/20 px-1 rounded font-bold">.env</code> file.
                            This page tracks usage based on the key identifier.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {keys.map((key) => (
                            <div key={key.id} className="bg-white dark:bg-[#16161A] p-6 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm relative overflow-hidden">
                                {key.status === 'warning' && (
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/20 to-transparent pointer-events-none"></div>
                                )}

                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
                                    {/* Key Info */}
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                                            <Key className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                {key.name}
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${key.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                                    'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                                                    }`}>
                                                    {key.status}
                                                </span>
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="font-mono text-gray-500 dark:text-gray-400 text-sm bg-gray-100 dark:bg-black/30 px-2 py-1 rounded">
                                                    {key.preview}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Usage Stats - with Progress Bar */}
                                    <div className="flex-1 max-w-md w-full">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600 dark:text-gray-400 font-medium">Monthly Usage</span>
                                            <span className="text-gray-900 dark:text-white font-bold">
                                                ${key.usage.current.toFixed(2)} <span className="text-gray-400 font-normal">/ ${key.usage.limit.toFixed(2)}</span>
                                            </span>
                                        </div>
                                        <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(key.usage.current, key.usage.limit)}`}
                                                style={{ width: `${(key.usage.current / key.usage.limit) * 100}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-500">
                                            <span>Requests: {key.requests.toLocaleString()}</span>
                                            <span>Last used: {key.lastUsed}</span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
