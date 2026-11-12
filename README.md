# Creative Nerds website

This repository is a rebuild of the Creative Nerds website. It keeps the editable content in `content/`, page source and templates in `src/`, and builds plain static files into `dist/` for Apache hosting.

## Run locally

Requirements: Node.js 20 or newer. There are no third-party packages to install.

```sh
npm run build
npm run check
npm run dev
```

Open `http://127.0.0.1:4175/`. If that port is already used, run `node tools/preview-server.mjs dist 4176` and use port 4176. The preview server serves the generated `dist/` directory only.

## Edit content

- Page copy and markup: `src/pages/`
- Shared layout and reusable sections: `src/partials/`
- Page layout templates: `src/templates/`
- Service facts and FAQs: `content/services/`
- Journal articles and project case records: `content/blogs/` and `content/work/`
- Brand settings, verified client names, and testimonials: `content/`
- Styling and interactions: `assets/styles/` and `assets/scripts/`

Read [docs/FILE-GUIDE.md](docs/FILE-GUIDE.md) for the responsibility of each project file and [docs/TODO-from-client.md](docs/TODO-from-client.md) for details that still need owner-approved source information.

## Publishing

The site is static. Upload the contents of `dist/` to the hosting document root. Do not upload `src/`, `content/`, `_archive/`, or development tools as the public site. Apache uses the included `.htaccess` for redirects, compression and cache headers.

The contact form opens an email draft until an approved form endpoint is configured in `content/site.config.json`. A real endpoint must be tested on the host before it is entered there.
