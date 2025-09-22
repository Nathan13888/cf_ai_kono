# Kono Chat

Kono Chat is a modern, full-stack chat application built for speed, reliability, and extensibility. It leverages Cloudflare's edge infrastructure for scalable APIs, Tauri for desktop experiences, and Bun for fast JavaScript runtime and tooling.

## Tech Stack

- **Frontend:** React, Vite, TypeScript
- **Desktop:** Tauri (Rust + WebView)
- **API:** Hono (Cloudflare Workers), Bun
- **Database:** Cloudflare D1 (SQLite at the edge)
- **Auth:** Better Auth, Google OAuth
- **Cloudflare Features:**
  - Workers (serverless API)
  - D1 (edge database)
  - Durable Objects (stateful edge logic)
  - Wrangler (deployment & management)
- **Other:** Bun (runtime, package manager), Rust (Tauri), React Markdown, Remark GFM

## Monorepo Structure

```
apps/
  api/      # Cloudflare Worker API server
  app/      # Tauri desktop app
  web/      # Web frontend
packages/
  models/   # Shared models & types
  ui/       # Shared UI components
```

## Development Setup

### Prerequisites

- [Bun](https://bun.sh) (JavaScript runtime & package manager)
- [Rust](https://www.rust-lang.org/tools/install) (for Tauri)
- [Node.js](https://nodejs.org/) (for some tooling)
- [Cloudflare Wrangler](https://developers.cloudflare.com/workers/wrangler/) (for API deployment)
- [Tauri CLI](https://tauri.app/) (for desktop app)

### 1. Install Dependencies

```sh
bun install
```

### 2. Environment Variables

Set up `.dev.vars` in `apps/api/`:

```env
GOOGLE_CLIENT_ID="YOUR_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_CLIENT_SECRET"
BETTER_AUTH_SECRET="YOUR_SECRET"
BETTER_AUTH_URL="http://localhost:8787"
GOOGLE_GENERATIVE_AI_API_KEY="YOUR_API_KEY"
OPENAI_API_KEY="sk-proj-YOUR_KEY"
ANTHROPIC_API_KEY="sk-ant-api08-YOUR_KEY"
```

### 3. Generate Types & Schemas

```sh
bun run cf-typegen           # Cloudflare Worker types
bunx @better-auth/cli generate # Auth schemas
bun run db:generate          # DB migration file
bun run db:migrate           # Push migration
```

### 4. Start Development Servers

- **API (Cloudflare Worker):**

  ```sh
  cd apps/api
  bun dev
  ```

- **Web Frontend:**

  ```sh
  cd apps/web
  bun dev
  ```

<!-- - **Desktop App (Tauri):**

  ```sh
  cd apps/app
  bun run tauri dev
  ``` -->

### 5. Database Management

View D1 database:

```sh
bun run db:view
```

Useful Wrangler commands:

```sh
bunx wrangler d1 list
bunx wrangler d1 info kono-chat
```

## Deployment

- **API:**  

  ```sh
  cd apps/api
  bun deploy
  ```

- **Web:**  
  Deploy via your preferred static hosting (Cloudflare Pages recommended).
- **Desktop:**  
  Build with Tauri:

  ```sh
  cd apps/app
  bun run tauri build
  ```
