# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ЦифроПед** — a static educational platform for future primary school teachers, teaching digital tools for modern classrooms. Russian-language content. Hosted on Netlify.

## Architecture

- **Static HTML site** — no build step, no bundler, no framework. Pages are plain `.html` files at the repo root.
- **CMS**: Decap CMS (formerly Netlify CMS) at `/admin/`, configured in `admin/config.yml`. Uses git-gateway backend on the `main` branch.
- **Content**: Markdown files with YAML frontmatter in `content/modules/`, `content/library/`, `content/safety/`. CMS collections map to these folders.
- **Module pages** (`module-*.html`): Templated shells that load content at runtime via `js/module-loader.js`. The loader fetches a markdown file, parses YAML frontmatter with a custom parser, and injects fields (title, goals, theory, pedagogy, practice, reflection) into DOM elements by ID.
- **Styling**: Single `css/style.css`, no preprocessor.
- **JS**: `js/main.js` (mobile nav, scroll fade-in, accordion, progress bars, active nav link) + `js/module-loader.js` (content loading).

## Adding a New Module

1. Create a markdown file in `content/modules/` with the standard frontmatter fields (title, number, description, goals, theory, pedagogy, practice, reflection).
2. Create a `module-N.html` page following the pattern in `module-1.html` — it's a shell that calls `loadModule('content/modules/<slug>.md')`.
3. Add a link to the new module on `index.html` and `course.html`.

## Development

No build or install step. Open HTML files directly in a browser or serve with any static server:

```
python3 -m http.server 8000
# or
npx serve .
```

Module content loading (`fetch()`) requires serving over HTTP, not `file://`.
