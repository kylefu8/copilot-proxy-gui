# Copilot Proxy v0.9.3 Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebase the local conversation-recording proxy fork onto Jer-y `v0.9.3`, align the GUI to `0.9.3`, validate every release gate, and publish the three-platform GitHub Release without intermediate GUI versions.

**Architecture:** Create `conv-middleware-v093` from the formal upstream tag and replay the three existing middleware commits so the fork remains a two-file delta. The parent GUI keeps its current Electron 41, Node 24, `GH_TOKEN`, Host allowlist, bundle, updater, and conversation-viewer architecture; only the submodule pointer, version metadata, release documentation, and generated release artifacts change unless a failing compatibility test proves a minimal code fix is required.

**Tech Stack:** Git submodules, Bun 1.3.10, TypeScript 6, Node.js 24/25, Electron 41.10.1, React 18, Vite 5, esbuild, electron-builder, GitHub CLI/Actions.

## Global Constraints

- Upstream base must be the formal `v0.9.3` tag; do not use an untagged main commit.
- GUI version and release tag must be exactly `0.9.3`; do not publish GUI `0.9.1` or `0.9.2`.
- Preserve conversation recording and keep the proxy fork delta limited to `src/lib/conversation-middleware.ts` and `src/server.ts`.
- Preserve the GUI `GH_TOKEN` startup path, loopback Host allowlist merge, Electron `41.10.1`, Node 24 bundle target, updater, and new icon.
- Preserve `CLAUDE.md` and `.claude/settings.local.json`; never stage or commit them.
- If a nonmechanical compatibility change is needed, write and observe a failing focused test before changing production code.
- Do not tag or publish while any required proxy build/typecheck, GUI test/build/bundle, desktop packaging, or process smoke gate is failing.
- Record Bun Windows hangs, crashes, or dependency limitations as bounded non-pass results; never call an interrupted command successful.

---

### Task 1: Rebase the Proxy Fork onto Upstream v0.9.3

**Files:**
- Modify: `copilot-proxy` submodule checkout and branch refs
- Verify: `copilot-proxy/src/lib/conversation-middleware.ts`
- Verify: `copilot-proxy/src/server.ts`

**Interfaces:**
- Consumes: upstream tag `v0.9.3`; local commits `420c39e`, `529380e`, and `0c813dd`
- Produces: remote branch `origin/conv-middleware-v093` and a clean submodule HEAD usable by the parent pointer

- [ ] **Step 1: Fetch the formal upstream tag and verify the target commit**

Run:

```powershell
git -C copilot-proxy fetch https://github.com/Jer-y/copilot-proxy.git refs/tags/v0.9.3:refs/tags/v0.9.3
git -C copilot-proxy show -s --format='%H %s' v0.9.3^{}
```

Expected: tag `v0.9.3` resolves to the upstream release commit whose subject is `release: v0.9.3`.

- [ ] **Step 2: Create the versioned fork branch and replay local middleware commits**

Run:

```powershell
git -C copilot-proxy switch -c conv-middleware-v093 v0.9.3
git -C copilot-proxy cherry-pick 420c39e 529380e 0c813dd
```

If `src/server.ts` conflicts, preserve upstream route and middleware ordering, add `conversationMiddleware` through the current `~/lib/conversation-middleware` import, register it immediately after `new Hono()`, stage only the resolved files, and continue the cherry-pick.

- [ ] **Step 3: Verify the fork remains a two-file delta**

Run:

```powershell
git -C copilot-proxy diff --name-status v0.9.3..HEAD
git -C copilot-proxy diff --stat v0.9.3..HEAD
git -C copilot-proxy diff --check
```

Expected names:

```text
A src/lib/conversation-middleware.ts
M src/server.ts
```

- [ ] **Step 4: Refresh proxy dependencies without lifecycle hooks**

Run:

```powershell
bun --cwd copilot-proxy install --frozen-lockfile --ignore-scripts
```

Expected: required `v0.9.3` dependencies install and tracked `package.json`/`bun.lock` remain unchanged.

- [ ] **Step 5: Run core proxy regressions**

Run:

```powershell
Push-Location copilot-proxy
bun test `
  tests/model-config.test.ts `
  tests/routing-policy.test.ts `
  tests/models-route.test.ts `
  tests/messages-routing.test.ts `
  tests/messages-request-adaptation.test.ts `
  tests/github-token-argv.test.ts `
  tests/server-setup.test.ts `
  tests/cors.test.ts `
  tests/health-routes.test.ts `
  tests/responses-websocket.test.ts `
  tests/responses-websocket-upgrade.test.ts `
  tests/responses-websocket-upstream.test.ts
Pop-Location
```

Expected: all selected tests pass with zero failures.

