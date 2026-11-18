/* Inkmind — serve as imagens enviadas (/_blob/<id>) a partir do cache ou do Firestore (via a página aberta). */
const CACHE = 'ink-blobs-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

function ask(client, id) {
  return new Promise(res => {
    const ch = new MessageChannel(); const t = setTimeout(() => res(null), 15000);
    ch.port1.onmessage = e => { clearTimeout(t); res(e.data); };
    client.postMessage({ t: 'ink-blob', id }, [ch.port2]);
  });
}
async function serve(e, id) {
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
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  const m = u.origin === self.location.origin && /\/_blob\/([A-Za-z0-9_-]+)$/.exec(u.pathname);
  if (m && e.request.method === 'GET') e.respondWith(serve(e, m[1]));
});
