import DashboardLayout from "@/components/DashboardLayout";
import { TrendingUp } from "lucide-react";

export default function Analytics() {
    return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <div className="p-6 rounded-full bg-indigo-500/10 text-indigo-500 animate-pulse">
                    <TrendingUp className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Advanced Analytics</h1>
                <p className="text-muted-foreground max-w-md">
                    Deep dive into your LLM usage patterns, semantic analysis, and user behavior metrics. This module is currently under development.
                </p>
            </div>
        </DashboardLayout>
    );
}
