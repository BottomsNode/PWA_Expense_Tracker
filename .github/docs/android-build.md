# Android Build

This workflow produces the signed release APK for Android distribution. It executes only after the CI/CD pipeline completes successfully.

## Overview

The Android build workflow transforms the web application build into a production-ready Android APK using Capacitor, then signs it with the release keystore.

## Triggers

### Automatic
- `workflow_run` event: Triggers when "CI Pipeline" workflow completes on `main` or `dev` branches

**Important**: This workflow will not run if the CI pipeline fails. This is intentional and prevents building APKs from unvalidated code.

### Manual
- Not supported for safety reasons (use CI pipeline trigger instead)

## Workflow Steps

### 1. Web Build Artifact Download
Downloads the `web-build` artifact produced by the CI/CD pipeline.

**Dependency**: Requires CI/CD workflow to complete successfully first.

### 2. Dependency Installation
Installs JavaScript dependencies using Bun.

**Command**: `bun install`

### 3. Java & Android SDK Setup
Configures the build environment:
- **Java Version**: 17 (Temurin distribution)
- **Gradle**: Auto-configured
- **Android SDK**: Latest stable

### 4. Keystore Restoration
Decodes and restores the release keystore from secrets.

**Process**:
1. Decodes `ANDROID_KEYSTORE_BASE64` to binary
2. Writes to `android/app/release.keystore`
3. Configures Gradle to use the keystore

### 5. Capacitor Sync
Copies web assets and synchronizes Capacitor configuration.

**Commands**:
```bash
bunx cap copy android
bunx cap sync android
```

### 6. APK Build
Builds the signed release APK using Gradle.

**Command**: `./gradlew assembleRelease`

**Output**: `android/app/build/outputs/apk/release/app-release.apk`

### 7. APK Validation
Performs a sanity check to ensure the APK meets minimum size requirements.

**Minimum Size**: 5 MB (configurable)

**Purpose**: Detects obviously broken or incomplete builds early.

### 8. APK Renaming
Renames the APK to a consistent, identifiable format:

**Format**: `expense-tracker-<branch-name>.apk`

**Examples**:
- `main` → `expense-tracker-main.apk`
- `dev` → `expense-tracker-dev.apk`
- `v1.2.3` → `expense-tracker-v1.2.3.apk`

### 9. Artifact Upload
Uploads the renamed APK as the `android-apk` artifact.

## Artifacts

| Artifact Name | Description | Retention | Used By |
|---------------|-------------|-----------|---------|
| `android-apk` | Signed release APK | 90 days | Release workflow |

## Required Secrets

These secrets must be configured in the repository settings:

| Secret Name | Description | How to Generate |
|-------------|-------------|-----------------|
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded release keystore | `base64 -i release.keystore` |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password | Created during keystore generation |
| `ANDROID_KEY_ALIAS` | Key alias name | Specified during keystore generation |
| `ANDROID_KEY_ALIAS_PASSWORD` | Key alias password | Created during keystore generation |

### Generating a Release Keystore

If you need to create a new keystore:

```bash
keytool -genkey -v -keystore release.keystore \
  -alias your-key-alias \
  -keyalg RSA -keysize 2048 -validity 10000

# Encode for GitHub Secrets
base64 -i release.keystore | pbcopy  # macOS
base64 -i release.keystore | xclip   # Linux
```

**⚠️ Warning**: Store the original keystore and passwords securely. Loss of the keystore prevents publishing updates to existing app installations.

## Failure Scenarios

### Missing Web Build Artifact
**Symptom**: "Artifact not found: web-build"

**Cause**: CI pipeline didn't complete or failed

**Resolution**:
1. Check CI pipeline status
2. Ensure CI completed successfully
3. Verify `web-build` artifact was uploaded

### Keystore Errors
**Symptom**: Gradle signing failure, "keystore password was incorrect"

**Cause**: Invalid keystore secrets

**Resolution**:
1. Verify all four keystore secrets are configured correctly
2. Test keystore locally: `keytool -list -v -keystore release.keystore`
3. Ensure base64 encoding is correct (no line breaks)
4. Re-encode keystore if necessary

### Gradle Build Failures
**Symptom**: `assembleRelease` task fails

**Common Causes**:
- Missing or corrupted `android/` directory
- Gradle configuration errors
- Android SDK version mismatches
- Insufficient build resources

**Resolution**:
1. Review Gradle error messages in workflow logs
2. Test build locally: `cd android && ./gradlew assembleRelease`
3. Sync Android project in Android Studio to identify issues
4. Check for recent changes to `android/build.gradle` or `app/build.gradle`

### APK Size Validation Failure
**Symptom**: "APK size below minimum threshold"

**Cause**: Incomplete build, missing assets

**Resolution**:
1. Check web build artifact contents
2. Verify Capacitor sync completed successfully
3. Inspect APK contents: `unzip -l app-release.apk`
4. Look for missing `www/` directory in APK

### Capacitor Sync Issues
**Symptom**: Capacitor errors during copy/sync

**Resolution**:
1. Verify `capacitor.config.json` is valid
2. Check that web build output directory matches config
3. Ensure Capacitor plugins are properly installed
4. Test sync locally: `bunx cap sync android`

## Build Configuration

### Capacitor Configuration
Location: `capacitor.config.ts`

Key settings:
- `webDir`: Must point to Vite build output (`dist`)
- `appId`: Android package name
- `appName`: Display name

### Gradle Configuration
Location: `android/app/build.gradle`

Signing configuration:
```gradle
signingConfigs {
    release {
        storeFile file('release.keystore')
        storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
        keyAlias System.getenv("ANDROID_KEY_ALIAS")
        keyPassword System.getenv("ANDROID_KEY_ALIAS_PASSWORD")
    }
}
```

## Performance Considerations

- **Build Time**: Typical build takes 5-8 minutes
- **Caching**: Gradle dependencies are cached to reduce build time
- **Resource Usage**: Requires standard GitHub Actions runner resources

## Best Practices

1. **Never commit the keystore**: Always use base64-encoded secrets
2. **Test locally first**: Build APK locally before relying on CI
3. **Keep Gradle updated**: Regularly update Android Gradle Plugin
4. **Monitor APK size**: Significant size changes may indicate issues
5. **Verify signing**: Always check APK signature after major changes

## Local Development

To replicate the build locally:

```bash
# 1. Build web app
bun run build

# 2. Sync with Capacitor
bunx cap sync android

# 3. Build APK (requires keystore setup)
cd android
./gradlew assembleRelease
```

## Troubleshooting

**Q: Why isn't the Android workflow triggering?**  
A: Check that CI completed successfully. Android only runs after CI passes.

**Q: Can I build a debug APK instead?**  
A: This workflow only builds release APKs. For debug builds, use `./gradlew assembleDebug` locally.

**Q: How do I test the APK?**  
A: Download the `android-apk` artifact from the workflow run and install on a device or emulator.

**Q: Can I skip the keystore and build unsigned?**  
A: No. The workflow requires a signed release build. Unsigned APKs cannot be distributed.

**Q: Where can I find the APK after the build?**  
A: Navigate to the workflow run, scroll to "Artifacts", and download `android-apk`.