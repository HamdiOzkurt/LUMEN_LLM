import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';
import { format } from 'date-fns';
import {
    MessageSquare,
    Clock,
    Coins,
    Zap,
    Search,
    Ghost,
    Target,
    Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface Message {
    id: string;
    timestamp: Date;
    role: 'user' | 'assistant' | 'system';
    content: string;
    promptTokens: number;
    completionTokens: number;
    cost: number;
    duration: number;
}

interface Session {
    sessionId: string;
    userId?: string;
    projectId: string;
    provider: string;
    model: string;
    startTime: Date;
    endTime?: Date;
    messages: Message[];
    totalTokens: number;
    totalCost: number;
    totalDuration: number;
    messageCount: number;
    status: 'active' | 'completed' | 'abandoned';
}

const API_BASE = 'http://localhost:5000';

export default function Sessions() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/sessions`, {
                params: { limit: 50 } // Son 50 session
            });
            setSessions(response.data.sessions);
        } catch (error) {
            console.error('Session fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSession = async (sessionId: string) => {
        // Onay kutusu kaldırıldı - Direkt silme
        try {
            await axios.delete(`${API_BASE}/api/sessions/${sessionId}`);

            // State'den sil
            setSessions(prev => prev.filter(s => s.sessionId !== sessionId));

            // Eğer silinen session seçiliyse, seçimi kaldır
            if (selectedSession?.sessionId === sessionId) {
                setSelectedSession(null);
            }
        } catch (error) {
            console.error('Delete error:', error);
            // Hata olursa kullanıcı bilsin (opsiyonel, console'da görebiliriz)
        }
    };

    // Filter sessions
    const filteredSessions = sessions.filter(session =>
        session.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDuration = (ms: number) => {
        const sec = Math.floor(ms / 1000);
        return sec < 60 ? `${sec}s` : `${Math.floor(sec / 60)}m ${sec % 60}s`;
    };

    return (
        <DashboardLayout>
            <div className="flex h-[calc(100vh-8rem)] gap-6">

                {/* SOL KOLON: SESSION LISTESI */}
                <div className="w-1/3 flex flex-col gap-4 min-w-[320px]">
                    {/* Header & Search */}
                    <div className="flex flex-col gap-4">
                        <div>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                                Sessions
                            </h1>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Session ID, User veya Model ara..."
                                className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Liste */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="text-center py-10 text-muted-foreground animate-pulse">
                                Yükleniyor...
                            </div>
                        ) : filteredSessions.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground flex flex-col items-center gap-2">
                                <Ghost className="w-8 h-8 opacity-20" />
                                <span className="text-sm">Kayıt Bulunamadı</span>
                            </div>
                        ) : (
                            filteredSessions.map(session => (
                                <div
                                    key={session.sessionId}
                                    onClick={() => setSelectedSession(session)}
                                    className={cn(
                                        "group relative p-4 rounded-xl border cursor-pointer transition-all duration-300",
                                        selectedSession?.sessionId === session.sessionId
                                            ? "bg-primary/5 border-primary/50 shadow-sm ring-1 ring-primary/20 dark:bg-white/10 dark:ring-primary/20"
                                            : "bg-card border-border hover:border-primary/30 hover:bg-muted/50 hover:shadow-md"
                                    )}
                                >
                                    {/* DELETE BUTTON (Hover Only) */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // Parent click engelle
                                            handleDeleteSession(session.sessionId);
                                        }}
                                        className="absolute top-2 right-2 p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                                        title="Bu oturumu sil"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    <div className="flex justify-between items-start mb-2 pr-6">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "w-2 h-2 rounded-full",
                                                session.status === 'active' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" :
                                                    session.status === 'completed' ? "bg-blue-500" : "bg-orange-500"
                                            )} />
                                            <span className="text-xs font-mono text-foreground/80 truncate max-w-[120px]">
                                                {session.sessionId.slice(0, 8)}...
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">
                                            {format(new Date(session.startTime), 'HH:mm')}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 mb-3">
                                        {session.userId ? (
                                            <span className="text-xs font-medium text-foreground bg-primary/10 px-2 py-0.5 rounded text-primary-dark">
                                                {session.userId}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">Anonim</span>
                                        )}
                                        <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground bg-background">
                                            {session.model}
                                        </span>
                                    </div>

                                    {/* Mini Metrics */}
                                    <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground border-t border-border pt-2 mt-2">
                                        <div className="flex items-center gap-1">
                                            <MessageSquare className="w-3 h-3" />
                                            {session.messageCount} msg
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDuration(session.totalDuration)}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Coins className="w-3 h-3" />
                                            ${session.totalCost.toFixed(4)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* SAĞ KOLON: CHAT DETAYI */}
                <div className="flex-1 bg-muted/20 dark:bg-card/30 rounded-2xl border border-border overflow-hidden flex flex-col relative shadow-sm backdrop-blur-xl">
                    {selectedSession ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-16 border-b border-border bg-background/80 dark:bg-[#0B0B0E]/80 backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                        {selectedSession.userId ? selectedSession.userId[0].toUpperCase() : 'A'}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground">
                                            {selectedSession.userId || 'Anonim Kullanıcı'}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Target className="w-3 h-3" /> {selectedSession.sessionId}
                                            </span>
                                            <span>•</span>
                                            <span>{format(new Date(selectedSession.startTime), 'd MMM yyyy, HH:mm')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-bold text-foreground">${selectedSession.totalCost.toFixed(5)}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">TOTAL COST</span>
                                    </div>
                                    <div className="w-px h-8 bg-border" />
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-bold text-foreground">{selectedSession.totalTokens}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">TOKENS</span>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Area - ARKA PLAN RENGİ */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-background/50 dark:bg-[#0B0B0E]/50 custom-scrollbar">
                                {selectedSession.messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            "flex gap-4 max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-300 group",
                                            msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                                        )}
                                    >
                                        {/* Avatar */}
                                        <div className={cn(
                                            "w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-xs shadow-md mt-1 transition-transform group-hover:scale-110",
                                            msg.role === 'user'
                                                ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-500/20"
                                                : "bg-white dark:bg-[#1A1A23] text-emerald-600 dark:text-emerald-400 border border-border dark:border-white/5 shadow-sm"
                                        )}>
                                            {msg.role === 'user' ? 'U' : <Zap className="w-5 h-5" />}
                                        </div>

                                        {/* Bubble Container */}
                                        <div className={cn(
                                            "flex flex-col gap-1.5 min-w-[240px] max-w-[85%]",
                                            msg.role === 'user' ? "items-end" : "items-start"
                                        )}>
                                            {/* Meta Info */}
                                            <div className="flex items-center gap-2 px-1">
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase tracking-wider",
                                                    msg.role === 'user' ? "text-indigo-500 dark:text-indigo-400" : "text-emerald-600 dark:text-emerald-500"
                                                )}>
                                                    {msg.role === 'user' ? 'YOU' : 'LUMEN AI'}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground/60 font-mono">
                                                    {format(new Date(msg.timestamp), 'HH:mm:ss')}
                                                </span>
                                            </div>

                                            {/* Chat Bubble */}
                                            <div className={cn(
                                                "px-6 py-4 rounded-2xl text-sm leading-relaxed shadow-sm border relative",
                                                msg.role === 'user'
                                                    ? "bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-indigo-500/50 rounded-tr-sm"
                                                    : "bg-white dark:bg-[#15151A] text-foreground dark:text-gray-200 border-border dark:border-white/5 rounded-tl-sm hover:border-primary/20 transition-colors"
                                            )}>
                                                {/* Content with Code Highlighting Logic */}
                                                <div className="whitespace-pre-wrap font-sans">
                                                    {msg.content.split('```').map((part, i) => {
                                                        if (i % 2 === 1) {
                                                            // Code Block
                                                            return (
                                                                <div key={i} className="my-3 rounded-lg overflow-hidden bg-slate-900 dark:bg-[#0a0a0c] border border-border dark:border-white/10 shadow-inner">
                                                                    <div className="bg-slate-800 dark:bg-white/5 px-3 py-1.5 text-[10px] text-gray-400 font-mono border-b border-white/10 flex gap-2">
                                                                        <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
                                                                        <div className="w-2 h-2 rounded-full bg-yellow-500/20"></div>
                                                                        <div className="w-2 h-2 rounded-full bg-green-500/20"></div>
                                                                        <span className="ml-auto">CODE</span>
                                                                    </div>
                                                                    <pre className="p-4 text-xs font-mono text-blue-300 overflow-x-auto">
                                                                        {part}
                                                                    </pre>
                                                                </div>
                                                            );
                                                        } else {
                                                            // Normal Text (Basic paragraphs)
                                                            return <span key={i}>{part}</span>;
                                                        }
                                                    })}
                                                </div>
                                            </div>

                                            {/* Message Metrics (Tokens/Cost) */}
                                            {msg.role !== 'user' && (
                                                <div className="flex items-center gap-3 px-1 mt-1 opacity-40 group-hover:opacity-100 transition-all duration-300 transform translate-y-[-5px] group-hover:translate-y-0">
                                                    <span className="text-[9px] flex items-center gap-1 text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border">
                                                        <Clock className="w-2.5 h-2.5" />
                                                        {msg.duration}ms
                                                    </span>
                                                    <span className="text-[9px] flex items-center gap-1 text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border">
                                                        <Coins className="w-2.5 h-2.5" />
                                                        ${msg.cost.toFixed(6)}
                                                    </span>
                                                    <span className="text-[9px] flex items-center gap-1 text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border">
                                                        <MessageSquare className="w-2.5 h-2.5" />
                                                        {msg.completionTokens} toks
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <div className="h-12" /> {/* Bottom Spacer */}
                            </div>

                        </>
                    ) : (
                        /* Empty State */
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/30 gap-4">
                            <div className="w-20 h-20 rounded-3xl bg-muted/50 dark:bg-white/5 flex items-center justify-center rotate-12 border border-border dark:border-white/5 backdrop-blur-sm">
                                <MessageSquare className="w-10 h-10" />
                            </div>
                            <p className="text-lg font-light">Görüntülemek için bir konuşma seçin</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
