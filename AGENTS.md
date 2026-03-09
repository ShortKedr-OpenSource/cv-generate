# AGENTS.md

## Project overview
- This project is a public CV web app, not just a static CV page.
- The app presents a CV as a public web page with multilingual support, theme selection, and PDF export.
- Languages and visual themes are intended to be extendable by a developer or a server administrator.
- Default language and default theme are product-level configuration, not one-off hardcoded choices.
- Main page: `index.html`
- Locale files: `locales/*.json`
- Local HTTP server: `server.js`
- Production hosting config: `Dockerfile`, `nginx.conf`

## Product direction
- Treat the current implementation as a lightweight baseline for a configurable web application.
- Do not frame the product as "just a static site" in future changes.
- Preserve compatibility between screen rendering, mobile rendering, and PDF export.
- Keep the system extensible for future theme and language additions.

## Preferred workflow for Codex
- Prefer editing `index.html`, `server.js`, `package.json`, `README.md`, `AGENTS.md`, and files in `locales/`.
- Preserve translation support and avoid breaking existing language keys unless the change explicitly restructures the locale model.
- Do not hardcode new themes or languages in one isolated place without updating the configuration model.
- When changing UI or layout, consider desktop, tablet, mobile, and PDF/export behavior together.
- When adding admin-oriented capabilities, assume the first version may rely on protected HTTPS-based access to web resources or config endpoints rather than a full admin panel.
- Follow safe defaults for any admin or config-related work.

## Security guidance
- Treat administrative operations as protected.
- Assume HTTPS is required for administrative access.
- Do not place secrets or privileged configuration in client-visible code.
- Separate public resources from admin/config resources.
- Validate configuration inputs for languages, themes, and defaults.
- Prefer deny-by-default and minimum required access when introducing admin-related behavior.

## Run commands
- Preferred local start: `npm start`
- Portable Node start: `.\\.tools\\node\\npm.cmd start`
- Direct server start: `.\\.tools\\node\\node.exe .\\server.js`
- Docker start: `docker build -t cv-generated .` then `docker run --rm -p 8080:80 cv-generated`

## Validation
- After server-related changes, verify that `/` returns HTTP 200.
- Verify that `locales/manifest.json` is served correctly.
- Keep screen layout and PDF export behavior aligned with product expectations.
- Keep the app functional without a frontend build step unless the architecture is intentionally changed.
