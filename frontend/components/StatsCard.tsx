import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    icon: LucideIcon;
    label: string;
    value: string;
    trend?: string;
    trendUp?: boolean;
}

export default function StatsCard({ icon: Icon, label, value, trend, trendUp }: StatsCardProps) {
    return (
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-slate-700 hover:shadow-md group">
            {/* Background Glow Effect */}
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl transition-all group-hover:bg-indigo-500/20"></div>

            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-400">{label}</p>
                    <h3 className="mt-2 text-3xl font-bold tracking-tight text-white">{value}</h3>

                    {trend && (
                        <div className={`mt-2 flex items-center text-xs font-medium ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {trendUp ? '↑' : '↓'} {trend}
                            <span className="ml-1 text-slate-500">vs last hour</span>
                        </div>
                    )}
                </div>

                <div className="rounded-lg bg-slate-800 p-3 text-slate-300 ring-1 ring-inset ring-slate-700/50">
                    <Icon size={24} strokeWidth={1.5} />
                </div>
            </div>
        </div>
    );
}
