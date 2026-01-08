import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { useLocation } from "wouter";
import { Moon, Sun, Bell, Search, Command } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const { theme, toggleTheme } = useTheme();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [location] = useLocation();

    return (
        <div className="min-h-screen bg-background flex font-sans text-foreground selection:bg-primary/20">
            {/* Sidebar is fixed on the left */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 relative">

                {/* Top Header */}
                <header className="sticky top-0 z-30 h-20 px-8 flex items-center justify-between glassmorphic-elevated backdrop-blur-md bg-background/50 border-b border-border/50">

                    {/* Breadcrumbs / Page Title (Simplified for now) */}
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search resources..."
                                className="pl-9 pr-4 py-2 rounded-lg bg-secondary/50 border-none outline-none focus:ring-1 focus:ring-primary/50 text-sm w-64 transition-all placeholder:text-muted-foreground/70"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none">
                                <span className="text-[10px] bg-background/50 px-1.5 py-0.5 rounded border border-border text-muted-foreground">⌘</span>
                                <span className="text-[10px] bg-background/50 px-1.5 py-0.5 rounded border border-border text-muted-foreground">K</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
                        </Button>

                        <Button
                            onClick={toggleTheme}
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        >
                            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </Button>
                    </div>
                </header>

                {/* Dynamic Page Content */}
                <main className="flex-1 p-8 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    );
}
