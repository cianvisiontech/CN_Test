# Project file guide

## Root files

- `README.md` — quick start and publishing instructions.
- `package.json` — named build, preview, and quality-check commands. No package dependencies are required.
- `package-lock.json` — npm lockfile to make installs repeatable in CI.
- `.gitignore` — excludes generated files, local secrets, and machine-only files.
- `.htaccess` — Apache redirects, HTTPS and host normalization, compression, caching, and the custom 404 route.
- `robots.txt` — crawler access rules and sitemap location in the generated site.

## `src/`

- `src/build.mjs` — reads content/configuration and source templates, renders static HTML, copies the production asset set, and writes `dist/`, sitemap, and robots rules.
- `src/pages/` — editable page body fragments for home, about, service overview, projects, contact, privacy, thank-you, and 404 pages. Shared header and footer are added by the build.
- `src/partials/` — reusable header, footer, CTA, GTM noscript, breadcrumbs, card, and related-reading fragments.
- `src/templates/page.html` — common HTML shell for page title, SEO metadata, JSON-LD, site navigation, body, footer, and JavaScript entry point.
- `src/templates/service.html`, `blog-post.html`, `blog-index.html`, and `case-study.html` — reference layouts for the dynamic content types. The renderer assembles their current page layouts from the same data.

## `content/`

- `site.config.json` — canonical domain, Google Tag Manager ID, contact details, social profiles, and optional contact endpoint.
- `clients.json` — client names and verified relationships used in the site.
- `testimonials.json` — published client quotes and source notes.
- `facts.json` and `team.json` — owner-verified facts and team profiles. Empty values mean no verified detail was available.
- `services/*.json` — one record per service, including the audience, deliverables, process, FAQs, and related content.
- `blogs/**/*.html` — complete HTML source documents. Edit the article markup inside `<body>` and article fields in the `<head>` `cn:*` meta tags. Original published `.html` routes are preserved.
- `work/*.html` — one complete HTML source document per project. Edit the project copy in `<body>` and the corresponding project fields in the `<head>` `cn:*` meta tags.
- `work/_unpublished/` — project drafts that must not appear in production until approved.

## `assets/`

- `images/brand/` — official Creative Nerds logo, favicon, and social preview image.
- `images/about/` — Creative Nerds supplied about-page artwork.
- `images/portfolio/` — client artwork supplied in the source website and used on project cards.
- `images/journal/` — article cover images.
- `fonts/` — local Outfit font weights used by the design.
- `styles/tokens.css` — brand colors, typography and layout variables.
- `styles/base.css` — reset, page defaults, and global typography.
- `styles/components.css` — header, buttons, cards, grid, form, and reusable interface components.
- `styles/pages.css` — home, about, project, service, contact and case-study layouts, including responsive rules.
- `styles/journal.css` — article list and reading layout.
- `styles/motion.css` — reveal transitions, ticker movement, reduced-motion rules, and the A reveal layer.
- `scripts/main.js` — starts the site's client-side interactions and fills the copyright year.
- `scripts/navigation.js` — mobile menu open/close and keyboard behavior.
- `scripts/scroll-effects.js` — shared IntersectionObserver reveal setup and the single scroll/resize animation frame.
- `scripts/portal-reveal.js` — scales the inline SVG wordmark toward its A counter as the page scrolls, revealing the video through the A mask; also animates the oversized “MAKE MATTER” copy.
- `scripts/interactions.js` — adds pointer spotlights to capability, work and journal cards and a gentle tilt to journal cards on desktop; it respects reduced-motion settings.
- `scripts/portfolio-filter.js` — filters project cards by website or social category.
- `scripts/contact-form.js` — validates the enquiry form and either posts to a configured endpoint or opens a prefilled email draft.
- `scripts/preview-placeholders.js` — enables optional owner-only preview markers with `?preview=1`.
- `video/portal-reel.mp4` — the short, muted, looping video used in the homepage A reveal.

## `scripts/`, `tools/`, `docs/`, `.github/`, `_archive/`

- `scripts/migrate-blog-content.mjs` — one-time migration helper used to structure the existing articles.
- `scripts/check-links.mjs` — checks generated HTML for missing local files.
- `scripts/validate-seo.mjs` — checks titles, descriptions, canonical/OG/Twitter metadata, one H1, and GTM on every generated page.
- `scripts/validate-schema.mjs` — parses each generated JSON-LD block.
- `tools/preview-server.mjs` — small Node static file server for the generated `dist/`; it is not part of production hosting.
- `docs/` — file guide, source audit, redirect inventory, owner information requests, and validation report.
- `.github/workflows/` — CI build and static checks for the `redesign` branch.
- `_archive/` — original pages, scripts, styles, and unused source assets preserved during the rebuild for traceability. The builder does not publish the archive.

## Animation guide

- Homepage hero copy enters with a short text reveal.
- The oversized SVG wordmark section stays pinned while the A-shaped mask expands to reveal the muted studio video; the letters scale toward the A as the scroll continues.
- “MAKE MATTER” slides into view below the video portal, with separate horizontal movement for each line.
- The capabilities ticker moves horizontally and pauses for reduced-motion preferences.
- Section cards and headings reveal when they enter the viewport.
- Project images scale subtly on hover; card filtering works without a reload.
- Capability, project and journal cards show a pointer spotlight; journal cards gently tilt on desktop.
- The mobile menu expands in place, and honors Escape and link selection.
- `prefers-reduced-motion` disables large transitions and the ticker, and keeps content visible.
