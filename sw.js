/* Inkmind — service worker
   - /_blob/<id>: imagens enviadas, do cache ou do Firestore (via a página aberta)
   - app instalável: index.html pela rede primeiro (cai no cache sem internet); arquivos do app no cache, atualizando em segundo plano */
const CACHE = 'ink-blobs-v1';
const APP = 'ink-app-v28';
const SHELL = ['./', 'index.html', 'inkmind-fb.js', 'manifest.webmanifest', 'css/inkmind.css?v=28', 'js/01-base.js?v=28', 'js/02-estante.js?v=28', 'js/03-editor.js?v=28', 'js/04-mesa.js?v=28', 'js/05-mesa-extras.js?v=28', 'js/06-aparencia.js?v=28', 'js/07-mestre.js?v=28', 'js/08-tela-de-jogo.js?v=28', 'js/09-combate.js?v=28', 'js/10-aprender.js?v=28', 'js/11-mecanicas.js?v=28', 'js/12-backup.js?v=28', 'js/13-escrita-organizar.js?v=28', 'js/14-paginacao.js?v=28', 'js/15-menus.js?v=28', 'js/16-ferramentas-word.js?v=28', 'js/17-online.js?v=28', 'js/18-site-publico.js?v=28', 'js/19-mapa-secreto.js?v=28', 'js/20-painel-mover.js?v=28', 'js/21-coautoria.js?v=28', 'js/22-economia.js?v=28', 'js/99-inicio.js?v=28', 'img/icon-192.png', 'img/icon-512.png', 'img/wordmark.webp', 'img/logo.webp', 'img/banner.webp', 'img/mark.webp', 'img/wm-word.webp'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(APP).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))));
});
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k.startsWith('ink-app-') && k !== APP) await caches.delete(k);
  await self.clients.claim();
})()));

function ask(client, id) {
  return new Promise(res => {
    const ch = new MessageChannel(); const t = setTimeout(() => res(null), 15000);
    ch.port1.onmessage = e => { clearTimeout(t); res(e.data); };
    client.postMessage({ t: 'ink-blob', id }, [ch.port2]);
  });
}
async function serveBlob(e, id) {
  const key = self.location.origin + '/_blob/' + id;
  const c = await caches.open(CACHE);
  const hit = await c.match(key);
  if (hit) return hit;
  let client = e.clientId ? await self.clients.get(e.clientId) : null;
  if (!client) client = (await self.clients.matchAll({ type: 'window' }))[0];
  if (!client) return new Response('', { status: 404 });
  const r = await ask(client, id);
  if (!r || !r.ok) return new Response('', { status: 404 });
  const resp = new Response(new Blob([r.buf], { type: r.type }), { headers: { 'Content-Type': r.type, 'Cache-Control': 'max-age=31536000' } });
  try { await c.put(key, resp.clone()); } catch {}
  return resp;
}
async function networkFirst(req) {
  const c = await caches.open(APP);
  try { const r = await fetch(req); if (r && r.ok) c.put(req, r.clone()).catch(() => {}); return r; }
  catch { return (await c.match(req, { ignoreSearch: true })) || (await c.match('index.html')) || new Response('Sem conexão', { status: 503 }); }
}
async function staleWhileRevalidate(e, req) {
  const c = await caches.open(APP);
  const hit = await c.match(req);
  const net = fetch(req).then(r => { if (r && r.ok) c.put(req, r.clone()).catch(() => {}); return r; }).catch(() => null);
  if (hit) { e.waitUntil(net); return hit; }
  return (await net) || new Response('', { status: 504 });
}
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin !== self.location.origin) return;
  const m = /\/_blob\/([A-Za-z0-9_-]+)$/.exec(u.pathname);
  if (m) { e.respondWith(serveBlob(e, m[1])); return; }
  if (req.mode === 'navigate' || /\/(index\.html)?$/.test(u.pathname)) { e.respondWith(networkFirst(req)); return; }
  if (/\.(js|css)$/.test(u.pathname)) { e.respondWith(networkFirst(req)); return; }   // código: sempre a versão nova quando há internet
  if (/\.(webp|png|svg|webmanifest|woff2?)$/.test(u.pathname)) e.respondWith(staleWhileRevalidate(e, req));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil((async () => { const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true }); if (cs[0]) return cs[0].focus(); return self.clients.openWindow('./'); })());
});