- [ ] **Step 6: Run v0.9.1-v0.9.3 feature regressions**

Run the exact existing files discovered under `copilot-proxy/tests` for:

```powershell
Push-Location copilot-proxy
bun test `
  tests/setup.test.ts `
  tests/client-setup.test.ts `
  tests/doctor.test.ts `
  tests/models-command.test.ts `
  tests/product-capabilities.test.ts `
  tests/model-normalization.test.ts `
  tests/messages-sse-writer.test.ts `
  tests/package-documentation.test.ts
Pop-Location
```

Expected: setup/doctor/client profiles, Claude Opus 5/model normalization, SSE keepalive, and packaged documentation tests pass.

- [ ] **Step 7: Run proxy build and typecheck serially**

Run:

```powershell
Push-Location copilot-proxy
bun run build
if ($LASTEXITCODE -ne 0) { throw 'proxy build failed' }
bun run typecheck
Pop-Location
```

Expected: both commands exit 0. Do not run them concurrently because `tsdown` cleans `dist` while TypeScript scans it.

- [ ] **Step 8: Attempt lint and broader test coverage with bounded reporting**

Run:

```powershell
bun --cwd copilot-proxy run lint
bun --cwd copilot-proxy test
```

If Bun 1.3.10 reproduces the known missing nested `acorn`, panic, or sustained high-CPU behavior, stop only the newly started process, record the exact boundary, and rely only on completed focused tests for pass counts.

- [ ] **Step 9: Push the verified fork branch**

Run:

```powershell
git -C copilot-proxy push -u origin conv-middleware-v093
git -C copilot-proxy status --short --branch
```

Expected: local and remote branch point to the same clean commit.

---

### Task 2: Align GUI Version and Release Documentation

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `RELEASE_NOTES.md`
- Modify: `RELEASE_NOTES_TEMP.md`
- Modify: `DEVLOG.md`
- Modify only if stale: `README.md`

**Interfaces:**
- Consumes: verified `conv-middleware-v093` HEAD and completed Task 1 validation evidence
- Produces: parent working tree ready for `v0.9.3` build and release commit

- [ ] **Step 1: Update package versions mechanically**

Run:

```powershell
npm.cmd version 0.9.3 --no-git-tag-version
```

Then update `package.json` so both fields are exact:

```json
"version": "0.9.3",
"releaseVersion": "0.9.3"
```

- [ ] **Step 2: Add the permanent v0.9.3 release note**

Prepend a `# v0.9.3` section to `RELEASE_NOTES.md` covering:

- Upstream `v0.9.1` setup, models, doctor, diagnostics, profiles, and service hardening.
- Upstream `v0.9.2` Claude Opus 5, Claude Code 1M selector, Hono, dependency, and protocol-fidelity changes.
- Upstream `v0.9.3` Anthropic idle-SSE keepalive.
- Preserved conversation recording, `GH_TOKEN`, Host allowlist, Electron 41, and Node 24 behavior.
- Asset names for Windows setup/portable and macOS arm64/x64.
- Changelog link `v0.9.0...v0.9.3`.

- [ ] **Step 3: Replace the temporary GitHub Release body**

Make `RELEASE_NOTES_TEMP.md` contain the same user-facing content as the new permanent section, without the `# v0.9.3` history heading.

- [ ] **Step 4: Add the dated development log entry**

Add a `2026-07-25 - v0.9.3 upstream sync` entry containing:

- Upstream and local commit IDs.
- The final two-file submodule delta.
- Exact completed test counts and explicit non-pass boundaries copied from the completed Task 1 and Task 3 command outputs.
- Proxy build/typecheck results from Task 1 and GUI build/bundle/package/smoke results from Task 3, copied only after those commands complete.

- [ ] **Step 5: Check current documentation for stale claims**

Run:

```powershell
git grep -n -I -E "v0\.9\.0|Electron 33|Node 20|conv-middleware-v090" -- '*.md'
```

Update only current-version statements. Preserve dated history and prior release sections.

---

### Task 3: Validate and Package GUI v0.9.3

**Files:**
- Verify: `electron/main.cjs`
- Verify: `electron/proxy-launch.cjs`
- Verify: `electron/proxy-launch.test.cjs`
- Generate ignored artifacts: `build/*`, `dist/*`, `release/*`

**Interfaces:**
- Consumes: parent version `0.9.3` and verified proxy submodule
- Produces: locally verified Windows release artifacts and manifest evidence

- [ ] **Step 1: Run Electron syntax and launch regressions**

Run:

```powershell
node --check electron/main.cjs
node --check electron/proxy-launch.cjs
npm.cmd run test:electron
```

Expected: syntax checks exit 0 and all existing launch tests pass.

