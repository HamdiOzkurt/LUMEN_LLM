'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    AreaChart,
    Area,
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
} from 'recharts';

const API_BASE = 'http://localhost:3000/api';

// Modern Color Palette
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
const DARK_BG = '#1e293b'; // slate-800 for tooltip bg

export default function Charts() {
    const [timeseriesData, setTimeseriesData] = useState([]);
    const [providerData, setProviderData] = useState([]);

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const [timeseriesRes, providerRes] = await Promise.all([
                    axios.get(`${API_BASE}/metrics/timeseries?interval=hour`, { timeout: 30000 }),
                    axios.get(`${API_BASE}/metrics/by-provider`, { timeout: 30000 }),
                ]);

                // Veri yoksa boş array ata
                setTimeseriesData(timeseriesRes.data || []);
                setProviderData(providerRes.data || []);
            } catch (error) {
                console.error('Error fetching chart data:', error);
            }
        };

        fetchChartData();
        const interval = setInterval(fetchChartData, 10000);
        return () => clearInterval(interval);
    }, []);

    // Custom Tooltip for dark mode
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-xl">
                    <p className="mb-2 text-sm font-semibold text-slate-200">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: <span className="font-medium text-white">{entry.value}</span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (timeseriesData.length === 0 && providerData.length === 0) {
        return (
            <div className="flex h-64 w-full items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/50">
                <p className="text-slate-500">Waiting for data...</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Time Series Chart */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm backdrop-blur-sm">
                <h3 className="mb-6 text-lg font-semibold text-white">
                    📈 Traffic & Costs
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timeseriesData}>
                            <defs>
                                <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis
                                dataKey="_id"
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                stroke="#475569"
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                stroke="#475569"
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Area
                                type="monotone"
                                dataKey="calls"
                                stroke="#6366f1"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorCalls)"
                                name="API Calls"
                                animationDuration={1000}
                            />
                            <Area
                                type="monotone"
                                dataKey="cost"
                                stroke="#10b981"
                                strokeWidth={2}
                                fill="none"
                                name="Cost ($)"
                                animationDuration={1000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Provider Distribution */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm backdrop-blur-sm">
                <h3 className="mb-6 text-lg font-semibold text-white">
                    🔮 Model Distribution
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={providerData}
                                dataKey="calls"
                                nameKey="_id.model"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                            >
                                {providerData.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend layout="vertical" verticalAlign="middle" align="right" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
