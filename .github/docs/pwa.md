# PWA (Progressive Web App) Configuration

This document covers the PWA setup for the Expense Tracker application, including required files, configuration, and maintenance guidelines.

## Overview

The application is configured as a Progressive Web App (PWA), allowing users to install it on their devices and use it offline.

## Required Files

All PWA files must exist in the `public/` directory:

| File | Purpose | Required |
|------|---------|----------|
| `manifest.json` | PWA manifest defining app metadata | ✅ Yes |
| `pwa-icon-192.png` | App icon for mobile (192×192) | ✅ Yes |
| `pwa-icon-512.png` | App icon for high-res displays (512×512) | ✅ Yes |
| `sw.js` | Service worker for offline support | ✅ Yes |
| `favicon.ico` | Browser favicon | Recommended |

**⚠️ Warning**: Deleting any required file will break PWA functionality and prevent installation.

## Manifest Configuration

### Location
`public/manifest.json`

### Minimum Required Configuration

```json
{
  "name": "Expense Tracker",
  "short_name": "Expenses",
  "description": "Track your expenses efficiently",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/pwa-icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/pwa-icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Key Properties

#### name
**Full application name** displayed during installation.

**Max length**: 45 characters

**Example**: `"Expense Tracker - Personal Finance"`

#### short_name
**Short name** displayed on home screen under icon.

**Max length**: 12 characters (recommended)

**Example**: `"Expenses"`

#### start_url
**Initial page** loaded when app launches.

**Default**: `"/"` (root of application)

**Options**:
- `"/"` - Home page
- `"/dashboard"` - Specific route
- `"/?source=pwa"` - With tracking parameter

#### display
**Display mode** controlling how the app appears.

**Options**:
- `"standalone"` - Looks like a native app (recommended)
- `"fullscreen"` - Full screen, no browser UI
- `"minimal-ui"` - Minimal browser UI
- `"browser"` - Regular browser tab

#### theme_color
**Theme color** for browser UI (address bar, status bar).

**Format**: Hex color code

**Example**: `"#3b82f6"` (Tailwind blue-500)

**Note**: Should match your app's primary color.

#### background_color
**Splash screen background** displayed during app launch.

**Format**: Hex color code

**Example**: `"#ffffff"` (white)

**Note**: Should match your app's background color.

#### icons
**Array of icon definitions** for different contexts.

**Sizes required**:
- 192×192 (minimum required)
- 512×512 (recommended for high-res)
- 144×144, 96×96, 72×72, 48×48 (optional, better coverage)

**Purpose property**:
- `"any"` - Use in any context
- `"maskable"` - Safe area for adaptive icons
- `"any maskable"` - Both (recommended)

## Service Worker

### Location
`public/sw.js`

### Purpose
- Enable offline functionality
- Cache static assets
- Improve performance with caching strategies

### Basic Service Worker Template

```javascript
const CACHE_NAME = 'expense-tracker-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/main.js',
  '/pwa-icon-192.png'
];

// Install service worker and cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

### Service Worker Registration

Register the service worker in your main application file:

```javascript
// src/main.tsx or src/index.tsx
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}
```

**⚠️ Important**: Only register service workers after the page loads to avoid delaying initial render.

## Icon Requirements

### Specifications

| Size | Purpose | Required |
|------|---------|----------|
| 192×192 | Mobile home screen | ✅ Yes |
| 512×512 | High-resolution displays | ✅ Yes |
| 144×144 | Windows tablets | Optional |
| 96×96 | Android | Optional |
| 72×72 | iOS | Optional |
| 48×48 | Older devices | Optional |

### Design Guidelines

1. **Use simple, recognizable shapes**: Icons are displayed at small sizes
2. **High contrast**: Ensure visibility on various backgrounds
3. **No text**: Text becomes illegible at small sizes
4. **Square format**: Avoid landscape or portrait shapes
5. **Transparent background**: For non-maskable icons
6. **Safe area**: Keep important content within 80% center for maskable icons

### Creating Icons

**From SVG** (recommended):
```bash
# Using ImageMagick
convert -background none icon.svg -resize 192x192 pwa-icon-192.png
convert -background none icon.svg -resize 512x512 pwa-icon-512.png
```

**From PNG**:
```bash
# Resize existing PNG
convert icon.png -resize 192x192 pwa-icon-192.png
convert icon.png -resize 512x512 pwa-icon-512.png
```

