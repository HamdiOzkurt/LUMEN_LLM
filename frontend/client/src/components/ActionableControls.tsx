/**
 * Actionable Controls Component
 * 
 * Enables users to take direct actions on LLM configurations:
 * - Apply rate limits to specific providers/models
 * - Switch between models for cost optimization
 * - Adjust request priorities
 * - Configure fallback strategies
 * 
 * Design: Dark theme with semantic colors (green for apply, red for restrict)
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle2, Zap, Shield, Settings } from "lucide-react";

interface RateLimitConfig {
  provider: string;
  model: string;
  requestsPerMinute: number;
  tokensPerHour: number;
}

interface ModelSwitchConfig {
  projectId: string;
  currentModel: string;
  suggestedModel: string;
  costSavings: number;
  performanceImpact: string;
}

export default function ActionableControls() {
  const [activeTab, setActiveTab] = useState<"rate-limit" | "model-switch" | "priority" | "fallback">("rate-limit");
  const [rateLimits, setRateLimits] = useState<RateLimitConfig[]>([
    { provider: "OpenAI", model: "gpt-4-turbo", requestsPerMinute: 100, tokensPerHour: 100000 },
    { provider: "Anthropic", model: "claude-3-opus", requestsPerMinute: 50, tokensPerHour: 50000 },
  ]);
  const [modelSwitches, setModelSwitches] = useState<ModelSwitchConfig[]>([
    {
      projectId: "Project Alpha",
      currentModel: "gpt-4-turbo",
      suggestedModel: "gpt-3.5-turbo",
      costSavings: 65,
      performanceImpact: "Low (5% latency increase)",
    },
    {
      projectId: "Project Beta",
      currentModel: "claude-3-opus",
      suggestedModel: "claude-3-sonnet",
      costSavings: 45,
      performanceImpact: "Medium (12% latency increase)",
    },
  ]);
  const [appliedActions, setAppliedActions] = useState<string[]>([]);

  const handleApplyRateLimit = (provider: string, model: string) => {
    const actionId = `rate-limit-${provider}-${model}`;
    setAppliedActions([...appliedActions, actionId]);
    setTimeout(() => {
      setAppliedActions(appliedActions.filter((id) => id !== actionId));
    }, 3000);
  };

  const handleSwitchModel = (projectId: string, newModel: string) => {
    const actionId = `switch-${projectId}`;
    setAppliedActions([...appliedActions, actionId]);
    setTimeout(() => {
      setAppliedActions(appliedActions.filter((id) => id !== actionId));
    }, 3000);
  };

  return (
    <Card className="bg-card border border-border/50 overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-border/50 bg-secondary/30">
        <div className="flex">
          {[
            { id: "rate-limit", label: "Rate Limiting", icon: Shield },
            { id: "model-switch", label: "Model Optimization", icon: Zap },
            { id: "priority", label: "Request Priority", icon: Settings },
            { id: "fallback", label: "Fallback Strategy", icon: AlertCircle },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                activeTab === id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Rate Limiting Tab */}
        {activeTab === "rate-limit" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Rate Limit Configuration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Control request and token throughput for each provider and model combination
              </p>
            </div>

            <div className="space-y-3">
              {rateLimits.map((limit, idx) => (
                <div
                  key={idx}
                  className="border border-border/50 rounded-lg p-4 bg-secondary/10 hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-foreground">
                        {limit.provider} - {limit.model}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Current limits: {limit.requestsPerMinute} req/min, {limit.tokensPerHour.toLocaleString()} tokens/hour
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Requests/min</label>
                      <input
                        type="number"
                        defaultValue={limit.requestsPerMinute}
                        className="w-full bg-secondary/50 border border-border/50 rounded px-2 py-1 text-sm text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Tokens/hour</label>
                      <input
                        type="number"
                        defaultValue={limit.tokensPerHour}
                        className="w-full bg-secondary/50 border border-border/50 rounded px-2 py-1 text-sm text-foreground"
                      />
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => handleApplyRateLimit(limit.provider, limit.model)}
                  >
                    {appliedActions.includes(`rate-limit-${limit.provider}-${limit.model}`) ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Applied
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Apply Rate Limit
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full border-border/50 mt-4">
              Add New Rate Limit
            </Button>
          </div>
        )}

        {/* Model Switch Tab */}
        {activeTab === "model-switch" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Model Optimization Suggestions</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Switch to more cost-effective models with minimal performance impact
              </p>
            </div>

            <div className="space-y-3">
              {modelSwitches.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="border border-border/50 rounded-lg p-4 bg-secondary/10 hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{suggestion.projectId}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Current: <span className="text-primary font-mono">{suggestion.currentModel}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                        <Zap className="w-3 h-3" />
                        <span className="text-xs font-medium">${suggestion.costSavings}/day</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-secondary/30 rounded p-3 mb-3">
                    <p className="text-xs text-muted-foreground mb-1">Suggested Model</p>
                    <p className="text-sm font-mono text-foreground mb-2">{suggestion.suggestedModel}</p>
                    <p className="text-xs text-amber-400">⚠️ {suggestion.performanceImpact}</p>
                  </div>

                  <Button
                    size="sm"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => handleSwitchModel(suggestion.projectId, suggestion.suggestedModel)}
                  >
                    {appliedActions.includes(`switch-${suggestion.projectId}`) ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Switched
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Switch Model
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Priority Tab */}
        {activeTab === "priority" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Request Priority Configuration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Set priority levels for different projects and request types
              </p>
            </div>

            <div className="space-y-3">
              {["Project Alpha", "Project Beta", "Project Gamma"].map((project) => (
                <div key={project} className="border border-border/50 rounded-lg p-4 bg-secondary/10">
                  <p className="font-semibold text-foreground mb-3">{project}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {["High", "Medium", "Low"].map((priority) => (
                      <button
                        key={priority}
                        className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                          priority === "High"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {priority}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fallback Strategy Tab */}
        {activeTab === "fallback" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Fallback Strategy</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure automatic fallback to alternative providers if primary fails
              </p>
            </div>

            <div className="space-y-3">
              {["OpenAI", "Anthropic", "Google"].map((provider) => (
                <div key={provider} className="border border-border/50 rounded-lg p-4 bg-secondary/10">
                  <p className="font-semibold text-foreground mb-3">{provider}</p>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Primary Provider</label>
                      <Select defaultValue={provider.toLowerCase()}>
                        <SelectTrigger className="bg-secondary/50 border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="anthropic">Anthropic</SelectItem>
                          <SelectItem value="google">Google</SelectItem>
                          <SelectItem value="cohere">Cohere</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Fallback Provider</label>
                      <Select defaultValue="anthropic">
                        <SelectTrigger className="bg-secondary/50 border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="anthropic">Anthropic</SelectItem>
                          <SelectItem value="google">Google</SelectItem>
                          <SelectItem value="cohere">Cohere</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
