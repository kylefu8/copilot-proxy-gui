# Development Log

## 2026-04-29 — v0.7.3 upstream sync (major simplification)

### Summary

Major upstream sync: embedded copilot-proxy upgraded from v0.6.3 to v0.7.3. Upstream deleted ~3600 net lines, massively simplifying the routing and translation layers. Conversation recording middleware rebased cleanly with zero conflicts.

### Upstream changes included (v0.6.3 → v0.7.3)

- `a2a18ed` feat: align responses proxy with copilot capabilities
- `dc8f397` docs: capture copilot capability smoke policy
- `293b1ac` chore: release v0.7.0
- `71acef0` feat: support Claude Opus 4.7 routing
- `7e25679` chore: release v0.7.1
- `cd72e91` fix: accept xhigh Claude effort
- `2c7c3d3` chore: release v0.7.2
- `fa78013` fix: preserve xhigh Anthropic effort
- `7f6704f` Simplify API routing policy
- `1591624` chore: release v0.7.3

### Key upstream architectural changes

- Deleted `api-probe.ts`, `backend-plan.ts`, `cc-responses-stream.ts`, `cc-to-responses.ts`, `responses-to-cc.ts`, `stream-translation.ts`, `chat-completions-buffer.ts`
- `routing-policy.ts` massively simplified
- `messages/handler.ts` and `responses/handler.ts` streamlined
- Net code reduction: -3600 lines

### Our middleware

- Cherry-picked `conversation-middleware.ts` + `server.ts` 2 lines from previous branch onto v0.7.3 base
- Zero conflicts — server.ts structure unchanged
- Fixed two unused variable TS errors (`path` → `_path`) to satisfy stricter checks
- Fork branch: `conv-middleware-v073` (fc7f821)

### Changes

- Updated `copilot-proxy` submodule to v0.7.3 base with conversation middleware rebased (branch `conv-middleware-v073`)
- Bumped `package.json` version to `0.7.3`
- Updated release notes and dev log

### Files changed

- `package.json` — version bump to 0.7.3
- `copilot-proxy` — submodule pointer updated
- `RELEASE_NOTES.md` — v0.7.3 release note
- `RELEASE_NOTES_TEMP.md` — v0.7.3 release note
- `DEVLOG.md` — this entry

### Reference release

- GUI release: `v0.7.3`
- Embedded proxy: fork `conv-middleware-v073` based on upstream v0.7.3

## 2026-04-23 — v0.6.3 upstream sync (cache_control passthrough)

### Summary

Upstream sync to copilot-proxy v0.6.3. The main change is that Copilot's native `/v1/messages` endpoint now accepts the top-level `cache_control` field, so the proxy no longer needs to strip it. This benefits Claude Code and other Anthropic SDK clients that rely on prompt caching.

### Upstream changes included (v0.6.2 → v0.6.3)

- `222a78c` Preserve native Anthropic cache control — stops stripping top-level `cache_control` on the native passthrough path
- `a30c8f0` Release v0.6.3 — version bump + updated capability probes and tests

### Changes

- Updated `copilot-proxy` submodule to v0.6.3 base with conversation middleware rebased (branch `conv-middleware-v063`)
- Bumped `package.json` version to `0.6.3`
- Updated release notes and dev log

### Files changed

- `package.json` — version bump to 0.6.3
- `copilot-proxy` — submodule pointer updated
- `RELEASE_NOTES.md` — v0.6.3 release note
- `RELEASE_NOTES_TEMP.md` — v0.6.3 release note
- `DEVLOG.md` — this entry

### Reference release

- GUI release: `v0.6.3`
- Embedded proxy: fork `conv-middleware-v063` based on upstream v0.6.3

## 2026-04-11 — v0.6.2 stale config detection & upstream sync

### Summary

Replace the auto-sync behaviour for Claude Code's `~/.claude/settings.json` with a startup stale-config detection dialog. When the GUI starts, it checks whether a previous session left proxy environment variables in Claude's settings file and shows a dialog letting the user choose to keep, remove, or dismiss. Also includes upstream submodule updates (Claude thinking replay fix, CI improvements).

