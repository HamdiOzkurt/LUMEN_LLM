import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { formatCost } from "@/lib/formatters";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function EnterpriseDashboard() {
  // State
  const [stats, setStats] = useState({
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    totalTokens: 0,
    totalCost: 0,
    avgDuration: 0
  });
  const [providerData, setProviderData] = useState<any[]>([]);
  const [timeseriesData, setTimeseriesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, providerRes, timeseriesRes] = await Promise.all([
          fetch(`${API_BASE}/api/metrics/summary`),
          fetch(`${API_BASE}/api/metrics/by-provider`),
          fetch(`${API_BASE}/api/metrics/timeseries?interval=hour`)
        ]);

        const statsData = await statsRes.json();
        const providerDataRaw = await providerRes.json();
        const timeseriesDataRaw = await timeseriesRes.json();

        setStats(statsData);
        setProviderData(providerDataRaw);
        setTimeseriesData(timeseriesDataRaw);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  // Derived metrics
  const successRate = stats.totalCalls > 0
    ? ((stats.successfulCalls / stats.totalCalls) * 100).toFixed(1)
    : '0.0';

  // Transform data for charts
  const tokenUsageData = timeseriesData.map(item => ({
    time: item._id,
    tokens: item.tokens,
    cost: item.cost,
    calls: item.calls
  }));

  const tokenBreakdownData = providerData.map(item => ({
    name: `${item._id.provider}`,
    value: item.tokens,
    cost: item.cost,
    color: "#6366f1"
  })).slice(0, 5);

  return (
    <DashboardLayout>

      {/* Page Header Content */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 inline-block mb-2">
          Global Overview
        </h1>
        <p className="text-muted-foreground">
          Real-time insights into your LLM infrastructure performance, costs, and usage.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Total Cost", value: formatCost(stats.totalCost), trend: "+12%", color: "text-indigo-500", border: "border-indigo-500/20", shadow: "shadow-indigo-500/10" },
              { label: "Total Tokens", value: stats.totalTokens.toLocaleString(), trend: "+5%", color: "text-cyan-500", border: "border-cyan-500/20", shadow: "shadow-cyan-500/10" },
              { label: "Avg. Latency", value: `${Math.round(stats.avgDuration)}ms`, trend: "-8%", color: "text-emerald-500", border: "border-emerald-500/20", shadow: "shadow-emerald-500/10" },
              { label: "Success Rate", value: `${successRate}%`, trend: "+0.2%", color: "text-amber-500", border: "border-amber-500/20", shadow: "shadow-amber-500/10" },
            ].map((stat, i) => (
              <div
                key={i}
                className={`glassmorphic p-6 rounded-xl border ${stat.border} hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group`}
              >
                <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${stat.color}`}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" /></svg>
                </div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-3xl font-bold text-foreground font-mono">{stat.value}</p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full bg-white/10 ${stat.color} font-bold`}>
                    {stat.trend}
                  </span>
                  <span className="text-xs text-muted-foreground">vs last 24h</span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Token Usage Chart */}
            <div className="glassmorphic p-6 rounded-xl border border-white/10 flex flex-col">
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                Token Usage Trend
              </h3>
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tokenUsageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                      dataKey="time"
                      stroke="#94a3b8"
                      style={{ fontSize: "10px", fontFamily: "var(--font-mono)" }}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      style={{ fontSize: "10px", fontFamily: "var(--font-mono)" }}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(10, 10, 12, 0.9)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)",
                        padding: "16px"
                      }}
                      itemStyle={{ color: "#fff", fontSize: "12px" }}
                      labelStyle={{ color: "#94a3b8", marginBottom: "8px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px" }}
                      cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    <Bar
                      dataKey="tokens"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                      name="Tokens Generated"
                    />
                    <Bar
                      dataKey="calls"
                      fill="#06b6d4"
                      radius={[4, 4, 0, 0]}
                      name="API Calls"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cost Distribution */}
            <div className="glassmorphic p-6 rounded-xl border border-white/10 flex flex-col">
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-cyan-500 rounded-full"></span>
                Token Usage by Provider
              </h3>
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tokenBreakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {tokenBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#6366f1" : "#06b6d4"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "rgba(10, 10, 12, 0.9)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)",
                        padding: "12px 16px"
                      }}
                      itemStyle={{ color: "#fff" }}
                      formatter={(value: number) => [value.toLocaleString(), 'Tokens']}
                    />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      iconType="circle"
                      formatter={(value) => <span className="text-sm font-medium text-muted-foreground ml-2">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
