/* Inkmind × Firebase — implementa a mesma interface que o app usa dentro do Claude
   (claude.use('db' | 'user' | 'assets' | 'room' …)) em cima do Firebase Auth + Firestore.
   Imagens ficam no Firestore (coleção blobs) e são servidas em /_blob/<id> por um service worker. */

const BLOB_MAX = 700 * 1024;           // bytes do arquivo (base64 ≈ +33% → cabe no limite de 1 MiB do Firestore)
const PRES_TTL = 75 * 1000;

/* ---------- codificação: Firestore não aceita listas dentro de listas ---------- */
function enc(v) {
  if (Array.isArray(v)) return v.map(x => Array.isArray(x) ? { __a: enc(x) } : enc(x));
  if (v && typeof v === 'object' && !(v instanceof Date)) { const o = {}; for (const k in v) { if (v[k] !== undefined) o[k] = enc(v[k]); } return o; }
  return v;
}
function dec(v) {
  if (Array.isArray(v)) return v.map(dec);
  if (v && typeof v === 'object') {
    if (Object.keys(v).length === 1 && Array.isArray(v.__a)) return dec(v.__a);
    if (typeof v.toMillis === 'function') return v.toMillis();
    const o = {}; for (const k in v) o[k] = dec(v[k]); return o;
  }
  return v;
}
const isPlain = v => v && typeof v === 'object' && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype;
function flatten(obj, pre, out) { // update com mescla profunda (listas substituem) → caminhos de campo
  for (const k of Object.keys(obj)) {
    const v = obj[k]; if (v === undefined) continue;
    const p = [...pre, k];
    if (isPlain(v) && Object.keys(v).length) flatten(v, p, out); else out.push([p, enc(v)]);
  }
  return out;
}
const rid = (n = 20) => { const a = new Uint8Array(n), c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; crypto.getRandomValues(a); return [...a].map(x => c[x % 62]).join(''); };

