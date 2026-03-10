# Monterossa KI-Chat - Vercel Ready

## ✅ Vorbereitet für Vercel-Deployment

### Dateien für Vercel:
- ✅ `prisma/schema.prisma` - PostgreSQL-kompatibel
- ✅ `vercel.json` - CORS & Header-Konfiguration
- ✅ `.env.example` - Umgebungsvariablen-Vorlage
- ✅ Admin-Dashboard unter `/admin`
- ✅ Embed-Chat unter `/embed/chat`
- ✅ Embed-Script unter `/embed.js`

### Features:
- 🎤 Sprachnachrichten (Telefonbeantworter)
- 📎 Datei-Upload (Bilder, Videos, Dokumente)
- ⭐ Bewertungs-System
- 👤 Mitarbeiter-Transfer bei Unzufriedenheit
- 📊 Admin-Dashboard mit Statistiken
- 📚 Wissensdatenbank

---

## 🚀 Deployment-Schritte

### 1. GitHub Repository erstellen

Gehen Sie zu [github.com/new](https://github.com/new):
- Repository Name: `monterossa-ki-chat`
- Private oder Public
- **NICHT** mit README initialisieren (wir haben schon eins)

### 2. Code pushen

```bash
cd /home/z/my-project
git remote add origin https://github.com/IHR-USERNAME/monterossa-ki-chat.git
git push -u origin master
```

### 3. Vercel einrichten

1. [vercel.com](https://vercel.com) → Sign Up with GitHub
2. "Add New Project" → Repository auswählen
3. Storage → Create Database → Postgres (Neon)
4. Environment Variables setzen:
   - `DATABASE_URL`
   - `DIRECT_DATABASE_URL`
5. Deploy

### 4. Auf seopulse.ch einbinden

```html
<script src="https://IHR-PROJEKT.vercel.app/embed.js"></script>
```

---

## 📋 Umgebungvariablen für Vercel

Diese werden automatisch von Vercel Postgres bereitgestellt:

```
DATABASE_URL="postgresql://..."
DIRECT_DATABASE_URL="postgresql://..."
```

---

## Kosten

- Vercel: **Kostenlos** für kleine Projekte
- Vercel Postgres: **Kostenlos** (256MB)
- GitHub: **Kostenlos**

**Total: CHF 0/Monat** 🎉
