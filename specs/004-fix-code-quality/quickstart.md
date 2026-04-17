# Quickstart: Repository Quality Remediation

## Prerequisites

- Node.js >= 18
- pnpm >= 8
- Project dependencies installed (`pnpm install`)
- Database file available at `data/ecommerce.db`

## Validation Flow

1. Run lint checks
2. Run backend regression tests
3. Run full workspace tests
4. Run production build
5. Verify import-data chain

## Commands

```bash
pnpm lint
pnpm --filter backend test:ci
pnpm test
pnpm build
pnpm run import-data
```

## Expected Outcomes

- All commands exit with status code `0`
- No watch-mode command blocks CI
- MCP regression tests for summary correctness and filter behavior pass
- Build artifacts generated under `backend/dist` and `frontend/dist`

## Execution Record

- `pnpm lint` ✅ pass
- `pnpm --filter backend test:ci` ✅ 9 files, 78 tests passed
- `pnpm test` ✅ workspace pass (backend deterministic run)
- `pnpm build` ✅ backend `tsc` + frontend `vite build` pass
- `pnpm run import-data` ✅ completed and verified script chain

## Notes

- Frontend build reports a chunk-size warning for `dist/assets/index-*.js`; this is non-blocking.
- `make test` and root `pnpm test` now run in deterministic non-watch mode by default.