export function install(cfg, F) {
  const app = F.initializeApp(cfg);
  const auth = F.getAuth(app);
  const fs = F.getFirestore(app);
  const state = { user: null, profileReady: null };

  /* ---------- db: mesma forma da API do Claude ---------- */
  const snapDoc = s => ({ id: s.id, exists: s.exists(), data: () => (s.exists() ? dec(s.data()) : undefined) });
  const snapCol = s => ({ docs: s.docs.map(snapDoc), size: s.size, empty: s.empty });
  function docRef(path) {
    const ref = F.doc(fs, path);
    return {
      id: ref.id, path,
      async get() { return snapDoc(await F.getDoc(ref)); },
      async set(v) { return F.setDoc(ref, enc(seatMark(path, v, true))); },
      async update(patch) {
        patch = seatMark(path, patch, false);
        const pairs = flatten(patch, [], []);
        if (!pairs.length) return;
        const args = []; for (const [p, v] of pairs) args.push(new F.FieldPath(...p), v);
        return F.updateDoc(ref, ...args);
      },
      async delete() { return F.deleteDoc(ref); },
      onSnapshot(cb, err) { return F.onSnapshot(ref, s => cb(snapDoc(s)), e => err && err(e)); },
      collection(sub) { return colRef(path + '/' + sub); }
    };
  }
  function qObj(q) {
    return {
      where(f, op, v) { return qObj(F.query(q, F.where(f, op, v))); },
      async get() { return snapCol(await F.getDocs(q)); },
      onSnapshot(cb, err) { return F.onSnapshot(q, s => cb(snapCol(s)), e => err && err(e)); }
    };
  }
  function colRef(path) { const q = qObj(F.collection(fs, path)); return { ...q, path, doc: id => docRef(path + '/' + (id || rid())) }; }
  // o mestre escreve g.<mesa> na ficha dos jogadores: marca qual mesa para as regras de segurança conferirem
  function seatMark(path, v, isSet) {
    const m = /^seats\/([^/]+)$/.exec(path);
    if (!m || !state.user || m[1] === state.user.uid || !v || typeof v !== 'object') return v;
    const keys = v.g && typeof v.g === 'object' ? Object.keys(v.g) : [];
    const gm = keys.length === 1 ? keys[0] : (isSet && Array.isArray(v.gids) ? v.gids[0] : null);
    return gm ? { ...v, _gm: gm } : v;
  }
  const db = { doc: docRef, collection: colRef };

  /* ---------- user ---------- */
  const nameOf = u => (u && (u.displayName || (u.email || '').split('@')[0])) || 'Você';
  const profCache = {};
  const user = {
    async id() { return state.user ? state.user.uid : null; },
    async me() { return state.user ? { name: nameOf(state.user), email: state.user.email, photo: state.user.photoURL || null } : null; },
    async canEdit() { return true; },
    async can() { return true; },
    async profiles(uids) {
      const out = {}; const need = [...new Set(uids || [])].filter(Boolean);
      await Promise.all(need.map(async u => {
        if (profCache[u]) { out[u] = profCache[u]; return; }
        try { const s = await F.getDoc(F.doc(fs, 'profiles/' + u)); if (s.exists()) out[u] = profCache[u] = dec(s.data()); } catch {}
      }));
      return out;
    }
  };

  /* ---------- imagens (Firestore + service worker) ---------- */
  const CACHE = 'ink-blobs-v1';
  const blobKey = id => location.origin + '/_blob/' + id;
  const toB64 = b => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(b); });
  const fromB64 = (b64, type) => { const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new Blob([u], { type }); };
  async function shrink(blob) {
    if (blob.size <= BLOB_MAX) return blob;
    if (!/^image\/(png|jpe?g|webp|gif|bmp)/.test(blob.type)) throw Object.assign(new Error('Arquivo grande demais (máx. 700 KB).'), { code: 'invalid_argument' });
    const bmp = await createImageBitmap(blob);
    let dim = Math.min(2000, Math.max(bmp.width, bmp.height)), q = .85, out = blob;
    for (let i = 0; i < 8 && out.size > BLOB_MAX; i++) {
      const k = dim / Math.max(bmp.width, bmp.height), c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(bmp.width * k)); c.height = Math.max(1, Math.round(bmp.height * k));
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      out = await new Promise(r => c.toBlob(r, 'image/webp', q));
      dim = Math.round(dim * .8); q = Math.max(.6, q - .05);
    }
    if (out.size > BLOB_MAX) throw Object.assign(new Error('Imagem grande demais.'), { code: 'invalid_argument' });
    return out;
  }
  async function cachePut(id, blob) { try { const c = await caches.open(CACHE); await c.put(blobKey(id), new Response(blob, { headers: { 'Content-Type': blob.type || 'application/octet-stream', 'Cache-Control': 'max-age=31536000' } })); } catch {} }
  async function loadBlob(id) {
    const s = await F.getDoc(F.doc(fs, 'blobs/' + id));
    if (!s.exists()) return null;
    const d = s.data(); const b = fromB64(d.data, d.type || 'application/octet-stream');
    await cachePut(id, b); return b;
  }
  const assets = {
    async upload(blob, o = {}) {
      if (!state.user) throw Object.assign(new Error('Entre na sua conta para enviar imagens.'), { code: 'permission_denied' });
      const b0 = blob instanceof Blob ? blob : new Blob([blob], { type: o.type || 'application/octet-stream' });
      const b = await shrink(b0.type ? b0 : new Blob([b0], { type: o.type || 'image/webp' }));
      const id = rid(24);
      await F.setDoc(F.doc(fs, 'blobs/' + id), { owner: state.user.uid, type: b.type || o.type || 'image/webp', size: b.size, data: await toB64(b), t: Date.now() });
      await cachePut(id, b);
      return { id, url: '/_blob/' + id };
    }
  };
  async function startSW() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.addEventListener('message', async e => {
      const m = e.data || {}; if (m.t !== 'ink-blob' || !e.ports[0]) return;
      try { const b = await loadBlob(m.id); e.ports[0].postMessage(b ? { ok: true, type: b.type, buf: await b.arrayBuffer() } : { ok: false }); }
      catch (err) { e.ports[0].postMessage({ ok: false, err: String(err && err.code || err) }); }
    });
    try {
      await navigator.serviceWorker.register(new URL('sw.js', location.href).href);
      if (!navigator.serviceWorker.controller) {
        await Promise.race([new Promise(r => navigator.serviceWorker.addEventListener('controllerchange', r, { once: true })), new Promise(r => setTimeout(r, 4000))]);
      }
    } catch (e) { console.warn('[inkmind] service worker', e); }
  }

  /* ---------- presença (quem está na mesa) ---------- */
  let presTimer = null, presVal = null;
  const room = {
    async presence(p) {
      if (!state.user) return; presVal = p || {};
      const write = () => F.setDoc(F.doc(fs, 'presence/' + state.user.uid), { by: state.user.uid, presence: enc(presVal), t: Date.now() }).catch(() => {});
      await write(); clearInterval(presTimer); presTimer = setInterval(write, 30000);
    },
    onPeers(cb, err) {
      let docs = [];
      const emit = () => { const now = Date.now(); cb({ peers: docs.filter(d => now - (d.t || 0) < PRES_TTL).map(d => ({ by: d.by, presence: dec(d.presence || {}) })) }); };
      const q = F.query(F.collection(fs, 'presence'), F.where('t', '>', Date.now() - 10 * 60 * 1000));
      const un = F.onSnapshot(q, s => { docs = s.docs.map(d => d.data()); emit(); }, e => err && err(e));
      const iv = setInterval(emit, 20000);
      return () => { un(); clearInterval(iv); };
    }
  };
  addEventListener('pagehide', () => { if (state.user) try { F.deleteDoc(F.doc(fs, 'presence/' + state.user.uid)); } catch {} });

  /* ---------- tela de login ---------- */
  const ERR = {
    'auth/invalid-email': 'E-mail inválido.', 'auth/missing-password': 'Digite a senha.', 'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/email-already-in-use': 'Já existe uma conta com esse e-mail. Use “Entrar”.', 'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/wrong-password': 'E-mail ou senha incorretos.', 'auth/user-not-found': 'Não há conta com esse e-mail. Use “Criar conta”.',
    'auth/too-many-requests': 'Muitas tentativas. Espere alguns minutos e tente de novo.', 'auth/network-request-failed': 'Sem conexão com a internet.',
    'auth/popup-closed-by-user': 'A janela do Google foi fechada antes de terminar.', 'auth/unauthorized-domain': 'Este endereço ainda não foi autorizado no Firebase (Authentication → Configurações → Domínios autorizados).',
    'auth/operation-not-allowed': 'Este tipo de login não está ativado no Firebase (Authentication → Método de login).', 'auth/popup-blocked': 'O navegador bloqueou a janela do Google. Permita pop-ups e tente de novo.'
  };
  const msgOf = e => ERR[e && e.code] || ('Não foi possível entrar agora' + (e && e.code ? ' (' + e.code + ')' : '') + '.');
  function loginScreen() {
    return new Promise(resolve => {
      const ov = document.createElement('div'); ov.id = 'inkLogin';
      ov.innerHTML = `<style>
#inkLogin{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:20px;overflow:auto;background:radial-gradient(120% 90% at 50% 0%,rgba(157,92,255,.22),transparent 60%),#0d0912;color:#f1eadf;font-family:Inter,system-ui,sans-serif}
#inkLogin .bx{width:min(420px,100%);background:#191222;border:1px solid rgba(157,92,255,.28);border-radius:20px;padding:26px 24px;box-shadow:0 30px 80px rgba(0,0,0,.5)}
#inkLogin img{display:block;width:210px;max-width:70%;margin:0 auto 6px}
#inkLogin h1{font:600 22px Fraunces,Georgia,serif;text-align:center;margin:6px 0 2px}#inkLogin p.s{text-align:center;color:#b6a9c9;font-size:14px;margin:0 0 18px}
#inkLogin label{display:block;font-size:12.5px;color:#b6a9c9;margin:10px 0 5px}
#inkLogin input{width:100%;box-sizing:border-box;background:#120c1a;border:1px solid #33264a;color:#f1eadf;border-radius:10px;padding:11px 12px;font-size:15px;outline:none}
#inkLogin input:focus{border-color:#9d5cff}
#inkLogin .b{width:100%;border:0;border-radius:11px;padding:12px;font:600 15px Inter,system-ui,sans-serif;cursor:pointer;margin-top:12px}
#inkLogin .p{background:linear-gradient(100deg,#9d5cff,#ff9640);color:#fff}#inkLogin .g{background:#fff;color:#222;display:flex;align-items:center;justify-content:center;gap:10px}
#inkLogin .o{background:transparent;color:#b6a9c9;border:1px solid #33264a}
#inkLogin .row{display:flex;gap:8px}#inkLogin .row .b{flex:1}
#inkLogin .sep{display:flex;align-items:center;gap:10px;color:#7d6f93;font-size:12px;margin:16px 0 4px}#inkLogin .sep:before,#inkLogin .sep:after{content:'';flex:1;height:1px;background:#33264a}
#inkLogin .er{color:#ff8a7a;font-size:13.5px;min-height:18px;margin-top:10px;text-align:center}#inkLogin .ok{color:#9be3a8}
#inkLogin a{color:#c9a8ff;font-size:13px;cursor:pointer;text-decoration:underline}#inkLogin .ft{text-align:center;margin-top:14px;font-size:12.5px;color:#7d6f93;line-height:1.5}
</style>
<div class="bx"><img src="img/wordmark.webp" alt="Inkmind"><h1>Entrar no Inkmind</h1><p class="s">Seus livros e campanhas salvos na nuvem, em qualquer aparelho.</p>
<button class="b g" id="ilG"><svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>Entrar com Google</button>
<div class="sep">ou com e-mail</div>
<label for="ilE">E-mail</label><input id="ilE" type="email" autocomplete="email" placeholder="voce@email.com">
<label for="ilP">Senha</label><input id="ilP" type="password" autocomplete="current-password" placeholder="mínimo 6 caracteres">
<div class="row"><button class="b p" id="ilIn">Entrar</button><button class="b o" id="ilUp">Criar conta</button></div>
<div class="er" id="ilEr"></div>
<div class="ft"><a id="ilFg">Esqueci a senha</a> · <a id="ilSk">Continuar sem conta</a><br><span>Sem conta, tudo fica salvo só neste navegador e a mesa ao vivo não funciona.</span></div></div>`;
      document.body.appendChild(ov);
      const $ = s => ov.querySelector(s), er = $('#ilEr');
      const busy = (on) => ov.querySelectorAll('button').forEach(b => b.disabled = on);
      const done = u => { ov.remove(); resolve(u); };
      const run = async fn => { er.className = 'er'; er.textContent = ''; busy(true); try { const c = await fn(); if (c && c.user) done(c.user); } catch (e) { er.textContent = msgOf(e); } finally { busy(false); } };
      $('#ilIn').onclick = () => run(() => F.signInWithEmailAndPassword(auth, $('#ilE').value.trim(), $('#ilP').value));
      $('#ilUp').onclick = () => run(async () => { const c = await F.createUserWithEmailAndPassword(auth, $('#ilE').value.trim(), $('#ilP').value); try { await F.updateProfile(c.user, { displayName: $('#ilE').value.trim().split('@')[0] }); } catch {} return c; });
      $('#ilG').onclick = () => run(() => F.signInWithPopup(auth, new F.GoogleAuthProvider()));
      $('#ilP').onkeydown = e => { if (e.key === 'Enter') $('#ilIn').click(); };
      $('#ilFg').onclick = async () => { const em = $('#ilE').value.trim(); if (!em) { er.textContent = 'Digite seu e-mail acima e clique de novo em “Esqueci a senha”.'; return; } try { await F.sendPasswordResetEmail(auth, em); er.className = 'er ok'; er.textContent = 'Enviamos um link para redefinir a senha para ' + em + '.'; } catch (e) { er.textContent = msgOf(e); } };
      $('#ilSk').onclick = () => { try { sessionStorage.setItem('ink-skip-login', '1'); } catch {} done(null); };
      setTimeout(() => $('#ilE').focus(), 50);
    });
  }

  /* ---------- inicialização ---------- */
  const authReady = new Promise(r => { const un = F.onAuthStateChanged(auth, u => { un(); r(u); }); });
  let boot = null;
  async function ensure() {
    if (boot) return boot;
    boot = (async () => {
      let u = await authReady;
      let skip = false; try { skip = sessionStorage.getItem('ink-skip-login') === '1'; } catch {}
      if (!u && !skip) u = await loginScreen();
      state.user = u || null;
      if (u) {
        F.onAuthStateChanged(auth, x => { if (!x && state.user) location.reload(); });
        try { await F.setDoc(F.doc(fs, 'profiles/' + u.uid), { name: nameOf(u), photo: u.photoURL || null, t: Date.now() }, { merge: true }); } catch (e) { console.warn('[inkmind] perfil', e); }
        await startSW();
      }
      return u;
    })();
    return boot;
  }
  window.claude = {
    async use(n) {
      const u = await ensure();
      if (!u) return null;                                  // sem conta → modo local do app
      return { db, user, assets, room }[n] || null;         // downloads e IA: o app usa o caminho normal do navegador
    }
  };
  window.INK = {
    mode: 'firebase',
    get user() { return state.user; },
    async logout() { try { await F.deleteDoc(F.doc(fs, 'presence/' + state.user.uid)); } catch {} try { sessionStorage.removeItem('ink-skip-login'); } catch {} await F.signOut(auth); location.reload(); },
    login() { try { sessionStorage.removeItem('ink-skip-login'); } catch {} location.reload(); },
    async renameMe(name) { if (!state.user) return; await F.updateProfile(state.user, { displayName: name }); await F.setDoc(F.doc(fs, 'profiles/' + state.user.uid), { name }, { merge: true }); },
    _enc: enc, _dec: dec, _flatten: flatten
  };
  return window.claude;
}
