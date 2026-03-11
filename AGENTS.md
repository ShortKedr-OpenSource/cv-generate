# AGENTS.md

## Project overview

- This project is a public CV web app, not just a static CV page.
- The app presents CV content as a multilingual public page with theme switching, profile switching, media support, and PDF export.
- Languages, profiles, and visual themes are intended to be extendable through file-based configuration.
- Default language, default theme, and default profile are product-level configuration, not one-off hardcoded choices.
- Main page entry: `index.html`
- Vue app source: `src/`
- App config: `config/app.json`
- Profile content: `profiles/<id>/profile.json`, `profiles/<id>/locales/*.json`
- Theme styles: `styles/themes/*.css`
- Vue structural styles: `src/styles/`
- System locale files: `locales/system/*.json`
- Production hosting config: `Dockerfile`, `nginx.conf`

## Product direction

- Treat the implementation as a configurable static-hosted web application with a Vue 3 + Vite frontend.
- Do not frame the product as "just a static site" in future changes.
- Preserve compatibility between screen rendering, mobile rendering, and PDF export.
- Keep the system extensible for future profiles, languages, themes, and integrations.
- Configuration is file-based; do not introduce admin/runtime config editors unless explicitly requested.
- Treat `config/app.json` as the app-level source of truth for languages, theme metadata, profile registration, defaults, features, versioning, and integrations.
- Keep actual theme styles in `styles/themes/*.css`.
- Prefer evolving app-structure styling in `src/styles/` or Vue component styles instead of reintroducing a monolithic global CSS file.

## Preferred workflow for Codex

- Prefer editing `src/`, `index.html`, `package.json`, `README.md`, `AGENTS.md`, `ROADMAP.md`, `config/app.json`, files in `profiles/`, and files in `locales/system/`.
- Preserve translation support and avoid breaking existing language keys unless the change explicitly restructures the locale model.
- Use English for commit messages and for developer-maintained project files by default.
- Non-English content is allowed only in product-facing content such as localized strings, CV content, and other locale data.
- Do not hardcode new themes, languages, or profiles in isolated runtime logic without updating the configuration model.
- When changing UI or layout, consider desktop, tablet, mobile, and PDF/export behavior together.
- Treat Docker/nginx as an optional static-hosting baseline, not as the default local development workflow.
- For WebStorm workflow, prefer `CV App Preview` for local development and `CV App Production Preview` to inspect the built `dist` output after `npm run build`.
- Open the browser manually against the local Vite URL instead of keeping extra browser-only and compound IDE configurations.
- Keep shared WebStorm run configurations in `.idea/runConfigurations/` aligned with the current Vite-based workflow.

## Patch workflow

- If the built-in patch tool is unreliable in this environment, prefer the local wrapper `scripts/apply-diff.ps1`.
- Apply a patch file with `powershell -ExecutionPolicy Bypass -File .\scripts\apply-diff.ps1 .\my-change.diff`.
- Validate a patch without applying it with `powershell -ExecutionPolicy Bypass -File .\scripts\apply-diff.ps1 .\my-change.diff -Check`.

## Security guidance

- Do not place secrets or privileged configuration in client-visible code.
- Validate configuration inputs for profiles, languages, themes, defaults, version metadata, and integrations.
- Assume the app is hosted as public static content unless a task explicitly introduces a protected service.

## Run commands

- Preferred WebStorm run configs: `CV App Preview`, `CV App Production Preview`
- Preferred local CLI dev start: `npm start`
- Preferred local CLI production preview: `npm run build` then `npm run preview:local`
- Preferred local CLI validation build: `npm run build`
- Docker start: `docker build -t cv-generate .` then `docker run --rm -p 8080:80 cv-generate`

## Validation

- Verify that `/` returns HTTP 200 on the chosen Vite dev server and local Vite preview.
- Verify that `/` returns HTTP 200 on Docker-hosted local static output when Docker workflow is involved.
- Verify that `/cv-generate/` returns HTTP 200 on GitHub Pages or any repository-subpath deployment.
- Verify that `config/app.json`, profile metadata files, theme CSS files, locale JSON files, and media assets are served correctly.
- Keep screen layout, mobile layout, and PDF export behavior aligned with product expectations.
- Keep shared WebStorm run configurations valid when IDE workflow is part of the project.
- For GitHub Pages, remember that `nginx.conf` headers do not apply; app-side validation must enforce link and theme safety.

## Migration notes

- The app has already migrated from inline page JavaScript to a Vue 3 + Vite application.
- Prefer continuing the migration by extracting reusable Vue components, composables, services, and utilities rather than reintroducing large monolithic scripts.
- Preserve the current file-driven content model while improving internal app structure.