### Changes

- Removed automatic config sync on model/port change (was in `App.jsx` via `useEffect` watching `config.port`, `config.defaultModel`, etc.)
- Added `ClaudeStaleDialog.jsx` — new dialog component for residual config prompt
- Added `clearClaudeEnv` import and wiring in `App.jsx` for the "Remove" action
- Added i18n keys for stale dialog (title, body, keep, remove, dismiss) in both zh and en
- Updated `package.json` version to `0.6.2`
- Updated `copilot-proxy` submodule (upstream fixes: Claude thinking replay, CI runtime bumps)

### Files changed

- `package.json` — version bump to 0.6.2
- `src/App.jsx` — replaced auto-sync with stale detection dialog
- `src/features/main/ClaudeStaleDialog.jsx` — new file
- `src/core/i18n.jsx` — added stale dialog i18n keys
- `copilot-proxy` — submodule pointer updated
- `README.md` — updated feature description
- `RELEASE_NOTES.md` — v0.6.2 release note
- `RELEASE_NOTES_TEMP.md` — v0.6.2 release note
- `DEVLOG.md` — this entry

### Reference release

- GUI release: `v0.6.2`
- Embedded proxy: fork `main` with upstream fixes + conversation middleware

## 2026-04-10 — v0.6.1 upstream upgrade to v0.6.1

### Summary

Major upstream upgrade: embedded copilot-proxy upgraded from v0.4.2 to v0.6.1. Version number aligned with upstream to reduce confusion. Conversation recording middleware rebased onto v0.6.1 base with zero conflicts.

### Upstream changes included (v0.4.2 → v0.6.1)

- `91709e7` feat: support Anthropic document blocks (PDF/text extraction)
- `1e76b6d` chore: release v0.5.0
- `03b9dfe` feat: native Anthropic /v1/messages passthrough for Claude models
- `a1ce201` fix: preserve upstream metadata and abort handling
- `bb76ab1` Normalize Anthropic and Responses translation semantics
- `573d793` Route Claude requests around Copilot backend limits
- `6599c9c` Add Copilot capability probes and coverage
- `7b0b2c6` fix(messages): align Anthropic contract with Copilot compatibility
- `4c538e8` fix(openai): align compatibility guards and structured outputs
- `8c0764e` fix(embeddings): normalize scalar input for Copilot upstream
- `dcb72f2` test(live): add proxy smoke coverage for official feature surfaces
- `b0170bf` test(live): extend Copilot capability matrix coverage
- `145d725` refactor: centralize backend routing and fallback planning
- `5fbf0cd` fix: restrict backend plans to supported APIs
- `ec01113` refactor: separate static routing from runtime fallback
- `ced0029` chore(release): v0.6.0
- `e57f729` fix: release 0.6.1 abort-signal regression

### Submodule branch management

- Merged `conv-middleware-v061` into submodule `main` (fast-forward)
- Force-pushed submodule `main` to `origin` (kylefu8/copilot-proxy) to replace stale remote commits
- Conversation recording middleware cherry-picked cleanly onto v0.6.1 base

### Version alignment

- GUI version bumped from 0.3.7 to 0.6.1 to align with embedded proxy version
- Reduces user confusion about which proxy version is included

### Reference release

- GUI release: `v0.6.1`
- Embedded proxy: fork `main` based on upstream v0.6.1 + conversation middleware

## 2026-03-06 — v0.2.9 release cycle

### Summary

This round focused on upgrading the embedded `copilot-proxy`, restoring client compatibility, polishing the GUI workflow, and shipping `v0.2.9`.

### Completed work

- Upgraded embedded `copilot-proxy` to upstream `v0.3.0`
- Added a local compatibility fix for Anthropic `/v1/messages` requests that omit `max_tokens`
- Submitted the upstream PR for the `max_tokens` compatibility fix
- Added Claude model auto-sync to `~/.claude/settings.json` when persistent Claude config already exists
- Added a dedicated model refresh button on the main screen
- Added model refresh activity to Verbose logs
- Fixed `pushLog is not defined` by promoting `pushLog()` to module scope
- Updated the usage refresh button text/icon
- Updated the settings button icon
- Bumped the app version to `0.2.9`
- Updated release notes and README
- Built, smoke-tested, tagged, pushed, and published `v0.2.9`

