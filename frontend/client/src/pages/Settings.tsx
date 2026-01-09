import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Settings as SettingsIcon, Bell, Database, Moon, Sun, Monitor, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <SettingsIcon className="w-8 h-8 text-gray-400" />
                        Settings
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Configure your dashboard preferences and alert thresholds.
                    </p>
                </div>

                {/* General Settings */}
                <div className="glassmorphic p-8 rounded-xl border border-white/10 space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-indigo-400" />
                        General Preferences
                    </h2>

                    <div className="flex items-center justify-between py-4 border-b border-white/5">
                        <div>
                            <p className="font-medium text-foreground">Dark Mode</p>
                            <p className="text-sm text-muted-foreground">Toggle application theme</p>
                        </div>
                        <div className="flex bg-black/20 p-1 rounded-lg border border-white/5">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-white/10 text-white">
                                <Moon className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground">
                                <Sun className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between py-4">
                        <div>
                            <p className="font-medium text-foreground">Refresh Interval</p>
                            <p className="text-sm text-muted-foreground">How often to fetch new logs (seconds)</p>
                        </div>
                        <Input type="number" defaultValue="5" className="w-20 text-center" />
                    </div>
                </div>

                {/* Alert Settings */}
                <div className="glassmorphic p-8 rounded-xl border border-white/10 space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Bell className="w-5 h-5 text-rose-400" />
                        Alerts & Notifications
                    </h2>

                    <div className="flex items-center justify-between py-4 border-b border-white/5">
                        <div>
                            <p className="font-medium text-foreground">Error Rate Alert</p>
                            <p className="text-sm text-muted-foreground">Notify when error rate exceeds 5%</p>
                        </div>
                        <Switch checked />
                    </div>

                    <div className="flex items-center justify-between py-4 border-b border-white/5">
                        <div>
                            <p className="font-medium text-foreground">Cost Threshold</p>
                            <p className="text-sm text-muted-foreground">Notify when daily cost exceeds limit</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">$</span>
                            <Input type="number" defaultValue="10.00" className="w-24" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between py-4">
                        <div>
                            <p className="font-medium text-foreground">Email Notifications</p>
                            <Input placeholder="admin@lumen.ai" className="mt-2 w-64" />
                        </div>
                    </div>
                </div>

                {/* Data Retention */}
                <div className="glassmorphic p-8 rounded-xl border border-white/10 space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Database className="w-5 h-5 text-emerald-400" />
                        Data Retention
                    </h2>

                    <div className="flex items-center justify-between py-4">
                        <div>
                            <p className="font-medium text-foreground">Log Retention Period</p>
                            <p className="text-sm text-muted-foreground">Older logs will be automatically archived</p>
                        </div>
                        <select className="bg-black/20 border border-white/10 rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option>7 Days</option>
                            <option>30 Days</option>
                            <option selected>90 Days</option>
                            <option>1 Year</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                        <Save className="w-4 h-4" />
                        Save Changes
                    </Button>
                </div>

            </div>
        </DashboardLayout>
    );
}
