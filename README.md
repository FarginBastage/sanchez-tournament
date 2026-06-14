# 🐉 Sanchez Tournament of Cleaning

A Dragon Ball Z-themed family chore tracker. Earn Dragon Balls by completing your daily chores. Collect all 7 in a week and summon Shenron for a wish.

**Live demo:** https://sanchez-tournament.pplx.app

---

## The Cast

| Name   | Character | Role          |
|--------|-----------|---------------|
| Jesse  | Vegeta 👑 | Prince of All Saiyans |
| Angela | Bulma 💡  | Genius Inventor |
| Jude   | Gohan ⚡  | The Scholar |
| David  | Goku 🔥   | Low-Class Warrior |

---

## Features

- **Daily chore checklist** — each family member sees their tasks for the day
- **Dragon Ball system** — complete all chores on a given day → earn one Dragon Ball (max 7 per week)
- **Shenron summon** — collect all 7 in a week, summon the dragon, make a wish
- **Wish history** — vivid scrollable record of every granted wish
- **Chore notes** — tap the 📝 icon on any chore to leave a note; auto-posted to group chat
- **Confetti burst** — finishing your last chore fires gold/orange confetti
- **Dark/light mode** — toggle in sidebar (desktop) or bottom nav (mobile)
- **Day navigation** — go back and check off chores for prior days
- **Calendar** — month and week views with per-member completion dots; tap any day for details
- **War Room (group chat)** — family messaging with full timestamps and date separators
- **SOS summon** — call for help; fires a browser push notification to anyone on the page
- **Standings** — comparison page showing who's ahead this week
- **Edit Assignments** — override any member's chores for a given day/week without touching code
- **A/B week rotation** — chores rotate on a two-week cycle automatically
- **Sound effects** — punch on chore check, power-up on day complete, Kamehameha on Shenron summon
- **OG image** — Shenron image shows when you share the link

---

## Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | React 18 + TypeScript + Vite |
| Styling   | Tailwind CSS v3 + shadcn/ui |
| Routing   | wouter (hash-based) |
| Data      | TanStack Query v5 |
| Backend   | Node.js + Express |
| Database  | SQLite via Drizzle ORM + better-sqlite3 |
| Build     | tsx + esbuild |

---

## Project Structure

```
sanchez-tournament/
├── client/
│   ├── public/          # Static assets (OG image, icons)
│   └── src/
│       ├── components/  # DragonBalls, SosSummon
│       ├── lib/         # choreData.ts, sounds.ts, confetti.ts, notifications.ts
│       ├── pages/       # TodayPage, CalendarPage, ChatPage, etc.
│       └── App.tsx      # Routing + dark mode state
├── server/
│   ├── routes.ts        # All API endpoints
│   ├── storage.ts       # SQLite queries via Drizzle
│   └── index.ts         # Express entry point
├── shared/
│   └── schema.ts        # Database schema + TypeScript types
└── data.db              # SQLite database (created at runtime, gitignored)
```

---

## Running Locally

### Prerequisites

