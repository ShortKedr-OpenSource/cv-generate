# CV Generated

CV Generated is a configurable public CV web app. It serves a CV as a public web page with multilingual content, selectable visual themes, browser-based PDF export, and a lightweight protected admin config view.

The current implementation is intentionally lightweight, but the product is designed to remain extensible for additional languages, themes, and future protected configuration workflows.

See [ROADMAP.md](/C:/Users/short/OneDrive/Рабочий стол/CV Generated/ROADMAP.md) for future product phases and planned architecture evolution.

## Current capabilities

- Public CV page served from `index.html`
- Multilingual CV content loaded from `locales/*.json`
- System UI translations loaded from `locales/system/*.json` with embedded fallback data
- Theme registration through `config/app.json` and stylesheet files in `styles/themes/*.css`
- Default language and default theme controlled by product configuration
- Browser print export for both the visual CV and ATS-oriented PDF layouts
- Optional ATS checker integration configured in `config/app.json`
- Protected read-only admin config endpoint at `/admin/config/app`
- Minimal admin viewer page at `admin/index.html`

## Project structure

Core files and folders:

- `index.html`: public CV app and client-side runtime
- `admin/index.html`: minimal admin page for reading protected app config
- `config/app.json`: application-level source of truth for languages, themes, defaults, profile, and integrations
- `locales/*.json`: localized CV content
- `locales/system/*.json`: localized system UI strings
- `styles/themes/*.css`: theme stylesheets registered in config
- `styles/cv.css`: shared CV layout and print styles
- `styles/admin.css`: admin page styles
- `server.js`: local HTTP server and protected admin config route
- `Dockerfile`, `nginx.conf`: production hosting baseline
- `.idea/runConfigurations/`: shared WebStorm run configurations

## Configuration model

`config/app.json` is the app-level source of truth for public runtime configuration.

Current top-level fields:

- `languages`: list of language codes exposed by the public language switcher
- `themes`: list of registered themes with `id`, `label`, and `stylesheet`
- `defaults.language`: fallback and initial language
- `defaults.theme`: fallback and initial theme
- `profile`: non-sensitive app-level profile metadata
- `integrations.ats`: ATS integration settings and providers

Current repository baseline:

- Languages: `ru`, `en`, `de`
- Themes: `default` (`Sky`), `graphite`, `sand`
- Default language: `ru`
- Default theme: `default`
- ATS provider: `enhancv`

The public app loads `config/app.json` at runtime and falls back to embedded defaults when needed. Theme registration should stay in config, while actual CSS remains in `styles/themes/*.css`.

## Running locally

### WebStorm

Shared WebStorm run configurations are included:

- `CV App Server`
- `CV App Browser`
- `CV App Server + Browser`

Recommended flow:

1. Open the project in WebStorm.
2. Use the IDE-managed Node interpreter.
3. Run `CV App Server + Browser` to start the server and open the public page.
4. Use `CV App Server` for server-only work.
5. Use `CV App Browser` when the server is already running.

### Preferred CLI start

If Node is available globally:

```powershell
npm start
```

If you want to use the portable Node bundled in `.tools/node`:

```powershell
.\.tools\node\npm.cmd start
```

Direct server start:

```powershell
.\.tools\node\node.exe .\server.js
```

Open the public app at `http://localhost:8080`.

### Docker

```powershell
docker build -t cv-generated .
docker run --rm -p 8080:80 cv-generated
```

Open `http://localhost:8080`.

## Public runtime behavior

The public CV app:

- discovers available languages and themes from `config/app.json`
- loads localized CV content from `locales/<lang>.json`
- loads system UI strings from `locales/system/<lang>.json`
- applies the selected theme from the registered theme stylesheet
- remembers the selected theme in browser storage
- picks the initial language from the browser when supported, otherwise uses the configured default
- keeps both screen rendering and print export tied to the same content and theme selection

## PDF export and ATS flow

The app supports two browser-print export flows:

- `Export PDF`: visual CV export
- `Export ATS PDF`: ATS-oriented print layout

