import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
const read = (p) => fs.readFile(path.join(root, p), 'utf8');
const json = async (p) => JSON.parse(await read(p));
const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const config = await json('content/site.config.json');
const staging = process.env.SITE_ENV === 'staging';
const base = staging ? 'https://staging.creativenerds.in' : config.SITE_URL.replace(/\/$/, '');
await fs.rm(out, { recursive: true, force: true });
await fs.mkdir(out, { recursive: true });
const put = async (url, html) => { const dest = path.join(out, url === '/' ? 'index.html' : url.replace(/^\//, '')); await fs.mkdir(path.dirname(dest), {recursive:true}); await fs.writeFile(dest, html); };
const files = async (dir, ext) => (await fs.readdir(path.join(root, dir), {withFileTypes:true})).filter(x => x.isFile() && x.name.endsWith(ext)).map(x => path.join(dir,x.name));
const decodeHtml = (value='') => value.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const readHtmlRecord = async (file) => {
 const html=await fs.readFile(path.join(root,file),'utf8');
 const data={};
 for(const match of html.matchAll(/<meta\s+name=["']cn:([^"']+)["']\s+content=["']([\s\S]*?)["']\s*(?:\/>|>)/gi)){
  const value=decodeHtml(match[2]);
  try{data[match[1]]=JSON.parse(value);}catch{data[match[1]]=value;}
 }
 const body=html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1]||'';
 return {data,body};
};
const copyPath = async (rel) => { const source=path.join(root,rel);const dest=path.join(out,rel);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.copyFile(source,dest); };
const copyDir = async (from, to) => { try { await fs.cp(path.join(root,from), path.join(out,to), {recursive:true}); } catch (e) { if (e.code !== 'ENOENT') throw e; } };

const headTemplate = await read('src/partials/head.html');
const pageTemplate = await read('src/templates/page.html');
const header = await read('src/partials/header.html');
const footer = await read('src/partials/footer.html');
const bodyStart = await read('src/partials/body-noscript.html');
const pageDefs = [
 ['/', 'Creative Nerds | Creative & Digital Agency in Mumbai', 'Creative strategy, brand design, websites and digital growth for ambitious businesses.', 'index', 'WebSite'],
 ['/aboutus.html','About Creative Nerds | Our Approach','Meet Creative Nerds, an independent creative and digital agency based in Mumbai, India.','aboutus','AboutPage'],
 ['/services.html','Creative & Digital Services | Creative Nerds','Explore brand strategy, web design, digital marketing, content and campaign services.','services','CollectionPage'],
 ['/projects.html','Selected Projects | Creative Nerds','Explore selected website and social media work created with Creative Nerds clients.','projects','CollectionPage'],
 ['/contact.html','Contact Creative Nerds | Start a Project','Tell Creative Nerds about your next brand, website or digital growth project.','contact','ContactPage'],
 ['/privacy-policy.html','Privacy Policy | Creative Nerds','Read the Creative Nerds privacy policy and learn how submitted contact details are handled.','privacy-policy','WebPage'],
 ['/thank-you.html','Thanks for getting in touch | Creative Nerds','Your message has been received. Creative Nerds will be in touch.','thank-you','WebPage'],
 ['/404.html','Page not found | Creative Nerds','The page you requested could not be found.','404','WebPage']
];
const serviceJsons = (await Promise.all((await files('content/services','.json')).map(json))).map(s => ({...s, short:s.short||s.shortName, deliverables:(s.deliverables||[]).map(x=>Array.isArray(x)?`${x[0]}: ${x[1]}`:x), process:(s.process||[]).map(x=>Array.isArray(x)?{title:x[0],description:x[1]}:x), faqs:(s.faqs||[]).map(x=>Array.isArray(x)?{question:x[0],answer:x[1]}:x), relatedServices:s.relatedServices||s.related||[]}));
const serviceCards = serviceJsons.map((s,i) => `<a class="pillar-card reveal" style="--reveal-delay:${(i%2)*90+Math.floor(i/2)*60}ms" href="/services/${esc(s.slug)}.html"><span class="card-index">${esc(s.number || '✳')}</span><h3>${esc(s.title)}</h3><p>${esc(s.intro)}</p><span class="text-link">Explore service ↗</span></a>`).join('');
const clients = await json('content/clients.json');
const clientList = clients.map(c => `<span>${esc(c.name)}</span>`).join('');
const workFiles = await files('content/work','.html');
const works = await Promise.all(workFiles.map(readHtmlRecord));
const validWorks = works.map((w,i)=>{ const d=w.data; return { ...w, data:{...d, slug:d.slug||path.basename(workFiles[i],'.html'), category:d.categoryKey||String(d.category||'').toLowerCase().replace(/\s+/g,'-'), categoryLabel:d.category, image:d.image?.replace('/assets/images/portfolio/fce.png','/assets/images/portfolio/famos-cine-equipments-content.png').replace('/assets/images/portfolio/ns.png','/assets/images/portfolio/nail-social-kandivali-content.png'), imageAlt:d.alt, summary:d.summary||d.overview, bodySummary:d.approach, clientUrl:d.website||d.instagram}}; });
const projectCard = (w) => { const d=w.data; const image=d.image ? `<img src="${esc(d.image)}" alt="${esc(d.imageAlt || d.client+' project')}" loading="lazy">` : `<div class="project-placeholder"><span>${esc(d.client)}</span><small>Project imagery to be added</small></div>`; return `<article class="project-card reveal" data-project-category="${esc(d.category)}"><a class="project-visual" href="/work/${esc(d.slug)}.html">${image}</a><div class="project-card-copy"><span class="eyebrow">${esc(d.categoryLabel || d.category)}</span><h3><a href="/work/${esc(d.slug)}.html">${esc(d.client)}</a></h3><a class="text-link" href="${esc(d.clientUrl || '/contact.html')}"${d.clientUrl?' target="_blank" rel="noopener"':''}>${d.clientUrl?'Visit client ↗':'Project details ↗'}</a></div></article>`; };
const projectCards = validWorks.map(projectCard).join('');
const pillarCards = serviceJsons.slice(0,4).map((s,i)=>`<a class="pillar-card reveal" style="--reveal-delay:${i*90}ms" href="/services/${esc(s.slug)}.html"><span class="card-index">✳</span><h3>${esc(s.title)}</h3><p>${esc(s.short || s.intro)}</p><span class="text-link">Explore service ↗</span></a>`).join('');
const testimonial = await json('content/testimonials.json');
const testimonialCards = testimonial.map(t=>`<figure class="quote-card reveal"><blockquote>“${esc(t.quote)}”</blockquote><figcaption><strong>${esc(t.name)}</strong><span>${esc(t.role || '')}</span></figcaption></figure>`).join('');
const cta = await read('src/partials/cta-band.html');
const fmtDate = (v) => { const dt = new Date(v); return isNaN(dt) ? String(v||'') : dt.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); };
const journalCard = ({d}, i, feature=false) => `<article class="journal-card reveal${feature?' journal-card--feature':''}" style="--reveal-delay:${Math.min(i,8)*80}ms"><a href="${esc(d.url||`/blogs/${d.slug}.html`)}"><div class="jc-media">${d.image?`<img src="${esc(d.image)}" alt="${esc(d.imageAlt||d.title||'')}" loading="lazy">`:'<div class="jc-placeholder">Creative Nerds Journal</div>'}<span class="jc-cat">${esc(d.category||'Journal')}</span></div><div class="jc-body"><span class="jc-meta"><b>${String(i+1).padStart(2,'0')}</b><time datetime="${esc(d.date||'')}">${esc(fmtDate(d.date))}</time></span><h3>${esc(d.title)}</h3><p>${esc(d.description||'')}</p><span class="jc-more"><span>Read article</span><i aria-hidden="true">↗</i></span></div></a></article>`;
const recentBlogs = blogs => blogs.slice(0,3).map((b,i)=>journalCard(b,i)).join('');
const bodyFor = async (key) => {
 let html=(await read(`src/pages/${key}.html`)).replace('{{pillar_cards}}',pillarCards).replace('{{all_service_cards}}',serviceCards).replaceAll('{{project_cards}}',projectCards).replace('{{client_list}}',clientList).replace('{{testimonials}}',testimonialCards).replace('{{journal_highlights}}',recentBlogs(blogs)).replaceAll('{{cta}}',cta).replaceAll('{{phone_link}}',esc(config.PHONE_LINK)).replaceAll('{{phone_display}}',esc(config.PHONE_DISPLAY)).replaceAll('{{email}}',esc(config.EMAIL)).replaceAll('{{address}}',esc(config.ADDRESS));
 if(key==='privacy-policy') { const old=await read('_archive/phase1-pages/privacy-policy.html'); const start=old.indexOf('<p>Effective Date:'); const end=old.indexOf('</h5>',start); const section=start>=0&&end>start?old.slice(start,end+5).replace(/<br\s*\/?\s*>/gi,'<br>').replace(/\sclass="[^"]*"/g,''):''; html=html.replace(/<section class="section wrap prose">[\s\S]*?<\/section>/,`<section class="section wrap prose">${section}</section>`).replace('The existing privacy statement is being reviewed for this redesign. For questions about an enquiry, contact','Read the current privacy information below. For questions, contact'); }
 if(key==='contact') html=html.replace('<form class="project-form" data-contact-form novalidate>','<form class="project-form" data-contact-form data-endpoint="'+esc(config.FORM_ENDPOINT)+'" novalidate>').replace('We use these details only to reply to your enquiry.','');
 return html;
};
const schemaOrg = { '@context':'https://schema.org','@type':'Organization',name:'Creative Nerds',url:base,logo:`${base}/assets/images/brand/creative-nerds-logo.png`,email:config.EMAIL,telephone:config.PHONE_DISPLAY,address:{'@type':'PostalAddress',streetAddress:config.ADDRESS,addressLocality:'Mumbai',addressRegion:'Maharashtra',postalCode:'400049',addressCountry:'IN'},sameAs:[config.INSTAGRAM,config.LINKEDIN] };
const render = async ({url,title,description,key,body,ogType='website',schemaType='WebPage',extraSchema=[]}) => {
 const canonical = new URL(url,`${base}/`).href;
 const headTitle=title.length>60?`${title.slice(0,39).replace(/\s+\S*$/,'')}… | Creative Nerds`:title;
 const headDescription=description.length>157?`${description.slice(0,154).replace(/\s+\S*$/,'')}…`:description;
 const trail=url.startsWith('/services/')?{hub:'/services.html',hubName:'Services'}:url.startsWith('/work/')?{hub:'/projects.html',hubName:'Work'}:url.startsWith('/blogs/')?{hub:'/blogs.html',hubName:'Journal'}:null;
 const crumbs=url==='/'||url==='/404.html'||url==='/thank-you.html'?'':`<nav class="breadcrumbs wrap" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span>${trail?`<a href="${trail.hub}">${trail.hubName}</a><span aria-hidden="true">/</span>`:''}<span aria-current="page">${esc(title.split(' | ')[0])}</span></nav>`;
 const crumbSchema=url==='/'?[]:[{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:`${base}/`},...(trail?[{'@type':'ListItem',position:2,name:trail.hubName,item:`${base}${trail.hub}`}]:[]),{'@type':'ListItem',position:trail?3:2,name:title.split(' | ')[0],item:canonical}]}];
 const schema = [{...schemaOrg}, {'@context':'https://schema.org','@type':'WebSite',name:'Creative Nerds',url:base}, {'@context':'https://schema.org','@type':schemaType,name:title,url:canonical,description,...(url==='/'?{publisher:{'@type':'Organization',name:'Creative Nerds'}}:{})},...crumbSchema,...extraSchema];
 const head = headTemplate.replaceAll('{{description}}',esc(headDescription)).replaceAll('{{canonical}}',canonical).replaceAll('{{og_type}}',ogType).replaceAll('{{title}}',esc(headTitle)).replaceAll('{{og_image}}',`${base}/assets/images/brand/creative-nerds-social-card.png`).replace('{{journal_css}}','<link rel="stylesheet" href="/assets/styles/journal.css">').replace('{{gtm_head}}',`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${esc(config.GTM_ID)}');`);
 const footerHtml=footer.replaceAll('{{phone_link}}',esc(config.PHONE_LINK)).replaceAll('{{phone_display}}',esc(config.PHONE_DISPLAY)).replaceAll('{{email}}',esc(config.EMAIL)).replaceAll('{{address}}',esc(config.ADDRESS)).replaceAll('{{instagram}}',esc(config.INSTAGRAM)).replaceAll('{{linkedin}}',esc(config.LINKEDIN));
 const doc = pageTemplate.replaceAll('{{title}}',esc(headTitle)).replace('{{head}}',head).replace('{{schema}}',`<script type="application/ld+json">${JSON.stringify(schema)}</script>${staging?'<meta name="robots" content="noindex,nofollow">':''}`).replace('{{body_class}}',`page-${key.replace(/[^a-z0-9-]/gi,'-')}`).replace('{{header}}',header).replace('{{body_start}}',bodyStart.replace('{{gtm_id}}',esc(config.GTM_ID))).replace('{{body}}',crumbs+body).replace('{{footer}}',footerHtml).replace('{{body_end}}','');
 await put(url,doc);
};
const articleMetaBySlug={};
async function indexBlogFiles(dir){for(const entry of await fs.readdir(path.join(root,dir),{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory()){await indexBlogFiles(file);continue;}if(!entry.name.endsWith('.html'))continue;const {data}=await readHtmlRecord(file);if(data.slug)articleMetaBySlug[data.slug]=data;}}
await indexBlogFiles('content/blogs');
for (const s of serviceJsons) {
 const faqSchema={'@context':'https://schema.org','@type':'FAQPage',mainEntity:(s.faqs||[]).map(f=>({'@type':'Question',name:f.question,acceptedAnswer:{'@type':'Answer',text:f.answer}}))};
 const relatedArticles=(s.blogs||[]).map(slug=>articleMetaBySlug[slug]).filter(Boolean).map(d=>`<article class="journal-card"><a href="${esc(d.url)}"><span class="eyebrow">${esc(d.category||'Journal')}</span><h3>${esc(d.title)}</h3><p>${esc(d.description||'')}</p><span class="text-link">Read article ↗</span></a></article>`).join('');
 const relatedProjects=validWorks.filter(w=>(s.projects||[]).includes(w.data.slug)).map(projectCard).join('');
 const body=`<section class="page-hero wrap"><span class="eyebrow">Creative Nerds services</span><h1>${esc(s.title)}</h1><p>${esc(s.intro)}</p><a class="button button-primary" href="/contact.html">Discuss your project ↗</a></section><section class="section wrap"><div class="split-section"><div><span class="eyebrow">The opportunity</span><h2>Clear thinking.<br><em>Useful outcomes.</em></h2></div><div><p>${esc(s.audience || s.intro)}</p><h3>What we can help with</h3><ul class="deliverable-list">${(s.deliverables||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></div></section><section class="section section-quiet"><div class="wrap"><div class="section-heading"><span class="eyebrow">How we work</span><h2>From first thought<br>to <em>what's next.</em></h2></div><ol class="process-timeline">${(s.process||[]).map((x,i)=>`<li><span>${String(i+1).padStart(2,'0')}</span><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p></li>`).join('')}</ol></div></section><section class="section wrap"><div class="section-heading"><span class="eyebrow">Questions</span><h2>A few useful<br><em>answers.</em></h2></div><div class="faq-list">${(s.faqs||[]).map(f=>`<details><summary>${esc(f.question)}</summary><p>${esc(f.answer)}</p></details>`).join('')}</div></section><section class="section section-quiet"><div class="wrap"><div class="section-heading"><span class="eyebrow">Related ideas</span><h2>Keep exploring.</h2></div><div class="journal-grid">${relatedArticles}</div></div></section><section class="section wrap"><div class="section-heading"><span class="eyebrow">Selected work</span><h2>Related projects.</h2></div><div class="project-grid">${relatedProjects}</div></section><section class="section wrap"><div class="section-heading"><span class="eyebrow">Explore further</span><h2>Related services</h2></div><div class="pillar-grid">${serviceJsons.filter(x=>(s.relatedServices||[]).includes(x.slug)).map(x=>`<a class="pillar-card" href="/services/${esc(x.slug)}.html"><h3>${esc(x.title)}</h3><p>${esc(x.short||x.intro)}</p></a>`).join('')}</div></section>`;
 await render({url:`/services/${s.slug}.html`,title:`${s.title} | Creative Nerds`,description:s.metaDescription||s.intro,key:`service-${s.slug}`,body,schemaType:'Service',extraSchema:s.faqs?.length?[faqSchema]:[]});
}

const blogFiles = await (async()=>{const result=[]; async function walk(d){for(const ent of await fs.readdir(path.join(root,d),{withFileTypes:true})){const p=path.join(d,ent.name);if(ent.isDirectory())await walk(p);else if(ent.name.endsWith('.html'))result.push(p)}} await walk('content/blogs'); return result;})();
const blogs=[];
for(const f of blogFiles){const {data:d,body:sourceBody}=await readHtmlRecord(f);if(!d.slug)continue;let image=d.image?.replace(/^\/assets\/images\/blog\//,'/assets/images/journal/');if(image&&!await fs.access(path.join(root,image.replace(/^\//,''))).then(()=>true).catch(()=>false))image=null;const serviceAliases={'/social-media-marketing.html':'/services/social-media-marketing.html','/seo-organic-growth.html':'/services/seo-organic-growth.html','/website-design-development.html':'/services/website-design-development.html'};let body=sourceBody;for(const [from,to] of Object.entries(serviceAliases))body=body.replaceAll(from,to);if(d.description==='Your reach didn')d.description="Your reach didn't drop for no reason. Here's the real 2026 Instagram algorithm shift behind it, and what actual Instagram marketing looks like now.";blogs.push({d:{...d,url:d.url,image},body});}
blogs.sort((a,b)=>String(b.d.date||'').localeCompare(String(a.d.date||'')));
for (const [url,title,description,key,schemaType] of pageDefs) await render({url,title,description,key,body:await bodyFor(key),schemaType});
const blogCards=blogs.map((b,i)=>journalCard(b,i,i===0)).join('');
const blogIndex=`<section class="page-hero wrap"><span class="eyebrow">Journal</span><h1>Notes for the<br><em>next good move.</em></h1><p>Ideas on brand, digital experiences and marketing.</p></section><section class="section wrap"><div class="journal-grid">${blogCards}</div></section>`;
await render({url:'/blogs.html',title:'Journal | Creative Nerds',description:'Ideas on brand, digital experiences, creative work and marketing.',key:'journal',body:blogIndex,schemaType:'CollectionPage'});
for(const {d,body} of blogs){const url=d.url||`/blogs/${d.slug}.html`; const article=`<article class="article wrap"><header class="article-header"><a class="eyebrow" href="/blogs.html">Journal</a><h1>${esc(d.title)}</h1><p>${esc(d.description||'')}</p><time datetime="${esc(d.date||'')}">${esc(d.date||'')}</time></header>${d.image?`<img class="article-cover" src="${esc(d.image)}" alt="${esc(d.imageAlt||'')}" loading="eager">`:'<div class="article-cover-placeholder">Article image not supplied</div>'}<div class="article-body">${body}</div><footer><a class="text-link" href="/blogs.html">← All articles</a></footer></article>`; const articleSchema={'@context':'https://schema.org','@type':'Article',headline:d.title,datePublished:d.date||undefined,description:d.description,url:`${base}${url}`,author:{'@type':'Organization',name:'Creative Nerds'},publisher:{'@type':'Organization',name:'Creative Nerds',logo:{'@type':'ImageObject',url:`${base}/assets/images/brand/creative-nerds-logo.png`}}}; await render({url,title:`${d.title} | Creative Nerds`,description:d.description||d.title,key:'article',body:article,ogType:'article',schemaType:'Article',extraSchema:[articleSchema]});}

for(const w of validWorks){const d=w.data; const body=`<section class="page-hero wrap"><span class="eyebrow">Selected work · ${esc(d.categoryLabel||d.category)}</span><h1>${esc(d.client)}</h1><p>${esc(d.summary||'A Creative Nerds client project.')}</p></section><section class="section wrap"><div class="case-study-visual">${d.image?`<img src="${esc(d.image)}" alt="${esc(d.imageAlt||d.client+' project')}" loading="eager">`:`<div class="project-placeholder"><span>${esc(d.client)}</span><small>Approved project imagery pending</small></div>`}</div><div class="article-body"><h2>Project information</h2><p>${esc(d.bodySummary||d.summary||'Project description and outcome details have not been supplied for publication.')}</p><dl>${[['Client',d.client],['Service',d.categoryLabel||d.category],['Timeline',d.timeline],['Results',d.results]].filter(x=>x[1]).map(x=>`<dt>${esc(x[0])}</dt><dd>${esc(x[1])}</dd>`).join('')}</dl></div><a class="button button-primary" href="/contact.html">Plan a project ↗</a></section>`; const cs={'@context':'https://schema.org','@type':'CreativeWork',name:d.client,description:d.summary||d.client,url:`${base}/work/${d.slug}.html`}; await render({url:`/work/${d.slug}.html`,title:`${d.client} | Selected Work | Creative Nerds`,description:d.summary||`${d.client} project by Creative Nerds.`,key:`work-${d.slug}`,body,schemaType:'CreativeWork',extraSchema:[cs]});}

for(const dir of ['assets/styles','assets/scripts','assets/fonts'])await copyDir(dir,dir);
for(const file of ['assets/images/brand/creative-nerds-logo.png','assets/images/brand/creative-nerds-social-card.png','assets/images/brand/favicon.png','assets/images/about/aboutus.png','assets/images/portfolio/famos-cine-equipments-content.png','assets/images/portfolio/nail-social-kandivali-content.png','assets/video/portal-reel.mp4'])await copyPath(file);
for(const {d} of blogs)if(d.image)await copyPath(d.image.replace(/^\//,''));
for(const p of ['.htaccess','robots.txt'])await fs.copyFile(path.join(root,p),path.join(out,p));
const sitemap=[...pageDefs.map(x=>x[0]),...serviceJsons.map(s=>`/services/${s.slug}.html`),'/blogs.html',...blogs.map(x=>x.d.url||`/blogs/${x.d.slug}.html`),...validWorks.map(w=>`/work/${w.data.slug}.html`)];
const sitemapDate=new Date().toISOString().slice(0,10);
await fs.writeFile(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(sitemap)].map(u=>`  <url><loc>${new URL(u,`${base}/`).href}</loc><lastmod>${sitemapDate}</lastmod></url>`).join('\n')}\n</urlset>\n`);
await fs.writeFile(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
console.log(`Built ${new Set(sitemap).size} pages into dist (${staging?'staging/noindex':'production'} mode).`);
