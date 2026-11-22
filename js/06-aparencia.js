/* ============ v5: aparência do personagem (retrato pintado) + tokens animados ============ */
const RACES={
 humano:{n:'Humano',hw:46,hh:58,jaw:.78,ears:'round',skins:['#f1cfb4','#deb193','#c48c69','#a36d4c','#7a4d33','#553522'],def:{hair:'curto'}},
 elfo:{n:'Elfo',tilt:1,hw:42,hh:60,jaw:.68,ears:'elf',skins:['#f3dccb','#e6c4a6','#cfa684','#a98568','#7d6a8c','#544868'],def:{hair:'longo',brows:'arqueada',eyes:'amendoado'}},
 meioelfo:{n:'Meio-Elfo',hw:44,hh:59,jaw:.74,ears:'halfelf',skins:['#f1cfb4','#deb193','#c48c69','#a36d4c','#7a4d33'],def:{hair:'medio'}},
 anao:{n:'Anão',hw:52,hh:54,jaw:.86,ears:'round',skins:['#e8bf9f','#d19e7a','#b07856','#86573c'],def:{hair:'curto',beard:'trancada',brows:'grossa'}},
 halfling:{n:'Halfling',hw:45,hh:52,jaw:.72,ears:'small',skins:['#f1cfb4','#deb193','#c48c69','#a36d4c','#7a4d33'],def:{hair:'cacheado',eyes:'redondo',mouth:'sorriso'}},
 gnomo:{n:'Gnomo',hw:44,hh:51,jaw:.7,ears:'gnome',skins:['#efcdb0','#dbad8b','#bf8f6b','#9a6e4f'],def:{hair:'selvagem',eyes:'redondo',mouth:'sorriso'}},
 meioorc:{n:'Meio-Orc',hw:52,hh:58,jaw:.88,ears:'halfelf',skins:['#9ca77b','#7f8f62','#8b908a','#6b7350','#a39483'],tusks:1,def:{hair:'moicano',brows:'raiva'}},
 orc:{n:'Orc',hw:55,hh:58,jaw:.92,ears:'orc',skins:['#6f8a4e','#5b7340','#6e7a6e','#4f5b3a','#7d6a55'],tusks:2,def:{hair:'rabo',brows:'raiva',mouth:'serio'}},
 tiefling:{n:'Tiefling',tilt:1,hw:45,hh:58,jaw:.72,ears:'elf',skins:['#b8443a','#8c2f3c','#7a4a8a','#5b3b7a','#3f5a8a','#c98a7a'],solidEyes:1,def:{hair:'longo',horns:'carneiro'}},
 draconato:{n:'Draconato',hw:50,hh:60,jaw:.9,dragon:1,skins:['#a83226','#2c5aa8','#2f7a3a','#c9a43a','#b06a3a','#b8bcc4','#2a2a30','#dfe6ea','#b87333','#c9a35a'],def:{hair:'careca',horns:'dragao',beard:'nenhuma'}},
 aasimar:{n:'Aasimar',hw:45,hh:59,jaw:.74,ears:'round',skins:['#f6e3d3','#e9cfb6','#d8b896','#c8a07a','#9b7b62'],glow:1,def:{hair:'longo',eyeColor:'#ffe08a'}},
 golias:{n:'Golias',hw:54,hh:62,jaw:.86,ears:'round',skins:['#9a9a92','#7f8288','#8c8579','#6b6e70'],stone:1,def:{hair:'careca',brows:'grossa'}}
};
const LOOK_OPTS={
 eyes:[['amendoado','Amendoado'],['redondo','Redondo'],['estreito','Estreito'],['cansado','Cansado']],
 brows:[['normal','Normal'],['grossa','Grossa'],['fina','Fina'],['arqueada','Arqueada'],['raiva','Brava']],
 mouth:[['neutra','Neutra'],['sorriso','Sorriso'],['serio','Séria'],['sarcastico','Sarcástica'],['aberta','Grito']],
 beard:[['nenhuma','Sem barba'],['rala','Por fazer'],['bigode','Bigode'],['cavanhaque','Cavanhaque'],['cheia','Cheia'],['trancada','Trançada']],
 marks:[['nenhuma','Nenhuma'],['cicatriz','Cicatriz'],['pintura','Pintura de guerra'],['tatuagem','Tatuagem'],['sardas','Sardas']],
 hair:[['careca','Careca'],['raspado','Raspado'],['curto','Curto'],['medio','Médio'],['longo','Longo'],['rabo','Rabo de cavalo'],['trancas','Tranças'],['coque','Coque'],['moicano','Moicano'],['selvagem','Selvagem'],['cacheado','Cacheado']],
 outfit:[['couro','🧥 Couro'],['placas','🛡️ Armadura'],['manto','🔮 Manto arcano'],['capuz','🗡️ Capuz'],['sagradas','✝️ Vestes sagradas'],['trapos','🧺 Andarilho']],
 horns:[['nenhum','Nenhum'],['carneiro','Carneiro'],['retos','Retos'],['curvos','Curvos'],['dragao','Dracônicos']],
 acc:[['nenhum','Nenhum'],['brinco','Brinco'],['diadema','Diadema'],['tapaolho','Tapa-olho'],['faixa','Faixa']]
};
const HAIR_COLORS=['#1c1612','#3b2a1e','#5e3b22','#8a5a2b','#b07a3a','#d9b26a','#e8dcc0','#9a9a9a','#e6e6e6','#8f2a1c','#c4472a','#3a4f8a','#5b3a7a','#2f6a5a'];
const EYE_COLORS=['#4a3020','#6b4a2a','#5a7a3a','#3f6a8a','#7a8a9a','#2a2a2a','#b08a2a','#8a2a2a','#9a5ac8','#ffe08a','#e04a2a','#40d0c0'];
const CLOTH_COLORS=['#5a3a24','#3e2a1a','#6b6f78','#2e3328','#3b2f5a','#5a1e1e','#1e3a5a','#d8d0c0','#7a6a52','#1a1a1c','#2f4a2a','#6a4a1a'];
const ACCENT_COLORS=['#b08a3a','#c9a44a','#8a8f96','#d8d0c0','#8a1e1e','#3a6aa8','#2f7a3a','#5a2a7a','#1a1a1c'];
const BG_COLORS=['#2a1c12','#1a1410','#16201c','#1c1a28','#281616','#121820','#2a2418'];
function shade(hex,amt){let c=String(hex||'#888').replace('#','');if(c.length===3)c=c.split('').map(x=>x+x).join('');const n=parseInt(c,16);let r=n>>16&255,g=n>>8&255,b=n&255;const t=amt<0?0:255,p=Math.abs(amt);r=Math.round((t-r)*p)+r;g=Math.round((t-g)*p)+g;b=Math.round((t-b)*p)+b;return'#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}
function rgba(hex,a){const c=shade(hex,0).slice(1),n=parseInt(c,16);return`rgba(${n>>16&255},${n>>8&255},${n&255},${a})`}
const raceKey=name=>{const s=norm(name).replace(/[^a-z]/g,'');const map={humano:'humano',human:'humano',elfo:'elfo',elf:'elfo',meioelfo:'meioelfo',halfelf:'meioelfo',anao:'anao',dwarf:'anao',halfling:'halfling',pequenino:'halfling',gnomo:'gnomo',gnome:'gnomo',meioorc:'meioorc',halforc:'meioorc',orc:'orc',tiefling:'tiefling',draconato:'draconato',dragonborn:'draconato',aasimar:'aasimar',golias:'golias',goliath:'golias'};return map[s]||null};
function classOutfit(name){const s=norm(name);if(/guerreir|paladin|barbar|cavaleir|soldad/.test(s))return'placas';if(/mago|feitic|brux|arcan/.test(s))return'manto';if(/ladin|patrulh|ranger|assassin|cacad/.test(s))return'capuz';if(/clerig|sacerdot|druid|monj/.test(s))return'sagradas';if(/monge|andarilh|campones/.test(s))return'trapos';return'couro'}
const OUTFIT_COLORS={couro:['#5a3a24','#b08a3a'],placas:['#6b6f78','#c9a44a'],manto:['#3b2f5a','#c9a44a'],capuz:['#2e3328','#8a7a5a'],sagradas:['#d8d0c0','#b08a3a'],trapos:['#7a6a52','#5a3a24']};
function availRaces(){const g=T.game||{},h=new Set(g.hiddenRaces||[]);const a=Object.keys(RACES).filter(k=>!h.has(k)).concat((g.races||[]).map(r=>'c:'+r.id));return a.length?a:['humano']}
function defaultLook(race,outfit,seed){const R=getRace(race),rnd=rng(hash2(String(seed||'x').length*97,[...String(seed||'x')].reduce((a,c)=>a+c.charCodeAt(0),0)));const pk=a=>a[Math.floor(rnd()*a.length)];const o=outfit||'couro',oc=OUTFIT_COLORS[o]||OUTFIT_COLORS.couro;
 const L0=Object.assign({race:(RACES[race]||String(race).startsWith('c:'))?race:'humano',body:rnd()<.5?'m':'f',age:'adulto',skin:pk(R.skins),hair:'curto',hairColor:pk(HAIR_COLORS.slice(0,8)),eyes:'amendoado',eyeColor:pk(EYE_COLORS.slice(0,6)),brows:'normal',mouth:'neutra',beard:'nenhuma',marks:'nenhuma',outfit:o,outfitColor:oc[0],accent:oc[1],horns:'nenhum',hornColor:'#2a2420',acc:'nenhum',bg:pk(BG_COLORS)},R.def||{});if(R.custom)L0.rc=R;return L0}
function randomLook(prev){const keys=availRaces();const race=prev&&prev._lockRace?prev.race:keys[Math.floor(Math.random()*keys.length)];const R=getRace(race),pk=a=>a[Math.floor(Math.random()*a.length)][0];
 const L=defaultLook(race,pk(LOOK_OPTS.outfit),Math.random());Object.assign(L,{body:Math.random()<.5?'m':'f',hair:R.dragon?'careca':pk(LOOK_OPTS.hair),eyes:pk(LOOK_OPTS.eyes),brows:pk(LOOK_OPTS.brows),mouth:pk(LOOK_OPTS.mouth),marks:Math.random()<.6?'nenhuma':pk(LOOK_OPTS.marks),acc:Math.random()<.6?'nenhum':pk(LOOK_OPTS.acc),hairColor:HAIR_COLORS[Math.floor(Math.random()*HAIR_COLORS.length)],eyeColor:EYE_COLORS[Math.floor(Math.random()*EYE_COLORS.length)],outfitColor:CLOTH_COLORS[Math.floor(Math.random()*CLOTH_COLORS.length)],accent:ACCENT_COLORS[Math.floor(Math.random()*ACCENT_COLORS.length)]});
 L.beard=L.body==='m'&&!R.dragon&&Math.random()<.5?pk(LOOK_OPTS.beard):(R.def&&R.def.beard||'nenhuma');if(race==='tiefling')L.horns=pk(LOOK_OPTS.horns.slice(1,4));if(R.custom&&R.def&&R.def.horns)L.horns=R.def.horns;return L}
/* --- desenho do retrato (coordenadas lógicas 200×240) --- */
function facePath(cx,cy,hw,hh,jaw){const p=new Path2D();p.moveTo(cx,cy-hh);p.bezierCurveTo(cx+hw*.95,cy-hh,cx+hw*1.03,cy-hh*.35,cx+hw,cy-hh*.02);p.bezierCurveTo(cx+hw*.97,cy+hh*.38,cx+hw*jaw,cy+hh*.76,cx,cy+hh);p.bezierCurveTo(cx-hw*jaw,cy+hh*.76,cx-hw*.97,cy+hh*.38,cx-hw,cy-hh*.02);p.bezierCurveTo(cx-hw*1.03,cy-hh*.35,cx-hw*.95,cy-hh,cx,cy-hh);p.closePath();return p}
let _grain=null;function grainPat(x){if(!_grain){const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d'),d=g.createImageData(96,96);for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}g.putImageData(d,0,0);_grain=c}return x.createPattern(_grain,'repeat')}
function strands(x,clip,col,n,y0,y1,x0,x1,len,seed){const R=rng(seed);x.save();x.clip(clip);x.lineCap='round';for(let i=0;i<n;i++){const px=x0+R()*(x1-x0),py=y0+R()*(y1-y0),l=len*(.5+R());x.strokeStyle=R()<.5?shade(col,.28):shade(col,-.35);x.globalAlpha=.25+R()*.35;x.lineWidth=.6+R()*1.1;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+(R()-.5)*6,py+l*.5,px+(R()-.5)*8,py+l);x.stroke()}x.restore()}
function hairBack(x,L,R,cx,cy,hw,hh){const c=L.hairColor,st=L.hair;if(R.dragon)return;const p=new Path2D();
 if(st==='longo'||st==='trancas'){p.moveTo(cx-hw*1.15,cy-hh*.4);p.bezierCurveTo(cx-hw*1.4,cy+hh*.6,cx-hw*1.5,cy+hh*1.5,cx-hw*1.25,cy+hh*2.1);p.lineTo(cx+hw*1.25,cy+hh*2.1);p.bezierCurveTo(cx+hw*1.5,cy+hh*1.5,cx+hw*1.4,cy+hh*.6,cx+hw*1.15,cy-hh*.4);p.closePath()}
 else if(st==='medio'||st==='cacheado'||st==='selvagem'){const k=st==='selvagem'?1.35:st==='cacheado'?1.3:1.18;p.ellipse(cx,cy-hh*.15,hw*k,hh*(st==='medio'?1.05:1.12),0,0,Math.PI*2)}
 else if(st==='rabo'){p.ellipse(cx+hw*.9,cy+hh*.5,hw*.32,hh*.9,-.25,0,Math.PI*2)}
 else return;
 const g=x.createLinearGradient(cx-hw,cy-hh,cx+hw,cy+hh*2);g.addColorStop(0,shade(c,.12));g.addColorStop(1,shade(c,-.45));x.fillStyle=g;x.fill(p);strands(x,p,c,140,cy-hh,cy+hh*2.1,cx-hw*1.5,cx+hw*1.5,26,7)}
function hairFront(x,L,R,cx,cy,hw,hh){const c=L.hairColor,st=L.hair;if(R.dragon||st==='careca')return;const top=cy-hh,p=new Path2D();
 const cap=(lo,fr)=>{p.moveTo(cx-hw*1.04,cy-hh*lo);p.bezierCurveTo(cx-hw*1.12,top-hh*.25,cx+hw*1.12,top-hh*.25,cx+hw*1.04,cy-hh*lo);fr()};
 if(st==='raspado'){x.save();x.clip(facePath(cx,cy,hw,hh,R.jaw));x.fillStyle=rgba(c,.38);x.beginPath();x.ellipse(cx,top+hh*.18,hw*1.1,hh*.5,0,Math.PI,0);x.fill();x.restore();return}
 if(st==='moicano'){x.save();x.clip(facePath(cx,cy,hw,hh,R.jaw));x.fillStyle=rgba(c,.3);x.beginPath();x.ellipse(cx,top+hh*.18,hw*1.1,hh*.5,0,Math.PI,0);x.fill();x.restore();p.moveTo(cx-hw*.22,cy-hh*.55);for(let i=0;i<=6;i++){const t=i/6,px=cx-hw*.22+t*hw*.44;p.lineTo(px+(i%2?0:0),top-hh*(.25+.2*Math.sin(t*Math.PI))-(i%2?hh*.12:0))}p.lineTo(cx+hw*.22,cy-hh*.55);p.closePath()}
 else if(st==='curto'){cap(.42,()=>{for(let i=0;i<=8;i++){const t=i/8;p.lineTo(cx+hw*1.04-t*hw*2.08,cy-hh*(.42+((i%2)?.06:-.02))-Math.sin(t*Math.PI)*hh*.12)}});p.closePath()}
 else if(st==='medio'||st==='longo'||st==='trancas'){cap(-.1,()=>{p.lineTo(cx+hw*.86,cy-hh*.2);p.quadraticCurveTo(cx+hw*.55,cy-hh*.72,cx+hw*.05,cy-hh*.62);p.lineTo(cx-hw*.05,cy-hh*.62);p.quadraticCurveTo(cx-hw*.6,cy-hh*.7,cx-hw*.88,cy-hh*.2)});p.closePath()}
 else if(st==='rabo'||st==='coque'){cap(.3,()=>{p.quadraticCurveTo(cx,cy-hh*.62,cx-hw*1.04,cy-hh*.3)});p.closePath();if(st==='coque')p.ellipse(cx,top-hh*.18,hw*.42,hh*.28,0,0,Math.PI*2)}
 else if(st==='selvagem'||st==='cacheado'){const n=st==='cacheado'?13:11;for(let i=0;i<n;i++){const a=Math.PI*(1.02+i/(n-1)*.96),r=st==='cacheado'?hw*.32:hw*.38,px=cx+Math.cos(a)*hw*1.02,py=cy-hh*.25+Math.sin(a)*hh*.88;p.moveTo(px+r,py);p.arc(px,py,r,0,Math.PI*2)}p.ellipse(cx,top+hh*.25,hw*.95,hh*.42,0,0,Math.PI*2)}
 const g=x.createLinearGradient(cx-hw*.6,top-hh*.3,cx+hw,cy);g.addColorStop(0,shade(c,.18));g.addColorStop(1,shade(c,-.4));x.fillStyle=g;x.fill(p);strands(x,p,c,110,top-hh*.4,cy,cx-hw*1.3,cx+hw*1.3,18,11);
 x.save();x.clip(facePath(cx,cy,hw,hh,R.jaw));x.filter='blur(3px)';x.globalAlpha=.35;x.fillStyle='#120a05';x.translate(0,3);x.fill(p);x.restore();x.fillStyle=g;x.fill(p);strands(x,p,c,60,top-hh*.4,cy,cx-hw*1.3,cx+hw*1.3,14,13);
 if(st==='trancas'){[-1,1].forEach(sd=>{for(let k=0;k<7;k++){const bx=cx+sd*hw*.95,by=cy+hh*.15+k*hh*.22;x.fillStyle=k%2?shade(c,-.15):shade(c,.08);x.beginPath();x.ellipse(bx,by,hw*.16,hh*.13,0,0,Math.PI*2);x.fill()}x.fillStyle=L.accent;x.fillRect(cx+sd*hw*.95-hw*.14,cy+hh*1.62,hw*.28,hh*.08)})}
}
function drawHorns(x,L,R,cx,cy,hw,hh){const t=L.horns;if(!t||t==='nenhum')return;const col=L.hornColor||'#2a2420';
 const horn=(sd)=>{const p=new Path2D(),bx=cx+sd*hw*.55,by=cy-hh*.78;
  if(t==='carneiro'){p.moveTo(bx-sd*6,by+4);p.bezierCurveTo(bx+sd*hw*.9,by-hh*.55,bx+sd*hw*1.35,by+hh*.15,bx+sd*hw*.82,by+hh*.42);p.bezierCurveTo(bx+sd*hw*1.05,by+hh*.05,bx+sd*hw*.7,by-hh*.25,bx+sd*8,by+8);}
  else if(t==='retos'){p.moveTo(bx-sd*7,by+6);p.lineTo(bx+sd*hw*.18,by-hh*.85);p.lineTo(bx+sd*9,by+6)}
  else if(t==='curvos'){p.moveTo(bx-sd*7,by+6);p.quadraticCurveTo(bx+sd*hw*.2,by-hh*.7,bx+sd*hw*.75,by-hh*.95);p.quadraticCurveTo(bx+sd*hw*.3,by-hh*.55,bx+sd*9,by+6)}
  else{const ox=cx+sd*hw*.7,oy=cy-hh*.55;p.moveTo(ox-sd*6,oy);p.quadraticCurveTo(ox+sd*hw*.5,oy-hh*.4,ox+sd*hw*.95,oy-hh*.85);p.quadraticCurveTo(ox+sd*hw*.45,oy-hh*.2,ox+sd*8,oy+8)}
  p.closePath();const g=x.createLinearGradient(bx,by-hh,bx+sd*hw,by+hh*.4);g.addColorStop(0,shade(col,.35));g.addColorStop(1,shade(col,-.4));x.fillStyle=g;x.fill(p);
  x.save();x.clip(p);x.strokeStyle=rgba('#000000',.35);x.lineWidth=1;for(let i=0;i<9;i++){x.beginPath();x.arc(bx+sd*hw*.35,by-hh*.05,8+i*5,0,Math.PI*2);x.stroke()}x.restore();x.strokeStyle=rgba('#000',.5);x.lineWidth=1;x.stroke(p)};
 horn(-1);horn(1)}
function drawEars(x,L,R,cx,cy,hw,hh,skin){const t=R.ears;if(!t||R.dragon)return;[-1,1].forEach(sd=>{const ex=cx+sd*hw*.98,ey=cy-hh*.02,p=new Path2D();
 if(t==='elf'||t==='halfelf'||t==='gnome'||t==='orc'){const len=t==='elf'?hw*.95:t==='gnome'?hw*.55:t==='orc'?hw*.5:hw*.5,up=t==='orc'?.15:.55;p.moveTo(ex,ey-hh*.18);p.quadraticCurveTo(ex+sd*len*.6,ey-hh*.3,ex+sd*len,ey-hh*up);p.quadraticCurveTo(ex+sd*len*.55,ey+hh*.02,ex+sd*hw*.08,ey+hh*.22);p.closePath()}
 else{const s=t==='small'?.85:1;p.ellipse(ex+sd*hw*.07,ey+hh*.02,hw*.14*s,hh*.2*s,sd*.15,0,Math.PI*2)}
 x.fillStyle=shade(skin,-.08);x.fill(p);x.strokeStyle=rgba(shade(skin,-.5),.6);x.lineWidth=1;x.stroke(p);x.fillStyle=rgba(shade(skin,-.45),.35);x.beginPath();x.ellipse(ex+sd*hw*.08,ey,hw*.05,hh*.09,0,0,Math.PI*2);x.fill()})}
function drawEye(x,ex,ey,w,L,R,sd,skin){const shp=L.eyes,h=w*({amendoado:.42,redondo:.58,estreito:.28,cansado:.38}[shp]||.42),tilt=(R.tilt?-.22:0)*w,droop=shp==='cansado'?w*.18:0;
 x.save();x.filter='blur(2px)';x.fillStyle=rgba(shade(skin,-.6),.22);x.beginPath();x.ellipse(ex,ey-h*.2,w*1.15,h*1.45,0,0,Math.PI*2);x.fill();x.restore();
 const p=new Path2D();p.moveTo(ex-sd*w,ey);p.quadraticCurveTo(ex,ey-h*2.1,ex+sd*w,ey+tilt*sd*sd+droop);p.quadraticCurveTo(ex,ey+h*1.5,ex-sd*w,ey);p.closePath();
 x.save();x.clip(p);const col=L.eyeColor||'#4a3020';
 if(R.solidEyes){const g=x.createRadialGradient(ex,ey,1,ex,ey,w);g.addColorStop(0,shade(col,.4));g.addColorStop(1,shade(col,-.3));x.fillStyle=g;x.fillRect(ex-w*1.2,ey-h*3,w*2.4,h*6)}
 else{x.fillStyle='#d6cdbf';x.fillRect(ex-w*1.2,ey-h*3,w*2.4,h*6);const ir=h*1.18,ix=ex+sd*w*.05,iy=ey+h*.15,g=x.createRadialGradient(ix,iy,1,ix,iy,ir);g.addColorStop(0,shade(col,.45));g.addColorStop(.7,col);g.addColorStop(1,shade(col,-.5));x.fillStyle=g;x.beginPath();x.arc(ix,iy,ir,0,Math.PI*2);x.fill();x.fillStyle='#0b0908';x.beginPath();if(R.dragon)x.ellipse(ix,iy,ir*.18,ir*.8,0,0,Math.PI*2);else x.arc(ix,iy,ir*.42,0,Math.PI*2);x.fill()}
 x.fillStyle='rgba(255,255,255,.75)';x.beginPath();x.arc(ex-w*.15,ey-h*.35,Math.max(.8,h*.28),0,Math.PI*2);x.fill();
 x.fillStyle=rgba(shade(skin,-.6),.55);x.fillRect(ex-w*1.2,ey-h*2.2,w*2.4,h*.9);x.restore();
 if(R.glow||R.solidEyes&&false){x.save();x.shadowColor=col;x.shadowBlur=10;x.fillStyle=rgba(col,.35);x.fill(p);x.restore()}
 x.strokeStyle='#160f0b';x.lineWidth=L.body==='f'?2.2:1.7;x.lineCap='round';x.beginPath();x.moveTo(ex-sd*w,ey);x.quadraticCurveTo(ex,ey-h*2.1,ex+sd*w,ey+tilt*sd*sd+droop);x.stroke();
 if(L.body==='f'){x.beginPath();x.moveTo(ex+sd*w,ey+tilt*sd*sd+droop);x.lineTo(ex+sd*w*1.22,ey-h*.6+tilt);x.stroke()}
 x.strokeStyle=rgba('#2a1a12',.35);x.lineWidth=1;x.beginPath();x.moveTo(ex-sd*w*.8,ey+h*.7);x.quadraticCurveTo(ex,ey+h*1.4,ex+sd*w*.85,ey+h*.5);x.stroke();
 if(L.age==='veterano'){x.strokeStyle=rgba(shade(skin,-.5),.5);x.lineWidth=.8;for(let i=0;i<3;i++){x.beginPath();x.moveTo(ex+sd*w*1.05,ey-h*.2+i*h*.5);x.lineTo(ex+sd*w*1.45,ey-h*.6+i*h*.7);x.stroke()}}}
function drawBrow(x,bx,by,w,L,sd){const t=L.brows,c=shade(L.hairColor||'#3b2a1e',-.2),lw={grossa:5.6,fina:2,normal:3.6,arqueada:3.2,raiva:4.4}[t]||3.6;x.strokeStyle=c;x.lineCap='round';x.lineWidth=lw*(L.body==='f'?.75:1);x.beginPath();
 if(t==='arqueada'){x.moveTo(bx-sd*w,by+2);x.quadraticCurveTo(bx,by-w*.55,bx+sd*w*1.1,by+1)}else if(t==='raiva'){x.moveTo(bx-sd*w*1.05,by+w*.32);x.quadraticCurveTo(bx,by-w*.05,bx+sd*w*1.1,by-w*.2)}else{x.moveTo(bx-sd*w,by+1);x.quadraticCurveTo(bx,by-w*.3,bx+sd*w*1.1,by+2)}x.stroke()}
function drawMouth(x,cx,my,w,L,skin){const lip=shade(skin,-.32),t=L.mouth;x.lineCap='round';
 if(t==='aberta'){x.fillStyle='#1a0c0a';x.beginPath();x.ellipse(cx,my+3,w*.55,w*.42,0,0,Math.PI*2);x.fill();x.fillStyle='#d8cfbf';x.fillRect(cx-w*.42,my-2,w*.84,w*.16);x.strokeStyle=lip;x.lineWidth=2.4;x.beginPath();x.ellipse(cx,my+3,w*.55,w*.42,0,0,Math.PI*2);x.stroke();return}
 const curve={neutra:1,sorriso:-5,serio:3,sarcastico:0}[t]??1;
 if(L.body==='f'){x.fillStyle=lip;x.beginPath();x.moveTo(cx-w*.55,my);x.quadraticCurveTo(cx,my+w*.42-curve*.3,cx+w*.55,my);x.quadraticCurveTo(cx,my-w*.12,cx-w*.55,my);x.fill();x.fillStyle=shade(lip,.08);x.beginPath();x.moveTo(cx-w*.5,my);x.quadraticCurveTo(cx-w*.2,my-w*.28,cx,my-w*.14);x.quadraticCurveTo(cx+w*.2,my-w*.28,cx+w*.5,my);x.fill()}
 else{x.fillStyle=rgba(lip,.55);x.beginPath();x.ellipse(cx,my+w*.16,w*.36,w*.12,0,0,Math.PI*2);x.fill()}
 x.strokeStyle='#2a140f';x.lineWidth=1.8;x.beginPath();if(t==='sarcastico'){x.moveTo(cx-w*.55,my+1);x.quadraticCurveTo(cx,my+2,cx+w*.6,my-w*.18)}else{x.moveTo(cx-w*.55,my+curve*.4);x.quadraticCurveTo(cx,my+curve,cx+w*.55,my+curve*.4)}x.stroke()}
function drawBeard(x,L,cx,cy,hw,hh,jaw){const t=L.beard;if(!t||t==='nenhuma')return;const c=L.hairColor,my=cy+hh*.52;
 if(t==='rala'){x.save();x.clip(facePath(cx,cy,hw,hh,jaw));const R_=rng(5);x.fillStyle=rgba(shade(c,-.2),.5);for(let i=0;i<420;i++){const a=R_()*Math.PI,r=R_(),px=cx+Math.cos(a)*hw*(.5+r*.5)*(R_()<.5?-1:1),py=cy+hh*(.25+R_()*.8);x.fillRect(px,py,.9,.9)}x.restore();return}
 const p=new Path2D();
 if(t==='bigode'||t==='cavanhaque'){p.moveTo(cx,my-hh*.1);p.quadraticCurveTo(cx+hw*.35,my-hh*.16,cx+hw*.42,my+hh*.04);p.quadraticCurveTo(cx+hw*.2,my-hh*.03,cx,my-hh*.04);p.quadraticCurveTo(cx-hw*.2,my-hh*.03,cx-hw*.42,my+hh*.04);p.quadraticCurveTo(cx-hw*.35,my-hh*.16,cx,my-hh*.1);if(t==='cavanhaque'){p.moveTo(cx-hw*.2,my+hh*.12);p.quadraticCurveTo(cx,my+hh*.1,cx+hw*.2,my+hh*.12);p.quadraticCurveTo(cx+hw*.14,cy+hh*1.2,cx,cy+hh*1.25);p.quadraticCurveTo(cx-hw*.14,cy+hh*1.2,cx-hw*.2,my+hh*.12)}}
 else{const long=t==='trancada'?1.9:1.3;p.moveTo(cx-hw*.96,cy+hh*.05);p.quadraticCurveTo(cx-hw*.95,cy+hh*.8,cx-hw*.5,cy+hh*long*.9);p.quadraticCurveTo(cx,cy+hh*long*1.05,cx+hw*.5,cy+hh*long*.9);p.quadraticCurveTo(cx+hw*.95,cy+hh*.8,cx+hw*.96,cy+hh*.05);p.lineTo(cx+hw*.82,cy+hh*.08);p.quadraticCurveTo(cx+hw*.6,my-hh*.2,cx,my-hh*.12);p.quadraticCurveTo(cx-hw*.6,my-hh*.2,cx-hw*.82,cy+hh*.08);p.closePath()}
 const g=x.createLinearGradient(cx,my-hh*.2,cx,cy+hh*2);g.addColorStop(0,shade(c,.1));g.addColorStop(1,shade(c,-.45));x.fillStyle=g;x.fill(p);strands(x,p,c,160,my-hh*.25,cy+hh*2,cx-hw,cx+hw,16,23);
 if(t==='cheia'||t==='trancada'){x.fillStyle='#1a0c0a';x.beginPath();x.ellipse(cx,my+2,hw*.22,hh*.05,0,0,Math.PI*2);x.fill()}
 if(t==='trancada'){x.fillStyle=L.accent||'#b08a3a';[1.45,1.7].forEach(k=>{x.fillRect(cx-hw*.13,cy+hh*k,hw*.26,hh*.07)})}}
function drawMarks(x,L,R,cx,cy,hw,hh,jaw,skin){x.save();x.clip(facePath(cx,cy,hw,hh,jaw));
 if(R.stone){x.strokeStyle=rgba(shade(skin,-.55),.7);x.lineWidth=2;x.beginPath();x.moveTo(cx-hw*.9,cy-hh*.5);x.lineTo(cx-hw*.45,cy-hh*.3);x.lineTo(cx-hw*.6,cy+hh*.1);x.moveTo(cx+hw*.9,cy-hh*.2);x.lineTo(cx+hw*.5,cy);x.lineTo(cx+hw*.75,cy+hh*.4);x.moveTo(cx-hw*.15,cy-hh*.95);x.lineTo(cx,cy-hh*.6);x.lineTo(cx+hw*.18,cy-hh*.9);x.stroke();x.fillStyle=rgba(shade(skin,.3),.25);for(let i=0;i<6;i++){x.beginPath();x.arc(cx+(i-2.5)*hw*.3,cy-hh*.75+(i%2)*hh*.1,2,0,7);x.fill()}}
 const m=L.marks;
 if(m==='cicatriz'){x.strokeStyle=rgba('#e8a8a0',.8);x.lineWidth=3;x.beginPath();x.moveTo(cx+hw*.2,cy-hh*.55);x.lineTo(cx+hw*.65,cy+hh*.25);x.stroke();x.strokeStyle=rgba('#5a1a14',.5);x.lineWidth=1;x.stroke()}
 else if(m==='pintura'){x.fillStyle=rgba(L.accent||'#8a1e1e',.7);x.beginPath();x.moveTo(cx-hw*1.1,cy-hh*.2);x.lineTo(cx+hw*1.1,cy-hh*.26);x.lineTo(cx+hw*1.1,cy+hh*.0);x.lineTo(cx-hw*1.1,cy+hh*.06);x.fill();x.fillRect(cx-hw*.06,cy-hh*.95,hw*.12,hh*.7)}
 else if(m==='tatuagem'){x.strokeStyle=rgba('#1e2a4a',.55);x.lineWidth=2;x.beginPath();for(let i=0;i<3;i++){x.moveTo(cx-hw*.85,cy+hh*(.05+i*.15));x.quadraticCurveTo(cx-hw*.55,cy+hh*(-.05+i*.15),cx-hw*.4,cy+hh*(.15+i*.15))}x.stroke()}
 else if(m==='sardas'){const r=rng(9);x.fillStyle=rgba(shade(skin,-.4),.55);for(let i=0;i<60;i++){const sd=r()<.5?-1:1;x.beginPath();x.arc(cx+sd*hw*(.15+r()*.6),cy+hh*(-.05+r()*.3),.6+r()*.9,0,7);x.fill()}}
 x.restore()}
function drawOutfit(x,L,cx,cy,hw,hh,phase){const o=L.outfit,col=L.outfitColor,ac=L.accent,ny=cy+hh*.86,by=240;
 const body=new Path2D();body.moveTo(cx-hw*.42,ny);body.quadraticCurveTo(cx-hw*.5,ny+16,cx-92,ny+30);body.lineTo(cx-104,by);body.lineTo(cx+104,by);body.lineTo(cx+92,ny+30);body.quadraticCurveTo(cx+hw*.5,ny+16,cx+hw*.42,ny);body.closePath();
 if(phase==='back'){if(o==='capuz'){const g=x.createRadialGradient(cx,cy-hh*.2,hw*.4,cx,cy,hw*1.9);g.addColorStop(0,shade(col,-.55));g.addColorStop(1,shade(col,-.2));x.fillStyle=g;x.beginPath();x.ellipse(cx,cy-hh*.05,hw*1.5,hh*1.45,0,0,Math.PI*2);x.fill()}return}
 const base=o==='placas'?'#7c8189':col,g=x.createLinearGradient(cx-100,ny,cx+100,by);g.addColorStop(0,shade(base,.12));g.addColorStop(.6,base);g.addColorStop(1,shade(base,-.5));x.fillStyle=g;x.fill(body);
 x.save();x.clip(body);
 if(o==='placas'){x.fillStyle=rgba(col,.35);x.fill(body);[-1,1].forEach(sd=>{const px=cx+sd*80,py=ny+38,pg=x.createRadialGradient(px-sd*8,py-10,3,px,py,40);pg.addColorStop(0,'#c9ccd2');pg.addColorStop(.5,shade(base,0));pg.addColorStop(1,'#2a2c30');x.fillStyle=pg;x.beginPath();x.ellipse(px,py,42,30,sd*.25,0,Math.PI*2);x.fill();x.strokeStyle='#1a1b1e';x.lineWidth=1.5;x.stroke();x.fillStyle=ac;[0,1,2].forEach(i=>{x.beginPath();x.arc(px-sd*20+sd*i*16,py-18+i*4,2,0,7);x.fill()})});for(let i=0;i<3;i++){x.strokeStyle=i?rgba('#1a1b1e',.8):ac;x.lineWidth=i?2:3;x.beginPath();x.ellipse(cx,ny+2+i*9,hw*.7+i*10,12+i*4,0,0,Math.PI);x.stroke()}}
 else if(o==='couro'){x.fillStyle=shade(col,-.3);x.beginPath();x.moveTo(cx-hw*.42,ny);x.lineTo(cx,ny+40);x.lineTo(cx+hw*.42,ny);x.fill();x.setLineDash([3,3]);x.strokeStyle=rgba(ac,.8);x.lineWidth=1.2;x.beginPath();x.moveTo(cx-hw*.5,ny+4);x.lineTo(cx-6,ny+46);x.moveTo(cx+hw*.5,ny+4);x.lineTo(cx+6,ny+46);x.stroke();x.setLineDash([]);x.strokeStyle=shade(col,-.55);x.lineWidth=7;x.beginPath();x.moveTo(cx-90,ny+34);x.lineTo(cx+60,by);x.stroke();x.fillStyle=ac;x.fillRect(cx-18,ny+64,14,10)}
 else if(o==='manto'){x.strokeStyle=ac;x.lineWidth=4;x.beginPath();x.moveTo(cx-hw*.55,ny-4);x.quadraticCurveTo(cx-hw*.3,ny+30,cx,ny+52);x.quadraticCurveTo(cx+hw*.3,ny+30,cx+hw*.55,ny-4);x.stroke();x.strokeStyle=rgba('#000',.35);x.lineWidth=1.5;for(let i=0;i<6;i++){x.beginPath();x.moveTo(cx-80+i*32,ny+40);x.quadraticCurveTo(cx-74+i*32,ny+80,cx-84+i*32,by);x.stroke()}const gg=x.createRadialGradient(cx,ny+58,1,cx,ny+58,9);gg.addColorStop(0,'#fff');gg.addColorStop(.4,ac);gg.addColorStop(1,shade(ac,-.5));x.fillStyle=gg;x.beginPath();x.arc(cx,ny+58,7,0,7);x.fill()}
 else if(o==='capuz'){x.fillStyle=shade(col,-.25);x.beginPath();x.moveTo(cx-hw*.42,ny);x.quadraticCurveTo(cx,ny+30,cx+hw*.42,ny);x.lineTo(cx+70,by);x.lineTo(cx-70,by);x.fill();x.fillStyle=ac;x.beginPath();x.arc(cx,ny+22,6,0,7);x.fill();x.strokeStyle=rgba('#000',.4);x.lineWidth=1.5;for(let i=0;i<5;i++){x.beginPath();x.moveTo(cx-60+i*30,ny+40);x.lineTo(cx-66+i*30,by);x.stroke()}}
 else if(o==='sagradas'){x.fillStyle=ac;x.fillRect(cx-22,ny+6,44,by-ny);x.fillStyle=col;x.fillRect(cx-16,ny+6,32,by-ny);x.strokeStyle=ac;x.lineWidth=3;x.beginPath();x.arc(cx,ny+50,11,0,7);x.stroke();for(let i=0;i<8;i++){const a=i/8*Math.PI*2;x.beginPath();x.moveTo(cx+Math.cos(a)*14,ny+50+Math.sin(a)*14);x.lineTo(cx+Math.cos(a)*19,ny+50+Math.sin(a)*19);x.stroke()}x.strokeStyle='#8a8f96';x.setLineDash([2,2]);x.lineWidth=3;x.beginPath();x.moveTo(cx-90,ny+36);x.quadraticCurveTo(cx-40,ny+28,cx-22,ny+12);x.moveTo(cx+90,ny+36);x.quadraticCurveTo(cx+40,ny+28,cx+22,ny+12);x.stroke();x.setLineDash([])}
 else{x.strokeStyle=shade(col,-.5);x.lineWidth=2;x.beginPath();x.moveTo(cx-hw*.3,ny);x.lineTo(cx,ny+26);x.lineTo(cx+hw*.3,ny);x.stroke();x.strokeStyle='#c9b48a';x.lineWidth=1.5;for(let i=0;i<4;i++){x.beginPath();x.moveTo(cx-8,ny+6+i*6);x.lineTo(cx+8,ny+9+i*6);x.stroke()}x.fillStyle=shade(col,.15);x.fillRect(cx+40,ny+60,22,18);x.strokeStyle=rgba('#000',.4);x.setLineDash([2,2]);x.strokeRect(cx+40,ny+60,22,18);x.setLineDash([])}
 x.fillStyle=rgba('#ffe0b0',.08);x.fillRect(cx-104,ny,90,by-ny);x.restore();x.strokeStyle=rgba('#000',.6);x.lineWidth=1.5;x.stroke(body)}
function drawDragonHead(x,L,cx,cy,hw,hh){const s=L.skin,p=new Path2D();
 p.moveTo(cx,cy-hh*1.02);p.bezierCurveTo(cx+hw*1.05,cy-hh,cx+hw*1.15,cy-hh*.2,cx+hw*.9,cy+hh*.2);p.bezierCurveTo(cx+hw*.7,cy+hh*.55,cx+hw*.55,cy+hh*.95,cx+hw*.35,cy+hh*1.12);p.lineTo(cx-hw*.35,cy+hh*1.12);p.bezierCurveTo(cx-hw*.55,cy+hh*.95,cx-hw*.7,cy+hh*.55,cx-hw*.9,cy+hh*.2);p.bezierCurveTo(cx-hw*1.15,cy-hh*.2,cx-hw*1.05,cy-hh,cx,cy-hh*1.02);p.closePath();
 [-1,1].forEach(sd=>{x.fillStyle=shade(s,-.35);x.beginPath();x.moveTo(cx+sd*hw*.85,cy-hh*.1);x.lineTo(cx+sd*hw*1.45,cy+hh*.05);x.lineTo(cx+sd*hw*1.1,cy+hh*.25);x.lineTo(cx+sd*hw*1.35,cy+hh*.45);x.lineTo(cx+sd*hw*.8,cy+hh*.45);x.fill()});
 const g=x.createRadialGradient(cx-hw*.3,cy-hh*.4,4,cx,cy,hh*1.5);g.addColorStop(0,shade(s,.25));g.addColorStop(.6,s);g.addColorStop(1,shade(s,-.55));x.fillStyle=g;x.fill(p);
 x.save();x.clip(p);x.strokeStyle=rgba(shade(s,-.6),.45);x.lineWidth=1;for(let j=0;j<16;j++)for(let i=0;i<12;i++){const sx=cx-hw*1.1+i*hw*.2+(j%2)*hw*.1,sy=cy-hh+j*hh*.14;x.beginPath();x.arc(sx,sy,hw*.11,.15*Math.PI,.85*Math.PI);x.stroke()}
 x.fillStyle=rgba(shade(s,.35),.5);x.beginPath();x.ellipse(cx,cy+hh*.75,hw*.42,hh*.32,0,0,Math.PI*2);x.fill();x.restore();
 x.strokeStyle='#120c0a';x.lineWidth=2.4;x.beginPath();x.moveTo(cx-hw*.5,cy+hh*.82);x.quadraticCurveTo(cx,cy+hh*(L.mouth==='sorriso'?.98:.9),cx+hw*.5,cy+hh*.82);x.stroke();
 if(L.mouth==='aberta'){x.fillStyle='#1a0808';x.beginPath();x.ellipse(cx,cy+hh*.92,hw*.42,hh*.13,0,0,Math.PI*2);x.fill();x.fillStyle='#e8e0d0';for(let i=-3;i<=3;i++){x.beginPath();x.moveTo(cx+i*hw*.11-3,cy+hh*.82);x.lineTo(cx+i*hw*.11,cy+hh*.9);x.lineTo(cx+i*hw*.11+3,cy+hh*.82);x.fill()}}
 x.fillStyle='#120c0a';[-1,1].forEach(sd=>{x.beginPath();x.ellipse(cx+sd*hw*.18,cy+hh*.62,hw*.06,hh*.035,sd*.5,0,7);x.fill()});
 x.strokeStyle=shade(s,-.5);x.lineWidth=3;[-1,1].forEach(sd=>{x.beginPath();x.moveTo(cx+sd*hw*.15,cy-hh*.28);x.lineTo(cx+sd*hw*.72,cy-hh*.38);x.stroke()});x.strokeStyle=rgba('#000',.6);x.lineWidth=1.5;x.stroke(p);return p}
function drawPortrait(x,L,W,H){
 const R=raceOf(L),cx=100,cy=100,hw=R.hw*(L.body==='f'&&!R.dragon?.94:1),hh=R.hh,jaw=R.jaw*(L.body==='f'?.9:1),skin=L.skin||R.skins[0],P=L.parts||{};
 x.save();x.scale(W/200,H/240);
 if(L.img&&L.img.src){x.fillStyle='#0b0907';x.fillRect(0,0,200,240);const im=pimg(L.img.src);if(im){const b=Math.max(200/im.naturalWidth,240/im.naturalHeight)*(L.img.s||1),w=im.naturalWidth*b,h=im.naturalHeight*b;x.drawImage(im,100-w/2+(L.img.x||0),120-h/2+(L.img.y||0),w,h)}else{x.fillStyle='#8a7a6a';x.font='12px Inter,sans-serif';x.textAlign='center';x.fillText('carregando…',100,124)}if(L.img.finish!==false)postFx(x);x.restore();return}
 const bg=x.createRadialGradient(cx-30,70,10,cx,120,170);bg.addColorStop(0,shade(L.bg||'#2a1c12',.25));bg.addColorStop(.55,L.bg||'#2a1c12');bg.addColorStop(1,'#050403');x.fillStyle=bg;x.fillRect(0,0,200,240);
 const sm=rng(hash2(3,(L.bg||'').length));for(let i=0;i<7;i++){const g=x.createRadialGradient(sm()*200,sm()*240,2,sm()*200,sm()*240,40+sm()*50);g.addColorStop(0,'rgba(255,220,180,.05)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,200,240)}
 if(R.glow){const g=x.createRadialGradient(cx,cy-10,20,cx,cy-10,110);g.addColorStop(0,'rgba(255,230,160,.45)');g.addColorStop(1,'rgba(255,230,160,0)');x.fillStyle=g;x.fillRect(0,0,200,240)}
 Object.entries(P).forEach(([cat,pt])=>{if(pt&&pt.layer==='back')drawPart(x,pt,partColor(L,cat))});
 if(!P.outfit)drawOutfit(x,L,cx,cy,hw,hh,'back');if(!P.hair)hairBack(x,L,R,cx,cy,hw,hh);
 const ng=x.createLinearGradient(0,cy+hh*.5,0,cy+hh*1.3);ng.addColorStop(0,shade(skin,-.45));ng.addColorStop(1,shade(skin,-.15));x.fillStyle=ng;x.fillRect(cx-hw*.4,cy+hh*.5,hw*.8,hh*.6);
 if(P.outfit){if(P.outfit.layer!=='back')drawPart(x,P.outfit,L.outfitColor)}else drawOutfit(x,L,cx,cy,hw,hh,'front');
 drawEars(x,L,R,cx,cy,hw,hh,skin);
 let face;
 if(R.dragon){face=drawDragonHead(x,L,cx,cy,hw,hh);drawEye(x,cx-hw*.5,cy-hh*.22,hw*.22,L,R,1,skin);drawEye(x,cx+hw*.5,cy-hh*.22,hw*.22,L,R,-1,skin)}
 else{face=facePath(cx,cy,hw,hh,jaw);x.fillStyle=skin;x.fill(face);
  x.save();x.clip(face);let g=x.createRadialGradient(cx-hw*.4,cy-hh*.45,4,cx,cy,hh*1.45);g.addColorStop(0,'rgba(255,236,210,.28)');g.addColorStop(.45,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(10,4,0,.62)');x.fillStyle=g;x.fillRect(0,0,200,240);
  g=x.createLinearGradient(cx+hw*.2,0,cx+hw,0);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(10,4,0,.35)');x.fillStyle=g;x.fillRect(0,0,200,240);
  x.fillStyle='rgba(255,225,195,.12)';[-1,1].forEach(sd=>{x.beginPath();x.ellipse(cx+sd*hw*.5,cy+hh*.1,hw*.22,hh*.1,0,0,Math.PI*2);x.fill()});
  x.fillStyle=rgba('#a03a2a',.08);[-1,1].forEach(sd=>{x.beginPath();x.ellipse(cx+sd*hw*.48,cy+hh*.28,hw*.2,hh*.1,0,0,Math.PI*2);x.fill()});
  x.filter='blur(3px)';x.strokeStyle='rgba(20,8,2,.45)';x.lineWidth=7;x.stroke(face);x.filter='none';
  x.fillStyle='rgba(255,235,210,.14)';x.beginPath();x.ellipse(cx-hw*.04,cy+hh*.05,hw*.07,hh*.24,0,0,Math.PI*2);x.fill();
  x.fillStyle='rgba(20,8,2,.18)';x.beginPath();x.ellipse(cx+hw*.1,cy+hh*.08,hw*.06,hh*.22,0,0,Math.PI*2);x.fill();
  if(L.age==='veterano'){x.strokeStyle=rgba(shade(skin,-.5),.45);x.lineWidth=.9;for(let i=0;i<3;i++){x.beginPath();x.moveTo(cx-hw*.5,cy-hh*(.62-i*.08));x.quadraticCurveTo(cx,cy-hh*(.68-i*.08),cx+hw*.5,cy-hh*(.62-i*.08));x.stroke()}x.beginPath();x.moveTo(cx-hw*.28,cy+hh*.3);x.quadraticCurveTo(cx-hw*.4,cy+hh*.5,cx-hw*.32,cy+hh*.62);x.moveTo(cx+hw*.28,cy+hh*.3);x.quadraticCurveTo(cx+hw*.4,cy+hh*.5,cx+hw*.32,cy+hh*.62);x.stroke()}
  x.restore();
  drawMarks(x,L,R,cx,cy,hw,hh,jaw,skin);
  const ew=hw*.27,ey=cy-hh*.1;drawEye(x,cx-hw*.42,ey,ew,L,R,1,skin);drawEye(x,cx+hw*.42,ey,ew,L,R,-1,skin);
  drawBrow(x,cx-hw*.42,cy-hh*.34,ew,L,1);drawBrow(x,cx+hw*.42,cy-hh*.34,ew,L,-1);
  x.strokeStyle=rgba(shade(skin,-.6),.75);x.lineWidth=1.8;x.lineCap='round';x.beginPath();x.moveTo(cx-hw*.06,cy-hh*.06);x.quadraticCurveTo(cx-hw*.13,cy+hh*.18,cx-hw*.1,cy+hh*.28);x.stroke();
  x.fillStyle=rgba(shade(skin,-.5),.45);x.beginPath();x.ellipse(cx,cy+hh*.31,hw*.16,hh*.05,0,0,Math.PI*2);x.fill();x.fillStyle=rgba('#fff',.12);x.beginPath();x.ellipse(cx+hw*.02,cy+hh*.22,hw*.06,hh*.04,0,0,7);x.fill();
  drawMouth(x,cx,cy+hh*.53,hw*.42,L,skin);
  if(R.tusks){x.fillStyle='#e8dcc0';x.strokeStyle='#5a4a30';x.lineWidth=.8;const tl=R.tusks===2?hh*.22:hh*.13;[-1,1].forEach(sd=>{const tx=cx+sd*hw*.26,ty=cy+hh*.6;x.beginPath();x.moveTo(tx-3,ty);x.quadraticCurveTo(tx+sd*2,ty-tl*.6,tx+sd*3,ty-tl);x.quadraticCurveTo(tx+sd*4,ty-tl*.4,tx+4,ty);x.fill();x.stroke()})}
  drawBeard(x,L,cx,cy,hw,hh,jaw);
 }
 if(P.hair){if(P.hair.layer!=='back')drawPart(x,P.hair,L.hairColor)}else hairFront(x,L,R,cx,cy,hw,hh);
 if(P.horns){if(P.horns.layer!=='back')drawPart(x,P.horns,L.hornColor)}else drawHorns(x,L,R,cx,cy,hw,hh);
 if(L.outfit==='capuz'&&!P.outfit){const col=L.outfitColor;x.save();x.fillStyle=shade(col,-.15);const hp=new Path2D();hp.moveTo(cx-hw*1.45,cy+hh*.9);hp.bezierCurveTo(cx-hw*1.55,cy-hh*1.5,cx+hw*1.55,cy-hh*1.5,cx+hw*1.45,cy+hh*.9);hp.lineTo(cx+hw*1.05,cy+hh*.6);hp.bezierCurveTo(cx+hw*1.15,cy-hh*1.08,cx-hw*1.15,cy-hh*1.08,cx-hw*1.05,cy+hh*.6);hp.closePath();x.fill(hp);x.strokeStyle=rgba('#000',.5);x.lineWidth=1.5;x.stroke(hp);x.clip(face);const sg=x.createLinearGradient(0,cy-hh,0,cy-hh*.1);sg.addColorStop(0,'rgba(0,0,0,.65)');sg.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=sg;x.fillRect(0,0,200,240);x.restore()}
 const a=L.acc;
 if(a==='diadema'){x.strokeStyle=L.accent;x.lineWidth=3;x.beginPath();x.ellipse(cx,cy-hh*.55,hw*1.0,hh*.18,0,.05*Math.PI,.95*Math.PI,true);x.stroke();x.fillStyle='#7ad0ff';x.beginPath();x.arc(cx,cy-hh*.73,3.5,0,7);x.fill()}
 else if(a==='faixa'){x.fillStyle=L.accent;x.beginPath();x.moveTo(cx-hw*1.02,cy-hh*.5);x.quadraticCurveTo(cx,cy-hh*.7,cx+hw*1.02,cy-hh*.5);x.lineTo(cx+hw*1.02,cy-hh*.38);x.quadraticCurveTo(cx,cy-hh*.58,cx-hw*1.02,cy-hh*.38);x.fill()}
 else if(a==='tapaolho'){x.strokeStyle='#120c0a';x.lineWidth=1.6;x.beginPath();x.moveTo(cx-hw,cy-hh*.45);x.lineTo(cx+hw,cy+hh*.05);x.stroke();x.fillStyle='#16100c';x.beginPath();x.ellipse(cx+hw*.42,cy-hh*.1,hw*.3,hh*.18,0,0,Math.PI*2);x.fill()}
 else if(a==='brinco'&&!R.dragon){x.strokeStyle=L.accent;x.lineWidth=2;x.beginPath();x.arc(cx-hw*1.02,cy+hh*.25,4,0,7);x.stroke()}
 ['acc','extra'].forEach(cat=>{const pt=P[cat];if(pt&&pt.layer!=='back')drawPart(x,pt,partColor(L,cat))});
 x.save();x.beginPath();x.rect(0,0,cx-8,240);x.clip();x.strokeStyle='rgba(255,196,140,.35)';x.lineWidth=2;x.shadowColor='rgba(255,170,90,.8)';x.shadowBlur=6;x.stroke(face);x.restore();
 x.save();x.globalCompositeOperation='soft-light';x.fillStyle='rgba(150,90,40,.35)';x.fillRect(0,0,200,240);x.globalCompositeOperation='saturation';x.fillStyle='rgba(128,128,128,.18)';x.fillRect(0,0,200,240);x.restore();
 const v=x.createRadialGradient(cx,110,60,cx,120,165);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.72)');x.fillStyle=v;x.fillRect(0,0,200,240);
 x.save();x.globalAlpha=.07;x.globalCompositeOperation='overlay';x.fillStyle=grainPat(x);x.fillRect(0,0,200,240);x.restore();
 x.restore();
}
const PORT={};
function lookKey(L){return JSON.stringify(L)}
function tokenSprite(L,px){const k=Math.min(2,window.devicePixelRatio||1),sz=Math.max(16,Math.round(px*k)),key='t'+sz+lookKey(L);if(PORT[key])return PORT[key];
 const c=document.createElement('canvas');c.width=c.height=sz;const x=c.getContext('2d');x.beginPath();x.arc(sz/2,sz/2,sz/2,0,Math.PI*2);x.clip();x.scale(sz/118,sz/118);x.translate(-41,-36);drawPortrait(x,L,200,240);
 const keys=Object.keys(PORT);if(keys.length>300)keys.slice(0,100).forEach(k2=>delete PORT[k2]);PORT[key]=c;return c}
function lookAvatar(L,px=64){const key='a'+px+lookKey(L);if(PORT[key])return PORT[key];const u=tokenSprite(L,px).toDataURL('image/png');PORT[key]=u;return u}
const avatarHTML=(s,cls='tok')=>s&&s.look?`<img class="${cls} av" src="${lookAvatar(s.look)}" alt="">`:`<span class="${cls}" style="background:${esc((s&&s.color)||'#888')}">${esc((s&&s.emoji)||'🙂')}</span>`;

/* --- editor de aparência --- */
function lookBuilderHTML(L,opts={}){return `<div class="lb"><div class="lb-prev"><canvas id="lbC" width="400" height="480"></canvas><div class="lb-under"><canvas id="lbT" width="72" height="72"></canvas><div class="grow small muted">Assim ele aparece no mapa</div>${opts.ro?'':'<button class="btn sm" id="lbRnd" type="button">🎲 Aleatório</button>'}</div></div>
 ${opts.ro?'<div class="lb-opts"><div class="notice">O mestre define a aparência dos personagens nesta campanha.</div></div>':`<div class="lb-opts"><div class="lb-tabs" id="lbTabs">${[['race','Raça e corpo'],['img','Retrato'],['face','Rosto'],['hair','Cabelo'],['clothes','Roupas'],['extra','Detalhes']].map(([k,l],i)=>`<button type="button" data-lt="${k}" class="${i===0?'on':''}">${l}</button>`).join('')}</div><div id="lbPane"></div></div>`}</div>`}
function bindLookBuilder(root,L,opts={}){
 let tab='race';const cv=$('#lbC',root),tv=$('#lbT',root);
 const draw=()=>{const k=Math.min(2,window.devicePixelRatio||1);cv.width=400*k;cv.height=480*k;const x=cv.getContext('2d');x.setTransform(1,0,0,1,0,0);drawPortrait(x,L,cv.width,cv.height);tv.width=tv.height=72*k;const tx=tv.getContext('2d');tx.clearRect(0,0,tv.width,tv.height);tx.drawImage(tokenSprite(L,72),0,0,tv.width,tv.height);tx.lineWidth=3*k;tx.strokeStyle='#f5c542';tx.beginPath();tx.arc(tv.width/2,tv.height/2,tv.width/2-1.5*k,0,Math.PI*2);tx.stroke();opts.onChange&&opts.onChange(L)};
 if(opts.ro){draw();return}
 if(String(L.race).startsWith('c:')){const rc=getRace(L.race);if(rc.custom)L.rc=rc}else delete L.rc;window._lbDraw=()=>{if(cv.isConnected)draw()};imgWaiters.add(window._lbDraw);
 const R=()=>raceOf(L);const G=T.game||{};
 const partChips=cat=>{const list=(G.lookParts||[]).filter(p=>p.cat===cat);if(!list.length)return'';const cur=L.parts&&L.parts[cat];return `<label class="f">Peças da campanha</label><div class="lb-parts"><button type="button" class="${!cur?'on':''}" data-pc="${cat}" data-pid=""><span class="pimg">✏️</span><small>Desenho do app</small></button>${list.map(p=>`<button type="button" class="${cur&&cur.id===p.id?'on':''}" data-pc="${cat}" data-pid="${p.id}"><span class="pimg"><img src="${esc(p.src)}" alt=""></span><small>${esc(p.name)}</small></button>`).join('')}</div>`};
 const chips=(k,list)=>`<div class="lb-chips">${list.map(([v,l])=>`<button type="button" class="chip ${L[k]===v?'on':''}" data-k="${k}" data-v="${v}">${l}</button>`).join('')}</div>`;
 const sw=(k,cols)=>`<div class="lb-sw">${cols.map(c=>`<button type="button" class="${String(L[k]).toLowerCase()===c.toLowerCase()?'on':''}" data-k="${k}" data-v="${c}" style="background:${c}" aria-label="cor"></button>`).join('')}<label class="lb-cust" title="Outra cor"><input type="color" data-k="${k}" value="${shade(L[k]||'#888888',0)}">+</label></div>`;
 const pane=()=>{const r=R();let h='';
  if(tab==='race'){h=`<label class="f">Raça${opts.lockRace?' <span class="muted small">(definida pela ficha)</span>':''}</label><div class="lb-races">${[...new Set([...availRaces(),...(opts.lockRace?[opts.lockRace]:[]),L.race])].map(k=>{const v=getRace(k);return `<button type="button" class="lb-race ${L.race===k?'on':''}" data-race="${k}" ${opts.lockRace&&opts.lockRace!==k?'disabled':''}><img src="${lookAvatar(defaultLook(k,L.outfit,k),56)}" alt=""><span>${esc(v.n)}</span></button>`}).join('')}</div>
   <label class="f">Traços</label>${chips('body',[['m','Masculino'],['f','Feminino']])}<label class="f">Idade</label>${chips('age',[['jovem','Jovem'],['adulto','Adulto'],['veterano','Veterano']])}<label class="f">${r.dragon?'Escamas':'Pele'}</label>${sw('skin',r.skins)}`}
  else if(tab==='img'){const pr=(G.lookParts||[]).filter(p=>p.cat==='portrait');h=`<label class="f">Tipo de retrato</label><div class="lb-chips"><button type="button" class="chip ${!L.img?'on':''}" data-imgmode="draw">✏️ Desenho do app</button><button type="button" class="chip ${L.img?'on':''}" data-imgmode="img">🖼 Imagem</button></div>
   ${pr.length?`<label class="f">Retratos da campanha</label><div class="lb-parts">${pr.map(p=>`<button type="button" class="${L.img&&L.img.src===p.src?'on':''}" data-psrc="${esc(p.src)}"><span class="pimg"><img src="${esc(p.src)}" alt=""></span><small>${esc(p.name)}</small></button>`).join('')}</div>`:''}
   ${S.assets?`<div class="row wrap" style="margin-top:10px"><button type="button" class="btn sm" id="lbUp">${I('up')} Enviar imagem</button><button type="button" class="btn sm" id="lbGen">🎨 Gerar com IA</button></div>`:(pr.length?'':'<p class="small muted">O mestre ainda não enviou retratos prontos.</p>')}
   ${L.img?`<label class="f">Zoom</label><input type="range" data-img="s" min="0.5" max="3" step="0.02" value="${L.img.s||1}"><div class="row wrap"><div class="grow"><label class="f">Horizontal</label><input type="range" data-img="x" min="-150" max="150" step="1" value="${L.img.x||0}"></div><div class="grow"><label class="f">Vertical</label><input type="range" data-img="y" min="-150" max="150" step="1" value="${L.img.y||0}"></div></div><label class="toggle"><input type="checkbox" id="lbFin" ${L.img.finish!==false?'checked':''}><span class="sw"></span>Acabamento sombrio (vinheta e granulado)</label><p class="small muted">Ajuste o enquadramento olhando o ícone do mapa ao lado.</p>`:''}`}
  else if(tab==='face'){h=`<label class="f">Olhos</label>${chips('eyes',LOOK_OPTS.eyes)}<label class="f">Cor dos olhos</label>${sw('eyeColor',EYE_COLORS)}${r.dragon?'':`<label class="f">Sobrancelhas</label>${chips('brows',LOOK_OPTS.brows)}`}<label class="f">Boca</label>${chips('mouth',LOOK_OPTS.mouth)}${r.dragon?'':`<label class="f">Barba</label>${chips('beard',LOOK_OPTS.beard)}<label class="f">Marcas</label>${chips('marks',LOOK_OPTS.marks)}`}`}
  else if(tab==='hair'){h=r.dragon?'<p class="muted">Draconatos não têm cabelo — veja os chifres em Detalhes.</p>':`<label class="f">Estilo</label>${chips('hair',LOOK_OPTS.hair)}<label class="f">Cor do cabelo</label>${sw('hairColor',HAIR_COLORS)}${partChips('hair')}`}
  else if(tab==='clothes'){h=`<label class="f">Traje inicial</label>${chips('outfit',LOOK_OPTS.outfit)}<label class="f">Cor principal</label>${sw('outfitColor',CLOTH_COLORS)}<label class="f">Cor dos detalhes</label>${sw('accent',ACCENT_COLORS)}${partChips('outfit')}`}
  else{h=`<label class="f">Chifres</label>${chips('horns',LOOK_OPTS.horns)}<label class="f">Cor dos chifres</label>${sw('hornColor',['#2a2420','#4a3a2a','#6a5a48','#d8d0c0','#1a1a1c','#5a1e1e'])}<label class="f">Acessório</label>${chips('acc',LOOK_OPTS.acc)}<label class="f">Fundo do retrato</label>${sw('bg',BG_COLORS)}${partChips('horns')}${partChips('acc')}${partChips('extra')}${partChips('back')}`}
  $('#lbPane',root).innerHTML=h};
 const takeImg=r=>{if(r){L.img={src:r.src,s:1,x:0,y:0,finish:true};pane();draw()}};
 root.addEventListener('click',async e=>{const t=e.target.closest('[data-lt],[data-k],[data-race],#lbRnd,[data-pc],[data-imgmode],[data-psrc],#lbUp,#lbGen');if(!t||!root.contains(t))return;
  if(t.dataset.pc!==undefined&&t.dataset.pc){const cat=t.dataset.pc,p=(G.lookParts||[]).find(x=>x.id===t.dataset.pid);L.parts=L.parts||{};if(p)L.parts[cat]=partSnap(p);else delete L.parts[cat];pane();draw();return}
  if(t.dataset.imgmode){if(t.dataset.imgmode==='draw'){delete L.img}else if(!L.img){const pr=(G.lookParts||[]).find(p=>p.cat==='portrait');if(pr)takeImg(pr);else{toast(S.assets?'Envie ou gere uma imagem abaixo.':'Peça ao mestre para enviar retratos.');}return}pane();draw();return}
  if(t.dataset.psrc){takeImg({src:t.dataset.psrc});return}
  if(t.id==='lbUp'){const [f]=await pickFile('image/*');if(!f)return;const b=busy('Enviando…');try{takeImg(await storeImage(f))}catch(er){toast(er.message,'err')}finally{b.done()}return}
  if(t.id==='lbGen'){takeImg(await genImage());return}
  if(t.id==='lbRnd'){const lock=opts.lockRace;Object.assign(L,randomLook({_lockRace:!!lock,race:lock||L.race}));if(lock)L.race=lock;pane();draw();return}
  if(t.dataset.lt){tab=t.dataset.lt;$$('#lbTabs button',root).forEach(b=>b.classList.toggle('on',b===t));pane();return}
  if(t.dataset.race){if(t.disabled)return;const keep={body:L.body,age:L.age,outfit:L.outfit,outfitColor:L.outfitColor,accent:L.accent,eyeColor:L.eyeColor,hairColor:L.hairColor,bg:L.bg};delete L.rc;Object.assign(L,defaultLook(t.dataset.race,L.outfit,Math.random()),keep);const rr=raceOf(L);if(rr.def&&rr.def.eyeColor)L.eyeColor=rr.def.eyeColor;pane();draw();return}
  if(t.tagName==='INPUT')return;
  L[t.dataset.k]=t.dataset.v;if(t.dataset.k==='outfit'){const oc=OUTFIT_COLORS[t.dataset.v];if(oc){L.outfitColor=oc[0];L.accent=oc[1]}}pane();draw()});
 root.addEventListener('input',e=>{const t=e.target;if(t.type==='color'&&t.dataset.k){L[t.dataset.k]=t.value;draw()}if(t.dataset.img&&L.img){L.img[t.dataset.img]=+t.value;draw()}if(t.id==='lbFin'&&L.img){L.img.finish=t.checked;draw()}});
 pane();draw();
}
function seatRaceLock(s){const tpl=T.game&&T.game.template;if(!tpl||!s)return null;const f=tplFields(tpl).find(f=>f.type==='select'&&/ra[cç]a|esp[eé]cie|ancestral/i.test(f.label));if(!f)return null;const c=choiceById(f,(s.values||{})[f.id]);if(!c)return null;const cr=((T.game&&T.game.races)||[]).find(r=>norm(r.name)===norm(c.name));return cr?'c:'+cr.id:raceKey(c.name)}
function seatClassOutfit(values){const tpl=T.game&&T.game.template;if(!tpl)return'couro';const f=tplFields(tpl).find(f=>f.type==='select'&&/classe|profiss|ocupa|arqu[eé]tipo/i.test(f.label));if(!f)return'couro';const c=choiceById(f,(values||{})[f.id]);return c?classOutfit(c.name):'couro'}
function autoLook(values,name){const fake={values};return defaultLook(seatRaceLock(fake)||'humano',seatClassOutfit(values),name)}
PR.look=()=>{const s=mySeat();if(!s)return renderJoin();const L=cl(s.look||autoLook(s.values,s.name)),lock=seatRaceLock(s);if(lock&&L.race!==lock)Object.assign(L,defaultLook(lock,L.outfit,s.name));const ro=T.game.lookFree===false;
 $('#tMain').innerHTML=`<div class="tpad"><div class="vh"><div class="grow"><h2>Aparência</h2><p>${ro?'Veja como o mestre definiu seu personagem.':'Monte o visual do seu personagem — ele vira o seu ícone no mapa.'}</p></div>${ro?'':'<button class="btn primary" id="lbSave">Salvar aparência</button>'}</div>${lookBuilderHTML(L,{ro})}</div>`;
 bindLookBuilder($('#tMain'),L,{ro,lockRace:lock});
 const sv=$('#lbSave');if(sv)sv.onclick=()=>{seatPatch(S.uid,{look:cl(L)});renderPanel();toast('Aparência salva — confira no mapa!')}};
async function lookModal(L,title,lockRace){const W=cl(L);const v=await modal({title,wide:true,body:lookBuilderHTML(W,{}),onMount:ov=>bindLookBuilder(ov,W,{lockRace}),actions:[{label:'Cancelar'},{label:'Salvar aparência',cls:'primary',value:true}]});return v?W:null}

/* --- camada de tokens animados por cima do mapa --- */
const TL={toks:{},raf:0,last:0,dust:[]};
function tlSync(tc,mc,m,tokens,mode){if(!tc||!mc)return;TL.cv=tc;TL.m=m;TL.mode=mode;TL.vis=mc._vis||null;TL.cell=mc._cell||28;
 if(tc.width!==mc.width||tc.height!==mc.height){tc.width=mc.width;tc.height=mc.height}tc.style.width=mc.style.width;tc.style.height=mc.style.height;TL.dpr=mc.width/(m.w*TL.cell);
 const now=performance.now(),seen=new Set();
 tokens.forEach(t=>{seen.add(t.id);let s=TL.toks[t.id];if(!s||s.m!==m.id){s=TL.toks[t.id]={x:t.x,y:t.y,fx:t.x,fy:t.y,tx:t.x,ty:t.y,t0:0,dur:1,born:now,face:1,m:m.id,ph:Math.random()*6}}
  if(s.tx!==t.x||s.ty!==t.y){s.fx=s.x;s.fy=s.y;s.tx=t.x;s.ty=t.y;s.t0=now;const d=Math.hypot(t.x-s.fx,t.y-s.fy);s.dur=clamp(d*170,260,1100);s.steps=Math.max(2,Math.round(d*2));if(t.x!==s.fx)s.face=t.x>s.fx?1:-1;for(let i=0;i<5;i++)TL.dust.push({x:s.fx+.5+(Math.random()-.5)*.4,y:s.fy+.85,vx:(Math.random()-.5)*.6,vy:-Math.random()*.4,t:now})}
  s.tok=t});
 for(const id in TL.toks)if(!seen.has(id))delete TL.toks[id];
 if(!TL.raf)TL.raf=requestAnimationFrame(tlFrame)}
const easeIO=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
function tlFrame(ts){TL.raf=0;const cv=TL.cv;if(!cv||!cv.isConnected)return;
 const now=performance.now();let moving=!!T.dragTok||TL.dust.length>0;for(const id in TL.toks){const s=TL.toks[id];if(now-s.t0<s.dur||now-s.born<450||(s.hitT&&now-s.hitT<450))moving=true}if(TL.fx&&TL.fx.length)moving=true;
 if(!moving&&ts-TL.last<70){TL.raf=requestAnimationFrame(tlFrame);return}TL.last=ts;
 const x=cv.getContext('2d'),dpr=TL.dpr||1,cell=TL.cell,m=TL.m;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,cv.width,cv.height);x.setTransform(dpr,0,0,dpr,0,0);
 TL.dust=TL.dust.filter(d=>now-d.t<600);TL.dust.forEach(d=>{const a=(now-d.t)/600;x.fillStyle=`rgba(180,160,130,${.45*(1-a)})`;x.beginPath();x.arc((d.x+d.vx*a)*cell,(d.y+d.vy*a)*cell,cell*(.06+a*.12),0,7);x.fill()});try{tlPre(x,cell,now,m)}catch{}
 const list=Object.values(TL.toks).sort((a,b)=>a.y-b.y);
 list.forEach(s=>{const t=s.tok;let p=s.dur?clamp((now-s.t0)/s.dur,0,1):1;const mv=p<1;const e=easeIO(p);s.x=s.fx+(s.tx-s.fx)*e;s.y=s.fy+(s.ty-s.fy)*e;let lift=0;
  if(T.dragTok&&T.dragTok.id===t.id){s.x=T.dragTok.x;s.y=T.dragTok.y;s.fx=s.tx=s.x;s.fy=s.ty=s.y;lift=1;p=1}
  if(TL.vis&&TL.mode==='player'&&t.kind==='npc'){const ci=Math.round(s.y)*m.w+Math.round(s.x);if(!TL.vis[ci])return}
  const cx=(s.x+.5)*cell,cy=(s.y+.5)*cell,r=cell*.46,born=clamp((now-s.born)/420,0,1);
  const bob=mv?Math.abs(Math.sin(p*Math.PI*s.steps))*cell*.16:Math.sin(now/650+s.ph)*cell*.018,tilt=mv?Math.sin(p*Math.PI*s.steps)*.12*s.face:0,breathe=mv?1:1+Math.sin(now/650+s.ph)*.012;
  x.fillStyle=`rgba(0,0,0,${.38-lift*.12})`;x.beginPath();x.ellipse(cx,cy+r*.82,r*(.82-bob/cell)*(1+lift*.15),r*.26,0,0,Math.PI*2);x.fill();try{tlRing(x,t,cx,cy,r,now)}catch{}
  const hk=s.hitT&&now-s.hitT<450?Math.sin((now-s.hitT)/25)*cell*.07*(1-(now-s.hitT)/450):0;x.save();x.globalAlpha=born*(t.down?.5:1);if(t.down)x.filter='grayscale(1)';x.translate(cx+hk,cy-bob-lift*cell*.22);x.rotate(tilt);x.scale((.6+.4*born)*breathe,(.6+.4*born)*breathe);
  if(t.look){x.drawImage(tokenSprite(t.look,Math.round(r*2)),-r,-r,r*2,r*2)}
  else{x.fillStyle=t.color;x.beginPath();x.arc(0,0,r,0,Math.PI*2);x.fill();x.font=`${Math.round(cell*.5)}px ${EMOJI_FONT}`;x.textAlign='center';x.textBaseline='middle';x.fillStyle='#000';x.fillText(t.emoji,0,cell*.02)}
  x.lineWidth=Math.max(2,cell*.085);x.strokeStyle=t.mine?'#f5c542':(t.look?t.color:'#fff');x.beginPath();x.arc(0,0,r,0,Math.PI*2);x.stroke();
  if(t.look&&!t.mine){x.lineWidth=1;x.strokeStyle='rgba(255,255,255,.6)';x.beginPath();x.arc(0,0,r+x.lineWidth*2,0,Math.PI*2);x.stroke()}
  x.restore();try{tlPost(x,t,s,cx+hk,cy-bob,r,now,cell)}catch{}
  if(t.name){const nm=t.name.slice(0,14),ny=cy+r+cell*.24,dark=m.style==='dark'||m.style==='cyber';x.font=`600 ${Math.max(9,Math.round(cell*.3))}px Inter,sans-serif`;x.textAlign='center';x.textBaseline='middle';x.lineWidth=3;x.strokeStyle=dark?'rgba(0,0,0,.9)':'rgba(255,255,255,.95)';x.strokeText(nm,cx,ny);x.fillStyle=dark?'#fff':'#1c1916';x.fillText(nm,cx,ny)}});
 TL.raf=requestAnimationFrame(tlFrame)}
