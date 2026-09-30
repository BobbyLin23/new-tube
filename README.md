# New Tube

- Nuxt4
- Tailwind CSS
- `Shadcn Vue`
- Nuxt ColorMode
- Clerk
- Drizzle Orm
- Neon DB
- T3 Env
- Vue Use
- Ngrok
- oRPC
- UpStash

## AI generation with DeepSeek

Video titles and descriptions are generated from Mux transcripts using DeepSeek through Upstash Workflow. Add these server-only settings to your gitignored `.env` and deployment environment:

```dotenv
DEEPSEEK_API_KEY=<your DeepSeek API key>
DEEPSEEK_MODEL=deepseek-flash
QSTASH_TOKEN=<your QStash token>
QSTASH_CURRENT_SIGNING_KEY=<your current QStash signing key>
QSTASH_NEXT_SIGNING_KEY=<your next QStash signing key>
UPSTASH_WORKFLOW_URL=https://your-public-app-origin
```

`DEEPSEEK_MODEL` defaults to `deepseek-flash`; `deepseek-v4-pro` is also supported. Requests use non-thinking mode and the [DeepSeek Chat Completions API](https://api-docs.deepseek.com/api/create-chat-completion/). An OpenAI API key is no longer needed.

`UPSTASH_WORKFLOW_URL` must be the public app origin without an `/api` path. For local development, run `pnpm dev` and `pnpm dev:ngrok`, then use `https://jaybird-light-badger.ngrok-free.app`. Keep the tunnel running for signed workflow callbacks. Set the optional `QSTASH_URL` if your QStash account requires a regional API URL. Restart Nuxt after updating `.env`.

Once a video's subtitles are ready, click the sparkle beside **Title** or **Description** in Studio. Results save automatically, and the editor preserves draft edits made while generation runs. The rest of the app works without AI credentials; generation reports that it is not configured until the required settings are present.
