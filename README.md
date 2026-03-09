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

### Recommended start in this repo

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
