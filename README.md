# CV Generated

## Product overview

CV Generated is a public CV web app. It allows a user to present a CV as a public web page, switch between multiple languages, choose a visual theme, and export the current view to PDF.

The product is also intended to be extensible for developers or server administrators:
- add new languages
- add new visual themes
- set the default language
- set the default theme
- manage configuration through protected access

At the current stage, the project is still implemented as a lightweight web app baseline, but the product direction is broader than a single static page.

## Current configuration baseline

Phase 1 is now grounded around a single read-only app config resource: `config/app.json`.

It currently defines:
- `languages`: public languages available in the UI
- `themes`: registered visual themes and their tokens
- `defaults.language`: fallback/default language
- `defaults.theme`: fallback/default theme
- `profile`: non-sensitive app-level profile metadata


Localized CV content remains in `locales/*.json`, while app initialization now starts from `config/app.json`.
## Lightweight admin access

The project now includes a lightweight protected admin config route for the next roadmap phase:
- route: `/admin/config/app`
- mode: read-only
- auth: `Authorization: Bearer <token>` or `x-admin-token`
- enable it by setting `ADMIN_CONFIG_TOKEN`
- deny by default: if no token is configured, the route is disabled
- HTTPS is required for non-local access; plain HTTP is only tolerated for local development on `localhost`

### Local example

```powershell
$env:ADMIN_CONFIG_TOKEN='dev-token'
.\.tools\node\node.exe .\server.js
```

Then request it locally:

```powershell
Invoke-WebRequest -Uri 'http://localhost:8080/admin/config/app' -Headers @{ Authorization = 'Bearer dev-token' }
```

Or open the minimal admin page in the browser:

- [admin/index.html](C:/Users/short/OneDrive/Рабочий стол/CV Generated/admin/index.html)
- URL: `http://localhost:8080/admin/`

## Roadmap

### Phase 1: Product baseline
- formalize application data around `languages`, `themes`, `profile content`, and `defaults`
- treat the current single-file implementation as a baseline, not the final architecture
- allow the first admin mechanism to be lightweight and based on protected HTTPS access to web resources or configuration endpoints

### Phase 2: Extensibility
- move themes into a separate configuration model similar to languages
- make default language and default theme part of application config
- define what is public-user configurable and what is admin/developer configurable

### Phase 3: User-facing configurability
- expose stable language and theme selection in the public UI
- keep PDF export aligned with the currently selected language and theme

### Phase 4: Admin/developer workflow
- define the process for adding a language
- define the process for adding a theme
- keep room for a future lightweight admin app or protected config layer

### Phase 5: Architecture hardening
- split presentation, locale/content, export/print, server/config, and admin access layers
- move away from a growing single-file HTML implementation when product complexity requires it

## Security requirements

Administrative operations must be treated as protected from the beginning:
- HTTPS only
- explicit authentication and access profile
- no anonymous public writes to configs
- no secrets in client code
- separation between public and administrative resources
- validation for language, theme, and default-setting inputs
- restricted scope for what files/configs can be changed
- safe defaults with deny-by-default and minimum required permissions

## Quick start

### WebStorm

This project now includes shared WebStorm run configurations: `CV App Server`, `CV App Browser`, and `CV App Server + Browser`.

How to run it in WebStorm:
1. Open the project in WebStorm.
2. Make sure the project uses the IDE-managed Node interpreter.
3. Select CV App Server + Browser in the run configuration dropdown if you want WebStorm to start the server and open the page automatically.
4. Or select CV App Browser if the server is already running and you only want to open http://localhost:8080.
5. Press Run.

The shared server configuration launches `server.js` directly with `PORT=8080`, so WebStorm can use its own built-in Node runtime without relying on `.tools/node`. The browser config opens the public page separately, and the compound config runs both together.

### Recommended CLI start in this repo

If you already have the portable Node inside `.tools/node`, run:

```powershell
.\.tools\node\npm.cmd start
```

Open: `http://localhost:8080`

### Start with global Node.js

If `node` and `npm` are installed globally, run:

```powershell
npm start
```

### Direct start without npm

```powershell
.\.tools\node\node.exe .\server.js
```

## Configuration workflow

### Add a language

1. Create a new file in `locales/`, for example `locales/fr.json`.
2. Add the language code to `config/app.json` under `languages`.
3. If needed later, set it as `defaults.language`.

### Register a theme

1. Add a new object to `config/app.json` under `themes`.
2. Give it a unique `id`, a `label`, and a `tokens` map with CSS variable values. Registered themes appear automatically in the public theme switcher.
3. If needed later, set it as `defaults.theme`.

### Change defaults

Edit `config/app.json`:
- `defaults.language`
- `defaults.theme`

At this stage, config is changed directly by the developer or server administrator in repo/deploy assets. Protected admin access is a later roadmap phase.

## Docker

```powershell
docker build -t cv-generated .
docker run --rm -p 8080:80 cv-generated
```

Open: `http://localhost:8080`

## Codex environment

This project includes [AGENTS.md](C:/Users/short/OneDrive/Рабочий стол/CV Generated/AGENTS.md) with project-specific instructions for Codex:
- product framing
- preferred workflow
- run commands
- validation expectations

## Hosting

This repo includes production-ready static hosting config in `Dockerfile` and `nginx.conf`.
