// src/httpsServer.ts
import * as https from 'https';
import * as fs from 'fs';

const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert'),
  ciphers: 'ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-CHACHA20-POLY1305:DHE-RSA-CHACHA20-POLY1305',  // Prioritize ChaCha20
  honorCipherOrder: true  // Server cipher preference order is used
};



const server = https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('Hello, world over HTTPS!\n');
});

server.listen(3000, () => {
  console.log('HTTPS server running on https://localhost:3000');
});
