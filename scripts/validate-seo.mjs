import fs from 'node:fs/promises';
import path from 'node:path';

const errors=[];
let count=0;
const required=[
  ['title',/<title>[^<]{5,120}<\/title>/i],
  ['meta description',/<meta name="description" content="[^"]{25,240}"/i],
  ['canonical',/<link rel="canonical" href="https?:\/\//i],
  ['H1',/<h1\b[^>]*>[\s\S]*?<\/h1>/i],
  ['Open Graph title',/<meta property="og:title"/i],
  ['Twitter card',/<meta name="twitter:card"/i]
];
async function walk(dir){
  for(const entry of await fs.readdir(dir,{withFileTypes:true})){
    const file=path.join(dir,entry.name);
    if(entry.isDirectory()){await walk(file);continue;}
    if(!entry.name.endsWith('.html'))continue;
    count++;
    const html=await fs.readFile(file,'utf8');
    const name=path.relative('dist',file);
    for(const [label,pattern] of required)if(!pattern.test(html))errors.push(`${name}: missing or invalid ${label}`);
    const decode=s=>s.replace(/&quot;/g,'"').replace(/&#39;|&#x27;/g,"'").replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
    const pageTitle=html.match(/<title>([^<]+)<\/title>/i)?.[1]||'';
    const description=html.match(/<meta name="description" content="([^"]*)"/i)?.[1]||'';
    if(decode(pageTitle).length>60)errors.push(`${name}: title exceeds 60 characters`);
    if(decode(description).length>160)errors.push(`${name}: meta description exceeds 160 characters`);
    if((html.match(/<h1\b/gi)||[]).length!==1)errors.push(`${name}: expected exactly one H1`);
    if(process.env.SITE_ENV==='staging'&&!/<meta name="robots" content="noindex,nofollow">/.test(html))errors.push(`${name}: staging robots tag missing`);
    if(!html.includes('googletagmanager.com/gtm.js'))errors.push(`${name}: GTM missing`);
  }
}
await walk('dist');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
else console.log(`SEO essentials checked on ${count} HTML pages.`);
