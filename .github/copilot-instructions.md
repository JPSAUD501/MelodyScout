# MelodyScout - AI Coding Instructions

## Project Overview

MelodyScout is a **Telegram bot** that integrates with **Last.fm** to provide music tracking, scrobble statistics, lyrics, and AI-powered features. Built with **Bun runtime** and **TypeScript**.

## Architecture

### Entry Point & Boot Sequence
- `app.ts` → Starts `MelodyScoutLog_Bot` (logging), `MelodyScout_Bot` (main), and `Server` (health checks)
- Both bots run concurrently; the log bot receives all `advLog/advError` messages via a queue

### Core Components
```
MelodyScout_Bot/
├── bot.ts              # Grammy bot setup, composer registration
├── composers/          # Middleware for commands/callbacks/inlines
│   ├── commands/       # Thin wrappers → delegate to botFunctions/
│   └── callbacks/      # Parse callback data using regex + divider
├── botFunctions/       # Business logic for each command/callback
└── textFabric/         # Text generation with i18n support
```

### API Wrapper Pattern
Each external service has a dedicated wrapper in `api/ms{Service}Api/`:
- `base.ts` - Main class exposing sub-modules (e.g., `MsLastfmApi.user.getInfo()`)
- `classes/` - Method implementations per entity (User, Track, Album, Artist)
- `types/` - Zod schemas for response validation
- `functions/` - Shared fetch utilities

**Example:** `MsLastfmApi` exposes `user`, `artist`, `album`, `track` classes with typed methods.

### Response Pattern
All API methods return discriminated unions:
```typescript
type Response = { success: true; data: T } | ApiErrors
// Always check `success` before accessing `data`
```

## Key Patterns

### Callback Data Encoding
Callbacks use a divider (`melodyScoutConfig.divider`) with 64-byte limit:
```typescript
// Create: getCallbackKey(['TP', trackName, artistName])
// Match: new RegExp(`^TP${melodyScoutConfig.divider}`)
```
Parameters are truncated with `…` if exceeding byte limit.

### Internationalization
Use `lang()` from `translations/base.ts`:
```typescript
lang(ctxLang, { key: 'keyName', value: 'Fallback text {{var}}' }, { var: 'value' })
```
- `key` maps to translation file; `value` is fallback
- Run `bun run translate:dev` to sync translation keys from code to JSON base

### Grammy Helpers
Use functions from `functions/grammyFunctions.ts`:
- `ctxReply()` - Send message with HTML parsing
- `ctxEditMessage()` - Edit existing message
- `ctxReplyWithAudio/Video/Photo()` - Media with loading indicator
- `ctxAnswerCallbackQuery()` - Answer callbacks

### Logging
```typescript
import { advLog, advError } from '../functions/advancedConsole'
advLog('Info message')   // 🔵 prefix in log bot
advError('Error message') // 🔴 prefix in log bot
```

## Development Commands

```bash
bun run dev          # Translate + typecheck + start
bun run start        # Run app.ts directly
bun run deploy       # Run Prisma migrations (required before start in prod)
bun run translate:dev # Extract translation keys from code
bun run typecheck    # TypeScript check without emit
```

## Adding New Features

### New Command
1. Create `MelodyScout_Bot/composers/commands/{name}.ts` (thin wrapper)
2. Create `MelodyScout_Bot/botFunctions/commands/{name}.ts` (logic)
3. Create `MelodyScout_Bot/textFabric/{name}.ts` (text generation)
4. Register in `MelodyScout_Bot/bot.ts` with `bot.use()`
5. Add to `bot.api.setMyCommands()` array

### New Callback
1. Create `MelodyScout_Bot/composers/callbacks/{name}.ts`
2. Create `MelodyScout_Bot/botFunctions/callbacks/{name}.ts`
3. Use `getCallbackKey(['PREFIX', ...params])` to generate callback data
4. Match with `new RegExp(`^PREFIX${melodyScoutConfig.divider}`)`

### New API Integration
1. Create `api/ms{Service}Api/base.ts` with class structure
2. Add Zod schemas in `types/` for response validation
3. Export config in root `config.ts` from environment variables

## Database

- **Prisma** with PostgreSQL (`prisma/schema.prisma`)
- Access via `MsPrismaDbApi` class with `checkIfExists`, `create`, `get`, `update` modules
- Always run `bun run deploy` before starting in production

## Environment Variables

Key variables (see `config.ts`):
- `MSB_TELEGRAM_TOKEN` / `MSB_TELEGRAM_BOT_ID` - Main bot
- `MSLB_TELEGRAM_TOKEN` / `MSLB_TELEGRAM_LOG_CHANNEL` - Log bot
- `DATABASE_URL` / `DIRECT_URL` - Prisma database
- `LASTFM_API_KEY`, `SPOTIFY_CLIENT_*`, `GENIUS_ACCESS_TOKEN` - Music APIs
- `OPENAI_API_KEY`, `GOOGLE_AI_KEY` - AI features

## Testing

Tests are in `Tests/` directory. Run specific tests directly with Bun.
