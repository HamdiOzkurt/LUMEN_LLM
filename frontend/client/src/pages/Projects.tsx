import DashboardLayout from "@/components/DashboardLayout";
import { Layers, Folder, MoreHorizontal, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Dummy project data
const projects = [
    { id: 1, name: "Customer Support Bot", type: "Chatbot", models: 4, usage: "High", lastActive: "2 mins ago" },
    { id: 2, name: "Data Analyst Agent", type: "Analysis", models: 2, usage: "Medium", lastActive: "1 hour ago" },
    { id: 3, name: "Marketing Copywriter", type: "Generation", models: 1, usage: "Low", lastActive: "2 days ago" },
    { id: 4, name: "Internal RAG Search", type: "Search", models: 3, usage: "Very High", lastActive: "Just now" },
];

export default function Projects() {
    return (
        <DashboardLayout>
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
                    <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                        <Plus className="w-4 h-4" />
                        New Project
                    </Button>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div
                            key={project.id}
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
                                    <span className={`font-mono font-medium ${project.usage === "High" || project.usage === "Very High" ? "text-amber-500" : "text-emerald-500"
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
                    <div className="border border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center gap-4 text-muted-foreground hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer min-h-[320px]">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                            <Plus className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="font-medium">Create New Project</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
