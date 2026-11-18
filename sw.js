/* Inkmind — service worker
   - /_blob/<id>: imagens enviadas, do cache ou do Firestore (via a página aberta)
   - app instalável: index.html pela rede primeiro (cai no cache sem internet); arquivos do app no cache, atualizando em segundo plano */
const CACHE = 'ink-blobs-v1';
const APP = 'ink-app-v24';
const SHELL = ['./', 'index.html', 'inkmind-fb.js', 'manifest.webmanifest', 'img/icon-192.png', 'img/icon-512.png', 'img/wordmark.webp', 'img/logo.webp', 'img/banner.webp', 'img/mark.webp', 'img/wm-word.webp'];

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
  if (/\.js$/.test(u.pathname)) { e.respondWith(networkFirst(req)); return; }   // código: sempre a versão nova quando há internet
  if (/\.(webp|png|svg|webmanifest|woff2?)$/.test(u.pathname)) e.respondWith(staleWhileRevalidate(e, req));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil((async () => { const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true }); if (cs[0]) return cs[0].focus(); return self.clients.openWindow('./'); })());
});
