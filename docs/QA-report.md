# Build and QA report

## Automated checks

- Static build: 41 HTML pages generated successfully.
- Internal links and local HTML asset paths: passed across 41 pages.
- SEO metadata and one-H1 checks: passed across all 41 generated pages.
- JSON-LD: all generated structured-data blocks parse as JSON.
- Production files are emitted to `dist/`; source files are not changed by builds.

## Manual browser checks

The local preview returned HTTP 200 for the homepage, journal stylesheet, portal and card-interaction scripts, video, and blog index at `http://127.0.0.1:4177/`. The browser automation tool stopped because it could not verify the current browser URL, so a visual screenshot and interactive browser pass did not complete. Do not report Lighthouse scores until the site is accessible to Lighthouse on the deployment or a local browser.

## Known constraints

- No browser console/performance capture or Lighthouse run was possible in this environment so far.
- Direct server-form delivery cannot be confirmed until the owner supplies a form endpoint.
- Browser validation must still cover the homepage video reveal while scrolling, section reveal, project filtering, form validation/email fallback, keyboard menu, and phone widths.
