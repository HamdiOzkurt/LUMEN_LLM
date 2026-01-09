import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Layers, Folder, MoreHorizontal, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Projects() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [, setLocation] = useLocation();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                // Logları çekip projeleri analiz edeceğiz
                const res = await fetch(`${API_BASE}/api/logs?limit=1000`);
                const data = await res.json();
                const logs = data.logs || [];

                // Proje bazlı gruplama
                const projectMap = logs.reduce((acc: any, log: any) => {
                    // projectId yoksa 'default' veya 'unknown' ata
                    const pid = log.projectId || 'Default Project';
                    // projectId string olduğundan emin ol ve formatla
                    const safePid = String(pid);
                    const formattedName = safePid
                        .replace(/-/g, ' ')
                        .replace(/_/g, ' ') // Alt çizgileri de boşluk yap
                        .replace(/\b\w/g, l => l.toUpperCase());

                    if (!acc[pid]) {
                        acc[pid] = {
                            id: pid,
                            name: formattedName,
                            type: detectProjectType(safePid),
                            models: new Set(),
                            totalTokens: 0,
                            lastActiveTime: 0,
                        };
                    }

                    acc[pid].models.add(log.model);
                    acc[pid].totalTokens += (log.totalTokens || 0);
                    acc[pid].lastActiveTime = Math.max(acc[pid].lastActiveTime, new Date(log.timestamp).getTime());

                    return acc;
                }, {});

                // UI verisine dönüştür
                const processedProjects = Object.values(projectMap).map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    type: p.type,
                    models: p.models.size,
                    usage: calculateUsageLevel(p.totalTokens),
                    lastActive: timeAgo(p.lastActiveTime)
                }));

                // Eğer hiç veri yoksa dummy/örnek veri ekle (Demo amaçlı boş görünmesin)
                if (processedProjects.length === 0) {
                    processedProjects.push(
                        { id: 'demo-1', name: "Customer Support Bot", type: "Chatbot", models: 4, usage: "High", lastActive: "2 mins ago" },
                        { id: 'demo-2', name: "Data Analyst Agent", type: "Analysis", models: 2, usage: "Medium", lastActive: "1 hour ago" }
                    );
                }

                setProjects(processedProjects);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching projects:", error);
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    // Helper: Project Type Detection based on name
    const detectProjectType = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('bot') || n.includes('chat')) return 'Chatbot';
        if (n.includes('rag') || n.includes('search')) return 'RAG / Search';
        if (n.includes('anal')) return 'Analysis';
        if (n.includes('gen') || n.includes('copy')) return 'Generation';
        return 'General LLM App';
    };

    // Helper: Usage Level
    const calculateUsageLevel = (tokens: number) => {
        if (tokens > 10000) return 'Very High';
        if (tokens > 5000) return 'High';
        if (tokens > 1000) return 'Medium';
        return 'Low';
    };

    // Helper: Time Ago
    const timeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return "Just now";
        if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    };

    // Modal Component
    const NewProjectModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0f1117] border border-white/10 rounded-2xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-muted-foreground hover:text-white"
                    onClick={() => setShowNewProjectModal(false)}
                >
                    <ArrowRight className="w-5 h-5 rotate-45" />
                </Button>

                <div className="mb-8">
                    <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-sm">🚀</span>
                        How to create a new Project?
                    </h2>
                    <p className="text-muted-foreground">
                        LUMEN uses a <strong>secure, code-first approach</strong>. You don't need to enter API keys here.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Step 1 */}
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 relative group">
                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">1</div>
                        <h3 className="font-bold text-indigo-300 mb-2 mt-2">Code Config</h3>
                        <p className="text-xs text-muted-foreground">
                            Set the <code className="text-white">projectId</code> in your SDK initialization.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 relative group">
                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20">2</div>
                        <h3 className="font-bold text-purple-300 mb-2 mt-2">API Security</h3>
                        <p className="text-xs text-muted-foreground">
                            Keep your API Keys in your <code className="text-white">.env</code> file. <br />
                            <span className="text-red-400">Never share keys with the dashboard.</span>
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 relative group">
                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20">3</div>
                        <h3 className="font-bold text-emerald-300 mb-2 mt-2">Auto Discovery</h3>
                        <p className="text-xs text-muted-foreground">
                            Run your code. The project will <span className="text-white">automatically appear</span> here instantly.
                        </p>
                    </div>
                </div>

                <div className="bg-black/40 p-4 rounded-xl border border-white/10 font-mono text-sm overflow-x-auto">
                    <div className="text-muted-foreground mb-2 text-xs uppercase tracking-widest font-bold">Example Code</div>
                    <div className="text-indigo-300">
                        const llm = new GeminiProvider(&#123;<br />
                        &nbsp;&nbsp;apiKey: process.env.GEMINI_KEY, <span className="text-gray-500">// Your Key stays local</span><br />
                        &nbsp;&nbsp;projectId: <span className="text-emerald-400">'my-new-bot'</span> <span className="text-gray-500">// Change this name</span><br />
                        &#125;);
                    </div>
                </div>

                <div className="flex justify-end pt-6">
                    <Button onClick={() => setShowNewProjectModal(false)} className="bg-white/10 hover:bg-white/20 text-white">
                        Understood, I'll update my code
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            {showNewProjectModal && <NewProjectModal />}

            <div className="flex flex-col gap-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <Layers className="w-8 h-8 text-indigo-500" />
                            Projects
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your AI initiatives and track usage by project.
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowNewProjectModal(true)}
                        className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="w-4 h-4" />
                        New Project
                    </Button>
                </div>

                {/* Projects Grid */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                onClick={() => setLocation(`/analytics?projectId=${project.id}`)}
                                className="glassmorphic p-6 rounded-xl border border-white/10 hover:border-indigo-500/50 transition-all duration-300 group cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                        <Folder className="w-6 h-6" />
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </div>

                                <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-indigo-400 transition-colors">{project.name}</h3>
                                <p className="text-sm text-muted-foreground mb-6">{project.type}</p>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Active Models</span>
                                        <span className="font-mono font-medium text-foreground">{project.models}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Current Usage</span>
                                        <span className={`font-mono font-medium ${project.usage.includes("High") ? "text-amber-500" : "text-emerald-500"
                                            }`}>
                                            {project.usage}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Last Active</span>
                                        <span className="text-foreground text-xs">{project.lastActive}</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                                    <span className="text-xs font-bold text-indigo-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                                        View Analytics <ArrowRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Add New Placeholder Card */}
                        <div
                            onClick={() => setShowNewProjectModal(true)}
                            className="border border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center gap-4 text-muted-foreground hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer min-h-[300px]"
                        >
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                <Plus className="w-8 h-8 opacity-50" />
                            </div>
                            <p className="font-medium">Create New Project</p>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
