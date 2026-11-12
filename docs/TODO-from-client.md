# Owner-provided details still needed

The redesign uses only information found in Creative Nerds source files and the existing public site. Please supply or confirm the following before treating every portfolio page and lead path as final:

- Approved project screenshots or social creatives for the six projects that currently use a neutral visual placeholder.
- Approved project descriptions, deliverables, dates, outcomes, and measurable results. No project metrics were invented.
- Service cross-links or client logos only if those are approved and current.
- Confirm the preferred canonical hostname (`creativenerds.in` or `www.creativenerds.in`). The build currently uses the non-www URL configured in `content/site.config.json`.
- A tested form submission endpoint if enquiries should be submitted directly instead of opening a prefilled email draft. Keep any endpoint secrets out of Git.
- Confirm Google Tag Manager ID `GTM-TZXPQL72` remains current.
- Confirm whether the original 24 MB and 43 MB videos need to return. They are preserved in `_archive/original-video/`; no video encoder was available to make optimized versions here.
- Confirm whether clients/testimonial wording is current and approved for the redesigned pages.
- Bluehost cPanel or staging deployment secrets are not available in this checkout; deployment credentials should be added through GitHub Actions secrets after the hosting target is confirmed.