Recommended browser print settings for both exports:

- Margins: `None`
- Background graphics: `Enabled`

Suggested export flow:

1. Open `http://localhost:8080`.
2. Select the required language and theme.
3. Click `Export PDF` or `Export ATS PDF`.
4. In the browser print dialog, set `Margins` to `None`.
5. Enable `Background graphics`.
6. Save as PDF.

### ATS integration

ATS behavior is controlled by `config/app.json` under `integrations.ats`.

Current baseline:

- ATS integration is enabled
- the configured provider is `Enhancv ATS Score`
- the provider opens in a new tab
- the provider expects the user to upload the PDF exported from this app
- the UI can show a disclaimer and usage hint based on provider settings

If ATS integration is disabled or invalid, the public ATS checker action is hidden.

## Admin config route

The project includes a lightweight protected admin config endpoint:

- Route: `/admin/config/app`
- Method: `GET`
- Access mode: read-only
- Authentication: `Authorization: Bearer <token>` or `x-admin-token`
- Enablement: set `ADMIN_CONFIG_TOKEN`
- Default behavior: deny by default when no token is configured

Security behavior:

- non-local access requires HTTPS
- local development on `localhost` is allowed over plain HTTP
- invalid or missing credentials return `401 Unauthorized`
- when admin access is not enabled, the route returns `404 Not Found`

Local example:

```powershell
$env:ADMIN_CONFIG_TOKEN='dev-token'
.\.tools\node\node.exe .\server.js
```

Then request the endpoint locally:

```powershell
Invoke-WebRequest -Uri 'http://localhost:8080/admin/config/app' -Headers @{ Authorization = 'Bearer dev-token' }
```

Or open the admin page:

- [admin/index.html](/C:/Users/short/OneDrive/Рабочий стол/CV Generated/admin/index.html)
- `http://localhost:8080/admin/`

The admin page is public, but it only reads the protected route when a valid token is supplied at runtime.

## Extending the app

### Add a language

1. Add localized CV content in `locales/<code>.json`.
2. Add system UI strings in `locales/system/<code>.json`.
3. Register the language code in `config/app.json` under `languages`.
4. Optionally set it as `defaults.language`.

### Add a theme

1. Create a new stylesheet in `styles/themes/`.
2. Define the theme variables for `:root[data-theme="<id>"]`.
3. Register the theme in `config/app.json` with a unique `id`, `label`, and `stylesheet`.
4. Optionally set it as `defaults.theme`.

### Change defaults

Update these fields in `config/app.json`:

- `defaults.language`
- `defaults.theme`

Configured defaults should always point to an existing registered language and theme.

## Validation checklist

When changing server or config-related behavior, verify:

- `/` returns HTTP 200
- `/admin/config/app` stays deny-by-default when `ADMIN_CONFIG_TOKEN` is not set
- `/admin/config/app` returns HTTP 200 only with valid admin authentication when enabled
- `config/app.json` is served correctly
- locale JSON files are served correctly
- theme CSS files are served correctly
- screen rendering, mobile rendering, and PDF export remain aligned

## Patch workflow

If the Codex built-in `apply_patch` tool is unstable in this environment, use the local wrapper in `scripts/apply-diff.ps1`.

Apply a patch file:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\apply-diff.ps1 .\my-change.diff
```

Validate a patch without applying it:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\apply-diff.ps1 .\my-change.diff -Check
```
## Development notes

- Keep the app functional without requiring a frontend build step unless the architecture is intentionally changed.
- Keep product-facing content in locale files when possible.
- Do not hardcode new languages or themes in one isolated place without updating the configuration model.
- Keep `config/app.json` as the app-level source of truth for languages, theme metadata, defaults, and integrations.

## Related docs

- [ROADMAP.md](/C:/Users/short/OneDrive/Рабочий стол/CV Generated/ROADMAP.md): future product and architecture phases
- [AGENTS.md](/C:/Users/short/OneDrive/Рабочий стол/CV Generated/AGENTS.md): repository-specific instructions for Codex



