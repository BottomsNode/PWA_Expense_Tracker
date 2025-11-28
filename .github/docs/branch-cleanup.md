# Branch Cleanup

This workflow automatically removes merged and stale Dependabot branches to prevent repository clutter.

## Overview

As Dependabot creates automated upgrade branches, this workflow ensures they are cleaned up after merging or when they become stale, preventing the accumulation of dead branches.

## Triggers

### Automatic
- **PR Close Event**: When a pull request is closed (merged or not)
- **Scheduled**: Weekly on Sundays at 00:00 UTC

### Manual
- `workflow_dispatch`: Can be triggered manually from GitHub Actions UI

## Cleanup Criteria

### Merged Branches
Branches matching `dependabot/*` that have been merged into the target branch.

**Action**: Delete immediately after merge

### Stale Branches
Branches matching `dependabot/*` that:
- Have not been updated in 30 days (configurable)
- Have not been merged

**Action**: Delete during weekly cleanup

## Workflow Steps

### 1. Repository Checkout
Fetches the full git history to analyze branch states.

**Options**:
- `fetch-depth: 0` (complete history)
- `ref: main` (ensures up-to-date base)

### 2. Merged Branch Cleanup
Identifies and removes Dependabot branches that have been merged.

**Process**:
1. Lists all remote branches matching `dependabot/*`
2. Checks if each branch has been merged to `main`
3. Deletes merged branches from remote
4. Logs deleted branches to `merged-branches.txt`

### 3. Stale Branch Cleanup
Removes Dependabot branches that haven't been updated recently.

**Process**:
1. Lists all remote branches matching `dependabot/*`
2. Checks last commit date for each branch
3. Deletes branches older than 30 days
4. Logs deleted branches to `stale-branches.txt`

### 4. Report Generation
Creates artifacts documenting cleanup actions.

## Artifacts

| Artifact Name | Contents | Retention |
|---------------|----------|-----------|
| `merged-branches.txt` | List of deleted merged branches | 30 days |
| `stale-branches.txt` | List of deleted stale branches | 30 days |

**Format**:
```
dependabot/npm_and_yarn/vite-5.0.0
dependabot/npm_and_yarn/typescript-5.3.2
dependabot/npm_and_yarn/eslint-8.55.0
```

## Configuration

### Stale Threshold
Currently set to **30 days** (configurable via workflow file).

To change:
```yaml
env:
  STALE_DAYS: 30  # Adjust this value
```

### Branch Pattern
Currently targets branches matching `dependabot/*`.

To modify the pattern:
```yaml
env:
  BRANCH_PATTERN: "dependabot/*"  # Adjust this value
```

## Behavior Details

### What Gets Deleted

✅ **Will be deleted**:
- `dependabot/npm_and_yarn/package-1.0.0` (merged)
- `dependabot/bundler/gem-2.0.0` (45 days old)
- `dependabot/pip/requests-2.31.0` (stale PR, no activity)

❌ **Will NOT be deleted**:
- `feature/new-component` (not a Dependabot branch)
- `dependabot/npm_and_yarn/react-18.0.0` (updated 5 days ago)
- `main`, `dev`, `staging` (protected branches)
- Any branch not matching the Dependabot pattern

### Protected Branches

The following branches are never deleted:
- `main`
- `dev`
- Any branch configured as protected in repository settings

## Safety Measures

1. **Pattern Matching**: Only branches explicitly matching `dependabot/*` are affected
2. **Merge Verification**: Branches are only deleted if actually merged, not just closed
3. **Staleness Check**: 30-day grace period before stale deletion
4. **Logging**: All deletions are logged for audit purposes
5. **Manual Override**: Can be run manually to preview before automation

## Failure Scenarios

### Permission Denied
**Symptom**: "Failed to delete branch: Permission denied"

**Cause**: Workflow lacks permission to delete branches

