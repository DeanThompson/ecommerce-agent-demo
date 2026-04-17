<!--
Sync Impact Report
==================
Version change: 0.0.0 → 1.0.0 (MAJOR - initial constitution)
Modified principles: N/A (initial creation)
Added sections:
  - Core Principles (5 principles)
  - Technology Standards
  - Development Workflow
  - Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (compatible - Constitution Check section exists)
  - .specify/templates/spec-template.md ✅ (compatible - requirements structure aligns)
  - .specify/templates/tasks-template.md ✅ (compatible - testing phases align with Testing Discipline)
Follow-up TODOs: None
-->

# E-Commerce Insight Agent Constitution

## Core Principles

### I. Modern Tech Stack

All technology choices MUST prioritize current, well-maintained solutions with strong ecosystem support.

- TypeScript MUST be used for all JavaScript/Node.js code to ensure type safety
- Dependencies MUST be actively maintained (last release within 12 months)
- Framework versions MUST be current stable releases (not alpha/beta/RC)
- Deprecated APIs and patterns MUST NOT be introduced

**Rationale**: Modern tooling reduces technical debt, improves developer experience, and ensures long-term maintainability.

### II. Code Quality Standards

Code MUST meet measurable quality thresholds before merge.

- All code MUST pass linting (ESLint) with zero errors
- All code MUST pass formatting checks (Prettier)
- Functions MUST have single responsibility (max 50 lines recommended)
- Cyclomatic complexity MUST NOT exceed 10 per function
- No `any` types in TypeScript except with explicit justification comment

**Rationale**: Consistent quality standards prevent accumulation of technical debt and maintain codebase health.

### III. Modular Architecture

System components MUST be designed for separation of concerns and reusability.

- Frontend and backend MUST be independently deployable
- Business logic MUST be separated from presentation and data access layers
- Shared types/interfaces MUST be defined in a common location
- Each module MUST have a clear, documented public API
- Circular dependencies between modules are PROHIBITED

**Rationale**: Modular design enables parallel development, easier testing, and component reuse.

### IV. Testing Discipline

Testing MUST be proportional to risk and complexity.

- Critical paths (data queries, API endpoints) MUST have integration tests
- Business logic services SHOULD have unit tests
- Test coverage target: 70% for backend services, 50% for frontend components
- Tests MUST be deterministic (no flaky tests allowed in CI)
- E2E tests are OPTIONAL but recommended for critical user journeys

**Rationale**: Appropriate testing catches regressions without over-engineering test infrastructure.

### V. API-First Design

All service interfaces MUST be designed contract-first.

- API contracts MUST be defined before implementation
- MCP tools MUST have complete input/output schemas
- REST endpoints MUST follow OpenAPI specification
- Breaking changes MUST be versioned and documented
- Error responses MUST follow consistent structure

**Rationale**: Contract-first design enables parallel frontend/backend development and clear integration points.

## Technology Standards

### Required Stack

| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| Language | TypeScript | 5.x | Strict mode enabled |
| Frontend | React | 18.x | Functional components only |
| UI Library | Ant Design | 5.x | Enterprise-grade components |
| Charts | ECharts | 5.x | Data visualization |
| State | Zustand | 4.x | Lightweight state management |
| Backend | Express | 4.x | Node.js web framework |
| Database | SQLite | 3.x | Embedded database |
| Build | Vite | 5.x | Fast development builds |
| Package Manager | pnpm | 8.x | Workspace support |

### Code Organization

- Monorepo structure with `frontend/` and `backend/` directories
- Shared types in root-level `types/` or package
- Configuration files at repository root
- Documentation in `docs/` directory

## Development Workflow

### Branch Strategy

- Feature branches MUST follow pattern: `###-feature-name`
- All changes MUST go through pull request review
- Direct commits to main branch are PROHIBITED

### Commit Standards

- Commits MUST follow Conventional Commits format
- Commit messages MUST be descriptive (not "fix bug" or "update")
- Each commit SHOULD represent a logical unit of work

### Review Requirements

- Code reviews MUST verify constitution compliance
- Reviews MUST check for security vulnerabilities (OWASP Top 10)
- Performance implications MUST be considered for data-heavy operations

## Governance

### Amendment Process

1. Propose change with rationale in pull request
2. Document impact on existing code
3. Update version following semantic versioning
4. Propagate changes to dependent templates

### Compliance

- All PRs MUST pass constitution check before merge
- Violations MUST be documented with justification if unavoidable
- Quarterly review of constitution relevance recommended

### Versioning Policy

- MAJOR: Principle removal or incompatible redefinition
- MINOR: New principle or significant guidance expansion
- PATCH: Clarifications, typo fixes, non-semantic changes

**Version**: 1.0.0 | **Ratified**: 2026-02-05 | **Last Amended**: 2026-02-05
