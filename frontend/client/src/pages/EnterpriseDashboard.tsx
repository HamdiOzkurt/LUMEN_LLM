import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { formatCost, formatNumber, formatLatency } from "@/lib/formatters";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Activity, DollarSign,
  Clock, CheckCircle, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

export default function EnterpriseDashboard() {
  const [stats, setStats] = useState({
    totalCost: 0,
    totalTokens: 0,
    totalRequests: 0,
    avgLatency: 0,
    errorRate: 0,
    successRate: 100
  });
  const [usageTrend, setUsageTrend] = useState<any[]>([]);
  const [providerStats, setProviderStats] = useState<any[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, logsRes] = await Promise.all([
          fetch(`${API_BASE}/api/metrics`),
          fetch(`${API_BASE}/api/logs?limit=5000`)
        ]);

        const metrics = await metricsRes.json();
        const logsData = await logsRes.json();
        const logs = logsData.logs || [];

        // --- 1. HERO STATS CALCULATION ---
        const totalReqs = logs.length;
        const errors = logs.filter((l: any) => l.status === 'failed' || l.status === 'error').length;
        const successRate = totalReqs > 0 ? ((totalReqs - errors) / totalReqs) * 100 : 100;

        const validLatencies = logs.filter((l: any) => l.duration > 0).map((l: any) => l.duration);
        const avgLat = validLatencies.length > 0
          ? validLatencies.reduce((a: number, b: number) => a + b, 0) / validLatencies.length
          : 0;

        setStats({
          totalCost: metrics.totalCost || 0,
          totalTokens: metrics.totalTokens || 0,
          totalRequests: metrics.totalRequests || totalReqs,
          avgLatency: avgLat,
          errorRate: (errors / totalReqs) * 100,
          successRate: successRate
        });

        // --- 2. TREND CHART DATA (Last 24h Hourly) ---
        const last24h = new Array(24).fill(0).map((_, i) => {
          const d = new Date();
          d.setHours(d.getHours() - (23 - i));
          return {
            hour: d.getHours() + ':00',
            tokens: 0,
            latency: 0,
            count: 0
          };
        });

        logs.forEach((log: any) => {
          if (!log.timestamp) return;
          const logDate = new Date(log.timestamp);
          // Basit saat eşleştirmesi (Demo amaçlı sadece son saatleri doldurur)
          const hourStr = logDate.getHours() + ':00';
          const slot = last24h.find(s => s.hour === hourStr);
          if (slot) {
            slot.tokens += (log.totalTokens || 0);
            slot.latency += (log.duration || 0);
            slot.count++;
          }
        });

        // Boş slotları temizle veya sıfır olarak bırak
        const trendData = last24h.map(slot => ({
          ...slot,
          latency: slot.count > 0 ? Math.round(slot.latency / slot.count) : 0
        }));
        setUsageTrend(trendData);

        // --- 3. PROVIDER STATS ---
        const pStats: any = {};
        logs.forEach((log: any) => {
          const p = log.provider || 'unknown';
          if (!pStats[p]) {
            pStats[p] = { name: p, tokens: 0, calls: 0, cost: 0, latencySum: 0 };
          }
          pStats[p].tokens += (log.totalTokens || 0);
          pStats[p].calls++;
          pStats[p].cost += (log.cost || 0);
          pStats[p].latencySum += (log.duration || 0);
        });

        setProviderStats(Object.values(pStats).map((p: any) => ({
          ...p,
          avgCost: p.calls > 0 ? p.cost / p.calls : 0,
          avgLatency: p.calls > 0 ? p.latencySum / p.calls : 0
        })));

        setLoading(false);
      } catch (error) {
        console.error("Dashboard Error:", error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const changes = {
    cost: "+12%",
    tokens: "+5%",
    latency: "-8%",
    success: "+0.2%"
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">LLM Observability Dashboard</h1>
          <p className="text-muted-foreground text-sm">Real-time insights into your LLM infrastructure performance, costs, and usage patterns.</p>
        </div>

        {/* 1. HERO CARDS (Stats) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Cost */}
          <div className="glassmorphic p-5 rounded-xl border border-white/10 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">TOTAL COST</span>
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:text-indigo-300 transition-colors">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-2">{formatCost(stats.totalCost)}</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-medium flex items-center">
                {changes.cost}
              </span>
              <span className="text-muted-foreground">vs last 24h</span>
            </div>
          </div>

          {/* Total Tokens */}
          <div className="glassmorphic p-5 rounded-xl border border-white/10 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">TOTAL TOKENS</span>
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 group-hover:text-purple-300 transition-colors">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-2">{formatNumber(stats.totalTokens)}</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-medium flex items-center">
                {changes.tokens}
              </span>
              <span className="text-muted-foreground">vs last 24h</span>
            </div>
          </div>

          {/* Avg Latency */}
          <div className="glassmorphic p-5 rounded-xl border border-white/10 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AVG LATENCY</span>
              <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 group-hover:text-cyan-300 transition-colors">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-2">{formatLatency(stats.avgLatency)}</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-medium flex items-center">
                {changes.latency}
              </span>
              <span className="text-muted-foreground">vs last 24h</span>
            </div>
          </div>

          {/* Success Rate */}
          <div className="glassmorphic p-5 rounded-xl border border-white/10 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">SUCCESS RATE</span>
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 group-hover:text-amber-300 transition-colors">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-2">{stats.successRate.toFixed(1)}%</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-medium flex items-center">
                {changes.success}
              </span>
              <span className="text-muted-foreground">vs last 24h</span>
            </div>
          </div>
        </div>

        {/* 2. CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Trend Chart (Area) - Spans 2 cols */}
          <div className="lg:col-span-2 glassmorphic p-6 rounded-xl border border-white/10">
            <h3 className="text-sm font-bold text-foreground mb-6 pl-2 border-l-4 border-indigo-500">
              Token Usage Trend
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usageTrend}>
                  <defs>
                    <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f1117', borderColor: '#ffffff20', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="tokens"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorTokens)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution Chart (Donut) - Spans 1 col */}
          <div className="glassmorphic p-6 rounded-xl border border-white/10">
            <h3 className="text-sm font-bold text-foreground mb-6 pl-2 border-l-4 border-cyan-500">
              Token Usage by Provider
            </h3>
            <div className="h-[300px] w-full flex flex-col items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={providerStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="tokens"
                  >
                    {providerStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f1117', borderColor: '#ffffff20', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text (Total) */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                <div className="text-2xl font-bold text-white">{providerStats.length}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Providers</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. PROVIDER STATISTICS TABLE */}
        <div className="glassmorphic rounded-xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground pl-2 border-l-4 border-indigo-500">
              Provider Statistics
            </h3>
            <Button variant="ghost" size="sm" className="text-xs text-indigo-400 hover:text-indigo-300">
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase text-muted-foreground font-semibold">
                <tr>
                  <th className="px-6 py-4">Provider</th>
                  <th className="px-6 py-4 text-right">Tokens</th>
                  <th className="px-6 py-4 text-right">Calls</th>
                  <th className="px-6 py-4 text-right">Cost</th>
                  <th className="px-6 py-4 text-right">Avg Cost/Call</th>
                  <th className="px-6 py-4 text-right">Avg Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {providerStats.map((p, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                        <span className="font-medium text-foreground capitalize">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-muted-foreground">{formatNumber(p.tokens)}</td>
                    <td className="px-6 py-4 text-right font-mono text-muted-foreground">{p.calls}</td>
                    <td className="px-6 py-4 text-right font-mono text-foreground font-medium">{formatCost(p.cost)}</td>
                    <td className="px-6 py-4 text-right font-mono text-muted-foreground">{formatCost(p.avgCost)}</td>
                    <td className="px-6 py-4 text-right font-mono text-muted-foreground">{formatLatency(p.avgLatency)}</td>
                  </tr>
                ))}
                {providerStats.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">No provider data available yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
