<div align="center">

![BBD Papers Banner](/public/banner.png)

> `Engineering the future of study materials..._`

[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white&color=0f172a)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white&color=0f172a)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white&color=0f172a)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white&color=0f172a)](https://www.framer.com/motion/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white&color=0f172a)](https://supabase.com/)

</div>

---

## 🏗️ The Architecture Stack

> **Built for the edge. Designed for developers.**

<table>
<tr>
<td width="50%">

### **Frontend Layer**
```typescript
// React Server Components
export default async function Page() {
  const data = await fetch('/api/notes')
  return <NotesGrid data={data} />
}
```

</td>
<td width="50%">

### **Styling & Motion**
```css
/* Tailwind v4 + Dark Mode First */
@apply bg-slate-950 text-white
       backdrop-blur-xl 
       animate-fadeIn;
```

</td>
</tr>
<tr>
<td width="50%">

### **Backend Layer**
```typescript
// Supabase Edge Functions
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)
```

</td>
<td width="50%">

### **Database Layer**
```sql
-- PostgreSQL at the Edge
CREATE TABLE notes (
  id UUID PRIMARY KEY,
  title TEXT,
  content TEXT,
  created_at TIMESTAMP
);
```

</td>
</tr>
</table>

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | `Next.js 15` (App Router) | React Server Components, Streaming SSR |
| **Styling** | `Tailwind CSS v4` | Dark-mode-first utility styling |
| **Animation** | `Framer Motion` | Staggered page transitions, micro-interactions |
| **Backend** | `Supabase` | Serverless Postgres, Auth, Storage, Edge Functions |
| **Database** | `PostgreSQL` | Serverless database with Row Level Security |
| **Auth** | `Supabase Auth` | OAuth (Google/GitHub), Magic Links, JWT sessions |

---

## ✨ Key Features

> `Premium dark UI meets edge-first performance`

- ✅ **`Edge-First Performance`** → Sub-100ms page loads with RSC streaming
- ✅ **`Premium Dark UI`** → Glassmorphic cards, backdrop blur, smooth animations
- ✅ **`Secure PYQ/Notes Uploads`** → Row-level security policies, signed URLs
- ✅ **`Admin Command Center`** → Role-based access control, analytics dashboard
- ✅ **`Real-time Search`** → Instant filtering with debounced queries
- ✅ **`OAuth Integration`** → Google + GitHub login with consent forcing
- ✅ **`Mobile-First Design`** → Responsive breakpoints, drawer navigation
- ✅ **`Type-Safe APIs`** → End-to-end TypeScript with Zod validation

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

```bash
# Node.js (v18 or higher)
node --version  # v18.0.0+

# npm (comes with Node.js)
npm --version   # 9.0.0+
```

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/ankittroy-21/BBDPapers.git
cd BBDPapers

# 2. Install dependencies
npm install

# 3. Set up environment variables (see below)
cp .env.example .env.local

# 4. Run the development server
npm run dev
```

Open [**http://localhost:3000**](http://localhost:3000) to see the magic ✨

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OAuth Providers (configured in Supabase Dashboard)
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Optional: Analytics & Monitoring
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### **Where to get these values:**

| Variable | Source |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |
| `GOOGLE_CLIENT_ID` | [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials |
| `GITHUB_CLIENT_ID` | [GitHub Developer Settings](https://github.com/settings/developers) → OAuth Apps |

---

## 📁 Project Structure

```
BBDPapers/
├── app/                      # Next.js 15 App Router
│   ├── (auth)/
│   │   └── login/           # OAuth login page
│   ├── admin/               # Admin dashboard (protected)
│   │   ├── page.tsx         # Analytics & stats
│   │   ├── moderation/      # Content approval queue
│   │   ├── users/           # User management
│   │   └── analytics/       # Visit logs
│   ├── explore/             # Public resource browser
│   ├── upload/              # Upload form (auth required)
│   ├── feedback/            # Feedback submission
│   └── layout.tsx           # Root layout with Navbar
├── components/
│   ├── admin/
│   │   └── AdminLayoutWrapper.tsx
│   ├── Navbar.tsx           # Global navigation
│   ├── UserDropdown.tsx     # User menu with logout
│   ├── HeroSearch.tsx       # Landing page search
│   └── CompactSearch.tsx    # Sticky navbar search
├── utils/
│   ├── supabase/
│   │   ├── client.ts        # Client-side Supabase
│   │   └── server.ts        # Server-side Supabase
│   └── analytics.ts         # Visit tracking
├── middleware.ts            # Auth guards & session refresh
└── public/
    └── logo.png             # Brand assets
```

---

## 🎨 Design Philosophy

> **"Clean & Academic"** — The design system prioritizes whitespace, readability, and trust.

### Visual Hierarchy
```typescript
// Spacing Scale (Tailwind)
const spacing = {
  xs: 'p-2',      // 8px
  sm: 'p-4',      // 16px
  md: 'p-6',      // 24px  ← Default
  lg: 'p-8',      // 32px
  xl: 'p-12',     // 48px
}

// Color System
const colors = {
  background: 'bg-slate-950',     // #020617
  surface: 'bg-slate-900/50',     // Glass cards
  primary: 'bg-indigo-600',       // CTAs
  accent: 'bg-amber-400',         // Admin badges
  text: 'text-slate-300',         // Body
}
```

### Typography
- **Headings:** `font-bold text-3xl md:text-5xl tracking-tight`
- **Body:** `text-base md:text-lg text-slate-300`
- **Code:** `` `inline-code` `` → `bg-slate-800 px-2 py-1 rounded`

---

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Build optimized bundle
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check

# Windows Users
.\start.ps1          # One-click dev server + auto-open browser
```

---

## 🔒 Security Features

- ✅ **Row Level Security (RLS)** → Database-level access control
- ✅ **HttpOnly Cookies** → Session tokens never exposed to JavaScript
- ✅ **OAuth Consent Forcing** → Google shows account picker every time
- ✅ **Server-Side Auth Guards** → Middleware redirects before page render
- ✅ **Admin Role Verification** → Double-check `is_admin` flag in profiles
- ✅ **CVE Validation** → Dependency vulnerability scanning

---

## 📊 Performance Metrics

> Measured with [Lighthouse](https://developers.google.com/web/tools/lighthouse) on production build

| Metric | Score |
|--------|-------|
| **Performance** | 98/100 |
| **Accessibility** | 100/100 |
| **Best Practices** | 100/100 |
| **SEO** | 100/100 |

**Key Optimizations:**
- React Server Components for zero client JS on static pages
- Image optimization with Next.js `<Image>` component
- Prefetching with `<Link>` hover detection
- Streaming SSR for faster Time to First Byte (TTFB)

---

## 🤝 Contributing

We welcome contributions from the BBD community!

### Development Workflow

1. **Fork the repo** → Click the Fork button on GitHub
2. **Clone your fork** → `git clone https://github.com/YOUR_USERNAME/BBDPapers.git`
3. **Create a branch** → `git checkout -b feature/amazing-feature`
4. **Make changes** → Code with the "Vibe Coding Persona" guidelines
5. **Test locally** → `npm run dev` and verify changes
6. **Commit** → `git commit -m 'feat: add amazing feature'`
7. **Push** → `git push origin feature/amazing-feature`
8. **Open PR** → Submit a Pull Request with a clear description

### Code Style

Follow the project's `.github/copilot-instructions.md` for coding standards:
- **No placeholder logic** (no `// TODO` without implementation)
- **Server Actions for mutations** (no client-side API calls)
- **Fail gracefully** (wrap API calls in `try/catch` with toast notifications)

---

## 📝 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

<table>
<tr>
<td align="center">
<img src="https://github.com/ankittroy-21.png" width="100px;" alt="Ankit Roy"/><br />
<sub><b>Ankit Roy</b></sub><br />
<a href="https://github.com/ankittroy-21">GitHub</a> •
<a href="https://www.linkedin.com/in/ankittroy-21">LinkedIn</a>
</td>
</tr>
</table>

---

## 🙏 Acknowledgments

- **Next.js Team** → For the incredible App Router architecture
- **Supabase** → For the serverless Postgres + Auth platform
- **Vercel** → For deployment and edge network excellence
- **BBD Community** → For trusting us with their academic resources

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

**Built with ❤️ by students, for students**

[Report Bug](https://github.com/ankittroy-21/BBDPapers/issues) · [Request Feature](https://github.com/ankittroy-21/BBDPapers/issues) · [View Demo](https://bbd-papers.vercel.app)

</div>
