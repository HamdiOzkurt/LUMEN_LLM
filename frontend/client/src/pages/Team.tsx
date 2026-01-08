import DashboardLayout from "@/components/DashboardLayout";
import { Users } from "lucide-react";

export default function Team() {
    return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <div className="p-6 rounded-full bg-pink-500/10 text-pink-500">
                    <Users className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Team Management</h1>
                <p className="text-muted-foreground max-w-md">
                    Manage access controls, invite new members, and organize your team into workspaces.
                </p>
            </div>
        </DashboardLayout>
    );
}
