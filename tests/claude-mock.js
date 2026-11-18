(()=>{
const U=new URLSearchParams(location.search).get('u')||'master';
const KEY='mockdb';
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}};
const save=d=>localStorage.setItem(KEY,JSON.stringify(d));
const listeners=new Set();
const notify=()=>setTimeout(()=>listeners.forEach(f=>f()),5);
window.addEventListener('storage',e=>{if(e.key===KEY)notify()});
const isObj=v=>v&&typeof v==='object'&&!Array.isArray(v);
const merge=(a,b)=>{const o={...a};for(const k in b){o[k]=isObj(b[k])&&isObj(o[k])?merge(o[k],b[k]):JSON.parse(JSON.stringify(b[k]))}return o};
const snapDoc=(path,d)=>{const v=d[path];return{id:path.split('/').pop(),exists:!!v,data:()=>v?JSON.parse(JSON.stringify(v)):undefined,metadata:{fromCache:false,hasPendingWrites:false}}};
function docRef(path){return{id:path.split('/').pop(),path,
 get:async()=>snapDoc(path,load()),
 set:async v=>{const d=load();d[path]=JSON.parse(JSON.stringify(v));save(d);notify()},
 update:async v=>{const d=load();if(!d[path])throw{code:'invalid_argument',message:'missing'};d[path]=merge(d[path],v);save(d);notify()},
 delete:async()=>{const d=load();delete d[path];save(d);notify()},
 onSnapshot:(next,err)=>{const f=()=>next(snapDoc(path,load()));listeners.add(f);setTimeout(f,10);return()=>listeners.delete(f)},
 collection:sub=>colRef(path+'/'+sub)}}
function colRef(path,filters=[]){const run=()=>{const d=load();const pre=path+'/';const docs=Object.keys(d).filter(k=>k.startsWith(pre)&&!k.slice(pre.length).includes('/')).filter(k=>filters.every(([f,op,v])=>{const x=d[k][f];if(op==='==')return x===v;if(op==='array-contains')return Array.isArray(x)&&x.includes(v);return true})).sort().map(k=>snapDoc(k,d));return{docs,size:docs.length,empty:!docs.length,docChanges:()=>[],metadata:{fromCache:false}}};
 return{path,where:(f,op,v)=>colRef(path,[...filters,[f,op,v]]),orderBy:()=>colRef(path,filters),limit:()=>colRef(path,filters),get:async()=>run(),
 onSnapshot:(next,err)=>{const f=()=>next(run());listeners.add(f);setTimeout(f,10);return()=>listeners.delete(f)},
 doc:id=>docRef(path+'/'+(id||Math.random().toString(36).slice(2))),add:async v=>{const r=docRef(path+'/'+Math.random().toString(36).slice(2));await r.set(v);return r}}}
const db={doc:docRef,collection:p=>colRef(p)};
const user={id:async()=>'u_'+U,isOwner:async()=>U==='master',canEdit:async()=>U==='master',can:async()=>true,me:async()=>({id:'u_'+U,name:U}),profiles:async ids=>Object.fromEntries([].concat(ids).map(i=>[i,{id:i,name:i.replace('u_','').toUpperCase(),avatarUrl:'',color:'#888'}]))};
const assets={upload:async b=>{const id=Math.random().toString(36).slice(2);window.__blobs=window.__blobs||{};return{id,url:URL.createObjectURL(b)}}};
const peerId=Math.random().toString(36).slice(2);const RK='mockroom';
const rload=()=>{try{return JSON.parse(localStorage.getItem(RK)||'{}')}catch{return{}}};
const peerList=()=>{const r=rload();return Object.entries(r).map(([pid,v])=>({peer:pid,by:v.by,isMe:pid===peerId,sameTab:pid===peerId,kind:'viewer',guest:false,presence:v.presence||{},updatedAt:v.t}))};
const plis=new Set();const pnotify=()=>setTimeout(()=>{const ps=peerList();plis.forEach(f=>f({peers:ps,joined:[],left:[],updated:[]}))},5);
window.addEventListener('storage',e=>{if(e.key===RK)pnotify()});
window.addEventListener('beforeunload',()=>{const r=rload();delete r[peerId];localStorage.setItem(RK,JSON.stringify(r))});
const room={presence:async p=>{const r=rload();const cur=(r[peerId]||{presence:{}}).presence;const np={...cur};for(const k in p){if(p[k]===null)delete np[k];else np[k]=p[k]}r[peerId]={by:'u_'+U,presence:np,t:Date.now()};localStorage.setItem(RK,JSON.stringify(r));pnotify()},
 onPeers:(f)=>{plis.add(f);room.presence({});return()=>plis.delete(f)},peers:()=>peerList(),connected:()=>true};
const sample=async(input)=>({text:'A fierce elf archer in a green cloak, dark misty forest, torchlight, oil painting',truncated:false});
window.__closePeer=()=>{const r=rload();delete r[peerId];localStorage.setItem(RK,JSON.stringify(r))};
window.claude={use:async n=>({db,user,assets,downloads:null,room,sample})[n]||null};
})();
