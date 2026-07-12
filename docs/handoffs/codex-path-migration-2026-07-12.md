# Codex path migration handoff

## Identity

- Old path: `E:\SynologyDrive\AI\Projects\copilot-proxy-gui`
- New path: `E:\AI\Projects\copilot-proxy-gui`
- Primary thread: `019e573b-95c4-7b71-85f2-84d7b66e0e83`; title `查看项目类型`; updated `2026-07-10T02:06:47Z`
- Archived cwd-related thread: `019e5d36-cc65-7aa1-955b-d6484a570e6f`; title `帮我查一下为什么本机做 github.com的解析会失败，我在路由器上做就是好的`; updated `2026-06-14T02:36:24Z`
- Windows continuation thread: `019f5612-c73d-7960-a527-43852cbed649`
- Continuation created: `2026-07-12`
- Parent HEAD: `4f21719d0bf59786bf5221e6a773ec761d3bdd28`
- Submodule HEAD: `c71afbfaf901323a50e2675bc2298c7f2d97a9f7`
- Latest release: `v0.7.15-3`

The new working copy was cloned recursively from GitHub. The Synology source remains in place and unchanged.

## Preserved local-only files

These two parent-repository files were copied byte-for-byte after a filename-only sensitive-field scan returned no matches:

- `CLAUDE.md`
- `.claude/settings.local.json`

They remain local-only and are not part of the migration documentation commit.

## Excluded historical submodule leftovers

The old submodule worktree contained these 17 untracked paths:

- `src/lib/api-probe.ts`
- `src/lib/backend-plan.ts`
- `src/lib/translation/cc-responses-stream.ts`
- `src/lib/translation/cc-to-responses.ts`
- `src/lib/translation/responses-to-cc.ts`
- `src/routes/messages/anthropic-types.ts`
- `src/routes/messages/chat-completions-buffer.ts`
- `src/routes/messages/non-stream-translation.ts`
- `src/routes/messages/stream-translation.ts`
- `src/routes/messages/utils.ts`
- `tests/anthropic-request.test.ts`
- `tests/anthropic-response.test.ts`
- `tests/api-probe.test.ts`
- `tests/backend-plan.test.ts`
- `tests/stream-translation-error.test.ts`
- `tests/translation-cc-responses.test.ts`
- `tests/variant-routing.test.ts`

All 17 working-file content blobs were verified byte-for-byte in reachable Git history. They are historical leftovers rather than unique development and were intentionally not copied into the new submodule worktree.

## Generated output

Dependency and generated directories such as `node_modules`, `build`, `dist`, and `release` were intentionally not copied.

On Windows with Bun 1.3.10, `bun install --frozen-lockfile` installed most packages but exited nonzero while enqueueing the `simple-git-hooks` lifecycle script with `ENOENT`. The approved `--ignore-scripts` fallback reached the same Bun lifecycle error. The lockfile and tracked worktree remained unchanged.

Validation completed with these explicit boundaries:

- Five focused, current migration/release-relevant test files passed 97 tests with 0 failures.
- The full `bun test` run was aborted after about 9.5 minutes of sustained high CPU and therefore has no pass result.
- The standalone proxy `bun run build` remains blocked by the Bun 1.3.10 Windows lifecycle failure and resulting incomplete dependency tree; `tsdown` could not load `semver/ranges/min-version.js`.
- The official GUI esbuild path, `node scripts/bundle-proxy.cjs`, passed and produced the proxy bundle.
- The GUI Vite build and official Windows desktop packaging passed. The generated setup, portable executable, and update manifest report version `0.7.15-3`.
- Both the build and release proxy bundles contain `gpt-5.6`.
