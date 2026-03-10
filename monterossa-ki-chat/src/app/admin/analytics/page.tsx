'use client';

import { useEffect, useState } from 'react';
import { 
  BarChart3, 
  MessageSquare, 
  Users, 
  ThumbsUp,
  ThumbsDown,
  Star,
  TrendingUp,
  Phone,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface Stats {
  totalSessions: number;
  totalMessages: number;
  avgRating: number | null;
  satisfactionRate: number | null;
  positiveRatings: number;
  negativeRatings: number;
  pendingHandoffs: number;
  totalTransfers: number;
}

interface DailyStat {
  date: string;
  sessions: number;
  messages: number;
  avgRating: number | null;
  transfers: number;
}

interface TopQuestion {
  question: string;
  answer: string;
  frequency: number;
  avgRating: number | null;
}

export default function AnalyticsPage() {
  const [range, setRange] = useState('7d');
  const [stats, setStats] = useState<Stats>({
    totalSessions: 0,
    totalMessages: 0,
    avgRating: null,
    satisfactionRate: null,
    positiveRatings: 0,
    negativeRatings: 0,
    pendingHandoffs: 0,
    totalTransfers: 0
  });
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [topQuestions, setTopQuestions] = useState<TopQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/statistics?range=${range}`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data.overview);
        setDailyStats(data.data.dailyStats);
        setTopQuestions(data.data.topQuestions);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Gespräche',
      value: stats.totalSessions || 0,
      icon: Users,
      color: 'blue'
    },
    {
      label: 'Nachrichten',
      value: stats.totalMessages || 0,
      icon: MessageSquare,
      color: 'cyan'
    },
    {
      label: 'Ø Bewertung',
      value: stats.avgRating ? stats.avgRating.toFixed(1) : '—',
      icon: Star,
      color: 'yellow'
    },
    {
      label: 'Zufriedenheit',
      value: stats.satisfactionRate !== null ? `${stats.satisfactionRate}%` : '—',
      icon: ThumbsUp,
      color: 'green'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      blue: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
      cyan: { bg: 'bg-[#22d3bb]/20', text: 'text-[#22d3bb]' },
      yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
      green: { bg: 'bg-green-500/20', text: 'text-green-400' },
      red: { bg: 'bg-red-500/20', text: 'text-red-400' },
      orange: { bg: 'bg-orange-500/20', text: 'text-orange-400' }
    };
    return colors[color] || colors.cyan;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/5 rounded w-48"></div>
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-white/5 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Statistiken</h1>
          <p className="text-white/50">Analysieren Sie die Performance Ihres KI-Chats</p>
        </div>
        <div className="flex bg-white/5 rounded-xl p-1">
          {[
            { value: '7d', label: '7 Tage' },
            { value: '30d', label: '30 Tage' },
            { value: '90d', label: '90 Tage' }
          ].map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                range === r.value
                  ? 'bg-[#22d3bb] text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const colors = getColorClasses(card.color);
          return (
            <div key={card.label} className="bg-[#0f2035] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
                  <card.icon className={`w-6 h-6 ${colors.text}`} />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{card.value}</div>
              <div className="text-white/50 text-sm">{card.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Ratings Distribution */}
        <div className="bg-[#0f2035] border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Bewertungsverteilung
          </h2>
          
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                <ThumbsUp className="w-10 h-10 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats?.positiveRatings || 0}</div>
              <div className="text-sm text-white/50">Positiv</div>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
                <ThumbsDown className="w-10 h-10 text-red-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats?.negativeRatings || 0}</div>
              <div className="text-sm text-white/50">Negativ</div>
            </div>
          </div>

          {stats?.satisfactionRate !== null && (
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60">Zufriedenheitsrate</span>
                <span className="font-semibold text-white">{stats.satisfactionRate}%</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-[#22d3bb] rounded-full"
                  style={{ width: `${stats?.satisfactionRate || 0}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Handoff Stats */}
        <div className="bg-[#0f2035] border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Phone className="w-5 h-5 text-[#f97316]" />
            Mitarbeiter-Kontakt
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-[#f97316]">{stats?.pendingHandoffs || 0}</div>
              <div className="text-sm text-white/50">Offene Anfragen</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white">{stats?.totalTransfers || 0}</div>
              <div className="text-sm text-white/50">Gesamt Anfragen</div>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <p className="text-sm text-yellow-200/80">
              💡 <strong>Tipp:</strong> Eine hohe Anzahl an Mitarbeiter-Kontakt-Anfragen könnte auf Verbesserungspotenzial in der Wissensdatenbank hindeuten.
            </p>
          </div>
        </div>
      </div>

      {/* Top Questions */}
      <div className="bg-[#0f2035] border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#22d3bb]" />
          Häufigste Fragen (Top 10)
        </h2>

        {topQuestions.length === 0 ? (
          <div className="text-center py-12 text-white/40">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Noch keine Fragen erfasst</p>
            <p className="text-sm mt-1">Sobald Kunden den Chat nutzen, werden hier die häufigsten Fragen angezeigt.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topQuestions.map((q, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-[#22d3bb]/20 flex items-center justify-center text-[#22d3bb] font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium">{q.question}</p>
                  <p className="text-sm text-white/50 mt-1 line-clamp-2">{q.answer}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-semibold text-white">{q.frequency}x</div>
                  <div className="text-xs text-white/40">gefragt</div>
                  {q.avgRating && (
                    <div className="flex items-center gap-1 mt-1 justify-end">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-sm text-yellow-400">{q.avgRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Chart Placeholder */}
      {dailyStats.length > 0 && (
        <div className="bg-[#0f2035] border border-white/10 rounded-2xl p-6 mt-6">
          <h2 className="text-xl font-semibold text-white mb-6">Nachrichten pro Tag</h2>
          <div className="flex items-end gap-2 h-48">
            {dailyStats.slice(-14).map((d, i) => {
              const maxMessages = Math.max(...dailyStats.map(s => s.messages), 1);
              const height = (d.messages / maxMessages) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-[#22d3bb] to-[#22d3bb]/50 rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`${d.messages} Nachrichten`}
                  />
                  <span className="text-xs text-white/30 transform -rotate-45 origin-left">
                    {new Date(d.date).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