**Resolution**:
1. Verify workflow has `contents: write` permission
2. Check branch protection rules
3. Ensure `GITHUB_TOKEN` has proper permissions

### Branch Protection Conflicts
**Symptom**: "Cannot delete protected branch"

**Cause**: Attempting to delete a protected branch

**Resolution**:
1. Review branch protection rules in repository settings
2. Adjust branch pattern to exclude protected branches
3. Ensure only Dependabot branches are targeted

### Stale Detection Issues
**Symptom**: Active branches being deleted or old branches not deleted

**Cause**: Incorrect date calculation or git log parsing

**Resolution**:
1. Check workflow logs for date parsing errors
2. Verify `git log` commands work correctly
3. Adjust `STALE_DAYS` threshold if needed

## Monitoring

### Weekly Summary
After each scheduled run, check the artifacts to see what was cleaned up:

1. Navigate to the workflow run
2. Download `merged-branches.txt` and `stale-branches.txt`
3. Review the list of deleted branches

### Notification Setup
To receive notifications about branch cleanup:

1. Watch the repository for "Actions" events
2. Configure GitHub notifications preferences
3. Set up Slack/Discord webhooks (requires workflow modification)

## Manual Cleanup

To manually clean up branches:

1. Go to Actions → Branch Cleanup workflow
2. Click "Run workflow"
3. Select the branch to run on (usually `main`)
4. Click "Run workflow"

**When to use manual cleanup**:
- After a large Dependabot merge session
- Before a major release
- When repository branch count is excessive
- To test cleanup logic changes

## Impact on Open PRs

**Merged PRs**: Branches are deleted automatically. This is safe—merged PRs remain accessible.

**Closed but not merged PRs**: Branches are deleted after 30 days of inactivity. The PR remains visible on GitHub, but the branch is removed.

**Open PRs**: Active branches (< 30 days old) are preserved even if the PR is stale.

## Dependabot Configuration

This workflow works best with Dependabot configured. Ensure `dependabot.yml` is set up:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```

## Best Practices

1. **Review before enabling**: Run manually first to see what would be deleted
2. **Adjust thresholds**: Tune `STALE_DAYS` based on your team's workflow
3. **Monitor regularly**: Check artifacts weekly to ensure proper cleanup
4. **Communicate**: Let team members know this automation is active
5. **Preserve important branches**: Use branch protection for critical branches

## Customization

### Clean Up Other Branch Patterns

To extend cleanup to other automated branches:

```yaml
env:
  BRANCH_PATTERN: "{dependabot,renovate,snyk}/*"
```

### Change Cleanup Schedule

To run more or less frequently:

```yaml
on:
  schedule:
    - cron: '0 0 * * 1'  # Weekly (Monday at midnight)
    # - cron: '0 0 * * *'  # Daily
    # - cron: '0 0 1 * *'  # Monthly
```

### Adjust Stale Threshold

For stricter or looser cleanup:

```yaml
env:
  STALE_DAYS: 14  # More aggressive (2 weeks)
  # STALE_DAYS: 60  # More lenient (2 months)
```

## Troubleshooting

**Q: Why are branches I want to keep being deleted?**  
A: Check the branch pattern and stale threshold. Ensure important branches don't match `dependabot/*`.

**Q: Can I recover a deleted branch?**  
A: Yes, if the commit still exists:
```bash
git checkout -b branch-name <commit-sha>
git push origin branch-name
```

**Q: How do I disable this workflow?**  
A: Disable it in the Actions workflow list, or delete the workflow file.

**Q: What happens to PRs after branch deletion?**  
A: PRs remain visible on GitHub. Merged PRs are unaffected. Closed PRs lose their branch but remain in history.

**Q: Can I exclude specific Dependabot branches?**  
A: Currently, no. All branches matching the pattern are subject to cleanup. Modify the workflow script to add exclusions if needed.

**Q: Does this delete local branches?**  
A: No. This only affects remote branches. Local branches remain until you manually delete them.