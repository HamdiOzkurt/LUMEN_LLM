import { useState } from "react";
import {
  BarChart3,
  Layers,
  TrendingUp,
  Terminal,
  Settings,
  Shield,
  Users,
  Key,
  FileText,
  Menu,
  X,
  ChevronRight,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, Link } from "wouter";

interface SidebarProps {
  className?: string;
  onNavChange?: (navId: string) => void; // Keeping for backward compatibility
  activeNav?: string;                    // Keeping for backward compatibility
}

export default function Sidebar({ className, onNavChange, activeNav: propActiveNav }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [location, setLocation] = useLocation();

  // Determine active item based on URL or prop
  // This allows the sidebar to work both with routing and the legacy state-based switch
  const activeItem = propActiveNav || (location === "/" ? "overview" : location.substring(1));

  const navGroups = [
    {
      title: "Main",
      items: [
        { id: "dashboard", label: "Dashboard", icon: BarChart3, path: "/dashboard" },
        { id: "requests", label: "Requests", icon: Terminal, path: "/requests" },
        { id: "sessions", label: "Sessions", icon: MessageSquare, path: "/sessions" },
      ]
    },
    {
      title: "Management",
      items: [
        { id: "projects", label: "Projects", icon: Layers, path: "/projects" },
        { id: "models", label: "Models", icon: Shield, path: "/models" },
        { id: "api-keys", label: "API Keys", icon: Key, path: "/keys" },
      ]
    },
    {
      title: "System",
      items: [
        { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
      ]
    }
  ];

  const handleNavClick = (item: any) => {
    // If onNavChange prop is provided (legacy mode), use it
    if (onNavChange) {
      onNavChange(item.id);
    } else {
      // Otherwise navigate using wouter
      setLocation(item.path);
    }
  };

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen z-40 transition-all duration-300 ease-out",
          "glassmorphic border-r border-white/10 flex flex-col",
          isCollapsed ? "w-20" : "w-72",
          className
        )}
      >
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 relative">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-foreground text-sm tracking-widest">LUMEN</span>
                <span className="text-[10px] text-gray-600 dark:text-gray-400 font-mono font-semibold">ENTERPRISE</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors absolute right-4 top-1/2 -translate-y-1/2"
          >
            {isCollapsed ? <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              {!isCollapsed && (
                <h3 className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-3 px-2">
                  {group.title}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden",
                      activeItem === item.id
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-white/5"
                    )}
                  >
                    {activeItem === item.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    )}

                    <item.icon className={cn(
                      "w-5 h-5 transition-colors",
                      activeItem === item.id ? "text-primary" : "text-gray-700 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    )} />

                    {!isCollapsed && (
                      <span className="font-medium text-sm">{item.label}</span>
                    )}

                    {!isCollapsed && activeItem === item.id && (
                      <ChevronRight className="w-4 h-4 ml-auto text-primary opacity-50" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* User Profile / Status */}
        <div className="p-4 border-t border-white/10">
          <div className={cn(
            "rounded-xl bg-white/5 p-3 flex items-center gap-3 border border-white/5 transition-all hover:bg-white/10 cursor-pointer",
            isCollapsed && "justify-center p-2"
          )}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex-shrink-0" />
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-foreground truncate">Admin User</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">admin@lumen.ai</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Spacer to push content */}
      <div className={cn("transition-all duration-300", isCollapsed ? "w-20" : "w-72")} />
    </>
  );
}