### Validation performed

- Rebuilt the frontend multiple times successfully with Vite
- Repeatedly launched the Electron app in local dev mode successfully
- Verified a real `/v1/messages` request without `max_tokens` returned `200`
- Verified the final `v0.2.9` tag and GitHub release were created successfully

### Temporary release workaround

To allow `v0.2.9` to ship before the upstream PR is merged, the git submodule source was temporarily switched from upstream to the fork:

- temporary submodule URL: `https://github.com/kylefu8/copilot-proxy.git`
- temporary pinned commit includes the compatibility fix

### Follow-up required after upstream PR is merged

1. Change `.gitmodules` back to `https://github.com/Jer-y/copilot-proxy.git`
2. Point the `copilot-proxy` submodule at the official upstream merged commit
3. Sync submodule config and verify fresh clone/submodule init still works

### Reference release

- GUI release: `v0.2.9`
- Embedded proxy baseline: upstream `v0.3.0`

## 2026-03-07 — upstream PR follow-up

### Summary

This round focused on addressing upstream review feedback for the `max_tokens` compatibility PR, validating the exact Claude Code + `gpt-5.4` proxy path locally, and updating the fork branch that backs the upstream PR.

### Upstream review feedback

The upstream author reviewed the PR and requested two concrete changes:

- narrow the schema change so it only accepts omitted `max_tokens`, not `max_tokens: null`
- add a route-level regression test that verifies handler-side backfill behavior instead of only schema acceptance

### Changes applied on the fork branch

- Tightened `AnthropicMessagesPayloadSchema.max_tokens` from `nullable().optional()` to `optional()`
- Tightened the corresponding Anthropic request type from `number | null` to optional `number`
- Kept handler-side `max_tokens` backfill when the field is missing
- Added a route-level regression test for `/v1/messages` requests that omit `max_tokens`
- Added a targeted regression test for `gpt-5.4` via `/v1/messages`, verifying the request is routed to `/responses` and that `max_output_tokens` is backfilled from model limits

### Validation performed

- Ran `bun test tests/messages-error.test.ts`
- Ran `bun test tests/anthropic-request.test.ts tests/messages-error.test.ts`
- Launched the local GUI and tested the real Claude Code flow against the local proxy
- Confirmed the `gpt-5.4` Claude Code scenario no longer failed due to missing `max_tokens`

### PR branch update

- Updated fork branch: `kylef/max-tokens-compat`
- Original compatibility fix commit: `e8428d5`
- Review follow-up commit: `2bca804`
- The upstream PR now includes the narrowed contract and the stronger regression coverage

### Outstanding follow-up

After the upstream PR is merged:

1. Change `.gitmodules` back to `https://github.com/Jer-y/copilot-proxy.git`
2. Point the `copilot-proxy` submodule at the upstream merged commit instead of the fork commit
3. Sync submodule config and verify fresh clone/submodule init still works

## 2026-03-08 — upstream 0.3.1 prerelease check

### Summary

This round validated the published npm package `@jer-y/copilot-proxy@0.3.1` through an isolated GUI-based test environment to determine whether the upstream release had already fixed the Claude Code + `gpt-5.4` + missing `max_tokens` issue.

### What was checked

- Verified npm metadata for `@jer-y/copilot-proxy@0.3.1`
- Downloaded and unpacked the published npm tarball
- Inspected the shipped `dist/main.js` build for Anthropic schema and routing behavior
- Created an isolated GUI worktree and injected the published `0.3.1` proxy build into its `build/` directory
- Launched the GUI from the isolated worktree and tested the real Claude Code flow

### Result

The published `0.3.1` package still fails the target scenario.

- Anthropic `/v1/messages` validation still requires `max_tokens`
- The package still throws `Request validation failed: max_tokens: Invalid input: expected number, received undefined`
- Therefore the upstream `0.3.1` release does not contain the local compatibility fix for missing `max_tokens`

