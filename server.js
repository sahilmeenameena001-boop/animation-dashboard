/* Zero-dependency static server: node server.js  →  http://localhost:5173 */
const http = require('http'), fs = require('fs'), path = require('path');
const PORT = process.env.PORT || 5173;
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css',
  '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png',
  '.jpg':'image/jpeg', '.gif':'image/gif', '.mp4':'video/mp4', '.webm':'video/webm' };

http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if(rel === '/') rel = '/index.html';
  const file = path.join(__dirname, rel.split('..').join(''));
  fs.readFile(file, (err, data) => {
    if(err){ res.writeHead(404, {'Content-Type':'text/plain'}); return res.end('Not found: ' + rel); }
    res.writeHead(200, {'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream'});
    res.end(data);
  });
}).listen(PORT, () => console.log('AnimLib Studio → http://localhost:' + PORT));
