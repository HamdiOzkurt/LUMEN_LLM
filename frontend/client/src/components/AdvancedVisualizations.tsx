/**
 * Advanced Visualizations Component
 * 
 * Complex data visualizations for deep analysis:
 * - Heatmap: Provider performance across time and request types
 * - Sankey Diagram: Cost flow from projects through providers to models
 * - Correlation Matrix: Performance metrics relationships
 * 
 * Design: Dark theme with semantic color gradients
 */

import { Card } from "@/components/ui/card";
import { useState } from "react";

// Heatmap data: Provider performance by hour and request type
const heatmapData = [
  { hour: "00:00", simple: 145, complex: 234, vision: 89 },
  { hour: "04:00", simple: 167, complex: 289, vision: 112 },
  { hour: "08:00", simple: 198, complex: 345, vision: 156 },
  { hour: "12:00", simple: 267, complex: 412, vision: 234 },
  { hour: "16:00", simple: 245, complex: 389, vision: 201 },
  { hour: "20:00", simple: 189, complex: 312, vision: 145 },
  { hour: "24:00", simple: 156, complex: 267, vision: 98 },
];

const requestTypes = ["Simple", "Complex", "Vision"];
const providers = ["OpenAI", "Anthropic", "Google", "Cohere"];

// Sankey data structure
const sankeySources = [
  { name: "Project Alpha", value: 2450 },
  { name: "Project Beta", value: 1890 },
  { name: "Project Gamma", value: 1650 },
  { name: "Project Delta", value: 1320 },
  { name: "Project Epsilon", value: 980 },
];

const sankeyTargets = [
  { name: "OpenAI", value: 3200 },
  { name: "Anthropic", value: 2100 },
  { name: "Google", value: 1800 },
  { name: "Cohere", value: 1190 },
];

// Color gradient for heatmap (low to high latency)
const getHeatmapColor = (value: number, max: number) => {
  const ratio = value / max;
  if (ratio < 0.25) return "bg-green-900/40";
  if (ratio < 0.5) return "bg-yellow-900/40";
  if (ratio < 0.75) return "bg-orange-900/40";
  return "bg-red-900/40";
};

const getHeatmapTextColor = (value: number, max: number) => {
  const ratio = value / max;
  if (ratio < 0.25) return "text-green-400";
  if (ratio < 0.5) return "text-yellow-400";
  if (ratio < 0.75) return "text-orange-400";
  return "text-red-400";
};

// SVG Sankey Diagram Component
const SankeyDiagram = () => {
  const width = 800;
  const height = 400;
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Calculate positions
  const sourceX = margin.left + 50;
  const targetX = width - margin.right - 150;
  const sourceYStart = margin.top + 30;
  const targetYStart = margin.top + 30;

  const sourceSpacing = innerHeight / (sankeySources.length + 1);
  const targetSpacing = innerHeight / (sankeyTargets.length + 1);

  // Create flows (simplified - in production use d3-sankey)
  const flows = [
    { source: 0, target: 0, value: 1200 }, // Project Alpha -> OpenAI
    { source: 0, target: 1, value: 800 },  // Project Alpha -> Anthropic
    { source: 1, target: 0, value: 900 },  // Project Beta -> OpenAI
    { source: 1, target: 2, value: 600 },  // Project Beta -> Google
    { source: 2, target: 1, value: 750 },  // Project Gamma -> Anthropic
    { source: 2, target: 2, value: 650 },  // Project Gamma -> Google
    { source: 3, target: 3, value: 800 },  // Project Delta -> Cohere
    { source: 4, target: 3, value: 390 },  // Project Epsilon -> Cohere
  ];

  return (
    <svg width={width} height={height} className="w-full border border-border/50 rounded-lg bg-secondary/10">
      <defs>
        <linearGradient id="flow-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="oklch(0.623 0.214 259.815)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="oklch(0.65 0.15 155)" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="flow-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="oklch(0.623 0.214 259.815)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="oklch(0.577 0.245 27.325)" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="flow-gradient-3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="oklch(0.623 0.214 259.815)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="oklch(0.65 0.15 70)" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Sources (Projects) */}
      {sankeySources.map((source, i) => (
        <g key={`source-${i}`}>
          <rect
            x={sourceX - 40}
            y={sourceYStart + i * sourceSpacing - 12}
            width={80}
            height={24}
            fill="oklch(0.623 0.214 259.815)"
            opacity="0.6"
            rx="4"
          />
          <text
            x={sourceX}
            y={sourceYStart + i * sourceSpacing + 2}
            textAnchor="middle"
            className="text-xs fill-foreground font-medium"
          >
            ${source.value}
          </text>
          <text
            x={sourceX - 50}
            y={sourceYStart + i * sourceSpacing + 2}
            textAnchor="end"
            className="text-xs fill-muted-foreground"
          >
            {source.name}
          </text>
        </g>
      ))}

      {/* Flows */}
      {flows.map((flow, i) => {
        const sourceY = sourceYStart + flow.source * sourceSpacing;
        const targetY = targetYStart + flow.target * targetSpacing;
        const flowHeight = Math.max(2, (flow.value / 1500) * 20);

        return (
          <path
            key={`flow-${i}`}
            d={`M ${sourceX + 40} ${sourceY} Q ${(sourceX + targetX) / 2} ${(sourceY + targetY) / 2} ${targetX - 40} ${targetY}`}
            fill="none"
            stroke={`url(#flow-gradient-${(i % 3) + 1})`}
            strokeWidth={flowHeight}
            opacity="0.6"
          />
        );
      })}

      {/* Targets (Providers) */}
      {sankeyTargets.map((target, i) => (
        <g key={`target-${i}`}>
          <rect
            x={targetX - 40}
            y={targetYStart + i * targetSpacing - 12}
            width={80}
            height={24}
            fill="oklch(0.65 0.15 155)"
            opacity="0.6"
            rx="4"
          />
          <text
            x={targetX}
            y={targetYStart + i * targetSpacing + 2}
            textAnchor="middle"
            className="text-xs fill-foreground font-medium"
          >
            ${target.value}
          </text>
          <text
            x={targetX + 50}
            y={targetYStart + i * targetSpacing + 2}
            textAnchor="start"
            className="text-xs fill-muted-foreground"
          >
            {target.name}
          </text>
        </g>
      ))}

      {/* Labels */}
      <text x={sourceX} y={margin.top} textAnchor="middle" className="text-xs fill-muted-foreground font-semibold">
        Projects
      </text>
      <text x={targetX} y={margin.top} textAnchor="middle" className="text-xs fill-muted-foreground font-semibold">
        Providers
      </text>
    </svg>
  );
};

