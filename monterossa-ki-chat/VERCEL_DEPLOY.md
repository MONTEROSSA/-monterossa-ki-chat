# 🚀 Vercel Deployment Guide - Monterossa KI-Chat

## Voraussetzungen

- GitHub Account (kostenlos)
- Vercel Account (kostenlos unter vercel.com)
- 10-15 Minuten Zeit

---

## Schritt 1: GitHub Repository erstellen

### 1.1 Neues Repository auf GitHub erstellen

1. Gehen Sie zu [github.com](https://github.com) und loggen Sie sich ein
2. Klicken Sie auf **"New repository"** (grüner Button)
3. Repository-Name: `monterossa-ki-chat`
4. Wählen Sie **"Private"** (empfohlen)
5. Klicken Sie **"Create repository"**

### 1.2 Code hochladen

Führen Sie diese Befehle im Projektordner aus:

```bash
git init
git add .
git commit -m "Initial commit - Monterossa KI-Chat"
git branch -M main
git remote add origin https://github.com/IHR-USERNAME/monterossa-ki-chat.git
git push -u origin main
```

---

## Schritt 2: Vercel Postgres Database erstellen

### 2.1 Vercel Account erstellen

1. Gehen Sie zu [vercel.com](https://vercel.com)
2. Klicken Sie **"Sign Up"** → **"Continue with GitHub"**
3. Autorisieren Sie Vercel für GitHub

### 2.2 Datenbank erstellen

1. Klicken Sie auf **"Storage"** im Dashboard
2. Klicken Sie **"Create Database"**
3. Wählen Sie **"Postgres"** (Neon)
4. Database Name: `monterossa-chat-db`
5. Region: **Frankfurt (fra1)** oder **Washington (iad1)**
6. Klicken Sie **"Create"**

### 2.3 Umgebungsvariablen kopieren

Nach der Erstellung sehen Sie die Verbindungsinformationen:

```
DATABASE_URL="postgresql://..."
DIRECT_DATABASE_URL="postgresql://..."
```

**Kopieren Sie diese Werte!**

---

## Schritt 3: Projekt auf Vercel deployen

### 3.1 Neues Projekt erstellen

1. Klicken Sie **"Add New..."** → **"Project"**
2. Wählen Sie Ihr GitHub Repository `monterossa-ki-chat`
3. Klicken Sie **"Import"**

### 3.2 Umgebungsvariablen hinzufügen

1. Klicken Sie auf **"Environment Variables"**
2. Fügen Sie hinzu:

| Name | Wert |
|------|------|
| `DATABASE_URL` | (Ihre Postgres URL) |
| `DIRECT_DATABASE_URL` | (Ihre Postgres Direct URL) |

### 3.3 Deploy starten

1. Klicken Sie **"Deploy"**
2. Warten Sie 2-3 Minuten

---

## Schritt 4: Datenbank initialisieren

### 4.1 Vercel CLI installieren (optional)

```bash
npm i -g vercel
vercel login
```

### 4.2 Prisma Migration ausführen

Im Vercel Dashboard:

1. Gehen Sie zu Ihrem Projekt
2. Klicken Sie **"Storage"** → Ihre Datenbank
3. Klicken Sie **"Query"** Tab
4. Führen Sie folgende SQL-Befehle aus:

```sql
-- Chat Settings Tabelle
CREATE TABLE chat_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "welcomeMessage" TEXT NOT NULL DEFAULT 'Willkommen! Wie kann ich Ihnen helfen?',
  "companyName" TEXT NOT NULL DEFAULT 'Monterossa AG',
  "primaryColor" TEXT NOT NULL DEFAULT '#22d3bb',
  "accentColor" TEXT NOT NULL DEFAULT '#f97316',
  "transferEnabled" BOOLEAN NOT NULL DEFAULT true,
  "transferEmail" TEXT,
  "transferPhone" TEXT,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Knowledge Items Tabelle
CREATE TABLE knowledge_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  url TEXT,
  "fileName" TEXT,
  "fileSize" INTEGER,
  "mimeType" TEXT,
  category TEXT,
  tags TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Messages Tabelle
CREATE TABLE messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "sessionId" TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER,
  "ratingComment" TEXT,
  "hasAttachment" BOOLEAN NOT NULL DEFAULT false,
  "attachmentUrl" TEXT,
  "attachmentName" TEXT,
  "isVoiceMessage" BOOLEAN NOT NULL DEFAULT false,
  "voiceMessageUrl" TEXT,
  "knowledgeUsed" TEXT,
  improved BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Chat Sessions Tabelle
CREATE TABLE chat_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "visitorId" TEXT,
  "userAgent" TEXT,
  "ipAddress" TEXT,
  country TEXT,
  transferred BOOLEAN NOT NULL DEFAULT false,
  "transferReason" TEXT,
  "feedbackLeft" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "endedAt" TIMESTAMP
);

-- Human Handoffs Tabelle
CREATE TABLE human_handoffs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "sessionId" TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  "customerName" TEXT,
  "customerEmail" TEXT,
  "customerPhone" TEXT,
  message TEXT,
  "voiceNoteUrl" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "resolvedAt" TIMESTAMP
);

-- Daily Stats Tabelle
CREATE TABLE daily_stats (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  "totalSessions" INTEGER NOT NULL DEFAULT 0,
  "totalMessages" INTEGER NOT NULL DEFAULT 0,
  "avgRating" REAL,
  "positiveRatings" INTEGER NOT NULL DEFAULT 0,
  "negativeRatings" INTEGER NOT NULL DEFAULT 0,
  transfers INTEGER NOT NULL DEFAULT 0,
  "topQuestions" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- FAQ Items Tabelle
CREATE TABLE faq_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  frequency INTEGER NOT NULL DEFAULT 1,
  "avgRating" REAL,
  "lastAsked" TIMESTAMP NOT NULL DEFAULT NOW(),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- AI Learnings Tabelle
CREATE TABLE ai_learnings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  "originalAnswer" TEXT NOT NULL,
  "improvedAnswer" TEXT,
  rating INTEGER,
  incorporated BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Default Settings einfügen
INSERT INTO chat_settings ("welcomeMessage", "companyName", "primaryColor", "accentColor", "transferEnabled")
VALUES ('Willkommen bei Monterossa AG! 👋

Ich bin Ihr KI-Chat Agent. Sie können mir:
• Textnachrichten schreiben
• Sprachnachrichten hinterlassen
• Dateien, Bilder und Videos anhängen

Wie kann ich Ihnen helfen?', 'Monterossa AG', '#22d3bb', '#f97316', true);
```

---

## Schritt 5: Chat auf seopulse.ch einbinden

Nach erfolgreichem Deployment erhalten Sie eine Vercel-URL wie:
`https://monterossa-ki-chat.vercel.app`

### 5.1 Einbettungscode für seopulse.ch

Fügen Sie diesen Code in Ihre Webseite vor `</body>` ein:

```html
<script 
  src="https://monterossa-ki-chat.vercel.app/embed.js"
  data-position="bottom-right"
  data-primary-color="#22d3bb"
></script>
```

### 5.2 Für WordPress (falls seopulse.ch WordPress nutzt)

1. Gehen Sie zu **Design → Theme-Editor**
2. Wählen Sie **footer.php**
3. Fügen Sie den Code vor `</body>` ein
4. Klicken Sie **"Datei aktualisieren"**

---

## Kostenübersicht

| Service | Kostenlos | Pro |
|---------|-----------|-----|
| **Vercel** | 100GB Bandbreite/Monat | $20/Monat |
| **Vercel Postgres** | 256MB Speicher | $0.30/GB |
| **GitHub** | Unbegrenzte private Repos | $4/Monat |

**Für kleine Websites ist der kostenlose Plan ausreichend!**

---

## Support

Bei Problemen:
1. Prüfen Sie die Vercel Logs unter **"Deployments"** → **"Functions"**
2. Stellen Sie sicher, dass alle Umgebungsvariablen gesetzt sind
3. Überprüfen Sie die Datenbankverbindung

---

## Nächste Schritte

1. ✅ Auf Vercel deployen
2. ✅ Datenbank einrichten
3. ✅ Chat auf seopulse.ch einbinden
4. ✅ Wissensdatenbank befüllen
5. ✅ Willkommensnachricht anpassen
