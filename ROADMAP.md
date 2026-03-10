# Roadmap

This document tracks the future-facing product and architecture direction for CV Generate. For the current implementation and usage details, see [README.md](./README.md).

## Direction

CV Generate should continue evolving as a configurable static CV web app, not as a one-off static page. The roadmap focuses on keeping the system easy to host while making content, themes, runtime behavior, and file-based configuration workflows more maintainable.

## Phase 1: Config-driven baseline

Status: in place as the current baseline.

Goals:

- keep `config/app.json` as the source of truth for languages, themes, defaults, profile metadata, and integration switches
- keep runtime discovery of languages and themes driven by config rather than isolated hardcoded registration
- preserve operation without a frontend build step

## Phase 2: Content model extraction

Goals:

- move more CV/profile content out of `index.html` and into file-driven content resources
- make `locales/*.json` responsible for structured localized content, not only text labels
- define a stable content model for sections such as summary, experience, education, contacts, certifications, and skills

## Phase 3: Theme and locale extensibility

Goals:

- keep theme files implemented in `styles/themes/*.css` and registered centrally through config
- make language and theme addition a file-based workflow
- validate configured defaults against the available registered resources
- reduce the risk of config drift between runtime metadata and actual files

## Phase 4: Public runtime hardening

Goals:

- keep language and theme switching fully driven by discovered config data
- keep visual export and ATS export aligned with the same source content
- preserve consistency across desktop, mobile, and print rendering
- make integration-driven UI behavior, such as ATS actions, predictable and configurable

## Phase 5: Static hosting polish

Goals:

- keep the supported runtime limited to standard static hosting and local preview helpers
- reduce the amount of application logic concentrated directly in `index.html`
- improve documentation and project structure for file-based configuration workflows
- keep deployment artifacts aligned with static hosting only

## Ongoing constraints

- no secrets in client-visible code
- file-based configuration as the default operating model
- compatibility across screen rendering, mobile rendering, and PDF export
- extensibility for future languages, themes, and integrations