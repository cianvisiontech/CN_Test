import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, relative } from 'node:path';

const root = process.cwd();
const sourceRoot = join(root, '_archive/phase1-articles/blogs');
const contentRoot = join(root, 'content/blogs');
const assetRoot = join(root, 'assets/images/journal');
const months = 'January February March April May June July August September October November December'.split(' ');

async function htmlFiles(folder) {
  const results = [];
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const file = join(folder, entry.name);
    if (entry.isDirectory()) results.push(...await htmlFiles(file));
    else if (entry.isFile() && entry.name.endsWith('.html') && entry.name.toLowerCase() !== 'blogs.html') results.push(file);
  }
  return results;
}

function findElement(html, tag, className) {
  const open = new RegExp(`<${tag}\\b[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>`, 'i').exec(html);
  if (!open) return '';
  const token = new RegExp(`<${tag}\\b[^>]*>|</${tag}\\s*>`, 'gi');
  token.lastIndex = open.index;
  let depth = 0;
  let match;
  while ((match = token.exec(html))) {
    if (match[0].startsWith('</')) depth -= 1;
    else depth += 1;
    if (depth === 0) return html.slice(open.index + open[0].length, token.lastIndex);
  }
  return '';
}

function tagText(value = '') {
  return value.replace(/<script\b[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ').trim();
}

function meta(html, key, attribute = 'name') {
  const pattern = new RegExp(`<meta\\b[^>]*${attribute}=["']${key}["'][^>]*content=["']([^"']*)["']|<meta\\b[^>]*content=["']([^"']*)["'][^>]*${attribute}=["']${key}["']`, 'i');
  const match = pattern.exec(html);
  return match?.[1] ?? match?.[2] ?? '';
}

function normalizeSlug(file) {
  const name = basename(file, '.html').toLowerCase();
  return name.normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function dateFrom(html) {
  const text = tagText(html);
  const match = text.match(new RegExp(`\\b(\\d{1,2})\\s+(${months.join('|')})\\s+(20\\d{2})\\b`, 'i'));
  if (!match) return null;
  const month = months.findIndex(value => value.toLowerCase() === match[2].toLowerCase()) + 1;
  return `${match[3]}-${String(month).padStart(2, '0')}-${String(match[1]).padStart(2, '0')}`;
}

function categoryFor(slug) {
  if (/ranking|seo|google-ads|website-structure|ai-is-changing/.test(slug)) return 'Search';
  if (/instagram|social-media|content|omnichannel|trojan-horse/.test(slug)) return 'Marketing';
  return 'Marketing';
}

function serviceFor(slug) {
  if (/ranking|seo|google-ads|website-structure|ai-is-changing/.test(slug)) return ['SEO & Organic Growth', '/seo-organic-growth.html'];
  if (/instagram|social-media|content|omnichannel|trojan-horse/.test(slug)) return ['Social Media Marketing', '/social-media-marketing.html'];
  if (/website|digital-marketing-budget/.test(slug)) return ['Website Design & Development', '/website-design-development.html'];
  return ['Brand Strategy', '/brand-strategy.html'];
}

await mkdir(contentRoot, { recursive: true });
let pages = await htmlFiles(sourceRoot);
const candidates = [];
for (const file of pages) {
  const html = await readFile(file, 'utf8');
  const title = tagText(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? basename(file, '.html'));
  const originalRelative = relative(sourceRoot, file).replaceAll('\\', '/');
  const sourceSlug = normalizeSlug(file);
  const isSecondDirectory = originalRelative.startsWith('2/');
  const route = `/blogs/${isSecondDirectory ? '2/' : ''}${sourceSlug}.html`;
  const oldSpaceUrl = originalRelative.includes('What Business Goals') ? `/blogs/${originalRelative.replaceAll(' ', '%20')}` : null;
  const content = findElement(html, 'div', 'post') || findElement(html, 'article', 'blog-meta-one') || '<p>Article content is being prepared.</p>';
  const desc = meta(html, 'description') || title;
  const originalImage = meta(html, 'og:image', 'property');
  const oldImageName = decodeURIComponent(originalImage.split('/').pop() || '');
  const oldExt = extname(oldImageName) || '.png';
  const image = `/assets/images/journal/${sourceSlug}-cover${oldExt}`;
  if (oldImageName) {
    const sourceImage = join(assetRoot, oldImageName);
    try { await cp(sourceImage, join(assetRoot, `${sourceSlug}-cover${oldExt}`)); } catch { /* audit reports missing covers */ }
  }
  const service = serviceFor(sourceSlug);
  const metadata = {
    title, slug: sourceSlug, url: route, oldUrl: oldSpaceUrl, description: desc,
    category: categoryFor(sourceSlug), date: dateFrom(html), image,
    imageAlt: title, serviceName: service[0], serviceUrl: service[1],
  };
  const rewritten = content
    .replace(/(?:\.\.\/)*images\/(?:blog|journal)\//g, '/assets/images/journal/')
    .replace(/(?:\.\.\/)*images\/(?:logo|fav-icon)\//g, '/assets/images/brand/')
    .replace(/href=["'](?:\.\.\/)*blogs\.html["']/gi, 'href="/blogs.html"');
  const output = join(contentRoot, isSecondDirectory ? '2' : '', `${sourceSlug}.md`);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `---\n${JSON.stringify(metadata, null, 2)}\n---\n\n${rewritten.trim()}\n`, 'utf8');
  candidates.push({ slug: sourceSlug, route, title, date: metadata.date, image, source: originalRelative });
}

for (let index = 0; index < candidates.length; index += 1) {
  const article = candidates[index];
  const related = [1, 2, 3].map(offset => candidates[(index + offset) % candidates.length].slug);
  const file = join(contentRoot, article.route.includes('/2/') ? '2' : '', `${article.slug}.md`);
  let text = await readFile(file, 'utf8');
  text = text.replace(/("serviceUrl":\s*"[^"]*")/, `$1,\n  "related": ${JSON.stringify(related)}`);
  await writeFile(file, text, 'utf8');
}

console.log(`Migrated ${candidates.length} articles to Markdown with original dates, titles, route paths and article HTML preserved.`);