- [ ] **Step 2: Build the frontend and proxy bundle**

Run:

```powershell
npm.cmd run build
node scripts/bundle-proxy.cjs
```

Expected: both exit 0.

- [ ] **Step 3: Verify bundle feature markers**

Run fixed-string searches against `build/copilot-proxy-bundle.mjs` for:

```text
claude-opus-5
doctor
COPILOT_PROXY_ALLOWED_HOSTS
response.output_text.delta
```

Also require the exact `keepAliveIntervalMs` marker from the upstream Anthropic SSE writer in the bundle.

- [ ] **Step 4: Build Windows desktop artifacts**

Run:

```powershell
npm.cmd run desktop:build
```

Expected artifacts:

```text
release/Copilot Proxy GUI-0.9.3-setup.exe
release/Copilot Proxy GUI-0.9.3-portable.exe
release/update-manifest.json
release/app.asar
release/copilot-proxy-bundle.mjs
```

- [ ] **Step 5: Verify manifest and hashes**

Parse `release/update-manifest.json` and require:

```text
version = 0.9.3
minElectronVersion = 41.0.0
```

Recompute SHA-256 for `app.asar` and the release bundle and compare them with the manifest. Verify setup and portable file versions are `0.9.3`.

- [ ] **Step 6: Run process smokes**

- Launch the packaged GUI with an isolated temporary user-data directory; require the main process to remain alive for at least six seconds.
- Launch the bundled proxy under Electron's Node runtime with an intentionally invalid `GH_TOKEN` and isolated data directory; require `Using provided GitHub token`, no `GitHub token saved securely`, no persisted secret, and progression to Copilot authentication.
- Clean up only the exact verified temporary paths and processes created by these smokes.

- [ ] **Step 7: Final local diff review**

Run:

```powershell
git diff --check
git status --short --untracked-files=all
git diff --stat
git diff --submodule=short -- copilot-proxy
```

Expected: only release-scoped files plus the two known untracked local-only files.

---

### Task 4: Commit, Fast-forward Main, Publish, and Verify GitHub Release

**Files:**
- Commit: parent release-scoped files and submodule pointer
- Preserve: `CLAUDE.md`, `.claude/settings.local.json`

**Interfaces:**
- Consumes: all verified local artifacts and remote `conv-middleware-v093`
- Produces: fast-forwarded parent `main` and latest GitHub Release `v0.9.3` with seven verified assets

- [ ] **Step 1: Stage only release files and commit**

Stage the submodule pointer, package metadata, release notes, devlog, and any current documentation changed by Task 2. Confirm the two local-only files remain untracked.

Run in the isolated worktree:

```powershell
git diff --cached --check
git commit -m "release: v0.9.3"
```

Then fast-forward the primary checkout, whose only worktree entries must still be the two known local-only files:

```powershell
git -C E:\AI\Projects\copilot-proxy-gui status --short --branch --untracked-files=all
git -C E:\AI\Projects\copilot-proxy-gui merge --ff-only codex/copilot-proxy-v093-sync
git -C E:\AI\Projects\copilot-proxy-gui push origin main
```

Expected: primary `main` points to the release commit; no local-only file is staged or changed.

- [ ] **Step 2: Create and push the release tag**

Run in the primary checkout after the fast-forward:

```powershell
git -C E:\AI\Projects\copilot-proxy-gui tag -a v0.9.3 -m "v0.9.3"
git -C E:\AI\Projects\copilot-proxy-gui push origin v0.9.3
```

Expected: tag resolves to the parent release commit.

- [ ] **Step 3: Monitor the release workflow**

Find the `release-gui.yml` run for `v0.9.3` and wait for:

```text
create-release
build-windows
build-macos (x64)
build-macos (arm64)
```

All jobs and upload steps must succeed.

- [ ] **Step 4: Replace and verify the public Release body**

Run:

```powershell
gh release edit v0.9.3 --notes-file RELEASE_NOTES_TEMP.md --latest
gh release view v0.9.3 --json tagName,isDraft,isPrerelease,assets,body,url
```

Require a non-draft, non-prerelease release and the `v0.9.0...v0.9.3` changelog link.

- [ ] **Step 5: Verify remote manifest and repository state**

Download only `update-manifest.json` to a verified temporary directory. Require:

- Version `0.9.3` and minimum Electron `41.0.0`.
- Manifest app/bundle SHA-256 values match the GitHub asset digests.
- Exactly seven uploaded assets.
- `/releases/latest` points to `v0.9.3`.
- Parent `HEAD == origin/main == tag commit`.
- Submodule `HEAD == origin/conv-middleware-v093`.
- Final worktree contains only `.claude/settings.local.json` and `CLAUDE.md` as untracked files.