### Decision

- Do not create a prerelease based on upstream `0.3.1`
- Keep using the current fork-based fix in the GUI for now
- Wait for the upstream PR to be merged before switching the submodule back to upstream

## 2026-03-11 — upstream PR lint fix

### Summary

Addressed the final review blocker on the upstream PR: an unused `init` parameter in the test mock that caused `bun run lint` to fail.

### Changes applied

- Removed unused `init?: RequestInit` parameter from `fetchMock` in `tests/messages-error.test.ts`
- Pushed lint-fix commit `f84933c` to the PR source branch
- Posted Chinese PR comment requesting re-review

## 2026-03-12 — upstream PR merged & submodule restored

### Summary

The upstream author (Jer-y) merged PR #2 into `Jer-y/copilot-proxy` main. The GUI repo submodule has been restored to point at the official upstream.

### Merge details

- PR: `Jer-y/copilot-proxy#2`
- Merge commit: `b162b63f40a9f61a37c36cc6315b7a85820e2919`
- Merged by: Jer-y
- Merged at: 2026-03-12T03:20:38Z

### Submodule restoration

- `.gitmodules` URL changed back from `kylefu8/copilot-proxy.git` to `Jer-y/copilot-proxy.git`
- Submodule pointer updated from fork commit `e8428d5` to upstream merge commit `b162b63`
- Ran `git submodule sync` to propagate the URL change
- Committed as `647f04e`

### Follow-up completed

All three items from the v0.2.9 follow-up list are now resolved:

1. ✅ `.gitmodules` restored to upstream URL
2. ✅ Submodule pointed at official upstream merged commit
3. ✅ Submodule config synced

## 2026-03-12 — v0.3.0 release

### Summary

This release integrates the upstream-merged compatibility fix, adds UX refinements, and fixes Windows window height issues.

### Upstream sync

- Upstream PR `Jer-y/copilot-proxy#2` merged by Jer-y on 2026-03-12
- `.gitmodules` restored to upstream `Jer-y/copilot-proxy.git`
- Submodule now points at upstream merge commit `b162b63` (ahead of upstream `v0.3.1`)

### New features

- Auto-refresh usage data on first panel expand after app launch (subsequent expands require manual refresh)
- About page logo replaced from 🚀 emoji to the actual app icon

### Window height optimization

- Fixed excessive bottom whitespace on Windows: `resizeWindow` now compensates for title bar / border frame dimensions
- Platform-specific CSS padding: Windows gets `10px`, macOS keeps `30px`
- Applied to Main view, Settings page, and About page

### Reference release

- GUI release: `v0.3.0`
- Embedded proxy: upstream `main` @ `b162b63` (post-`v0.3.1`)

## 2026-03-12 — v0.3.1 hotfix

### Summary

Hotfix for macOS window height regression introduced in v0.3.0 and CI workflow fixes.

### macOS fix

- The `resizeWindow` frame compensation added for Windows also affected macOS, making the window taller than intended
- Fixed by skipping frame compensation on macOS (`process.platform === 'darwin'`), where `useContentSize: true` already handles it correctly

### CI fixes

- `create-release` job now checks if the release already exists before creating
- Replaced `softprops/action-gh-release` upload steps with `gh release upload --clobber` to avoid "Finalizing release" failures

### Reference release

- GUI release: `v0.3.1`
- Embedded proxy: upstream `main` @ `b162b63` (post-`v0.3.1`)

## 2026-03-16 — v0.3.2 conversation recording

### Summary

New feature: conversation recording with a built-in conversation viewer. Records full request/response content flowing through the proxy to local JSON files, with session tracking, client identification, and a dedicated viewer window.

### Conversation recording

- New `conversation-log.ts` utility in proxy emits `[CONV]` structured lines to stdout
- Hooks in all 3 route handlers: chat-completions, messages, responses
- Supports both non-streaming and streaming (assembled after stream ends)
- Client detection: Claude Code, Cursor, Continue, Cline, generic OpenAI/Anthropic
- Session tracking by (clientType + model) with 15-min timeout heuristic
- Electron intercepts `[CONV]` lines, stores per-session JSON files in `{userData}/conversations/`
- Controlled by `conversationLog` config toggle (default off, requires service restart)
- `COPILOT_PROXY_CONVERSATION_LOG=1` env var passed to proxy child process

