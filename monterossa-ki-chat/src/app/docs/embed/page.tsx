import { Copy, Check, Code, Globe, Server, Layers, Layout } from 'lucide-react';

export default function EmbedDocsPage() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#22d3bb]/20 to-[#22d3bb]/5 border border-[#22d3bb]/30 flex items-center justify-center">
              <Code className="w-5 h-5 text-[#22d3bb]" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Monterossa KI-Chat</h1>
              <p className="text-white/50 text-sm">Embed Dokumentation</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Quick Start */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-4">Schnellstart</h2>
          <p className="text-white/60 mb-8 text-lg">
            Binden Sie den Monterossa KI-Chat mit nur einer Code-Zeile auf Ihrer Website ein.
          </p>
          
          <div className="bg-[#0f2035] border border-white/10 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-white/50">Kopieren Sie diesen Code und fügen Sie ihn vor &lt;/body&gt; ein:</span>
            </div>
            <div className="bg-[#0a1628] rounded-xl p-4 font-mono text-sm overflow-x-auto">
              <code className="text-[#22d3bb]">
                {`<script src="https://IHR-DOMAIN.com/embed.js"></script>`}
              </code>
            </div>
          </div>
        </section>

        {/* Configuration */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Konfiguration</h2>
          <p className="text-white/60 mb-6">
            Passen Sie das Widget mit folgenden data-Attributen an:
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-3 px-4 text-sm font-semibold text-white/70">Attribut</th>
                  <th className="py-3 px-4 text-sm font-semibold text-white/70">Standard</th>
                  <th className="py-3 px-4 text-sm font-semibold text-white/70">Beschreibung</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-mono text-[#22d3bb]">data-position</td>
                  <td className="py-3 px-4 text-white/50">bottom-right</td>
                  <td className="py-3 px-4 text-white/70">Position: bottom-right oder bottom-left</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-mono text-[#22d3bb]">data-primary-color</td>
                  <td className="py-3 px-4 text-white/50">#22d3bb</td>
                  <td className="py-3 px-4 text-white/70">Hauptfarbe (Hex)</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-mono text-[#22d3bb]">data-accent-color</td>
                  <td className="py-3 px-4 text-white/50">#f97316</td>
                  <td className="py-3 px-4 text-white/70">Akzentfarbe (Hex)</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-mono text-[#22d3bb]">data-base-url</td>
                  <td className="py-3 px-4 text-white/50">auto</td>
                  <td className="py-3 px-4 text-white/70">API URL (für eigene Installation)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-[#0f2035] border border-white/10 rounded-2xl p-6 mt-6">
            <p className="text-sm text-white/50 mb-3">Beispiel mit allen Optionen:</p>
            <div className="bg-[#0a1628] rounded-xl p-4 font-mono text-sm overflow-x-auto">
              <code className="text-[#22d3bb]">
{`<script 
  src="https://IHR-DOMAIN.com/embed.js"
  data-position="bottom-left"
  data-primary-color="#3b82f6"
  data-accent-color="#f97316">
</script>`}
              </code>
            </div>
          </div>
        </section>

        {/* Platform Examples */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Plattform-spezifische Anleitung</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* HTML */}
            <div className="bg-[#0f2035] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#22d3bb]/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-[#22d3bb]" />
                </div>
                <h3 className="font-semibold text-lg">HTML / PHP</h3>
              </div>
              <p className="text-white/50 text-sm mb-4">
                Fügen Sie den Script-Tag vor dem schließenden &lt;/body&gt; Tag ein:
              </p>
              <div className="bg-[#0a1628] rounded-xl p-4 font-mono text-xs overflow-x-auto">
                <code className="text-white/70">
{`<!DOCTYPE html>
<html>
<head>...</head>
<body>
  <!-- Ihr Content -->
  
  <script src="https://IHR-DOMAIN.com/embed.js"></script>
</body>
</html>`}
                </code>
              </div>
            </div>

            {/* WordPress */}
            <div className="bg-[#0f2035] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#22d3bb]/20 flex items-center justify-center">
                  <Layout className="w-5 h-5 text-[#22d3bb]" />
                </div>
                <h3 className="font-semibold text-lg">WordPress</h3>
              </div>
              <p className="text-white/50 text-sm mb-4">
                Gehen Sie zu <strong>Design → Theme-Editor → footer.php</strong> und fügen Sie den Code vor &lt;/body&gt; ein.
              </p>
              <p className="text-white/50 text-sm mb-4">
                Oder nutzen Sie ein Plugin wie <strong>"Insert Headers and Footers"</strong>.
              </p>
              <div className="bg-[#0a1628] rounded-xl p-4 font-mono text-xs overflow-x-auto">
                <code className="text-[#22d3bb]">
{`<!-- In footer.php vor </body> -->
<script src="https://IHR-DOMAIN.com/embed.js"></script>`}
                </code>
              </div>
            </div>

            {/* React */}
            <div className="bg-[#0f2035] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#22d3bb]/20 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-[#22d3bb]" />
                </div>
                <h3 className="font-semibold text-lg">React / Next.js</h3>
              </div>
              <p className="text-white/50 text-sm mb-4">
                Fügen Sie das Script in Ihre Layout-Komponente ein:
              </p>
              <div className="bg-[#0a1628] rounded-xl p-4 font-mono text-xs overflow-x-auto">
                <code className="text-white/70">
{`// app/layout.tsx oder pages/_app.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <script 
          src="https://IHR-DOMAIN.com/embed.js"
          async />
      </body>
    </html>
  )
}`}
                </code>
              </div>
            </div>

            {/* Wix / Squarespace */}
            <div className="bg-[#0f2035] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#22d3bb]/20 flex items-center justify-center">
                  <Server className="w-5 h-5 text-[#22d3bb]" />
                </div>
                <h3 className="font-semibold text-lg">Wix / Squarespace</h3>
              </div>
              <p className="text-white/50 text-sm mb-4">
                Nutzen Sie den "HTML Embed" oder "Custom Code" Block:
              </p>
              <p className="text-white/50 text-sm mb-2">
                <strong>Wix:</strong> Einstellungen → Tracking & Analytics → Neues Tool → Custom
              </p>
              <p className="text-white/50 text-sm mb-4">
                <strong>Squarespace:</strong> Einstellungen → Advanced → Code Injection
              </p>
              <div className="bg-[#0a1628] rounded-xl p-4 font-mono text-xs overflow-x-auto">
                <code className="text-[#22d3bb]">
{`<script src="https://IHR-DOMAIN.com/embed.js"></script>`}
                </code>
              </div>
            </div>
          </div>
        </section>

        {/* IFrame Alternative */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">IFrame-Einbindung (Alternative)</h2>
          <p className="text-white/60 mb-6">
            Für maximale Kontrolle können Sie den Chat auch direkt als IFrame einbinden:
          </p>
          
          <div className="bg-[#0f2035] border border-white/10 rounded-2xl p-6">
            <div className="bg-[#0a1628] rounded-xl p-4 font-mono text-sm overflow-x-auto">
              <code className="text-white/70">
{`<iframe 
  src="https://IHR-DOMAIN.com/embed/chat"
  style="width: 400px; height: 600px; border: none; border-radius: 16px;"
  allow="microphone">
</iframe>`}
              </code>
            </div>
          </div>
        </section>

        {/* JavaScript API */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">JavaScript API</h2>
          <p className="text-white/60 mb-6">
            Steuern Sie den Chat programmatisch über die globale API:
          </p>
          
          <div className="bg-[#0f2035] border border-white/10 rounded-2xl p-6">
            <div className="bg-[#0a1628] rounded-xl p-4 font-mono text-sm overflow-x-auto mb-4">
              <code className="text-white/70">
{`// Chat öffnen
MonterossaChat.open();

// Chat schließen
MonterossaChat.close();

// Chat umschalten
MonterossaChat.toggle();

// Status abfragen
if (MonterossaChat.isOpen()) {
  console.log('Chat ist geöffnet');
}`}
              </code>
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Voraussetzungen</h2>
          <div className="bg-[#22d3bb]/10 border border-[#22d3bb]/20 rounded-2xl p-6">
            <ul className="space-y-3 text-white/70">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#22d3bb] shrink-0 mt-0.5" />
                <span>Der Monterossa Chat-Server muss über HTTPS erreichbar sein</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#22d3bb] shrink-0 mt-0.5" />
                <span>Für Spracheingabe: Moderner Browser (Chrome, Edge, Safari)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#22d3bb] shrink-0 mt-0.5" />
                <span>JavaScript muss im Browser aktiviert sein</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#22d3bb] shrink-0 mt-0.5" />
                <span>Mikrofon-Berechtigung für Voice-Input</span>
              </li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-16">
        <div className="max-w-5xl mx-auto px-6 text-center text-white/40 text-sm">
          <p>© {new Date().getFullYear()} Monterossa AG. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  );
}
