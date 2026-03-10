'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, 
  Users, 
  ThumbsUp, 
  Phone,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  Clock,
  Star
} from 'lucide-react';

interface DashboardStats {
  totalSessions: number;
  totalMessages: number;
  avgRating: number | null;
  satisfactionRate: number | null;
  positiveRatings: number;
  negativeRatings: number;
  pendingHandoffs: number;
  totalTransfers: number;
}

interface TopQuestion {
  question: string;
  frequency: number;
  avgRating: number | null;
}

interface DailyStat {
  date: string;
  sessions: number;
  messages: number;
}

interface HandoffRequest {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  message: string | null;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topQuestions, setTopQuestions] = useState<TopQuestion[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [pendingHandoffs, setPendingHandoffs] = useState<HandoffRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, handoffsRes] = await Promise.all([
        fetch('/api/statistics?range=7d'),
        fetch('/api/handoff?status=pending')
      ]);

      const statsData = await statsRes.json();
      const handoffsData = await handoffsRes.json();

      if (statsData.success) {
        setStats(statsData.data.overview);
        setTopQuestions(statsData.data.topQuestions);
        setDailyStats(statsData.data.dailyStats);
      }

      if (handoffsData.success) {
        setPendingHandoffs(handoffsData.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-white/50">Übersicht Ihrer KI-Chat Leistung</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#0f2035] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#22d3bb]/20 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-[#22d3bb]" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats?.totalMessages || 0}</div>
          <div className="text-white/50 text-sm">Nachrichten (7 Tage)</div>
        </div>

        <div className="bg-[#0f2035] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats?.totalSessions || 0}</div>
          <div className="text-white/50 text-sm">Gespräche (7 Tage)</div>
        </div>

        <div className="bg-[#0f2035] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats?.avgRating ? stats.avgRating.toFixed(1) : '—'}
          </div>
          <div className="text-white/50 text-sm">Durchschnittsbewertung</div>
        </div>

        <div className="bg-[#0f2035] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <ThumbsUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats?.satisfactionRate !== null ? `${stats.satisfactionRate}%` : '—'}
          </div>
          <div className="text-white/50 text-sm">Zufriedenheitsrate</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Handoffs */}
        <div className="bg-[#0f2035] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#f97316]" />
              Offene Rückruf-Anfragen
            </h2>
            {pendingHandoffs.length > 0 && (
              <span className="px-3 py-1 bg-[#f97316]/20 text-[#f97316] rounded-full text-sm font-medium">
                {pendingHandoffs.length} offen
              </span>
            )}
          </div>

          {pendingHandoffs.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              <Phone className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Keine offenen Anfragen</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingHandoffs.slice(0, 5).map((handoff) => (
                <div key={handoff.id} className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-white">
                        {handoff.customerName || 'Anonym'}
                      </div>
                      {handoff.customerEmail && (
                        <div className="text-sm text-white/50">{handoff.customerEmail}</div>
                      )}
                      {handoff.message && (
                        <p className="text-sm text-white/60 mt-2 line-clamp-2">
                          {handoff.message}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-white/40 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(handoff.createdAt).toLocaleDateString('de-CH')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/admin/analytics"
            className="mt-4 flex items-center gap-2 text-[#22d3bb] hover:text-[#22d3bb]/80 text-sm"
          >
            Alle Anfragen anzeigen <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Top Questions */}
        <div className="bg-[#0f2035] border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5 text-[#22d3bb]" />
            Häufigste Fragen
          </h2>

          {topQuestions.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Noch keine Fragen erfasst</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topQuestions.slice(0, 5).map((q, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-[#22d3bb]/20 flex items-center justify-center text-[#22d3bb] font-bold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm line-clamp-2">{q.question}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-white/40">{q.frequency}x gefragt</span>
                      {q.avgRating && (
                        <span className="text-xs text-yellow-400 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          {q.avgRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/admin/analytics"
            className="mt-4 flex items-center gap-2 text-[#22d3bb] hover:text-[#22d3bb]/80 text-sm"
          >
            Alle Fragen analysieren <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
