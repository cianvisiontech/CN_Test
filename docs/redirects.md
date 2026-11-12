# URL and redirect notes

The existing primary page paths remain available: `/`, `/aboutus.html`, `/services.html`, `/projects.html`, `/contact.html`, `/privacy-policy.html`, `/blogs.html`, and the existing article paths. The old article URLs are retained from article metadata, including the nested `/blogs/2/` group. A source post with spaces and capital letters now uses a clean lowercase path, and `.htaccess` redirects the old URL to it.

Archived theme/demo endpoints are redirected by `.htaccess`:

- `/project-details-v1.html` → `/projects.html`
- `/blog-v1.html` and `/blog-details.html` → `/blogs.html`
- `/blogs/2/blogs.html` and `/blogs/blogs.html` → `/blogs.html`
- Old service article links are rewritten to the new `/services/{slug}.html` paths while articles are rendered.
- The former uppercase/space article route redirects to `/blogs/2/what-business-goals-is-your-current-website-not-meeting.html`.

Before deployment, confirm the preferred canonical host. The current canonical URL is the non-www domain from `content/site.config.json`; `.htaccess` must use the same host.
