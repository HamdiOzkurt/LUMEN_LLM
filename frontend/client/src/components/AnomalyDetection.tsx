/**
 * Anomaly Detection & Deep Analysis Component
 * 
 * Provides intelligent insights into performance anomalies:
 * - Detects unusual latency spikes
 * - Identifies cost outliers
 * - Root cause analysis suggestions
 * - Correlates anomalies with system events
 * 
 * Design: Alert-based visual hierarchy with severity indicators
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, TrendingUp, Zap, Clock, DollarSign, Activity } from "lucide-react";

interface Anomaly {
  id: string;
  type: "latency" | "cost" | "error-rate" | "throughput";
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  affectedResource: string;
  detectedAt: string;
  rootCauseAnalysis: string;
  suggestedAction: string;
  impact: string;
}

const anomalies: Anomaly[] = [
  {
    id: "anom-001",
    type: "latency",
    severity: "critical",
    title: "Latency Spike Detected",
    description: "gpt-4-turbo model experiencing 450ms average latency (baseline: 245ms)",
    affectedResource: "Project Alpha - OpenAI",
    detectedAt: "2024-01-08 14:45:32",
    rootCauseAnalysis:
      "Correlation with increased concurrent requests (1200 → 2100 req/min). OpenAI API rate limiting may be throttling responses. Secondary factor: Network latency increase from 12ms → 28ms.",
    suggestedAction: "1) Implement request queuing with exponential backoff. 2) Switch to gpt-3.5-turbo for non-critical tasks. 3) Contact OpenAI support if issue persists.",
    impact: "Est. 15-20% performance degradation for end-users",
  },
  {
    id: "anom-002",
    type: "cost",
    severity: "warning",
    title: "Unexpected Cost Increase",
    description: "Daily LLM costs increased 32% ($6,200 → $8,190) compared to 7-day average",
    affectedResource: "Project Beta - Anthropic",
    detectedAt: "2024-01-08 14:32:15",
    rootCauseAnalysis:
      "Root cause: New feature deployment using claude-3-opus for all requests (previously used claude-3-sonnet for 60% of requests). Token consumption increased 28% due to more verbose model responses.",
    suggestedAction: "1) Revert 40% of requests to claude-3-sonnet. 2) Implement token budget alerts. 3) Review feature requirements for model selection.",
    impact: "Potential $1,200/day overspend if not addressed",
  },
  {
    id: "anom-003",
    type: "error-rate",
    severity: "warning",
    title: "Error Rate Elevation",
    description: "Error rate increased from 0.2% to 1.8% in last 30 minutes",
    affectedResource: "Project Gamma - Google Gemini",
    detectedAt: "2024-01-08 14:28:45",
    rootCauseAnalysis:
      "Correlation with model version update (gemini-pro → gemini-pro-vision). New model version has stricter input validation. 78% of errors are due to unsupported image formats.",
    suggestedAction: "1) Implement image format validation before API calls. 2) Revert to previous model version temporarily. 3) Update documentation for supported formats.",
    impact: "Failed requests affecting 1.8% of user interactions",
  },
  {
    id: "anom-004",
    type: "throughput",
    severity: "info",
    title: "Throughput Optimization Opportunity",
    description: "Cohere model operating at 35% capacity utilization (avg: 72%)",
    affectedResource: "Project Delta - Cohere",
    detectedAt: "2024-01-08 14:15:22",
    rootCauseAnalysis:
      "Underutilization due to conservative rate limiting (50 req/min). Model can handle 200+ req/min based on historical performance. Cost per request is 2.4x higher than necessary.",
    suggestedAction: "1) Increase rate limit to 150 req/min. 2) Migrate low-priority workloads from OpenAI to Cohere. 3) Monitor for 24 hours to ensure stability.",
    impact: "Potential 35% cost reduction for Project Delta workloads",
  },
];

const severityConfig = {
  critical: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    icon: "text-red-500",
    badge: "bg-red-500/20 text-red-400",
  },
  warning: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    icon: "text-amber-500",
    badge: "bg-amber-500/20 text-amber-400",
  },
  info: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    icon: "text-blue-500",
    badge: "bg-blue-500/20 text-blue-400",
  },
};

const typeConfig = {
  latency: { icon: Clock, label: "Latency" },
  cost: { icon: DollarSign, label: "Cost" },
  "error-rate": { icon: AlertCircle, label: "Error Rate" },
  throughput: { icon: Activity, label: "Throughput" },
};

export default function AnomalyDetection() {
  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active Anomalies", value: "4", color: "text-red-500" },
          { label: "Critical Issues", value: "1", color: "text-red-500" },
          { label: "Warnings", value: "2", color: "text-amber-500" },
          { label: "Optimization Opportunities", value: "1", color: "text-blue-500" },
        ].map((stat, idx) => (
          <Card key={idx} className="p-4 bg-card border border-border/50">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Anomalies List */}
      <div className="space-y-3">
        {anomalies.map((anomaly) => {
          const config = severityConfig[anomaly.severity];
          const typeIcon = typeConfig[anomaly.type];
          const TypeIcon = typeIcon.icon;

          return (
            <Card
              key={anomaly.id}
              className={`border ${config.border} ${config.bg} overflow-hidden transition-all hover:shadow-md`}
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`mt-1 ${config.icon}`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-foreground">{anomaly.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.badge}`}>
                          {anomaly.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs text-muted-foreground mb-1">Detected</p>
                    <p className="text-xs font-mono text-foreground">{anomaly.detectedAt}</p>
                  </div>
                </div>

                {/* Affected Resource */}
                <div className="mb-3 pl-8">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/50 text-xs text-muted-foreground">
                    <Activity className="w-3 h-3" />
                    {anomaly.affectedResource}
                  </span>
                </div>

                {/* Root Cause Analysis */}
                <div className="mb-3 pl-8 bg-secondary/30 rounded p-3">
                  <p className="text-xs font-semibold text-foreground mb-1">🔍 Root Cause Analysis</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{anomaly.rootCauseAnalysis}</p>
                </div>

                {/* Impact */}
                <div className="mb-3 pl-8 bg-secondary/30 rounded p-3">
                  <p className="text-xs font-semibold text-foreground mb-1">⚠️ Impact</p>
                  <p className="text-xs text-muted-foreground">{anomaly.impact}</p>
                </div>

                {/* Suggested Action */}
                <div className="pl-8 bg-primary/10 rounded p-3 border border-primary/20">
                  <p className="text-xs font-semibold text-primary mb-1">💡 Suggested Actions</p>
                  <p className="text-xs text-muted-foreground whitespace-pre-line">{anomaly.suggestedAction}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3 pl-8">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Apply Suggestion
                  </Button>
                  <Button size="sm" variant="outline" className="border-border/50">
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" className="border-border/50">
                    Dismiss
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Learning Section */}
      <Card className="p-4 bg-primary/5 border border-primary/20">
        <div className="flex gap-3">
          <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">AI-Powered Insights</p>
            <p className="text-xs text-muted-foreground">
              Our anomaly detection system analyzes 15,000+ data points per minute to identify patterns and predict issues before they impact users. Machine learning models are continuously trained on your historical data.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
