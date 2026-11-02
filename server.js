import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 5173;
const DIST_DIR = path.join(__dirname, 'dist');
const PUBLIC_DIR = fs.existsSync(DIST_DIR) ? DIST_DIR : __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ status: 'ok', time: Date.now() }));
    return;
  }
  if (reqPath === '/') reqPath = '/index.html';

  let filePath = path.join(PUBLIC_DIR, reqPath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Akses Ditolak');
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Error membaca berkas');
      return;
    }

    const headers = {
      'Content-Type': contentType,
    };
    if (ext === '.html') {
      headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    } else {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    }

    res.writeHead(200, headers);
    res.end(data);
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`\n========================================================================`);
    console.log(`   [INFO] Port ${PORT} sudah aktif (aplikasi kemungkinan sudah berjalan).`);
    console.log(`   * Membuka peramban ke: http://localhost:${PORT}/`);
    console.log(`========================================================================\n`);
  } else {
    console.error('Server error:', err);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n========================================================================');
  console.log('   FJY CHANNEL KOMPRES - SERVER LOKAL AKTIF (100% OFFLINE READY)');
  console.log('========================================================================');
  console.log(`\n  * Akses Komputer Lokal : http://localhost:${PORT}/`);

  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`  * Akses Jaringan (HP/Wi-Fi) : http://${net.address}:${PORT}/`);
      }
    }
  }

  console.log('\n  [TIPS] Aplikasi berjalan lokal tanpa memerlukan koneksi internet.');
  console.log('  [TIPS] Tekan Ctrl + C pada jendela ini jika ingin menutup aplikasi.');
  console.log('========================================================================\n');
});

// Penanganan sinyal penutupan (Ctrl + C / SIGINT / SIGTERM)
function shutdown() {
  console.log('\n========================================================================');
  console.log('   [INFO] Menutup server FJY Channel Kompres...');
  server.close(() => {
    console.log('   [OK] Server berhasil dimatikan. Port 5173 telah dibebaskan.');
    console.log('========================================================================\n');
    process.exit(0);
  });
  // Paksa keluar jika ada koneksi peramban yang masih menggantung
  setTimeout(() => process.exit(0), 1000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGHUP', shutdown);
