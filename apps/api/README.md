# Kono API

API server written with Hono (name is a coincidence).

## Setup

1. Setup `.dev.vars`:

  ```env
  GOOGLE_CLIENT_ID="YOUR_CLIENT_ID"
  GOOGLE_CLIENT_SECRET="YOUR_CLIENT_SECRET"

  BETTER_AUTH_SECRET=c451345af02efebb57114b408888ddffeadb72f5a1e10bffag597c944e51a3fa
  BETTER_AUTH_URL="http://localhost:8787"

  GOOGLE_GENERATIVE_AI_API_KEY="YOUR_API_KEY"
  OPENAI_API_KEY="sk-proj-YOUR_KEY"
  ANTHROPIC_API_KEY="sk-ant-api08-YOUR_KEY"
  ```

2. Run some commands:

  ```sh
  bun install

  # (Required after each update to wrangler config)
  # Learn more: <https://developers.cloudflare.com/workers/wrangler/commands/#types>
  bun run cf-typegen

  # Generate schemas
  bunx @better-auth/cli generate # For Better Auth
  bun run db:generate # Generate the migration file
  # If necessary, delete .wrangler to reset local states/cache
  bun run db:migrate # Push the migration

  # Start dev server
  bun dev
  ```

Deploy application:

```sh
bun deploy
```

View local D1 database by Wrangler:

```sh
bun run db:view
```

Useful d1 commands:

```sh
bunx wrangler d1 list
bunx wrangler d1 info kono-chat
```

## Obtaining API Keys

- Google AI Studio (e.g. Gemini): <https://aistudio.google.com/apikey>
- OpenAI: <https://platform.openai.com/settings/organization/api-keys>
- Anthropic: <https://console.anthropic.com/settings/keys>

## Pricing

- Google Generative AI: <https://ai.google.dev/gemini-api/docs/pricing>
- OpenAI: <https://openai.com/api/pricing/>
