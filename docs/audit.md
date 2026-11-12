# Source and asset audit

- Original source repository and user reference files were left unchanged; this redesign lives in its own `CN_Test` checkout on branch `redesign`.
- Reusable source items: Creative Nerds logo and favicon, Outfit fonts, existing about artwork, two client-supplied portfolio visuals, the portal reel, and article cover assets.
- Retained published content: 16 existing article pages, 8 service landing pages, 8 project records, 3 existing testimonials, and core website pages.
- The archive keeps the first redesign's page files and the original brand variants, old styles/scripts, and unused source media. The archive is excluded from `dist`; the two 24 MB/43 MB source videos stay local and are excluded from Git to keep the repository practical to clone.
- Unused original icon, shape, decorative, team, and theme artwork files are not included in public output.
- The build copies only production CSS, JavaScript, fonts, brand/about/portfolio/journal media, and the portal video referenced by generated pages.
- Source article bodies are preserved from the supplied website pages. Source HTML may contain historical wording or external citations that should be reviewed by the content owner before publication.
- No synthetic performance figures, team biographies, case-study results, third-party stock photos, or unverified project claims were added.
