import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(process.argv[2]||'dist');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.mp4':'video/mp4'};
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const safe=path.resolve(root,`.${pathname}`);
    if(safe!==root&&!safe.startsWith(root+path.sep)){res.writeHead(403).end('Forbidden');return;}
    let file=safe;
    if((await fs.stat(file).catch(()=>null))?.isDirectory())file=path.join(file,'index.html');
    const data=await fs.readFile(file);
    res.writeHead(200,{'Content-Type':mime[path.extname(file).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}).end(data);
  }catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'}).end(await fs.readFile(path.join(root,'404.html')).catch(()=>Buffer.from('Not found')));}
});
const port=Number(process.env.PORT||process.argv[3]||4175);
server.listen(port,'127.0.0.1',()=>console.log(`Preview: http://127.0.0.1:${port}/ (serving ${root})`));
