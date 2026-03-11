[![Deploy GitHub Pages](https://github.com/ShortKedr-OpenSource/cv-generate/actions/workflows/deploy-pages.yml/badge.svg?branch=main)](https://github.com/ShortKedr-OpenSource/cv-generate/actions/workflows/deploy-pages.yml)

# CV Generate

Open app: [shortkedr-opensource.github.io/cv-generate](https://shortkedr-opensource.github.io/cv-generate/)

CV Generate is a configurable public CV web app. It presents CV content as a multilingual web experience with theme switching, profile switching, media support, and browser-based PDF export while keeping product configuration file-driven.

The runtime is now implemented as a Vue 3 application built with Vite and deployed as compiled static output. The product still uses file-based configuration and content so that profiles, locales, themes, and integrations remain easy to extend without adding a backend.

See [ROADMAP.md](./ROADMAP.md) for upcoming product and architecture phases.

## Current capabilities

- Vue 3 + Vite frontend with static-host-friendly deployment
- Multilingual CV content loaded from `profiles/<id>/locales/*.json`
- Localized system UI strings loaded from `locales/system/*.json`
- Config-driven profile registration, defaults, feature flags, and ATS integration in `config/app.json`
- Config-driven theme registration backed by `styles/themes/*.css`
- Profile selector with searchable options
- Optional media posts per profile with localized descriptions
- Browser print export for both visual CV and ATS-oriented layouts
- Build/version watermark and cache-busting through `version` and `buildHash`
- GitHub Pages deployment and optional Docker-based static hosting support

## Architecture overview

Key files and folders:

- `index.html`: Vite app entry HTML
- `src/`: Vue application source, components, composables, services, and utilities
- `config/app.json`: app-level source of truth for languages, themes, profiles, defaults, features, versioning, and integrations
- `profiles/<id>/profile.json`: per-profile metadata such as contacts, supported languages, assets path, and media post structure
- `profiles/<id>/locales/*.json`: localized CV content and localized media captions
- `profiles/<id>/assets/`: profile media assets
- `locales/system/*.json`: localized UI strings
- `styles/themes/*.css`: registered theme stylesheets
- `src/styles/`: Vue-owned structural, responsive, and print styling layers
- `.github/workflows/deploy-pages.yml`: GitHub Pages build and deploy workflow
- `Dockerfile`, `nginx.conf`: optional containerized static-host baseline
- `.idea/runConfigurations/`: shared WebStorm run configurations for local development and preview

## Configuration model

`config/app.json` is the public runtime source of truth.

Current top-level fields:

- `version`: human-readable app version
- `buildHash`: build/release hash used for cache invalidation
- `languages`: supported UI and content language codes
- `themes`: registered themes with `id`, `label`, and `stylesheet`
- `profiles`: registered profiles with `id`, `label`, and `path`
- `defaults.profile`, `defaults.language`, `defaults.theme`: initial fallback selections
- `features.profileSelector`: toggles the profile selector UI
- `integrations.ats`: ATS integration settings and providers

Current repository baseline:

- Profiles: `nikolay-nakoreshko`, `hide-the-pain-harold`
- Languages: `ru`, `en`, `de`
- Themes: `default` (`Sky`), `graphite`, `sand`, `meadow`
- Default profile: `hide-the-pain-harold`
- Default language: `en`
- Default theme: `meadow`
- ATS provider: `enhancv`

Profile metadata and content responsibilities:

- `profile.json` stores structural data such as contacts, supported languages, assets path, and media post file references
- `locales/*.json` store localized CV copy and localized media descriptions
- `styles/themes/*.css` remain the source of visual theme CSS, while theme registration stays centralized in config

Runtime safety expectations:

- language codes must match available locale files
- theme stylesheets must remain relative paths under `styles/themes/`
- profile ids and paths must be explicitly registered in `config/app.json`
- ATS provider URLs must use `https`
- client-visible runtime data should be validated before use

## Running locally

### CLI

Start the Vite dev server:

```powershell
npm start
```

Open the app at `http://localhost:5173/`.

Build the production output:

```powershell
npm run build
```

Preview the built `dist` output locally:

```powershell
npm run preview:local
```

Open the built app at `http://localhost:4173/`.

### WebStorm

Shared WebStorm run configurations are included:

- `CV App Preview`
- `CV App Production Preview`

Recommended flow:

1. Open the project in WebStorm.
2. Use the IDE-managed Node interpreter.
3. Run `CV App Preview` for local development.
4. Open `http://localhost:5173/` in the browser.
5. Run `npm run build` before using `CV App Production Preview` to inspect the compiled static output.
6. Open `http://localhost:4173/` in the browser when the production preview server is running.

### Docker

Build and run the compiled app through nginx:

```powershell
docker build -t cv-generate .
docker run --rm -p 8080:80 cv-generate
```

Open `http://localhost:8080`.

Docker and nginx are still useful in this repository as an optional production-like static hosting baseline, but they are no longer required for everyday local development. The default local workflow is Vite dev/build/preview.

### GitHub Pages

GitHub Pages is the primary production deployment target.

The workflow:

- installs dependencies with `npm ci`
- builds the Vue app with Vite
- copies runtime config/content/assets into `dist`
- stamps `buildHash` into the published `dist/config/app.json`
- publishes the compiled static output

Because the built asset paths are relative, the app can work both at `/` and at a repository subpath such as `/cv-generate/`.

## Public runtime behavior

The app:

- reads `config/app.json` on bootstrap
- resolves the active profile from `?profile=<id>` or the configured default
- loads per-profile metadata from `profiles/<id>/profile.json`
- loads localized profile content from `profiles/<id>/locales/<lang>.json`
- loads system UI strings from `locales/system/<lang>.json`
- switches themes using registered theme stylesheets
- remembers selected language, theme, and controls panel state in browser storage
- uses `version` and `buildHash` to invalidate cached static resources
- renders both screen and print views from the same source content

## PDF export and ATS flow

Two export flows are supported:

- `Export PDF`: visual CV export
- `Export ATS PDF`: ATS-oriented print layout

Recommended browser print settings:

- Margins: `None`
- Background graphics: `Enabled`

ATS behavior is controlled by `config/app.json` under `integrations.ats`.

Current baseline:

- ATS integration is enabled
- the configured provider is `Enhancv ATS Score`
- the provider opens in a new tab
- the provider expects the user to upload a PDF exported from this app

## Extending the app

### Add a profile

1. Create `profiles/<id>/`.
2. Add `profiles/<id>/profile.json`.
3. Add localized content in `profiles/<id>/locales/<code>.json`.
4. Add any media assets in `profiles/<id>/assets/`.
5. Register the profile in `config/app.json`.
6. Optionally update `defaults.profile`.

### Add a language

1. Add localized CV content in `profiles/<id>/locales/<code>.json`.
2. Add system UI strings in `locales/system/<code>.json`.
3. Register the language in `config/app.json`.
4. Optionally update `defaults.language`.

### Add a theme

1. Create a stylesheet in `styles/themes/`.
2. Register it in `config/app.json`.
3. Optionally update `defaults.theme`.

### Change defaults or build metadata

Update these fields in `config/app.json` as needed:

- `defaults.profile`
- `defaults.language`
- `defaults.theme`
- `version`

`buildHash` is automatically stamped for GitHub Pages during deployment.

## Validation checklist

When changing runtime, config, or deployment behavior, verify:

- `/` returns HTTP 200 on the Vite dev server
- `/` returns HTTP 200 on local built preview and Docker hosting
- `/cv-generate/` returns HTTP 200 on GitHub Pages or other repository-subpath hosting
- `config/app.json` is served correctly
- profile metadata files are served correctly
- profile locale files are served correctly
- theme CSS files are served correctly
- media assets are served correctly
- `?profile=<id>` selects the expected profile
- desktop, mobile, and print rendering remain aligned

## Contributor notes

- The app intentionally uses a frontend build step through Vue 3 + Vite.
- Keep product-facing text in locale files whenever possible.
- Keep profile, language, theme, default, and integration registration centralized in `config/app.json`.
- Keep actual theme CSS in `styles/themes/*.css`.
- Keep app-structure styling in `src/styles/` rather than rebuilding a monolithic global stylesheet.

## Related docs

- [ROADMAP.md](./ROADMAP.md)
- [AGENTS.md](./AGENTS.md)
