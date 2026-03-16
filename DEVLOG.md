# Development Log

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
