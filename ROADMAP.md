# Roadmap

This document tracks the future-facing product and architecture direction for CV Generate. For the current implementation and usage details, see [README.md](./README.md).

## Direction

CV Generate should continue evolving as a configurable public CV web app that is easy to host statically while remaining maintainable for future profiles, languages, themes, media content, and integrations.

The current implementation uses a Vue 3 + Vite frontend with file-based runtime content. The next phases focus on deepening that architecture without losing the simplicity of static hosting.

## Phase 1: Config-driven baseline

Status: completed.

Delivered:

- `config/app.json` is the runtime source of truth for languages, themes, defaults, profiles, features, versioning, and integrations
- profiles, themes, and languages are registered centrally instead of in isolated hardcoded runtime logic
- profile metadata and localized content are stored in file-based resources

## Phase 2: Structured content model

Status: completed as the current baseline.

Delivered:

- CV/profile content lives in profile locale files rather than in `index.html`
- profile metadata is separated from localized content
- media post metadata and localized media descriptions are supported
- sections such as summary, experience, education, contacts, certifications, and skills use a stable file-driven structure

## Phase 3: Vue app foundation

Status: completed as the current baseline.

Delivered:

- the app runtime now uses Vue 3 + Vite
- application logic is no longer concentrated in `index.html`
- GitHub Pages now deploys compiled static output
- Docker hosting now builds and serves the compiled app

## Phase 4: Internal architecture cleanup

Status: in progress.

Goals:

- continue splitting large composables into focused services, utilities, and smaller composables
- reduce coupling between data loading, browser integration, and UI state
- introduce more reusable Vue components for cards, sections, and print-specific blocks
- keep runtime behavior unchanged while making future feature work safer

## Phase 5: Styling and layout modernization

Goals:

- gradually reduce dependence on one large global stylesheet where practical
- move structural styling closer to components without breaking theme compatibility
- preserve consistency across desktop, tablet, mobile, and print
- keep theme token CSS in `styles/themes/*.css`

## Phase 6: Runtime hardening and UX polish

Goals:

- strengthen validation for config, locale, profile, and media resources
- improve loading, empty, and failure states in the Vue app
- keep profile selection, language switching, theme switching, and media rendering predictable
- preserve export behavior and ATS flow with the same source content

## Phase 7: Content and extension workflows

Goals:

- make adding a profile, language, theme, or media asset more documented and less error-prone
- keep repository structure friendly for future contributors and administrators
- improve tooling and validation around file-based extension workflows

## Ongoing constraints

- no secrets in client-visible code
- file-based configuration as the default operating model
- compatibility across screen rendering, mobile rendering, and PDF export
- extensibility for future profiles, languages, themes, and integrations
- static hosting remains the deployment model unless explicitly changed
