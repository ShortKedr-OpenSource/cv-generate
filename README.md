[![Deploy GitHub Pages](https://github.com/ShortKedr-OpenSource/cv-generate/actions/workflows/deploy-pages.yml/badge.svg?branch=main)](https://github.com/ShortKedr-OpenSource/cv-generate/actions/workflows/deploy-pages.yml)
# CV Generate

Open app: [shortkedr-opensource.github.io/cv-generate](https://shortkedr-opensource.github.io/cv-generate/)

CV Generate is a configurable static CV web app. It serves a CV as a public web page with multilingual content, selectable visual themes, browser-based PDF export, and file-based configuration.

The current implementation is intentionally lightweight, but the product is designed to remain extensible for additional languages, themes, and future static hosting environments.

See [ROADMAP.md](./ROADMAP.md) for future product phases and planned architecture evolution.

## Current capabilities

- Public CV page served from `index.html`
- Multilingual CV content loaded from `profiles/<id>/locales/*.json`
- System UI translations loaded from `locales/system/*.json` with embedded fallback data
- Theme registration through `config/app.json` and stylesheet files in `styles/themes/*.css`
- Centrally registered static profiles with optional URL-driven profile selection
- Default language and default theme controlled by product configuration
- Browser print export for both the visual CV and ATS-oriented PDF layouts
- Optional ATS checker integration configured in `config/app.json`
- Static-host-friendly runtime with no required custom backend

## Project structure

Core files and folders:

- `index.html`: public CV app and client-side runtime
- `config/app.json`: application-level source of truth for languages, themes, defaults, profiles, features, and integrations
- `profiles/<id>/profile.json`: per-profile metadata and future asset entrypoint
- `profiles/<id>/locales/*.json`: profile-localized CV content
- `profiles/<id>/assets/`: future profile media such as images and videos
- `locales/system/*.json`: localized system UI strings
- `styles/themes/*.css`: theme stylesheets registered in config
- `styles/cv.css`: shared CV layout and print styles
- `scripts/static-preview.js`: optional local static preview helper
- `.github/workflows/deploy-pages.yml`: GitHub Pages deployment workflow
- `Dockerfile`, `nginx.conf`: static hosting baseline
- `.idea/runConfigurations/`: shared WebStorm run configurations

## Configuration model

`config/app.json` is the app-level source of truth for public runtime configuration.

Current top-level fields:

- `languages`: list of language codes exposed by the public language switcher
- `themes`: list of registered themes with `id`, `label`, and `stylesheet`
- `profiles`: list of registered profiles with `id`, `label`, and `path`
- `defaults.language`: fallback and initial language
- `defaults.theme`: fallback and initial theme
- `defaults.profile`: fallback and initial profile
- `features.profileSelector`: controls whether the profile selector appears in the tooling panel
- `integrations.ats`: ATS integration settings and providers

Current repository baseline:

- Profiles: `nikolay-nakoreshko`
- Languages: `ru`, `en`, `de`
- Themes: `default` (`Sky`), `graphite`, `sand`, `meadow`
- Default profile: `nikolay-nakoreshko`
- Default language: `en`
- Default theme: `meadow`
- ATS provider: `enhancv`

The public app loads `config/app.json` at runtime and falls back to embedded defaults when needed. Theme registration should stay in config, while actual CSS remains in `styles/themes/*.css`.

Runtime safety expectations:

- language codes must stay compatible with `profiles/<id>/locales/<code>.json`
- theme stylesheets must be relative paths under `styles/themes/`
- profile ids and paths must be explicitly registered in `config/app.json`
- ATS provider URLs must use `https`
- invalid runtime config falls back to embedded safe defaults instead of being trusted

## Running locally

### WebStorm

Shared WebStorm run configurations are included:

- `CV App Preview`
- `CV App Browser`
- `CV App Preview + Browser`

Recommended flow:

1. Open the project in WebStorm.
2. Use the IDE-managed Node interpreter.
3. Run `CV App Preview + Browser` to start the optional static preview helper and open the public page.
4. Use `CV App Preview` for preview-only work.
5. Use `CV App Browser` when the app is already available at `http://localhost:8080`.

### Preferred CLI preview

The app does not require a custom backend. For local HTTP preview, you can use the optional Node helper.

If Node is available globally:

```powershell
npm start
```

Direct preview helper start:

```powershell
node .\scripts\static-preview.js
```

Open the public app at `http://localhost:8080`.

If you keep your own untracked local tooling in `.tools`, treat it as a machine-local convenience only. It is not part of the git-tracked project baseline and is not used by the documented default workflow.

### Static hosting

The supported runtime is any standard static HTTP host or CDN that serves the repository files as static assets.

### GitHub Pages

GitHub Pages is the primary production deployment target for this repository.

- The included workflow publishes only the public runtime assets needed by the app.
- Runtime asset and config paths are relative, so the app can work both at the domain root and at a repository subpath.
- `nginx.conf` security headers do not apply on GitHub Pages, so client-side config validation is part of the production security model.

Deployment flow:

1. Enable GitHub Pages in the repository settings.
2. Set the source to `GitHub Actions`.
3. Push to `main`.
4. Let `.github/workflows/deploy-pages.yml` publish the static app.

### Docker

```powershell
docker build -t cv-generate .
docker run --rm -p 8080:80 cv-generate
```

Open `http://localhost:8080`.

Docker remains an optional static-host baseline for local or alternate hosting. It is no longer the primary production deployment path.

## Public runtime behavior

The public CV app:

- discovers available profiles from `config/app.json`
- discovers available languages and themes from `config/app.json`
- resolves the active profile from `?profile=<id>` or the configured default
- loads localized CV content from `profiles/<id>/locales/<lang>.json`
- loads per-profile metadata from `profiles/<id>/profile.json`
- loads system UI strings from `locales/system/<lang>.json`
- applies the selected theme from the registered theme stylesheet
- remembers the selected theme in browser storage
- picks the initial language from the browser when supported, otherwise uses the configured default
- keeps both screen rendering and print export tied to the same profile, content, and theme selection

## PDF export and ATS flow

The app supports two browser-print export flows:

- `Export PDF`: visual CV export
- `Export ATS PDF`: ATS-oriented print layout

Recommended browser print settings for both exports:

- Margins: `None`
- Background graphics: `Enabled`

Suggested export flow:

1. Open the app from your static host.
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

## Extending the app

### Add a profile

1. Create a folder at `profiles/<id>/`.
2. Add `profiles/<id>/profile.json` with profile metadata such as `id`, `label`, `defaultLanguage`, `languages`, and `assetsPath`.
3. Add localized CV content at `profiles/<id>/locales/<code>.json`.
4. Reserve `profiles/<id>/assets/` for future profile images, videos, and other media.
5. Register the profile in `config/app.json` under `profiles`.
6. Optionally set it as `defaults.profile`.

### Add a language

1. Add localized CV content in `profiles/<id>/locales/<code>.json`.
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

- `defaults.profile`
- `defaults.language`
- `defaults.theme`

Configured defaults should always point to an existing registered profile, language, and theme.

## Validation checklist

When changing runtime or config-related behavior, verify:

- `/` returns HTTP 200 on the chosen static host or preview helper
- `config/app.json` is served correctly
- profile locale JSON files are served correctly
- profile metadata files are served correctly
- theme CSS files are served correctly
- GitHub Pages deployment publishes only `index.html`, `config/`, `locales/`, `profiles/`, and `styles/`
- `?profile=<id>` selects the expected registered profile
- the app works from a repository subpath as well as from `/`
- screen rendering, mobile rendering, and PDF export remain aligned

## Contributor notes

- Keep the app functional without requiring a frontend build step unless the architecture is intentionally changed.
- Keep product-facing content in locale files when possible.
- Keep language and theme registration centralized in `config/app.json` rather than in isolated hardcoded runtime logic.
- Keep `config/app.json` as the app-level source of truth for languages, theme metadata, defaults, and integrations.

## Related docs

- [ROADMAP.md](./ROADMAP.md): future product and architecture phases
- [AGENTS.md](./AGENTS.md): repository-specific instructions for Codex
