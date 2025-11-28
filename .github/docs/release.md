# Release Automation

This workflow automates the creation of GitHub Releases with signed APKs when version tags are pushed.

## Overview

The release workflow creates a formal GitHub Release, generates a changelog, and attaches the signed Android APK for distribution.

## Triggers

### Automatic
- `workflow_run` event: Triggers when "Android Release Build" completes on a branch matching the semver tag pattern

**Requirements**:
1. Branch name must match `v*.*.*` pattern (semantic versioning)
2. Android build must complete successfully
3. Signed APK must be available as an artifact

### Tag Format

**Valid tags**:
- `v1.0.0`
- `v2.3.5`
- `v10.0.0-beta.1`
- `v1.2.3-rc.2`

**Invalid tags**:
- `release-1.0` (wrong format)
- `v1` (incomplete version)
- `1.0.0` (missing 'v' prefix)
- `test-build` (not semver)

## Workflow Steps

### 1. Tag Validation
Verifies that the branch name matches the expected semver pattern.

**Pattern**: `^v[0-9]+\.[0-9]+\.[0-9]+`

**Action**: Skips release creation if pattern doesn't match.

### 2. APK Download
Downloads the `android-apk` artifact from the Android build workflow.

**Dependency**: Requires Android build to have completed successfully.

### 3. Changelog Generation
Generates a changelog by comparing the current tag with the previous tag.

**Process**:
1. Identifies the previous version tag
2. Collects all commits between tags
3. Formats commits into a markdown list
4. Saves to `CHANGELOG.md`

**Format**:
```markdown
# Changelog

## [v1.2.0] - 2024-01-15

### Commits
- feat: Add expense categories (#45)
- fix: Resolve currency conversion bug (#46)
- docs: Update API documentation (#47)
```

### 4. Release Creation
Creates a GitHub Release with:
- **Tag**: The version tag (e.g., `v1.2.0`)
- **Name**: Version number (e.g., `v1.2.0`)
- **Body**: Contents of generated `CHANGELOG.md`
- **Assets**: Signed Android APK
- **Type**: Full release (not a draft, not pre-release)

### 5. Asset Upload
Attaches the signed APK to the release.

**Asset Name**: `expense-tracker-<tag>.apk`

**Example**: `expense-tracker-v1.2.0.apk`

## Artifacts

This workflow consumes artifacts but does not produce new ones. All outputs are part of the GitHub Release.

## Required Permissions

The workflow requires `contents: write` permission to create releases.

This is automatically granted via `GITHUB_TOKEN`.

## Failure Scenarios

### Invalid Tag Format
**Symptom**: Release workflow skips execution

**Cause**: Tag doesn't match `v*.*.*` pattern

**Resolution**:
1. Delete the invalid tag: `git tag -d <tag-name>`
2. Push deletion: `git push origin :refs/tags/<tag-name>`
3. Create a properly formatted tag: `git tag v1.2.3`
4. Push the correct tag: `git push origin v1.2.3`

### Missing APK Artifact
**Symptom**: "Artifact not found: android-apk"

**Cause**: Android build didn't complete or failed

**Resolution**:
1. Check Android build workflow status
2. Ensure CI pipeline passed before Android build
3. Verify the tag was pushed to the correct branch
4. Check that the tag matches the Android workflow's trigger conditions

### Changelog Generation Failure
**Symptom**: Empty or malformed changelog

**Cause**: Unable to find previous tag or compare commits

**Resolution**:
1. Ensure at least one previous version tag exists
2. Verify git history is intact
3. Check that tags follow consistent versioning scheme
4. Manually create changelog if necessary

### Release Already Exists
**Symptom**: "Release already exists for tag v1.2.3"

**Cause**: Attempting to recreate an existing release

**Resolution**:
1. Delete the existing release if it's incorrect
2. Delete the tag locally and remotely
3. Recreate with the correct configuration

## Release Process

### Standard Release Flow

1. **Ensure code is ready**:
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create and push tag**:
   ```bash
   git tag v1.2.3
   git push origin v1.2.3
   ```

3. **Monitor workflows**:
   - CI/CD Pipeline → Android Build → Release
   - Each must complete successfully

4. **Verify release**:
   - Navigate to GitHub Releases
   - Verify APK is attached
   - Review changelog
   - Test download and installation

### Hotfix Release Flow

For urgent fixes to production:

1. **Create hotfix branch**:
   ```bash
   git checkout -b hotfix/v1.2.4 v1.2.3
   ```

2. **Make fixes and commit**

3. **Merge to main**:
   ```bash
   git checkout main
   git merge hotfix/v1.2.4
   ```

4. **Tag and push**:
   ```bash
   git tag v1.2.4
   git push origin main --tags
   ```

### Pre-release Flow

For beta or RC versions:

1. **Use pre-release tag format**:
   ```bash
   git tag v1.3.0-beta.1
   git push origin v1.3.0-beta.1
   ```

2. **Manually mark as pre-release**:
   - After release is created, edit it on GitHub
   - Check "Set as a pre-release"

## Versioning Strategy

Follow [Semantic Versioning 2.0.0](https://semver.org/):

- **MAJOR** (v2.0.0): Breaking changes
- **MINOR** (v1.3.0): New features, backward compatible
- **PATCH** (v1.2.5): Bug fixes, backward compatible

### Version Increment Guidelines

**Increment MAJOR when**:
- Breaking API changes
- Major architecture changes
- Removal of deprecated features

**Increment MINOR when**:
- New features added
- Existing features enhanced
- Deprecation of features (with continued support)

**Increment PATCH when**:
- Bug fixes
- Security patches
- Performance improvements
- Documentation updates

## Best Practices

1. **Never tag untested code**: Always verify CI passes before tagging
2. **Write meaningful commit messages**: They appear in the changelog
3. **Tag from stable branches**: Use `main` for releases, not feature branches
4. **Keep tags immutable**: Never force-push over existing tags
5. **Document breaking changes**: Add notes to release body for major versions
6. **Test before releasing**: Download and test the APK before making release public

## Manual Release Edits

After a release is created, you can:

1. **Edit the description**: Add release notes, migration guides, breaking changes
2. **Add additional assets**: Upload extra documentation or resources
3. **Mark as pre-release**: For beta/RC versions
4. **Delete and recreate**: If there's a critical error (use sparingly)

## Troubleshooting

**Q: Can I create a release without a tag?**  
A: No. This workflow only triggers on tags matching `v*.*.*`.

**Q: How do I release to a different branch?**  
A: Tags should be created on the commit you want to release. The workflow runs based on where the tag points.

**Q: What if the APK is corrupted?**  
A: Delete the release, fix the Android build issues, delete and recreate the tag.

**Q: Can I edit the changelog after release?**  
A: Yes, edit the release description on GitHub. The `CHANGELOG.md` file is just a starting point.

**Q: How do I rollback a release?**  
A: You cannot rollback a release, but you can:
   1. Mark the release as "not the latest"
   2. Create a new release with a higher version
   3. Document the issue in release notes

**Q: Why wasn't a release created for my tag?**  
A: Check that:
   1. Tag format is correct (`v*.*.*`)
   2. Android build completed successfully
   3. APK artifact is available
   4. Review workflow logs for errors