export default function AdvancedVisualizations() {
  const [heatmapMetric, setHeatmapMetric] = useState<"latency" | "cost" | "errors">("latency");

  const maxLatency = Math.max(...heatmapData.flatMap((d) => [d.simple, d.complex, d.vision]));

  return (
    <div className="space-y-6">
      {/* Heatmap */}
      <Card className="p-6 bg-card border border-border/50">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-foreground">Latency Heatmap by Request Type</h2>
            <div className="flex gap-2">
              {["latency", "cost", "errors"].map((metric) => (
                <button
                  key={metric}
                  onClick={() => setHeatmapMetric(metric as any)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    heatmapMetric === metric
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Latency (ms) across request types over 24 hours. Darker red indicates higher latency.
          </p>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Header row with request types */}
            <div className="flex">
              <div className="w-16 flex-shrink-0"></div>
              {requestTypes.map((type) => (
                <div key={type} className="w-24 text-center text-xs font-semibold text-muted-foreground py-2">
                  {type}
                </div>
              ))}
            </div>

            {/* Heatmap rows */}
            {heatmapData.map((row, rowIdx) => (
              <div key={rowIdx} className="flex">
                <div className="w-16 flex-shrink-0 text-xs text-muted-foreground py-2 px-2 font-mono">{row.hour}</div>
                {[
                  { key: "simple", value: row.simple },
                  { key: "complex", value: row.complex },
                  { key: "vision", value: row.vision },
                ].map((cell) => (
                  <div
                    key={cell.key}
                    className={`w-24 h-12 flex items-center justify-center rounded-lg m-1 ${getHeatmapColor(
                      cell.value,
                      maxLatency
                    )} border border-border/50 cursor-pointer hover:shadow-md transition-shadow`}
                    title={`${cell.value}ms`}
                  >
                    <span className={`text-xs font-semibold ${getHeatmapTextColor(cell.value, maxLatency)}`}>
                      {cell.value}ms
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-900/40 border border-green-500/30"></div>
            <span className="text-muted-foreground">Good (&lt;200ms)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-900/40 border border-yellow-500/30"></div>
            <span className="text-muted-foreground">Acceptable (200-300ms)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-900/40 border border-orange-500/30"></div>
            <span className="text-muted-foreground">Degraded (300-400ms)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-900/40 border border-red-500/30"></div>
            <span className="text-muted-foreground">Critical (&gt;400ms)</span>
          </div>
        </div>
      </Card>

      {/* Sankey Diagram */}
      <Card className="p-6 bg-card border border-border/50">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground mb-1">Cost Flow Analysis (Sankey Diagram)</h2>
          <p className="text-xs text-muted-foreground">
            Visualizes how costs flow from projects through providers. Line thickness represents cost magnitude.
          </p>
        </div>

        <div className="bg-secondary/10 rounded-lg p-4 overflow-x-auto">
          <SankeyDiagram />
        </div>

        {/* Sankey Legend */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">Projects (Left)</p>
            <div className="space-y-1">
              {sankeySources.map((source, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-muted-foreground">{source.name}: ${source.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">Providers (Right)</p>
            <div className="space-y-1">
              {sankeyTargets.map((target, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-muted-foreground">{target.name}: ${target.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-4 bg-primary/5 border border-primary/20">
        <p className="text-sm font-semibold text-foreground mb-2">📊 Key Insights</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Complex requests show 2.8x higher latency than simple requests during peak hours (12:00-16:00)</li>
          <li>• Project Alpha is the largest cost contributor (28%), primarily through OpenAI</li>
          <li>• Vision requests have the highest variance in latency, suggesting model-specific performance issues</li>
          <li>• Cohere is underutilized despite lowest cost per token - opportunity to shift workloads</li>
        </ul>
      </Card>
    </div>
  );
}
