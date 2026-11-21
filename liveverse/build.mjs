// Gera duas saídas a partir de src/:
//  - index.html      → ficheiro único usado no artifact do Claude (sem <html>/<head>, a plataforma acrescenta-os)
//  - dist/           → site estático completo para o Cloudflare Pages (ou qualquer alojamento estático)
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';

const root = new URL('./', import.meta.url);
const src = new URL('./src/', import.meta.url);
const read = f => readFileSync(new URL(f, src), 'utf8');
const files = ['data.js', 'core.js', 'views.js', 'live.js', 'social.js', 'extras.js', 'immersive.js', 'twitch.js', 'twitch2.js', 'twitch3.js', 'media.js', 'features.js', 'polish.js', 'livesound.js', 'giftsound.js', 'realism.js', 'pro.js', 'twitch4.js', 'twitch5.js', 'app.js'];
const js = files.map(read).join('\n');
const page = read('shell.html').replace('/*STYLE*/', () => read('style.css')).replace('/*SCRIPT*/', () => js);

// 1) Artifact
writeFileSync(new URL('./index.html', root), page);
console.log('index.html', (page.length / 1024).toFixed(1) + ' KB');

// 2) Cloudflare Pages: documento HTML completo
const split = page.indexOf('<div class="bg-glow"');
const head = page.slice(0, split).replace(/<link rel="icon"[^>]*>/, '');
const body = page.slice(split);
const doc = `<!doctype html>
<html lang="pt-PT">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="icon" href="icon-64.png" sizes="64x64" type="image/png">
<link rel="apple-touch-icon" href="icon-192.png">
<link rel="manifest" href="manifest.webmanifest">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="LiveVerse">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}</style>
${head.trim()}
</head>
<body>
${body.trim()}
</body>
</html>
`;
const dist = new URL('./dist/', root);
mkdirSync(dist, { recursive: true });
writeFileSync(new URL('./index.html', dist), doc);
for (const f of ['icon.svg', 'icon-512.png', 'icon-192.png', 'icon-64.png']) copyFileSync(new URL(f, root), new URL(f, dist));
writeFileSync(new URL('./manifest.webmanifest', dist), JSON.stringify({
  name: 'LiveVerse',
  short_name: 'LiveVerse',
  description: 'Rede social de criadores com simulador de lives. Seguidores, espectadores e métricas são fictícios.',
  lang: 'pt-PT',
  start_url: './',
  scope: './',
  display: 'standalone',
  background_color: '#0e0e10',
  theme_color: '#0e0e10',
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
  ],
}, null, 2));
// Cabeçalhos do Cloudflare Pages: o microfone só pode ser usado por esta página
writeFileSync(new URL('./_headers', dist), `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: microphone=(self), camera=(self), display-capture=(self), geolocation=(), payment=()

/
  Cache-Control: no-cache

/index.html
  Cache-Control: no-cache

/icon*
  Cache-Control: public, max-age=604800

/manifest.webmanifest
  Cache-Control: public, max-age=86400
`);
writeFileSync(new URL('./robots.txt', dist), 'User-agent: *\nAllow: /\n');
console.log('dist/ pronto para o Cloudflare Pages', (doc.length / 1024).toFixed(1) + ' KB');