**Online Tools**:
- [Favicon.io](https://favicon.io/) - Generate favicons and PWA icons
- [Real Favicon Generator](https://realfavicongenerator.net/) - Comprehensive icon generator
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator) - CLI tool

### Maskable Icons

Maskable icons adapt to different device shapes (rounded corners, circles, squircles).

**Safe area**: Keep critical content within center 80% (40px padding for 192px icon)

**Test your icons**: [Maskable.app](https://maskable.app/)

## HTML Integration

### Required Meta Tags

Add to `index.html` `<head>`:

```html
<!-- PWA Manifest -->
<link rel="manifest" href="/manifest.json">

<!-- Theme Color (matches manifest) -->
<meta name="theme-color" content="#3b82f6">

<!-- iOS Specific -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Expenses">
<link rel="apple-touch-icon" href="/pwa-icon-192.png">

<!-- Icons -->
<link rel="icon" type="image/png" sizes="192x192" href="/pwa-icon-192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/pwa-icon-512.png">
```

## Testing PWA Configuration

### Chrome DevTools

1. Open DevTools (F12)
2. Navigate to **Application** tab
3. Check **Manifest** section
   - Verify all properties load correctly
   - Check icon display
4. Check **Service Workers** section
   - Verify registration
   - Test offline functionality

### Lighthouse Audit

1. Open DevTools (F12)
2. Navigate to **Lighthouse** tab
3. Select **Progressive Web App** category
4. Click **Generate report**

**Target scores**:
- Installability: 100%
- PWA Optimized: 100%

### Manual Testing

**Installation test**:
1. Open site in Chrome mobile
2. Look for "Install" prompt
3. Install app
4. Verify icon appears on home screen
5. Launch app
6. Verify standalone display (no browser UI)

**Offline test**:
1. Install app
2. Open app
3. Enable airplane mode
4. Navigate within app
5. Verify cached content loads

## Platform-Specific Considerations

### Android

- Uses `manifest.json` directly
- Respects `theme_color` for status bar
- Supports maskable icons
- Installation prompt shown automatically

**Minimum Android version**: 5.0 (API 21)

### iOS

- Limited PWA support (improving)
- Requires `apple-touch-icon` link
- Uses `apple-mobile-web-app-*` meta tags
- No automatic installation prompt (user must add to home screen manually)
- Service workers supported but limited

**Minimum iOS version**: 11.3

### Desktop

- Chrome, Edge: Full PWA support
- Firefox: Basic PWA support (improving)
- Safari: Limited PWA support

**Installation**: Via browser menu → "Install [App Name]"

## Common Issues

### Icons Not Displaying

**Symptoms**:
- Default browser icon shown
- Broken image in manifest
- Installation fails

**Solutions**:
1. Verify icon files exist in `public/`
2. Check file permissions (readable)
3. Validate icon dimensions (exactly 192×192, 512×512)
4. Clear browser cache
5. Use PNG format (not JPG, WebP)

### App Not Installable

**Symptoms**:
- No installation prompt
- Lighthouse fails installability check

**Requirements for installation**:
- HTTPS (or localhost for development)
- Valid `manifest.json`
- Icons (192px minimum)
- Service worker registered
- Served over HTTPS

**Solutions**:
1. Verify all required files exist
2. Check browser console for errors
3. Run Lighthouse audit
4. Ensure HTTPS is enabled
5. Test on different browsers

### Service Worker Not Registering

**Symptoms**:
- Console error: "Failed to register service worker"
- Offline functionality doesn't work

**Solutions**:
1. Verify `sw.js` exists in `public/`
2. Check for JavaScript errors in `sw.js`
3. Ensure service worker registration code runs after load
4. Clear browser service worker cache
5. Check browser console for specific errors

### Theme Color Not Applied

**Symptoms**:
- Browser UI shows wrong color
- Status bar doesn't match app theme

**Solutions**:
1. Verify `theme_color` in `manifest.json`
2. Add `<meta name="theme-color">` to HTML
3. Ensure colors match between manifest and HTML
4. Use hex format for colors
5. Test on actual device (desktop browsers may not show theme color)

## Maintenance

### Updating Icons

When updating app icons:

1. Create new icons in all required sizes
2. Replace files in `public/`
3. Update `manifest.json` if filenames change
4. Clear browser cache
5. Test installation on multiple devices
6. Consider versioning: `pwa-icon-192-v2.png`

### Updating Manifest

When changing manifest:

1. Edit `public/manifest.json`
2. Validate JSON syntax
3. Test in Chrome DevTools → Application → Manifest
4. Clear browser cache
5. Test installation
6. Consider cache-busting: add version query param

### Service Worker Updates

When updating service worker:

1. Increment `CACHE_NAME` version
2. Update cached file list if needed
3. Test thoroughly in development
4. Deploy changes
5. Old service workers will update on next page load

**⚠️ Warning**: Service worker changes require careful testing. Bugs can break the entire app.

### Version Strategy

Implement versioning for cache management:

```javascript
const VERSION = '1.2.0';
const CACHE_NAME = `expense-tracker-${VERSION}`;
```

Update `VERSION` when:
- Adding new features
- Changing cached assets
- Fixing service worker bugs

## Advanced Features

### Push Notifications

Requires additional setup:
- Push notification permission
- Service worker push event listener
- Backend push notification server

**Not covered in this basic setup**. See [Push API documentation](https://developer.mozilla.org/en-US/docs/Web/API/Push_API).

### Background Sync

Allows syncing data when connection is restored:

```javascript
// In service worker
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-expenses') {
    event.waitUntil(syncExpenses());
  }
});
```

**Not covered in this basic setup**. See [Background Sync API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Sync_API).

### App Shortcuts

Define quick actions in manifest:

```json
{
  "shortcuts": [
    {
      "name": "Add Expense",
      "short_name": "Add",
      "url": "/add-expense",
      "icons": [{ "src": "/icon-add.png", "sizes": "192x192" }]
    }
  ]
}
```

## Resources

### Documentation
- [MDN Web Docs - PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [web.dev - PWA](https://web.dev/progressive-web-apps/)
- [W3C Manifest Spec](https://www.w3.org/TR/appmanifest/)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - PWA auditing
- [Workbox](https://developers.google.com/web/tools/workbox) - Service worker library
- [PWA Builder](https://www.pwabuilder.com/) - PWA generation tool

### Testing
- [Maskable.app](https://maskable.app/) - Test maskable icons
- [Favicon Checker](https://realfavicongenerator.net/favicon_checker) - Validate icons
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/) - PWA debugging