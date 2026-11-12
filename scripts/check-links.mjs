import fs from 'node:fs/promises';
import path from 'node:path';

const root=path.resolve('dist');
const errors=[];
let checked=0;
async function walk(dir){
  for(const entry of await fs.readdir(dir,{withFileTypes:true})){
    const file=path.join(dir,entry.name);
    if(entry.isDirectory()){await walk(file);continue;}
    if(!entry.name.endsWith('.html'))continue;
    checked++;
    const html=await fs.readFile(file,'utf8');
    for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
      const ref=match[1];
      if(!ref||/^(?:https?:|mailto:|tel:|data:|javascript:|#)/i.test(ref))continue;
      const target=decodeURIComponent(ref.split(/[?#]/)[0]);
      if(!target)continue;
      const relative=target.startsWith('/')?`.${target}`:path.join(path.relative(root,path.dirname(file)),target);
      const candidate=path.resolve(root,relative);
      if(candidate!==root&&!candidate.startsWith(root+path.sep))continue;
      const resolved=path.extname(candidate)?candidate:path.join(candidate,'index.html');
      try{await fs.access(resolved);}catch{errors.push(`${path.relative(root,file)} → ${ref}`);}
    }
  }
}
await walk(root);
if(errors.length){console.error('Broken local references:\n'+errors.join('\n'));process.exitCode=1;}
else console.log(`Checked local references in ${checked} HTML pages.`);
