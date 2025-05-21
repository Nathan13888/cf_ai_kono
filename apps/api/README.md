# Kono API

API server written with Hono (name is a coincidence).

## Setup

1. Setup `.dev.vars`:

  ```env
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
  bunx drizzle-kit generate # Generate the migration file
  bunx drizzle-kit migrate # Apply the migration

  # Start dev server
  bun dev
  ```

Deploy application:

```sh
bun deploy
```

## Obtaining API Keys

- Google AI Studio (e.g. Gemini): <https://aistudio.google.com/apikey>
- OpenAI: <https://platform.openai.com/settings/organization/api-keys>
- Anthropic: <https://console.anthropic.com/settings/keys>

## Pricing

- Google Generative AI: <https://ai.google.dev/gemini-api/docs/pricing>
- OpenAI: <https://openai.com/api/pricing/>
