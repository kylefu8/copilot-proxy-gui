# Repository guidance

- `copilot-proxy` is a Git submodule. Make and verify proxy changes in that repository, then update the parent repository's submodule pointer deliberately.
- Keep GUI hotfix releases on the upstream base version and add a local `-N` suffix, for example `0.7.15-3`.
- A concrete upstream pull-request commit is an acceptable release input before an upstream tag exists, provided the sync is validated locally before release.
- Preserve unrelated local-only files. Do not delete, reset, clean, stage, or commit them as part of another task.
- Keep changes scoped to the requested work and run the relevant proxy tests, proxy build, GUI build, and packaging checks before release changes are pushed.
