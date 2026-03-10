'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Database, 
  Settings, 
  BarChart3, 
  MessageSquare, 
  Users,
  Sparkles,
  Menu,
  X,
  Clock,
  ChevronRight,
  Loader2,
  Star,
  User
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Message {
  id: string;
  role: string;
  content: string;
  rating: number | null;
  createdAt: string;
}

interface ChatSession {
  id: string;
  visitorId: string | null;
  transferred: boolean;
  feedbackLeft: boolean;
  createdAt: string;
  endedAt: string | null;
  messages: Message[];
  handoffs: { id: string; status: string }[];
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/knowledge', label: 'Wissensdatenbank', icon: Database },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/sessions', label: 'Chats', icon: MessageSquare },
  { href: '/admin/handoffs', label: 'Handoffs', icon: Users },
  { href: '/admin/settings', label: 'Einstellungen', icon: Settings },
];

export default function SessionsPage() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      const data = await response.json();
      if (data.success) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSessionDuration = (session: ChatSession) => {
    if (!session.endedAt && session.messages.length === 0) return '-';
    
    const start = new Date(session.createdAt);
    const end = session.endedAt ? new Date(session.endedAt) : new Date(session.messages[session.messages.length - 1]?.createdAt || start);
    const diff = Math.floor((end.getTime() - start.getTime()) / 1000 / 60);
    
    return `${diff} Min.`;
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex">
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-[#0f2035] border-r border-white/10
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#22d3bb] to-[#1aa395] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">Monterossa</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-[#22d3bb]/20 text-[#22d3bb] border border-[#22d3bb]/30' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-[#0a1628]/80 backdrop-blur-lg border-b border-white/10 px-4 lg:px-6 flex items-center justify-between">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-white">Chat-Sessions</h1>
          </div>

          <div className="text-white/60 text-sm">
            {sessions.length} Sessions
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-6 space-y-4">
          {loading ? (
            <div className="text-center py-12 text-white/40">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              Laden...
            </div>
          ) : sessions.length === 0 ? (
            <Card className="glass-card border-white/10 bg-white/5">
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Keine Sessions</h3>
                <p className="text-white/50">Sobald Kunden den Chat nutzen, erscheinen hier die Sessions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <Card 
                  key={session.id}
                  className="glass-card border-white/10 bg-white/5 hover:bg-white/[0.07] cursor-pointer transition-all"
                  onClick={() => setSelectedSession(session)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#22d3bb]/20 flex items-center justify-center">
                          <User className="w-5 h-5 text-[#22d3bb]" />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {session.visitorId ? `Visitor ${session.visitorId.slice(0, 8)}` : 'Anonymer Besucher'}
                          </p>
                          <p className="text-white/50 text-sm flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {formatDate(session.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-white/60 text-sm">{session.messages.length} Nachrichten</p>
                          <p className="text-white/40 text-sm">{getSessionDuration(session)}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {session.transferred && (
                            <span className="px-2 py-1 rounded-full bg-[#f97316]/20 text-[#f97316] text-xs">
                              Transferiert
                            </span>
                          )}
                          {session.messages.some(m => m.rating !== null) && (
                            <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-xs flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              Bewertung
                            </span>
                          )}
                        </div>
                        
                        <ChevronRight className="w-5 h-5 text-white/40" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Session Detail Modal */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="bg-[#0f2035] border-white/10 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#22d3bb]" />
              Chat-Verlauf
            </DialogTitle>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-white/60 pb-4 border-b border-white/10">
                <span>Session: {selectedSession.id.slice(0, 8)}...</span>
                <span>•</span>
                <span>{formatDate(selectedSession.createdAt)}</span>
                <span>•</span>
                <span>{selectedSession.messages.length} Nachrichten</span>
              </div>
              
              <div className="space-y-3">
                {selectedSession.messages.map((message) => (
                  <div 
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div 
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        message.role === 'user' 
                          ? 'bg-[#22d3bb]/20 text-[#22d3bb]' 
                          : 'bg-white/5 text-white/60'
                      }`}
                    >
                      {message.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    </div>
                    <div 
                      className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                        message.role === 'user'
                          ? 'bg-[#22d3bb]/20 text-white rounded-tr-sm'
                          : 'bg-white/5 text-white/90 rounded-tl-sm border border-white/5'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.rating && (
                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/10">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-yellow-500">{message.rating}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
