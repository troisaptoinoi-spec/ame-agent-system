# Code Mode Standards

## Before Writing Code

1. Read existing files in target directory
2. Check project config (package.json, tsconfig.json, .eslintrc, etc.)
3. Identify testing framework and conventions
4. Understand error handling patterns

## Code Quality

- Handle errors explicitly. Never silently swallow exceptions
- Use type annotations where supported
- Validate all external inputs
- Use parameterized queries for database operations
- Follow RESTful conventions for APIs
- Ensure accessibility for frontend code

## SOLID Principles

- **S:** One reason to change per function/class
- **O:** Open for extension, closed for modification
- **L:** Subtypes substitutable for base types
- **I:** Small, focused interfaces
- **D:** Depend on abstractions, not concretions

## Refactoring

- Refactor when: duplicated code, long functions, unclear naming, high complexity
- Refactor BEFORE adding features to messy code (Boy Scout Rule)
- One change at a time, tests pass after each step
- Never refactor and change behavior simultaneously

## Naming Conventions

- Variables: camelCase (JS/TS), snake_case (Python)
- Functions: verb + noun (getUserData, calculateTotal)
- Classes: PascalCase (UserService, DatabaseConnection)
- Constants: UPPER_SNAKE_CASE (MAX_RETRY_COUNT)
- Boolean: is/has/can/should prefix
- Files: kebab-case (user-service.ts)

## Change Management

- Prefer apply_diff over write_to_file
- Minimal, targeted changes
- Preserve existing patterns unless clear reason to change
- Update related tests when changing functionality

## Auto-Execute Workflow

Execute automatically without asking confirmation:

1. **Read:** All relevant files without asking permission
2. **Analyze:** Understand codebase and requirements
3. **Implement:** Write code following conventions
4. **Test:** Run existing tests after each change
5. **Fix:** If tests fail, fix immediately (up to 3 attempts)
6. **Verify:** Confirm build succeeds
7. **Commit:** Stage, write descriptive message, commit
8. **Push:** Push to remote if configured
9. **Report:** List files changed, tests run, commit hash

## Auto-Commit & Push

After implementation and verification:

1. Check git status
2. If no repo: git init, initial commit
3. Stage all: git add -A
4. Commit with Conventional Commits: feat/fix/refactor/test/docs/chore
5. Check remote: git remote -v
6. If remote: git push
7. If no remote: report "No remote, saved locally"
8. Report commit hash and push status

## Error Recovery

1. Read full error message and stack trace
2. Identify root cause
3. Apply fix and retry
4. If first fix fails, try alternative
5. After 3 failed attempts, report to user
6. Never stop for errors you can diagnose and fix

## Continuous Execution

- Execute all steps without pausing for confirmation
- Do not ask "Should I proceed?" - always proceed
- Do not ask "Is this correct?" - verify with tests
- Do not summarize before doing - just do it
- Report results after completion

## Destructive Command Safety

Before destructive commands, verify:

- rm-rf → correct path, not system directory
- DROP TABLE → correct database, have backup
- git push --force → correct branch, no shared work
- npm publish → correct package, version, registry
  For these ONLY: add brief warning before executing.

## After Implementation

- Verify build succeeds
- Run existing tests
- Suggest additional tests if coverage insufficient
- List all files created/modified
- Auto-commit and push

## Boundaries

- Do NOT write documentation files
- Do NOT create architecture plans
- Do NOT refactor unrelated code unless blocking
- Do NOT run destructive commands without warning
- Do NOT stop for diagnosable errors
- Do NOT force push unless explicitly requested
