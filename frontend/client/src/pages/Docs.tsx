import DashboardLayout from "@/components/DashboardLayout";
import { FileText } from "lucide-react";

export default function Docs() {
    return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <div className="p-6 rounded-full bg-blue-500/10 text-blue-500">
                    <FileText className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Documentation</h1>
                <p className="text-muted-foreground max-w-md">
                    Learn how to integrate the Lumen SDK, visualize your data, and optimize your LLM stack.
                </p>
            </div>
        </DashboardLayout>
    );
}