- Node.js 18+ ([nodejs.org](https://nodejs.org))
- npm (comes with Node)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/FarginBastage/sanchez-tournament.git
cd sanchez-tournament

# 2. Install dependencies
npm install

# 3. Build the app
npm run build

# 4. Start the server
NODE_ENV=production node dist/index.cjs
```

Open http://localhost:5000 in your browser. The database (`data.db`) is created automatically on first run.

### Development mode (live reload)

```bash
npm run dev
```

This starts both the Express backend and Vite dev server together on port 5000 with hot module replacement.

---

## Deployment Options

### Option 1: Railway (Recommended — easiest)

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project → Deploy from GitHub repo**
3. Select `sanchez-tournament`
4. Railway auto-detects Node.js. Set the **start command** to:
   ```
   npm ci --omit=dev && node dist/index.cjs
   ```
5. Add a **Volume** mounted at `/app` so `data.db` survives redeploys
6. Railway gives you a live URL instantly

**Cost:** Free tier available; $5/mo Hobby plan for always-on.

---

### Option 2: Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Log in
fly auth login

# Launch (run from the project root)
fly launch

# Create a persistent volume for the database
fly volumes create data --size 1

# Deploy
fly deploy
```

Add this to `fly.toml` to mount the volume:
```toml
[mounts]
  source = "data"
  destination = "/app"
```

And update the run command to write `data.db` to `/app/data.db` by setting the env var:
```toml
[env]
  DATABASE_URL = "/app/data.db"
```

**Cost:** Free tier includes enough for a small app.

---

### Option 3: VPS (DigitalOcean / Hetzner / Linode)

```bash
# On your server (Ubuntu/Debian)
git clone https://github.com/FarginBastage/sanchez-tournament.git
cd sanchez-tournament
npm ci --omit=dev
npm run build

# Install PM2 to keep it running
npm install -g pm2
pm2 start "NODE_ENV=production node dist/index.cjs" --name sanchez
pm2 save
pm2 startup   # follow the printed command to enable on reboot
```

Then set up Nginx as a reverse proxy on port 80/443 pointing to port 5000.

**Cost:** Hetzner starts at ~€3.29/mo. DigitalOcean $4/mo.

---

### Option 4: Home Server / Raspberry Pi (Free)

Run the same `npm run build` + `pm2` steps above on any Linux machine at home.
Use [Tailscale](https://tailscale.com) (free for up to 3 users, $6/mo for families) to give every family member a private VPN URL — no port-forwarding or public exposure needed.

---

## Customizing for Your Family

### Changing family members and characters

Edit `server/storage.ts` — find the `initializeMembers()` function and update names, characters, colors, and emojis.

Available characters: `vegeta`, `goku`, `gohan`, `bulma`

```ts
{ name: "Jesse", character: "vegeta", color: "#1565c0", emoji: "👑" },
{ name: "Angela", character: "bulma",  color: "#7b1fa2", emoji: "💡" },
{ name: "Jude",   character: "gohan",  color: "#2e7d32", emoji: "⚡" },
{ name: "David",  character: "goku",   color: "#f57f17", emoji: "🔥" },
```

### Changing chore assignments

**Option A — In the app:** Go to **Edit Assignments** in the sidebar. You can override any member's chores for any day/week without touching code. Changes are saved to the database immediately.

**Option B — In code:** Edit `client/src/lib/choreData.ts`. The file has two week schedules (`WEEK_A` and `WEEK_B`), each with 7 days. Each day lists chores per member by first name (lowercase).

The dinner support logic uses three shared arrays at the top of the file:
- `SET_TABLE` — given to the person setting the table (includes dishwasher)
- `CLEAR_TABLE` — given to the person clearing (includes dishwasher)
- `COLLECT_DISHES` — given to everyone else (no dishwasher duty)

### Changing the week A/B rotation

The rotation is calculated in `getWeekRotation()` at the bottom of `choreData.ts`. Currently: even ISO week numbers = Week A, odd = Week B.

### Changing the Shenron incantation

In `client/src/components/DragonBalls.tsx`, find the `INCANTATION` constant.

### Swapping the summon video

In `DragonBalls.tsx`, find the YouTube Shorts URL and replace it with any YouTube or YouTube Shorts link.

---

## Database Schema

The SQLite database is created automatically at `data.db` in the project root.

| Table | Purpose |
|-------|---------|
| `members` | Family members + character assignments |
| `completions` | Chore check-offs (memberId, choreKey, date, completed) |
| `wishes` | Granted Shenron wishes |
| `sosRequests` | SOS help requests |
| `choreOverrides` | Per-member chore overrides (Edit Assignments) |
| `messages` | Group chat messages (War Room) |
| `choreNotes` | Notes attached to individual chores |

To reset everything and start fresh, delete `data.db` and restart the server. It will be recreated with the default members seeded in.

---

## Keeping the Repo in Sync

If you make changes via the Perplexity AI session that built this app, you can push updates to this repo at any time by asking the agent:

> "Push the latest changes to GitHub"

The agent has the repo configured as `origin` and will commit and push any changes.

---

## License

Private family project. Not intended for public distribution.

*A Fargin Bastage Production* 🐉
