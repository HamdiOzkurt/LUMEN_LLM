import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Settings as SettingsIcon, Bell, Database, Moon, Sun, Monitor, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/contexts/ThemeContext";

export default function Settings() {
    const { theme, toggleTheme } = useTheme();
    const [refreshInterval, setRefreshInterval] = useState(5);
    const [costThreshold, setCostThreshold] = useState(10.00);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [errorRateAlert, setErrorRateAlert] = useState(true);
    const [retentionPeriod, setRetentionPeriod] = useState("90 Days");

    const handleSave = () => {
        alert("Settings saved successfully!");
    };

    const handleThemeToggle = () => {
        if (toggleTheme) {
            toggleTheme();
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <SettingsIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                        Settings
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 font-medium">
                        Configure your dashboard preferences and alert thresholds.
                    </p>
                </div>

                {/* General Settings */}
                <div className="glassmorphic p-8 rounded-xl border border-gray-200 dark:border-white/10 space-y-6 bg-white dark:bg-transparent">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Monitor className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                        General Preferences
                    </h2>

                    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-white/5">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Theme</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Toggle application theme</p>
                        </div>
                        <div className="flex bg-gray-100 dark:bg-black/20 p-1 rounded-lg border border-gray-200 dark:border-white/5 gap-1">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => theme === 'dark' && handleThemeToggle()}
                                disabled={theme === 'light'}
                                className={`h-8 w-8 p-0 transition-all ${theme === 'light' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                <Sun className="w-4 h-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => theme === 'light' && handleThemeToggle()}
                                disabled={theme === 'dark'}
                                className={`h-8 w-8 p-0 transition-all ${theme === 'dark' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                <Moon className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between py-4">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Refresh Interval</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">How often to fetch new logs (seconds)</p>
                        </div>
                        <Input
                            type="number"
                            value={refreshInterval}
                            onChange={(e) => setRefreshInterval(Number(e.target.value))}
                            className="w-20 text-center bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
                        />
                    </div>
                </div>

                {/* Alert Settings */}
                <div className="glassmorphic p-8 rounded-xl border border-gray-200 dark:border-white/10 space-y-6 bg-white dark:bg-transparent">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Bell className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                        Alerts & Notifications
                    </h2>

                    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-white/5">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Error Rate Alert</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Notify when error rate exceeds 5%</p>
                        </div>
                        <Switch
                            checked={errorRateAlert}
                            onCheckedChange={setErrorRateAlert}
                        />
                    </div>

                    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-white/5">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Cost Threshold</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Notify when daily cost exceeds limit</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">$</span>
                            <Input
                                type="number"
                                value={costThreshold}
                                onChange={(e) => setCostThreshold(Number(e.target.value))}
                                className="w-24 bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between py-4">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                            <Input
                                placeholder="admin@lumen.ai"
                                className="mt-2 w-64 bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Data Retention */}
                <div className="glassmorphic p-8 rounded-xl border border-gray-200 dark:border-white/10 space-y-6 bg-white dark:bg-transparent">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Database className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                        Data Retention
                    </h2>

                    <div className="flex items-center justify-between py-4">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Log Retention Period</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Older logs will be automatically archived</p>
                        </div>
                        <select
                            value={retentionPeriod}
                            onChange={(e) => setRetentionPeriod(e.target.value)}
                            className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option>7 Days</option>
                            <option>30 Days</option>
                            <option>90 Days</option>
                            <option>1 Year</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={handleSave}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Save Changes
                    </Button>
                </div>

            </div>
        </DashboardLayout>
    );
}
