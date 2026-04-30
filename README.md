Dhyaan: The Spiritual & Aural Sanctuary 🕉️✨
Dhyaan is a high-performance, gamified spiritual wellness platform designed to bridge ancient Sanatan Dharma wisdom with modern software engineering. It features a data-driven e-reader, a global music sanctuary, and an automated engagement engine.

🚀 Core Modules
1. Vidya Sanctuary (The E-Reader)
A technical solution for hosting massive texts like the Bhagavad Gita and Ramayana without device lag.

Chapter-on-Demand Architecture: Utilizing a custom useChapterFetcher.ts hook to retrieve Markdown content from Supabase Storage asynchronously.

Advanced Caching: Implements React Query with a 30-minute stale time to ensure instant chapter transitions on revisit.

Adaptive UI Themes: Supports "Parchment" (Warm), "White" (Clean), and "Obsidian" (Dark Mode) to minimize eye strain during deep study.

2. Music Sanctuary (The Soundscape)
A global music streaming interface inspired by Spotify, designed for focus and meditation.

Global Music Search: Integrated with third-party APIs to allow users to search for music worldwide.

Relational Playlists: Users can curate personal soundscapes stored in a relational PostgreSQL schema involving playlists and playlist_songs.

Secure Access: Implements Supabase RLS (Row Level Security) to ensure users can only manage their own private collections.

3. Karma Engine (Gamification)
A behavioral incentive layer that tracks spiritual self-study (Svadhyaya).

Progress Tracking: Monitors active reading time and scroll depth via the user_reading_progress table.

Engagement Celebration: Triggers KarmaAnimation.tsx upon chapter completion, awarding +10 Karma Points with a gold-themed celebration.

🛠️ Tech Stack & Architecture
Frontend: Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion.

Backend: Supabase (PostgreSQL Database, Auth, Cloud Storage).

State Management: React Query (TanStack).

Data Pipelines: Idempotent Python seeder scripts for bulk Markdown file generation and content indexing.

🎨 Design Philosophy
The project follows an Ultra-Minimal, Apple Keynote-inspired aesthetic:

Primary Gold (#C9A84C): For high-value interactions and "Karma" rewards.

Porcelain (#F2EDE8): Used as a base background to create a "Sober" and calm atmosphere.

Glassmorphism: Applied to UI elements like the Global Audio Player for a premium, modern feel.

🔧 Local Setup & Deployment
Prerequisites
Node.js & npm installed.

## 📦 Installation

```bash
git clone https://github.com/sarthakraj1256-bit/Project-Dhayaan
cd Project-Dhayaan
npm install
npm run dev

👨‍💻 Author
Sarthak Raj
B.Tech Computer Science and Engineering Student
