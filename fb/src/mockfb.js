/* Firebase falso para testes: Firestore em localStorage (compartilhado entre abas), Auth por aba (sessionStorage). */
const LSK = 'mockfs:', clone = v => v === undefined ? undefined : JSON.parse(JSON.stringify(v));
const fsErr = (code, m) => Object.assign(new Error(m || code), { code });
function getAt(o, path) { for (const k of path) { if (!o || typeof o !== 'object') return undefined; o = o[k]; } return o; }
function validate(v, inArr) {
  if (Array.isArray(v)) { if (inArr) throw fsErr('invalid-argument', 'Nested arrays are not supported'); v.forEach(x => validate(x, true)); }
  else if (v && typeof v === 'object') { for (const k in v) { if (k === '') throw fsErr('invalid-argument', 'empty key'); validate(v[k], false); } }
}
function strip(v) { if (Array.isArray(v)) return v.map(strip); if (v && typeof v === 'object') { const o = {}; for (const k in v) if (v[k] !== undefined) o[k] = strip(v[k]); return o; } return v; }
function deepMerge(a, b) { const o = { ...(a || {}) }; for (const k in b) { o[k] = (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && o[k] && typeof o[k] === 'object' && !Array.isArray(o[k])) ? deepMerge(o[k], b[k]) : b[k]; } return o; }
const listeners = new Set();
/* regras simplificadas (espelham firestore.rules) para os testes pegarem acessos indevidos */
const uidNow = () => { const u = JSON.parse(sessionStorage.getItem('mockauth') || 'null'); return u && u.uid; };
const anonNow = () => { const u = JSON.parse(sessionStorage.getItem('mockauth') || 'null'); return !!(u && u.isAnonymous); };
function canReadGame(g, me) { return !!g && (g.masterId === me || (g.access || 'legacy') !== 'private' || !!(g.players || {})[me]); }
function isAdm() { const u = JSON.parse(sessionStorage.getItem('mockauth') || 'null'); return !!(u && u.email && u.emailVerified && !u.isAnonymous && (window.MOCK_ADMINS || []).includes(u.email.toLowerCase())); }
function mockRule(op, path, next, prev) {
  const me = uidNow(), seg = path.split('/'), anon = anonNow();
  const deny = () => { throw fsErr('permission-denied', 'Missing or insufficient permissions. (' + op + ' ' + path + ')'); };
  if (anon && op !== 'get' && (seg[0] === 'data' || seg[0] === 'pubs' || seg[0] === 'blobs' || seg[0] === 'invites' || (seg[0] === 'games' && (op === 'create' && seg.length === 2 || seg[2] === 'requests' && op === 'create')))) deny();
  if (anon && op === 'get' && seg[0] === 'data') deny();
  if (seg[0] === 'games') {
    const g = read('games/' + seg[1]);
    if (seg.length === 2) {
      if (op === 'get') { if (g && !canReadGame(g, me)) deny(); return; }
      if (op === 'create') { if (next.masterId !== me) deny(); return; }
      if (op === 'update') {
        if (prev.masterId === me) return;
        { const ks = [...new Set([...Object.keys(next), ...Object.keys(prev)])].filter(k => JSON.stringify(next[k]) !== JSON.stringify(prev[k])); if (isAdm() && ks.length === 1 && ks[0] === 'access' && next.access === 'private') return; }
        const keys = new Set([...Object.keys(next), ...Object.keys(prev)].filter(k => JSON.stringify(next[k]) !== JSON.stringify(prev[k])));
        if ([...keys].some(k => k !== 'players')) deny();
        const a = next.players || {}, b = prev.players || {};
        const changed = new Set([...Object.keys(a), ...Object.keys(b)].filter(k => a[k] !== b[k]));
        if ([...changed].some(k => k !== me)) deny();
        if (a[me]) { if (Object.keys(a).length > (prev.maxPlayers || 99)) deny(); if ((prev.access || 'legacy') === 'private') deny(); if ((prev.banned || {})[me]) deny(); if (anon && prev.access !== 'public') deny(); }
        return;
      }
    }
    if ((seg[2] === 'secret' || seg[2] === 'gmmaps') && (!g || g.masterId !== me)) deny();
    if (seg[2] === 'maps' && op === 'get' && g && !canReadGame(g, me)) deny();
    if (seg[2] === 'requests') { if (op === 'get' && seg[3] !== me && g.masterId !== me) deny(); if (op === 'create' && seg[3] !== me) deny(); if (op === 'update' && g.masterId !== me) deny(); }
  }
  if (seg[0] === 'reports') { if (op === 'create') { if (!me || next.by !== me || next.status !== 'open') deny(); return; } if (!isAdm()) deny(); return; }
  if (seg[0] === 'hidden' && op !== 'get' && !isAdm()) deny();
  if (seg[0] === 'invites' && (op === 'create' || op === 'update')) { const g = read('games/' + next.gid); if (!g || g.masterId !== me) deny(); }
}
function emit(path) { for (const l of [...listeners]) if (l.match(path)) l.fire(); }
addEventListener('storage', e => { if (e.key && e.key.startsWith(LSK)) emit(e.key.slice(LSK.length)); });
const read = p => { const v = localStorage.getItem(LSK + p); return v ? JSON.parse(v) : null; };
const write = (p, v) => { if (v === null) localStorage.removeItem(LSK + p); else { const s = JSON.stringify(v); if (s.length > 1048000) throw fsErr('invalid-argument', 'Document exceeds 1 MiB'); localStorage.setItem(LSK + p, s); } window.__mockWrites = (window.__mockWrites || 0) + 1; setTimeout(() => emit(p), 0); };
const parent = p => p.split('/').slice(0, -1).join('/');
export class FieldPath { constructor(...s) { this.s = s; } }
const snapOf = p => { const d = read(p); return { id: p.split('/').pop(), exists: () => !!d, data: () => clone(d) }; };
function colDocs(q) {
  const out = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (!k.startsWith(LSK)) continue; const p = k.slice(LSK.length); if (parent(p) !== q.path) continue; out.push(p); }
  out.sort();
  return out.map(snapOf).filter(s => (q.wheres || []).every(w => { const v = getAt(s.data(), w.f.split('.')); switch (w.op) { case '==': return v === w.v; case 'array-contains': return Array.isArray(v) && v.includes(w.v); case '>': return v > w.v; case '<': return v < w.v; case '>=': return v >= w.v; case '<=': return v <= w.v; default: throw fsErr('invalid-argument', 'op ' + w.op); } }));
}
export const F = {
  FieldPath,
  deleteField: () => ({ __del: true }),
  initializeApp: cfg => ({ cfg }),
  getAuth: () => ({ currentUser: JSON.parse(sessionStorage.getItem('mockauth') || 'null') }),
  getFirestore: () => ({}),
  onAuthStateChanged(auth, cb) { let on = true; setTimeout(() => on && cb(auth.currentUser), 10); F._authCbs.add(cb); return () => { on = false; F._authCbs.delete(cb); }; },
  _authCbs: new Set(),
  _setUser(auth, u) { auth.currentUser = u; sessionStorage.setItem('mockauth', JSON.stringify(u)); F._authCbs.forEach(cb => cb(u)); },
  async signInWithEmailAndPassword(auth, e, p) { const us = JSON.parse(localStorage.getItem('mockusers') || '{}'); if (!/@/.test(e)) throw fsErr('auth/invalid-email'); const u = us[e]; if (!u || u.pw !== p) throw fsErr('auth/invalid-credential'); const user = { uid: u.uid, email: e, displayName: u.displayName || null, photoURL: null, isAnonymous: false, emailVerified: false, providerData: [{ providerId: 'password' }] }; F._setUser(auth, user); return { user }; },
  async createUserWithEmailAndPassword(auth, e, p) { const us = JSON.parse(localStorage.getItem('mockusers') || '{}'); if (!/@/.test(e)) throw fsErr('auth/invalid-email'); if ((p || '').length < 6) throw fsErr('auth/weak-password'); if (us[e]) throw fsErr('auth/email-already-in-use'); us[e] = { pw: p, uid: 'u_' + e.split('@')[0] }; localStorage.setItem('mockusers', JSON.stringify(us)); const user = { uid: us[e].uid, email: e, displayName: null, photoURL: null, isAnonymous: false, emailVerified: false, providerData: [{ providerId: 'password' }] }; F._setUser(auth, user); return { user }; },
  async signInWithPopup(auth) { const user = { uid: 'u_google', email: 'google@gmail.com', displayName: 'Usuária Google', photoURL: null, isAnonymous: false, emailVerified: true, providerData: [{ providerId: 'google.com' }] }; F._setUser(auth, user); return { user }; },
  GoogleAuthProvider: class {},
  async signInAnonymously(auth) { const n = Math.random().toString(36).slice(2, 8); const user = { uid: 'anon_' + n, email: null, displayName: null, photoURL: null, isAnonymous: true }; F._setUser(auth, user); return { user }; },
  EmailAuthProvider: { credential: (e, p) => ({ e, p }) },
  async linkWithCredential(u, cred) { const us = JSON.parse(localStorage.getItem('mockusers') || '{}'); if (us[cred.e]) throw fsErr('auth/email-already-in-use'); if ((cred.p || '').length < 6) throw fsErr('auth/weak-password'); us[cred.e] = { pw: cred.p, uid: u.uid, displayName: u.displayName }; localStorage.setItem('mockusers', JSON.stringify(us)); const user = { ...u, email: cred.e, isAnonymous: false }; const a = { currentUser: null }; F._setUser(a, user); return { user }; },
  async deleteUser(u) { const us = JSON.parse(localStorage.getItem('mockusers') || '{}'); for (const k in us) if (us[k].uid === u.uid) delete us[k]; localStorage.setItem('mockusers', JSON.stringify(us)); F._setUser({}, null); },
  async reauthenticateWithCredential(u, cred) { const us = JSON.parse(localStorage.getItem('mockusers') || '{}'); if (!us[cred.e] || us[cred.e].pw !== cred.p) throw fsErr('auth/invalid-credential'); return { user: u }; },
  async reauthenticateWithPopup(u) { return { user: u }; },
  async linkWithPopup(u) { const user = { ...u, email: 'g_' + u.uid + '@gmail.com', isAnonymous: false }; F._setUser({}, user); return { user }; },
  async signOut(auth) { F._setUser(auth, null); },
  async sendPasswordResetEmail() {},
  async updateProfile(u, o) { Object.assign(u, o); const us = JSON.parse(localStorage.getItem('mockusers') || '{}'); if (us[u.email]) { us[u.email].displayName = o.displayName; localStorage.setItem('mockusers', JSON.stringify(us)); } sessionStorage.setItem('mockauth', JSON.stringify(u)); },
  doc: (fs, path) => { if (path.split('/').length % 2) throw fsErr('invalid-argument', 'doc path must be even: ' + path); return { type: 'doc', path, id: path.split('/').pop() }; },
  collection: (fs, path) => { if (path.split('/').length % 2 === 0) throw fsErr('invalid-argument', 'collection path must be odd: ' + path); return { type: 'q', path, wheres: [] }; },
  query: (q, ...ws) => ({ ...q, wheres: [...q.wheres, ...ws] }),
  where: (f, op, v) => ({ f, op, v }),
  async getDoc(ref) { await 0; mockRule('get', ref.path); return snapOf(ref.path); },
  async setDoc(ref, data, opts) { data = strip(data); validate(data); mockRule(read(ref.path) ? 'update' : 'create', ref.path, opts && opts.merge ? deepMerge(read(ref.path), data) : data, read(ref.path)); write(ref.path, opts && opts.merge ? deepMerge(read(ref.path), data) : clone(data)); },
  async updateDoc(ref, ...args) {
    const cur = read(ref.path); const before = clone(cur); if (!cur) throw fsErr('not-found', 'No document to update: ' + ref.path);
    for (let i = 0; i < args.length; i += 2) {
      const fp = args[i], v = args[i + 1]; if (!(fp instanceof FieldPath)) throw fsErr('invalid-argument', 'expected FieldPath');
      if (v !== undefined) validate(v, false);
      let o = cur; const s = fp.s; for (let j = 0; j < s.length - 1; j++) { if (!o[s[j]] || typeof o[s[j]] !== 'object' || Array.isArray(o[s[j]])) o[s[j]] = {}; o = o[s[j]]; }
      if (v === undefined) continue; if (v && v.__del) { delete o[s[s.length - 1]]; continue; } o[s[s.length - 1]] = clone(v);
    }
    mockRule('update', ref.path, cur, before); write(ref.path, cur);
  },
  async deleteDoc(ref) { write(ref.path, null); },
  async getDocs(q) { await 0; const docs = colDocs(q).filter(d => { if (q.path === 'games') return canReadGame(d.data(), uidNow()); return true; }); if (q.path === 'reports' && !isAdm()) throw fsErr('permission-denied', 'Missing or insufficient permissions. (list reports)'); { const sg = q.path.split('/'); if (sg[0] === 'games' && (sg[2] === 'gmmaps' || sg[2] === 'secret')) { const g = read('games/' + sg[1]); if (!g || g.masterId !== uidNow()) throw fsErr('permission-denied', 'Missing or insufficient permissions. (list ' + q.path + ')'); } } if (q.path === 'games' && !(q.wheres||[]).length) {}  return { docs, size: docs.length, empty: !docs.length }; },
  onSnapshot(t, cb, err) {
    try { if (t.type === 'doc') mockRule('get', t.path); else { const m = /^games\/([^/]+)\/(maps|requests|secret|gmmaps)$/.exec(t.path); if (m) { const g = read('games/' + m[1]); if (g && (m[2] === 'maps' ? !canReadGame(g, uidNow()) : g.masterId !== uidNow())) throw fsErr('permission-denied', 'no read ' + t.path); } } } catch (e) { setTimeout(() => err && err(e), 0); return () => {}; }
    const l = t.type === 'doc'
      ? { match: p => p === t.path, fire: () => { try { cb(snapOf(t.path)); } catch (e) { console.error(e); } } }
      : { match: p => parent(p) === t.path, fire: () => { try { const docs = colDocs(t); cb({ docs, size: docs.length, empty: !docs.length }); } catch (e) { err ? err(e) : console.error(e); } } };
    listeners.add(l); setTimeout(() => l.fire(), 0);
    return () => listeners.delete(l);
  }
};
