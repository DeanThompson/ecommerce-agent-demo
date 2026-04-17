# Regression Test Suite

This directory contains cross-cutting regression tests for repository quality.

## Scope

- Script and command consistency (`scriptsConsistency.test.ts`)
- Deterministic non-watch test behavior (`testCommandMode.test.ts`)
- Backend/frontend SSE and logging contract parity (`sseContractParity.test.ts`)
- Session listing behavior consistency after query optimization (`sessionListConsistency.test.ts`)

## Principles

- Assert behavior at contract boundaries.
- Keep tests deterministic and CI-friendly.
- Avoid dependence on manual interaction.
