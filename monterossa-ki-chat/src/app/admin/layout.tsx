'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Database, 
  Settings, 
  BarChart3, 
  Users, 
  MessageSquare,
  FileText,
  Phone,
  Sparkles
} from 'lucide-react';

interface Stats {
  totalSessions: number;
  totalMessages: number;
  avgRating: number | null;
  satisfactionRate: number | null;
  pendingHandoffs: number;
  totalTransfers: number;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/statistics');
      const data = await response.json();
      if (data.success) {
        setStats(data.data.overview);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/knowledge', icon: Database, label: 'Wissensdatenbank' },
    { href: '/admin/analytics', icon: BarChart3, label: 'Statistiken' },
    { href: '/admin/settings', icon: Settings, label: 'Einstellungen' },
  ];

  return (
    <div className="min-h-screen bg-[#0a1628] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f2035] border-r border-white/10 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#22d3bb]/20 to-[#22d3bb]/5 border border-[#22d3bb]/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#22d3bb]" />
            </div>
            <div>
              <span className="font-bold text-white">Monterossa</span>
              <span className="block text-xs text-white/50">KI-Chat Admin</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#22d3bb]/20 text-[#22d3bb]'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Quick Stats */}
        <div className="p-4 border-t border-white/10">
          <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">Heute</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Gespräche</span>
              <span className="text-white font-medium">{stats?.totalSessions || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Nachrichten</span>
              <span className="text-white font-medium">{stats?.totalMessages || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Offene Anfragen</span>
              <span className="text-[#f97316] font-medium">{stats?.pendingHandoffs || 0}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
