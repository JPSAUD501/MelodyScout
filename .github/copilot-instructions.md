# MelodyScout – AI Coding Instructions

## What You Are Building
- Bun + TypeScript Telegram stack: `app.ts` boots `MelodyScout_Bot` (Grammy), `MelodyScoutLog_Bot` (receives `advLog/advError` queue) and `Server/server.ts` (health pings).
- Main bot lives under `MelodyScout_Bot/`; log bot mirrors the same config but only streams structured logs.

## Runtime Topology
- `MelodyScout_Bot/bot.ts` wires Grammy middlewares, registers composers, and exposes `bot.api` helpers.
- Command/callback flow: `composers/*` are thin ctx parsers → delegate to `botFunctions/*` (business logic) → render strings/media via `textFabric/*`.
- Callback payloads must fit 64 bytes; always build them with `functions/callbackMaker.getCallbackKey()` and match with `new RegExp('^XX' + melodyScoutConfig.divider)` to stay consistent.

## Cross-Cutting Patterns
- **Grammy helpers** (`functions/grammyFunctions.ts`): prefer `ctxReply`, `ctxEditMessage`, `ctxReplyWithAudio/Video/Photo`, `ctxAnswerCallbackQuery` for html parsing + typing indicators.
- **Advanced logging** (`functions/advancedConsole.ts`): wrap background work in `advLog/advError` so the log bot can relay messages.
- **I18n**: generate copy via `lang()` (`translations/base.ts`) inside `textFabric/*`; add fallback `value` strings and run `bun run translate:dev` to sync JSON keys.
- **Media utilities**: long-running edits go through helpers such as `functions/collage.ts`, `functions/mediaEditors.ts`, and `functions/getTrackPreview.ts` to keep behavior uniform.

## API + Data Layer
- Every integration sits under `api/ms{Service}Api/` with `base.ts` exposing sub-clients from `classes/`, zod schemas in `types/`, and shared fetch logic in `functions/`.
- Responses are discriminated unions: `{ success: true; data } | ApiErrors`. Never touch `.data` before checking `success` and propagate the typed error branch upward.
- Database access happens exclusively through `api/msPrismaDbApi/` which groups `checkIfExists/create/get/update` modules; Prisma schema lives in `prisma/schema.prisma`.

## Adding Features Safely
- **New command**: add composer stub in `MelodyScout_Bot/composers/commands`, core logic in `botFunctions/commands`, strings in `textFabric`, then register it via `bot.use(...)` + `bot.api.setMyCommands`.
- **New callback**: mirror the command flow, but ensure the regex matcher and payload prefix align and keep params truncated with `callbackMaker.truncateParam`.
- **New external service**: scaffold `api/msXApi/` with the base/class/types layout and plumb configuration through `config.ts` env exports.

## Build + Verification Workflow
- `bun run dev` (translation extraction → typecheck → start bots).
- `bun run start` (fire `app.ts` only) and `bun run typecheck` for quick linting.
- `bun run deploy` applies Prisma migrations and should precede prod boots; dev DB resets live under `prisma/migrations`.
- Tests reside in `Tests/*.test.ts`; execute targeted suites with `bun test Tests/radio.test.ts` (Bun’s native test runner).

## Environment & Ops Notes
- Critical env vars (see `config.ts`): Telegram tokens/IDs for both bots, `DATABASE_URL/DIRECT_URL`, music API keys (Last.fm, Spotify, Genius), AI keys (`OPENAI_API_KEY`, `GOOGLE_AI_KEY`). Missing vars surface early because constructors in `config.ts` throw.
- Server health checks (`Server/server.ts`) are lightweight—don’t block startup paths; any long job should log via `advLog` and avoid unhandled promise chains.

## Quick Reference
- Text + translations: `MelodyScout_Bot/textFabric`, `translations/base/`.
- Media + download helpers: `functions/*.ts` (collage, downloader, sanitizer, track preview length calculation).
- Temporary assets: write to `temp/` via helpers in `functions/tempy.ts` so cleanup happens automatically.

Keep these conventions in mind and you can slot new behavior into the bot without regressing logging, localization, or API contracts.
