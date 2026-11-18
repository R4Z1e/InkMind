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
  initializeApp: cfg => ({ cfg }),
  getAuth: () => ({ currentUser: JSON.parse(sessionStorage.getItem('mockauth') || 'null') }),
  getFirestore: () => ({}),
  onAuthStateChanged(auth, cb) { let on = true; setTimeout(() => on && cb(auth.currentUser), 10); F._authCbs.add(cb); return () => { on = false; F._authCbs.delete(cb); }; },
  _authCbs: new Set(),
  _setUser(auth, u) { auth.currentUser = u; sessionStorage.setItem('mockauth', JSON.stringify(u)); F._authCbs.forEach(cb => cb(u)); },
  async signInWithEmailAndPassword(auth, e, p) { const us = JSON.parse(localStorage.getItem('mockusers') || '{}'); if (!/@/.test(e)) throw fsErr('auth/invalid-email'); const u = us[e]; if (!u || u.pw !== p) throw fsErr('auth/invalid-credential'); const user = { uid: u.uid, email: e, displayName: u.displayName || null, photoURL: null }; F._setUser(auth, user); return { user }; },
  async createUserWithEmailAndPassword(auth, e, p) { const us = JSON.parse(localStorage.getItem('mockusers') || '{}'); if (!/@/.test(e)) throw fsErr('auth/invalid-email'); if ((p || '').length < 6) throw fsErr('auth/weak-password'); if (us[e]) throw fsErr('auth/email-already-in-use'); us[e] = { pw: p, uid: 'u_' + e.split('@')[0] }; localStorage.setItem('mockusers', JSON.stringify(us)); const user = { uid: us[e].uid, email: e, displayName: null, photoURL: null }; F._setUser(auth, user); return { user }; },
  async signInWithPopup(auth) { const user = { uid: 'u_google', email: 'google@gmail.com', displayName: 'Usuária Google', photoURL: null }; F._setUser(auth, user); return { user }; },
  GoogleAuthProvider: class {},
  async signOut(auth) { F._setUser(auth, null); },
  async sendPasswordResetEmail() {},
  async updateProfile(u, o) { Object.assign(u, o); const us = JSON.parse(localStorage.getItem('mockusers') || '{}'); if (us[u.email]) { us[u.email].displayName = o.displayName; localStorage.setItem('mockusers', JSON.stringify(us)); } sessionStorage.setItem('mockauth', JSON.stringify(u)); },
  doc: (fs, path) => { if (path.split('/').length % 2) throw fsErr('invalid-argument', 'doc path must be even: ' + path); return { type: 'doc', path, id: path.split('/').pop() }; },
  collection: (fs, path) => { if (path.split('/').length % 2 === 0) throw fsErr('invalid-argument', 'collection path must be odd: ' + path); return { type: 'q', path, wheres: [] }; },
  query: (q, ...ws) => ({ ...q, wheres: [...q.wheres, ...ws] }),
  where: (f, op, v) => ({ f, op, v }),
  async getDoc(ref) { await 0; return snapOf(ref.path); },
  async setDoc(ref, data, opts) { data = strip(data); validate(data); write(ref.path, opts && opts.merge ? deepMerge(read(ref.path), data) : clone(data)); },
  async updateDoc(ref, ...args) {
    const cur = read(ref.path); if (!cur) throw fsErr('not-found', 'No document to update: ' + ref.path);
    for (let i = 0; i < args.length; i += 2) {
      const fp = args[i], v = args[i + 1]; if (!(fp instanceof FieldPath)) throw fsErr('invalid-argument', 'expected FieldPath');
      if (v !== undefined) validate(v, false);
      let o = cur; const s = fp.s; for (let j = 0; j < s.length - 1; j++) { if (!o[s[j]] || typeof o[s[j]] !== 'object' || Array.isArray(o[s[j]])) o[s[j]] = {}; o = o[s[j]]; }
      if (v === undefined) continue; o[s[s.length - 1]] = clone(v);
    }
    write(ref.path, cur);
  },
  async deleteDoc(ref) { write(ref.path, null); },
  async getDocs(q) { await 0; const docs = colDocs(q); return { docs, size: docs.length, empty: !docs.length }; },
  onSnapshot(t, cb, err) {
    const l = t.type === 'doc'
      ? { match: p => p === t.path, fire: () => { try { cb(snapOf(t.path)); } catch (e) { console.error(e); } } }
      : { match: p => parent(p) === t.path, fire: () => { try { const docs = colDocs(t); cb({ docs, size: docs.length, empty: !docs.length }); } catch (e) { err ? err(e) : console.error(e); } } };
    listeners.add(l); setTimeout(() => l.fire(), 0);
    return () => listeners.delete(l);
  }
};
