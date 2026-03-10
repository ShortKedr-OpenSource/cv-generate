# AGENTS.md

## Project overview
- This project is a public CV web app, not just a static CV page.
- The app presents a CV as a public web page with multilingual support, theme selection, and PDF export.
- Languages and visual themes are intended to be extendable by a developer or a server administrator.
- Default language and default theme are product-level configuration, not one-off hardcoded choices.
- Main page: `index.html`
- App config: `config/app.json`
- Profile content: `profiles/<id>/profile.json`, `profiles/<id>/locales/*.json`
- Theme styles: `styles/themes/*.css`
- System locale files: `locales/system/*.json`
- Optional local preview helper: `scripts/static-preview.js`
- Production hosting config: `Dockerfile`, `nginx.conf`

## Product direction
- Treat the current implementation as a lightweight baseline for a configurable static web application.
- Do not frame the product as "just a static site" in future changes.
- Preserve compatibility between screen rendering, mobile rendering, and PDF export.
- Keep the system extensible for future theme and language additions.
- Configuration is file-based; do not introduce admin/runtime config editors unless explicitly requested.
- Keep the app functional without a frontend build step unless the architecture is intentionally changed.
- Treat `config/app.json` as the app-level source of truth for languages, theme metadata, profile registration, defaults, features, and integrations. Keep actual theme styles in `styles/themes/*.css`.

## Preferred workflow for Codex
- Prefer editing `index.html`, `package.json`, `README.md`, `AGENTS.md`, `config/app.json`, files in `profiles/`, and files in `locales/system/`.
- Preserve translation support and avoid breaking existing language keys unless the change explicitly restructures the locale model.
- Use English for commit messages and for developer-maintained project files by default.
- Non-English content is allowed only in product-facing content such as localized strings, CV content, and other locale data.
- Do not hardcode new themes or languages in one isolated place without updating the configuration model.
- Do not hardcode new profiles in one isolated place without updating the configuration model.
- When changing UI or layout, consider desktop, tablet, mobile, and PDF/export behavior together.
- Use the optional preview helper in `scripts/static-preview.js` only for local HTTP verification; it is not part of the product runtime.
- For WebStorm workflow, prefer the shared run configurations `CV App Preview + Browser` for local preview, `CV App Preview` for preview-only work, and `CV App Browser` when the app is already being served.
- Do not change the preview helper entrypoint without updating the shared WebStorm run configuration in `.idea/runConfigurations/`.

## Patch workflow
- If the built-in patch tool is unreliable in this environment, prefer the local wrapper `scripts/apply-diff.ps1`.
- Apply a patch file with `powershell -ExecutionPolicy Bypass -File .\scripts\apply-diff.ps1 .\my-change.diff`.
- Validate a patch without applying it with `powershell -ExecutionPolicy Bypass -File .\scripts\apply-diff.ps1 .\my-change.diff -Check`.

## Security guidance
- Do not place secrets or privileged configuration in client-visible code.
- Validate configuration inputs for profiles, languages, themes, and defaults.
- Assume the app is hosted as public static content unless a task explicitly introduces a protected service.

## Run commands
- Preferred WebStorm run configs: `CV App Preview + Browser`, `CV App Preview`, `CV App Browser`
- Preferred local CLI preview: `npm start`
- Direct preview helper start: `node .\scripts\static-preview.js`
- Docker start: `docker build -t cv-generate .` then `docker run --rm -p 8080:80 cv-generate`

## Validation
- Verify that `/` returns HTTP 200 on the chosen static host or preview helper.
- Verify that `config/app.json`, profile metadata files, theme CSS files, and locale JSON files are served correctly.
- Keep screen layout and PDF export behavior aligned with product expectations.
- Keep the shared WebStorm run configuration valid when IDE workflow is part of the project.
- For GitHub Pages, remember that `nginx.conf` headers do not apply; app-side validation must enforce link and theme safety.
