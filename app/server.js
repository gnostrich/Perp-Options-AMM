const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;

const TYPES = {'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json','.gz':'application/gzip'};
const ROUTES = {'/':'index.html','/compare':'compare.html','/compare.html':'compare.html'};

http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];
  if (url === '/health') { res.writeHead(200, {'Content-Type':'application/json'}); return res.end('{"ok":true}'); }

  let rel = ROUTES[url];
  if (!rel && /^\/[A-Za-z0-9_\-.]+\.(html|js|png|webp|svg|json|gz|tar.gz)$/.test(url)) rel = url.slice(1);
  if (!rel) rel = 'index.html';                       // unknown path -> the console

  const file = path.join(__dirname, rel);
  if (!file.startsWith(__dirname)) { res.writeHead(403); return res.end('forbidden'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, {'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
                        'Cache-Control':'no-store'});
    res.end(data);
  });
}).listen(PORT, '0.0.0.0', () => console.log('temporal-mm-console on :' + PORT));
