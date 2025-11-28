# CI/CD Pipeline

The CI/CD pipeline is the primary quality gate for this repository. All code changes must pass this workflow before downstream processes (Android build, releases) can execute.

## Overview

This workflow performs comprehensive code quality checks, builds the web application, and generates artifacts for both production and preview purposes.

## Triggers

### Automatic
- Push to `main` branch
- Push to `dev` branch
- Pull requests targeting `main` or `dev`

### Manual
- `workflow_dispatch` event (can be triggered manually from GitHub Actions UI)

## Workflow Steps

### 1. Secret Scanning
Scans the codebase for accidentally committed secrets or sensitive data.

**Action**: Fails the workflow if secrets are detected.

### 2. Code Linting (ESLint)
Runs ESLint with the project's configuration.

**Requirements**: 
- All linting rules must pass
- No warnings or errors allowed

**Command**: `bun run lint`

### 3. Type Checking
Validates TypeScript type correctness across the entire codebase.

**Command**: `bun run typecheck`

### 4. Testing & Coverage
Executes the test suite and generates coverage reports.

**Command**: `bun test --coverage`

**Coverage Artifact**: `coverage-<commit-sha>`

### 5. Web Build
Builds the production-ready web application using Vite.

**Command**: `bun run build`

**Output**: `dist/` directory containing optimized production assets

### 6. Artifact Upload
Uploads the web build as `web-build` artifact for use by the Android workflow.

### 7. PR Preview Generation (PRs only)
For pull requests, generates a canary preview build.

**Artifact**: `preview-web-<commit-sha>`

### 8. PR Comment (PRs only)
Posts a comment on the pull request with:
- Build status
- Link to preview artifact
- Test coverage summary

## Artifacts

| Artifact Name | Description | Retention | Used By |
|---------------|-------------|-----------|---------|
| `web-build` | Production web build | 7 days | Android Build workflow |
| `coverage-<sha>` | Test coverage report | 7 days | Review/analysis |
| `preview-web-<sha>` | PR preview build | 3 days | Manual testing |

## Dependencies

### Runtime
- **Bun**: Package manager and runtime (latest)
- **Node.js**: Not used (Bun replaces Node/npm/yarn)

### Build Tools
- Vite
- TypeScript
- ESLint
- Vitest (testing)

## Failure Scenarios

### Lint Failures
**Symptom**: ESLint step fails with rule violations

**Resolution**:
1. Run `bun run lint` locally
2. Fix all reported issues
3. Run `bun run lint --fix` for auto-fixable issues
4. Do not disable rules without justification

### Type Check Failures
**Symptom**: TypeScript compilation errors

**Resolution**:
1. Run `bun run typecheck` locally
2. Fix all type errors
3. Do not use `@ts-ignore` or `any` without strong justification

### Test Failures
**Symptom**: Test suite fails

**Resolution**:
1. Run `bun test` locally
2. Fix failing tests
3. Ensure tests are deterministic (no flaky tests)
4. Verify test coverage meets project standards

### Build Failures
**Symptom**: Vite build fails

**Resolution**:
1. Run `bun run build` locally
2. Check for import errors or missing dependencies
3. Verify environment variables are correctly configured
4. Check build logs for specific error messages

## Environment Variables

No environment variables are currently required for the CI/CD pipeline. If your build requires environment-specific configuration, ensure it's documented here.

## Performance Considerations

- **Caching**: Node modules are cached between runs to speed up installations
- **Parallel Jobs**: Some steps run in parallel where dependencies allow
- **Artifact Size**: Web build artifacts are optimized to minimize storage and transfer costs

## Best Practices

1. **Always run CI checks locally** before pushing:
   ```bash
   bun run lint
   bun run typecheck
   bun test
   bun run build
   ```

2. **Keep the pipeline fast**: Avoid adding unnecessary steps that significantly increase build time

3. **Fix failures immediately**: Don't let CI failures accumulate

4. **Review PR comments**: Check coverage reports and preview builds before merging

## Troubleshooting

**Q: Why isn't the Android workflow running?**  
A: The Android workflow only triggers after CI completes successfully. Check CI logs for failures.

**Q: Can I skip CI checks?**  
A: No. Branch protection rules require CI to pass before merging.

**Q: How do I view the web build artifact?**  
A: Navigate to the workflow run in GitHub Actions, scroll to "Artifacts" section, and download `web-build`.

**Q: Why are my changes not reflected in the PR preview?**  
A: Ensure the CI pipeline completed successfully and the `preview-web-<sha>` artifact was generated.