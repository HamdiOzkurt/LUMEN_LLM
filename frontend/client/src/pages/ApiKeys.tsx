import DashboardLayout from "@/components/DashboardLayout";
import { Key } from "lucide-react";

export default function ApiKeys() {
    return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <div className="p-6 rounded-full bg-amber-500/10 text-amber-500">
                    <Key className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">API Keys management</h1>
                <p className="text-muted-foreground max-w-md">
                    Securely manage your provider API keys and configure usage limits per key.
                </p>
            </div>
        </DashboardLayout>
    );
}