### Conversation viewer

- Dedicated Electron window with sidebar (sessions) + main area (messages)
- Sessions grouped by date (Today / Yesterday / date)
- Content search with debounce, text highlighting, and auto-scroll to first match
- Multi-select sessions with checkbox + batch delete
- Clear all button
- Full i18n (Chinese/English) with real-time language switching
- Theme sync: follows app theme changes in real-time
- Real-time: new conversations pushed to open viewer via IPC

### UI polish

- Header button order: theme, lang, conversations, logs, settings, about
- Recording toggle moved to Settings page (Service Config section)
- Settings checkbox alignment fix

### Reference release

- GUI release: `v0.3.2`
- Embedded proxy: upstream `main` @ `b162b63` (post-`v0.3.1`)

## 2026-03-17 — v0.3.3 middleware refactor

### Summary

Refactored conversation recording from handler-level hooks to a single Hono middleware. This eliminates upstream merge conflicts when handler code changes, reducing fork maintenance from 4 modified files to 2 (1 new file + 2 lines in server.ts).

### Architecture change

- Replaced `conversation-log.ts` + 3 handler hooks with `conversation-middleware.ts`
- Middleware intercepts requests/responses at the Hono layer, before/after handlers
- Non-streaming: clones response and reads JSON
- Streaming: uses `ReadableStream.tee()` to observe SSE chunks without affecting client delivery
- Only `server.ts` modified (+2 lines: import + use), zero handler changes

### Why

- v0.3.2 handler hooks conflicted with upstream updates to the same files
- Middleware approach means upstream can freely change handlers without affecting our conversation recording
- Evaluated and rejected log-parsing approach (upstream logs truncate payloads to 400 chars, no full content)

### Reference release

- GUI release: `v0.3.3`
- Embedded proxy: fork `conv-middleware` branch based on upstream `b162b63`

## 2026-03-18 — v0.3.4 upstream upgrade to v0.4.1

### Summary

Upgraded embedded copilot-proxy from upstream v0.3.1 base (b162b63) to upstream v0.4.1 (29ab862). Conversation recording middleware cherry-picked cleanly onto the new base with zero conflicts.

### Upstream changes included

- `8b6b998` feat: add upstream HTTP resilience controls with Copilot timeout defaults and SSE keepalive
- `55c1bb6` fix: improve Anthropic Messages protocol compatibility
- `cb71c60` fix: tighten Anthropic protocol compat and close review follow-ups
- `e97d5f8` fix: propagate JSONResponseError in count_tokens instead of swallowing it

### Our middleware

- Cherry-picked `conversation-middleware.ts` + `server.ts` 2 lines from `conv-middleware` branch onto v0.4.1 base
- Zero conflicts — server.ts structure unchanged between v0.3.1 and v0.4.1
- Fork branch: `conv-middleware-v041` (614e530)

### Reference release

- GUI release: `v0.3.4`
- Embedded proxy: fork `conv-middleware-v041` based on upstream v0.4.1 (29ab862)

## 2026-03-18 — v0.3.5 bugfixes

### Summary

Fixed two platform-specific bugs on macOS: Claude Code CLI detection failure caused by nvm/npm_config_prefix conflict, and missing default-model conversations in the conversation viewer due to stdout line splitting across pipe buffer boundaries.

### Claude Code detection fix

- Root cause: Electron inherits `npm_config_prefix` from npm when launched in dev mode; nvm refuses to initialize when this variable is set, so the interactive login shell fails to add nvm-managed paths to PATH
- Symptom: `claude --version` exits with code 127, GUI shows "Claude Code not installed"
- Fix: strip `npm_config_prefix` from the environment passed to the detection shell spawn
- Also affects packaged builds when `npm_config_prefix` is set system-wide

### Conversation recording fix

