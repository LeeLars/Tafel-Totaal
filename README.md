# Tafel Totaal Verhuur

> **Van bord tot glas, zonder afwas!**  
> Compleet verhuurplatform voor tafelservies, bestek, glazen en accessoires.

---

## 🏗️ Project Structuur

```
tafel-totaal/
├── public/                 # Frontend (statische HTML, CSS, JS)
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript modules
│   ├── images/            # Afbeeldingen
│   ├── fonts/             # Custom fonts
│   └── *.html             # HTML pagina's
│
├── backend/               # Backend (Node.js + Express + TypeScript)
│   ├── src/               # Source code
│   │   ├── routes/        # API endpoints
│   │   ├── controllers/   # Business logic
│   │   ├── models/        # Database queries
│   │   ├── middleware/    # Auth, validation, etc.
│   │   ├── services/      # External services (Mollie, Resend, etc.)
│   │   ├── config/        # Configuration
│   │   └── types/         # TypeScript types
│   └── database/          # SQL schema & migrations
│
└── docs/                  # Documentatie
```

---

## 🚀 Tech Stack

| Component | Technologie |
|-----------|-------------|
| **Frontend** | HTML + CSS + Vanilla JS |
| **Frontend Hosting** | Netlify |
| **Backend** | Node.js + Express (TypeScript) |
| **Backend Hosting** | Railway |
| **Database** | PostgreSQL (Railway) |
| **Betalingen** | Mollie |
| **E-mail** | Resend |
| **Media Storage** | Cloudinary |

---

## 🛠️ Development Setup

### Prerequisites
- Node.js v18+ 
- PostgreSQL (lokaal voor development)
- Git

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Vul .env in met je credentials
npm run dev
```

### Frontend
De frontend bestaat uit statische bestanden in `/public`. 
Open `public/index.html` in je browser of gebruik een lokale server:
```bash
npx serve public
```

---

## 📚 Documentatie

- [Systeemontwerp](docs/SYSTEEMONTWERP-V2.md) - Volledige technische architectuur
- [Implementatie Stappenplan](docs/IMPLEMENTATIE-STAPPENPLAN.md) - Stap-voor-stap development guide
- [Sitemap](docs/SITEMAP.md) - Alle pagina's en URL structuur
- [Styleguide](docs/STYLEGUIDE.md) - Design system en huisstijl

---

## 🔗 Links

- **Live Website:** https://tafeltotaal.be (coming soon)
- **API:** https://api.tafeltotaal.be (coming soon)

---

## 📝 License

Private - All rights reserved.
