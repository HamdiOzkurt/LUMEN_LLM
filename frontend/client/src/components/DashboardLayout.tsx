import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { useLocation } from "wouter";
import { Moon, Sun, Bell } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
    children: ReactNode;
    isFullWidth?: boolean;
}

export default function DashboardLayout({ children, isFullWidth = false }: DashboardLayoutProps) {
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
                <header className="sticky top-0 z-30 h-20 px-8 flex items-center justify-end glassmorphic-elevated backdrop-blur-md bg-background/50 border-b border-border/50">

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
                <main className={`flex-1 overflow-x-hidden ${isFullWidth ? 'p-0' : 'p-8'}`}>
                    <div className={`${isFullWidth ? 'h-full w-full' : 'max-w-7xl mx-auto space-y-8'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                        {children}
                    </div>
                </main>

            </div>
        </div>
    );
}