- Root cause: `stdout.on('data')` chunks are not guaranteed to align with line boundaries; macOS pipe buffer (~16KB) splits large `[CONV]` JSON lines across multiple chunks
- Symptom: default-model conversations (longer responses → larger JSON) fail `JSON.parse()` because the line is split; fast-model conversations (shorter) fit in one chunk and work fine
- Fix: introduced `stdoutLineBuffer` to accumulate partial lines across chunks, splitting only on complete `\n` boundaries
- Also flushes remaining buffer on process exit to avoid losing the last entry
- Windows unaffected: pipe buffering behavior differs, but the fix is safe on all platforms

### Reference release

- GUI release: `v0.3.5`
- Embedded proxy: fork `conv-middleware-v041` based on upstream v0.4.1 (29ab862)

## 2026-04-06 — v0.3.7 auto 1M context window for Claude Code

### Summary

Auto-detect 1M context window models and append `[1m]` suffix to Claude Code environment variables. This enables Claude Code to use the full 1M context window when the selected model supports it, instead of defaulting to 200K. Also enhanced model dropdowns to show context window size, added `ANTHROPIC_DEFAULT_OPUS_MODEL` support, and kept the `--dangerously-skip-permissions` feature with two-stage safety confirmation.

### 1M context window support

- When a Claude model with `max_context_window_tokens >= 1000000` is selected, automatically append `[1m]` suffix to `ANTHROPIC_MODEL`, `ANTHROPIC_DEFAULT_OPUS_MODEL`, and `ANTHROPIC_DEFAULT_SONNET_MODEL`
- Claude Code recognizes this suffix to enable 1M context mode and strips it before sending API requests
- Only applies to Claude models (`/^claude/i`); non-Claude models (GPT, Gemini, etc.) never get the suffix
- Green hint displayed below model selector when 1M context is detected

### Enhanced model dropdowns

- Both default model and fast model dropdowns now show context window size in parentheses, e.g. `claude-opus-4.6-1m (1M)`, `gpt-5.4 (400K)`
- Helper function `formatContextWindow()` converts token counts to human-readable format (K/M)

### Added ANTHROPIC_DEFAULT_OPUS_MODEL

- Previously missing from env vars; now written alongside `ANTHROPIC_MODEL` and `ANTHROPIC_DEFAULT_SONNET_MODEL`
- Ensures Claude Code `/model opus` and `opusplan` aliases also route through the proxy
- Added to `CLAUDE_ENV_KEYS` for cleanup on "clear config"

### Auto-sync improvement

- Auto-sync now includes `models` in its dependency array, so when model data loads after initial render, the context window info is re-synced to `~/.claude/settings.json`

### Skip-permissions feature (kept)

- `--dangerously-skip-permissions` option with two-stage safety confirmation: settings toggle + launch-time danger dialog
- `DangerConfirmDialog` component reused across settings page and main view

### Cleanup

- `CLAUDE_CODE_AUTO_COMPACT_WINDOW` kept in `CLAUDE_ENV_KEYS` for cleanup of legacy entries (no longer written)

### Files changed

- `electron/main.cjs` — `[1m]` suffix logic in `writeClaudeEnv` + `launchClaudeCode`, added `ANTHROPIC_DEFAULT_OPUS_MODEL`, `skipPermissions` support
- `src/core/service-manager.js` — updated function signatures with `contextWindow` + `skipPermissions` params
- `src/features/main/MainView.jsx` — context window display in dropdowns, green hint, DangerConfirmDialog for skip-permissions launch
- `src/App.jsx` — auto-sync with context window + models dependency
- `src/core/i18n.jsx` — added `model.largeContext`, danger dialog keys
- `src/core/config-store.js` — `skipPermissions` in default config
- `src/features/settings/SettingsPage.jsx` — skip-permissions checkbox with danger confirmation
- `src/features/main/DangerConfirmDialog.jsx` — reusable danger confirmation dialog
- `src/styles.css` — danger dialog CSS

### Reference release

- GUI release: `v0.3.7`
- Embedded proxy: fork `conv-middleware-v042` based on upstream v0.4.2
