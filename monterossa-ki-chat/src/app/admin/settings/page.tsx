'use client';

import { useEffect, useState } from 'react';
import { Save, Sparkles, Phone, Palette, MessageSquare } from 'lucide-react';

interface Settings {
  id: string;
  welcomeMessage: string;
  companyName: string;
  primaryColor: string;
  accentColor: string;
  transferEnabled: boolean;
  transferEmail: string | null;
  transferPhone: string | null;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await response.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded w-48"></div>
          <div className="h-96 bg-white/5 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Einstellungen</h1>
        <p className="text-white/50">Passen Sie den KI-Chat an Ihre Bedürfnisse an</p>
      </div>

      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="bg-[#0f2035] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#22d3bb]/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#22d3bb]" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Begrüssungsnachricht</h2>
              <p className="text-sm text-white/50">Die erste Nachricht, die Kunden sehen</p>
            </div>
          </div>
          <textarea
            value={settings?.welcomeMessage || ''}
            onChange={(e) => setSettings(s => s ? { ...s, welcomeMessage: e.target.value } : s)}
            rows={4}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#22d3bb]/50 resize-none"
            placeholder="Willkommen bei..."
          />
          <p className="text-xs text-white/30 mt-2">
            Tipp: Verwenden Sie {"\\n"} für Zeilenumbrüche
          </p>
        </div>

        {/* Company Settings */}
        <div className="bg-[#0f2035] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Unternehmensdaten</h2>
              <p className="text-sm text-white/50">Ihre Firmeninformationen</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Firmenname</label>
              <input
                type="text"
                value={settings?.companyName || ''}
                onChange={(e) => setSettings(s => s ? { ...s, companyName: e.target.value } : s)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#22d3bb]/50"
              />
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="bg-[#0f2035] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <Palette className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Farben</h2>
              <p className="text-sm text-white/50">Passen Sie die Farben an Ihr Branding an</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Hauptfarbe</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={settings?.primaryColor || '#22d3bb'}
                  onChange={(e) => setSettings(s => s ? { ...s, primaryColor: e.target.value } : s)}
                  className="w-12 h-12 rounded-lg cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={settings?.primaryColor || '#22d3bb'}
                  onChange={(e) => setSettings(s => s ? { ...s, primaryColor: e.target.value } : s)}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#22d3bb]/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Akzentfarbe</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={settings?.accentColor || '#f97316'}
                  onChange={(e) => setSettings(s => s ? { ...s, accentColor: e.target.value } : s)}
                  className="w-12 h-12 rounded-lg cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={settings?.accentColor || '#f97316'}
                  onChange={(e) => setSettings(s => s ? { ...s, accentColor: e.target.value } : s)}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#22d3bb]/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Human Handoff */}
        <div className="bg-[#0f2035] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f97316]/20 flex items-center justify-center">
                <Phone className="w-5 h-5 text-[#f97316]" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Mitarbeiter-Kontakt</h2>
                <p className="text-sm text-white/50">Ermöglichen Sie Kunden, mit einem Menschen zu sprechen</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.transferEnabled || false}
                onChange={(e) => setSettings(s => s ? { ...s, transferEnabled: e.target.checked } : s)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22d3bb]"></div>
            </label>
          </div>
          
          {settings?.transferEnabled && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">E-Mail für Benachrichtigungen</label>
                <input
                  type="email"
                  value={settings?.transferEmail || ''}
                  onChange={(e) => setSettings(s => s ? { ...s, transferEmail: e.target.value } : s)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#22d3bb]/50"
                  placeholder="info@firma.ch"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Telefonnummer</label>
                <input
                  type="tel"
                  value={settings?.transferPhone || ''}
                  onChange={(e) => setSettings(s => s ? { ...s, transferPhone: e.target.value } : s)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#22d3bb]/50"
                  placeholder="+41 41 123 45 67"
                />
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-white/40">
            Änderungen werden automatisch im Chat übernommen
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#22d3bb] to-[#1aa395] text-white rounded-xl font-medium disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Wird gespeichert...' : 'Speichern'}
          </button>
        </div>

        {saved && (
          <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 text-center">
            Einstellungen erfolgreich gespeichert!
          </div>
        )}
      </div>
    </div>
  );
}
