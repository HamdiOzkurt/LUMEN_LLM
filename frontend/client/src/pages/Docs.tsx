import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Book, Code, Terminal, Copy, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Documentation() {
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const CodeBlock = ({ id, code, language = "javascript" }: { id: string, code: string, language?: string }) => (
        <div className="relative group rounded-lg overflow-hidden border border-white/10 bg-[#0f1117] mt-4">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                <span className="text-xs font-mono text-muted-foreground">{language}</span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-white"
                    onClick={() => handleCopy(code, id)}
                >
                    {copied === id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                </Button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-300">
                <code>{code}</code>
            </pre>
        </div>
    );

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-12 pb-20">

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex p-4 rounded-full bg-indigo-500/10 text-indigo-400 mb-2">
                        <Book className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Integration Guide
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Connect your AI applications to LUMEN in under 2 minutes. Track costs, usage, and performance automatically.
                    </p>
                </div>

                {/* Step 1: Install */}
                <div className="glassmorphic p-8 rounded-2xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Terminal className="w-32 h-32" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500 text-white text-sm">1</span>
                        Install the SDK
                    </h2>
                    <p className="text-muted-foreground mb-4">
                        Install the lightweight LLM Monitor SDK in your project directory.
                    </p>
                    <CodeBlock
                        id="install"
                        language="bash"
                        code="npm install llm-monitor-sdk"
                    />
                </div>

                {/* Step 2: Initialize */}
                <div className="glassmorphic p-8 rounded-2xl border border-white/10">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500 text-white text-sm">2</span>
                        Initialize Provider
                    </h2>
                    <p className="text-muted-foreground mb-4">
                        Import the provider you want to use (Gemini, OpenAI, etc.) and initialize it with your API key.
                        Your <code className="bg-white/10 px-1 py-0.5 rounded text-xs">projectId</code> determines how it appears on the dashboard.
                    </p>
                    <CodeBlock
                        id="init"
                        code={`const { GeminiProvider } = require('llm-monitor-sdk');

// Initialize with your config
const llm = new GeminiProvider({
    apiKey: process.env.GEMINI_API_KEY,
    projectId: 'customer-support-bot', // Creates a new project in Dashboard
    environment: 'production'          // 'development' or 'production'
});`}
                    />
                </div>

                {/* Migration Section - Addressing the user's concern */}
                <div className="glassmorphic p-8 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-br-lg uppercase tracking-wider">
                        Quick Migration
                    </div>

                    <h2 className="text-2xl font-bold mb-4 mt-2 flex items-center gap-3">
                        Already have a project?
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        LUMEN is designed as a <strong>drop-in replacement</strong>. You don't need to rewrite your application logic.
                        Just update your initialization file, and the rest of your code keeps working as is.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Before */}
                        <div className="rounded-xl overflow-hidden border border-red-500/20">
                            <div className="bg-red-500/10 px-4 py-2 border-b border-red-500/20 flex justify-between items-center">
                                <span className="text-xs font-bold text-red-400">BEFORE (Existing Code)</span>
                            </div>
                            <pre className="p-4 bg-black/40 text-xs font-mono text-gray-400">
                                <code>
                                    <span className="text-purple-400">import</span> &#123; GoogleGenerativeAI &#125; <span className="text-purple-400">from</span> <span className="text-green-400">'@google/generative-ai'</span>;<br /><br />
                                    <span className="text-gray-500">// Standard SDK Init</span><br />
                                    <span className="text-purple-400">const</span> client = <span className="text-purple-400">new</span> GoogleGenerativeAI(KEY);
                                </code>
                            </pre>
                        </div>

                        {/* After */}
                        <div className="rounded-xl overflow-hidden border border-emerald-500/20 shadow-2xl shadow-emerald-500/5">
                            <div className="bg-emerald-500/10 px-4 py-2 border-b border-emerald-500/20 flex justify-between items-center">
                                <span className="text-xs font-bold text-emerald-400">AFTER (With LUMEN)</span>
                                <Check className="w-4 h-4 text-emerald-500" />
                            </div>
                            <pre className="p-4 bg-black/40 text-xs font-mono text-emerald-50/80">
                                <code>
                                    <span className="text-purple-400">import</span> &#123; GeminiProvider &#125; <span className="text-purple-400">from</span> <span className="text-green-400">'llm-monitor-sdk'</span>;<br /><br />
                                    <span className="text-gray-500">// 1-Minute Switch</span><br />
                                    <span className="text-purple-400">const</span> client = <span className="text-purple-400">new</span> GeminiProvider(&#123;<br />
                                    &nbsp;&nbsp;apiKey: KEY,<br />
                                    &nbsp;&nbsp;projectId: <span className="text-emerald-400">'production-bot'</span><br />
                                    &#125;);
                                </code>
                            </pre>
                        </div>
                    </div>
                    <div className="mt-4 text-center">
                        <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                            ✨ No other code changes required and Fully Type-Safe
                        </span>
                    </div>
                </div>

                {/* Step 3: Usage */}
                <div className="glassmorphic p-8 rounded-2xl border border-white/10">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500 text-white text-sm">3</span>
                        Generate Content
                    </h2>
                    <p className="text-muted-foreground mb-4">
                        Use the SDK just like the standard Google/OpenAI libraries. Everything is logged automatically.
                    </p>
                    <CodeBlock
                        id="usage"
                        code={`async function run() {
    try {
        const response = await llm.generateContent({
            model: 'gemini-1.5-pro',
            prompt: 'Explain quantum computing to a 5 year old',
            temperature: 0.7
        });

        console.log(response.text());
        // ✨ Magic! Check your LUMEN dashboard for the logs.
    } catch (error) {
        console.error("AI Error:", error);
    }
}

run();`}
                    />
                </div>

                {/* Info Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-xl">
                        <h3 className="font-bold text-indigo-400 mb-2 flex items-center gap-2">
                            <Code className="w-4 h-4" /> Zero Latency Impact
                        </h3>
                        <p className="text-sm text-indigo-200/60">
                            The SDK uses non-blocking asynchronous logging. Your AI response times are not affected by the monitoring.
                        </p>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-xl">
                        <h3 className="font-bold text-emerald-400 mb-2 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> Secure by Default
                        </h3>
                        <p className="text-sm text-emerald-200/60">
                            We never store your full API keys or sensitive prompt data unless explicitly configured.
                        </p>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
