'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LayoutDashboard,
  ArrowUpRight,
  Activity,
  Zap,
  DollarSign,
  RefreshCw
} from 'lucide-react';

import StatsCard from '@/components/StatsCard';
import RecentLogs from '@/components/RecentLogs';
import Charts from '@/components/Charts';

const API_BASE = 'http://localhost:3000/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    totalTokens: 0,
    totalCost: 0,
    avgDuration: 0,
  });

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        axios.get(`${API_BASE}/metrics/summary`, { timeout: 30000 }),
        axios.get(`${API_BASE}/logs?limit=25`, { timeout: 30000 }),
      ]);

      setStats(statsRes.data);
      setLogs(logsRes.data.logs || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      // Backend kapalıysa veya hata varsa
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000); // Poll every 8s
    return () => clearInterval(interval);
  }, []);

  const successRate = stats.totalCalls > 0
    ? Math.round((stats.successfulCalls / stats.totalCalls) * 100)
    : 0;

  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <LayoutDashboard className="text-indigo-500" />
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time insights into your LLM infrastructure performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            System Operational
          </div>

          <button
            onClick={fetchData}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center gap-3 text-rose-400">
          <div className="p-2 bg-rose-500/20 rounded-lg">!</div>
          <div>
            <p className="font-semibold">Connection Error</p>
            <p className="text-sm opacity-80">{error}. Is the backend running on port 3000?</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={Activity}
          label="Total Requests"
          value={stats.totalCalls?.toLocaleString() || '0'}
          trend="+12%"
          trendUp={true}
        />
        <StatsCard
          icon={ArrowUpRight}
          label="Success Rate"
          value={`${successRate}%`}
          trend={successRate < 95 ? "-2%" : "+1%"}
          trendUp={successRate >= 95}
        />
        <StatsCard
          icon={Zap}
          label="Total Tokens"
          value={stats.totalTokens?.toLocaleString() || '0'}
          trend="+5.4%"
          trendUp={true}
        />
        <StatsCard
          icon={DollarSign}
          label="Total Cost"
          value={`$${(stats.totalCost || 0).toFixed(4)}`}
          trend="+0.8%"
          trendUp={true}
        />
      </div>

      {/* Content Grid */}
      <Charts />

      {/* Logs Table */}
      <RecentLogs logs={logs} />
    </div>
  );
}
