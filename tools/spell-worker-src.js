import { decodeTrie } from 'cspell-trie-lib';
const D = {}; let user = new Set(), userLower = new Set();
const norm = w => w.normalize('NFC');
function known(lang, w) {
  const it = D[lang]; if (!it) return true;
  if (user.has(w) || userLower.has(w.toLowerCase())) return true;
  if (it.has(w)) return true;
  const lw = w.toLowerCase(); if (lw !== w && it.has(lw)) return true;          // começo de frase / tudo maiúsculo
  if (/^[A-ZÀ-Ý]/.test(w) && w.length > 1 && w !== w.toUpperCase()) return false;
  return false;
}
const VARS = [['ss','ç'],['ç','ss'],['ç','s'],['s','ç'],['s','z'],['z','s'],['x','ch'],['ch','x'],['g','j'],['j','g'],['ss','s'],['s','ss'],['c','ç'],['ç','c'],['u','l'],['l','u'],['i','e'],['e','i'],['o','u'],['u','o'],['rr','r'],['r','rr']];
const ACC = { a: 'áàâã', e: 'éê', i: 'í', o: 'óôõ', u: 'úü', c: 'ç' };
function ptVariants(w) {
  const out = new Set(); const lw = w.toLowerCase();
  for (const [a, b] of VARS) { let i = lw.indexOf(a); while (i >= 0) { out.add(lw.slice(0, i) + b + lw.slice(i + a.length)); i = lw.indexOf(a, i + 1); } }
  for (let i = 0; i < lw.length; i++) { const al = ACC[lw[i]]; if (al) for (const c of al) out.add(lw.slice(0, i) + c + lw.slice(i + 1)); }
  const plain = lw.normalize('NFD').replace(/[̀-ͯ]/g, ''); if (plain !== lw) out.add(plain);
  return [...out];
}
function suggest(lang, w) {
  const it = D[lang]; if (!it) return [];
  const res = []; const add = s => { if (s && s !== w && !res.includes(s)) res.push(s); };
  const phon = new Set(); if (lang.startsWith('pt')) for (const v of ptVariants(w)) if (it.has(v)) { add(v); phon.add(v); }   // trocas comuns: ss/ç, s/z, x/ch, acentos
  try { for (const s of it.suggest(w.toLowerCase(), { numSuggestions: 8, ignoreCase: true })) add(s); } catch {}
  const lw = w.toLowerCase(), lev = (a, b) => { const d = Array.from({ length: b.length + 1 }, (_, i) => i); for (let i = 1; i <= a.length; i++) { let p = d[0]; d[0] = i; for (let j = 1; j <= b.length; j++) { const t = d[j]; d[j] = Math.min(d[j] + 1, d[j - 1] + 1, p + (a[i - 1] === b[j - 1] ? 0 : 1)); p = t; } } return d[b.length]; };
  const plain = x => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // ordem: só acento diferente > distância menor > mesmo tamanho ou uma letra a mais (o erro mais comum é esquecer uma letra)
  const score = x => { const lx = x.toLowerCase(); if (plain(lx) === plain(lw)) return -1; const dl = lx.length - lw.length, sub = (a, b) => { let i = 0; for (const c of b) if (c === a[i]) i++; return i === a.length; }; return (phon.has(lx) ? -2.5 : 0) + (dl > 0 && sub(plain(lw), plain(lx)) ? -1.5 : 0) + lev(plain(lx), plain(lw)) * 3 + (dl === 0 ? 0 : dl === 1 ? 0.5 : 1 + Math.abs(dl)) + (x.includes('-') ? 1 : 0); };
  const ranked = res.map((x, i) => [x, score(x), i]).sort((a, b) => a[1] - b[1] || a[2] - b[2]).map(x => x[0]);
  const cap = /^[A-ZÀ-Ý]/.test(w); return ranked.slice(0, 6).map(s => cap ? s[0].toUpperCase() + s.slice(1) : s);
}
self.onmessage = async e => {
  const m = e.data;
  try {
    if (m.t === 'load') {
      let txt = m.text;
      if (!txt) { const r = await fetch(m.url); if (!r.ok) throw new Error('HTTP ' + r.status); const ds = r.body.pipeThrough(new DecompressionStream('gzip')); txt = await new Response(ds).text(); }
      D[m.lang] = decodeTrie(txt); self.postMessage({ id: m.id, ok: true, words: D[m.lang].size || 0 });
    } else if (m.t === 'loadBuf') {
      const ds = new Blob([m.buf]).stream().pipeThrough(new DecompressionStream('gzip')); const txt = await new Response(ds).text();
      D[m.lang] = decodeTrie(txt); self.postMessage({ id: m.id, ok: true });
    } else if (m.t === 'user') { user = new Set((m.words || []).map(norm)); userLower = new Set([...user].map(w => w.toLowerCase())); self.postMessage({ id: m.id, ok: true }); }
    else if (m.t === 'check') { const bad = []; for (const w of m.words) if (!known(m.lang, norm(w))) bad.push(w); self.postMessage({ id: m.id, ok: true, bad }); }
    else if (m.t === 'suggest') self.postMessage({ id: m.id, ok: true, list: suggest(m.lang, norm(m.word)) });
    else if (m.t === 'unload') { delete D[m.lang]; self.postMessage({ id: m.id, ok: true }); }
  } catch (err) { self.postMessage({ id: m.id, ok: false, error: String(err && err.message || err) }); }
};
