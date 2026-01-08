import DashboardLayout from "@/components/DashboardLayout";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
    return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <div className="p-6 rounded-full bg-slate-500/10 text-slate-500">
                    <SettingsIcon className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
                <p className="text-muted-foreground max-w-md">
                    Configure your dashboard preferences, notification alerts, and data retention policies.
                </p>
            </div>
        </DashboardLayout>
    );
}
