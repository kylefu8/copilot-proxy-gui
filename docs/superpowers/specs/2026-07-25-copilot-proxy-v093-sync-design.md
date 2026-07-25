# Copilot Proxy v0.9.3 Sync Design

## Context

The GUI currently releases `v0.9.0` and embeds the fork branch `conv-middleware-v090`. Jer-y has published `copilot-proxy v0.9.3`, which cumulatively adds the `v0.9.1` setup/diagnostics/service hardening work, Claude Opus 5 support and dependency fixes from `v0.9.2`, and the Anthropic idle-SSE keepalive fix from `v0.9.3`.

The intended product still includes local conversation recording. The only source delta inside the proxy submodule is `src/lib/conversation-middleware.ts` plus its registration in `src/server.ts`.

## Goals

- Base the embedded proxy on the formal upstream `v0.9.3` tag.
- Preserve conversation recording without expanding the proxy fork beyond its current two-file boundary.
- Preserve the GUI's `GH_TOKEN` startup integration and local Host allowlist behavior.
- Align the GUI release version directly to `0.9.3`; do not publish `0.9.1` or `0.9.2` GUI releases.
- Validate the proxy, GUI bundle, Windows package, and GitHub release assets before treating the release as complete.

## Non-goals

- Do not remove or redesign conversation recording.
- Do not expose upstream `setup`, `models`, `doctor`, or diagnostics as new GUI pages in this release.
- Do not refactor unrelated Electron, React, update, tray, theme, or Claude Code code.
- Do not delete or modify the local-only `CLAUDE.md` and `.claude/settings.local.json` files.
- Do not recreate the retired `v0.8.x` GitHub Releases.

## Submodule Architecture

Create `conv-middleware-v093` from upstream tag `v0.9.3`. Replay these existing local commits in order:

1. `420c39e` - conversation recording middleware.
2. `529380e` - clone the raw request before reading its body.
3. `0c813dd` - align the middleware import with the upstream source layout.

If `src/server.ts` conflicts, preserve the complete upstream `v0.9.3` middleware and route ordering, then add only the conversation middleware import and `server.use(conversationMiddleware)` registration immediately after server creation. Do not modify upstream handlers or the new setup/diagnostics implementation.

The resulting branch must differ from upstream only in:

- `src/lib/conversation-middleware.ts`
- `src/server.ts`

Push `conv-middleware-v093` to `kylefu8/copilot-proxy` before committing the parent submodule pointer so clean CI clones can resolve the commit.

## GUI Integration

Update `package.json` and `package-lock.json` from `0.9.0` to `0.9.3`. Keep Electron `41.10.1`, Node 24 bundle targeting, `electron/proxy-launch.cjs`, and its tests unchanged unless upstream integration proves an exact compatibility defect.

The long-running proxy child must continue to satisfy these invariants:

- No `-g` or `--github-token` argument is retained.
- The encrypted GUI token is supplied through `GH_TOKEN`.
- `COPILOT_PROXY_ALLOWED_HOSTS` preserves user entries and includes `localhost`, `127.0.0.1`, and `::1`.
- Conversation logging is enabled only when the existing GUI setting requests it.

## Documentation and Release Notes

Add a `v0.9.3` entry to `RELEASE_NOTES.md` and replace `RELEASE_NOTES_TEMP.md` with the matching GitHub Release body. The public changelog range is `v0.9.0...v0.9.3` and should summarize:

- Guided setup, model inspection, doctor diagnostics, generated client profiles, and service hardening from `v0.9.1`.
- Claude Opus 5, Claude Code 1M selector compatibility, Hono/dependency updates, and protocol fidelity from `v0.9.2`.
- Anthropic idle-SSE keepalive from `v0.9.3`.
- Preservation of local conversation recording and existing GUI token/Host compatibility.

Add a dated `DEVLOG.md` entry with the exact upstream/local commits, validation results, and any bounded local test limitations. Update README only if a current-version or feature statement becomes inaccurate; historical entries remain unchanged.

## Validation

### Proxy gates

- Confirm the submodule diff against upstream `v0.9.3` is limited to the two intended files.
- Run the existing model, routing, Messages adaptation, token/Host, health, and Responses WebSocket focused tests.
- Run focused tests for the new setup, doctor, client profile, model command/normalization, Claude Opus 5, and Messages SSE keepalive surfaces.
- Run `bun run build` followed by `bun run typecheck` serially.
- Attempt lint and broader tests; report Bun 1.3.10 Windows dependency or high-CPU limitations explicitly rather than treating an interrupted run as passing.

### GUI gates

- Run Node syntax checks for Electron main/helper files.
- Run `npm.cmd run test:electron`.
- Run the Vite build and `node scripts/bundle-proxy.cjs`.
- Confirm the generated bundle contains the `v0.9.3` feature markers for Claude Opus 5, setup/doctor support, and SSE keepalive behavior.
- Run `npm.cmd run desktop:build` and verify manifest, app.asar, and proxy-bundle hashes.
- Smoke-launch the packaged GUI and verify the proxy environment-token path does not trigger persist-and-exit behavior.

### Release gates

- Commit and push the proxy fork branch before the parent repository.
- Commit and push the parent `main`, create tag `v0.9.3`, and wait for Windows, macOS x64, and macOS arm64 jobs.
- Replace the generated GitHub Release body with `RELEASE_NOTES_TEMP.md`.
- Verify seven uploaded assets, latest-release selection, remote manifest version `0.9.3`, and app/bundle digest parity.
- Confirm the final worktree contains only the two known local-only files.

## Failure Handling

- Stop before parent version changes if the middleware cannot be isolated to the two intended proxy files.
- Do not push a parent submodule pointer until the fork commit exists remotely.
- Do not create the release tag if proxy build/typecheck, GUI build, bundle, packaging, or regression tests fail.
- If GitHub Actions fails, inspect and fix the failing job before editing the Release body or claiming publication.

## Success Criteria

The work is complete when GUI `v0.9.3` is the latest non-draft GitHub Release, all three platform jobs pass, seven assets are present with a verified `0.9.3` manifest, the proxy fork remains a two-file delta from upstream, conversation recording and GUI startup compatibility remain intact, and no unrelated local files are staged or committed.
