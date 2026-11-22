/* ============ v39: tema Cyberpunk ============
   Mapas: estilo "🌃 Cyberpunk neon" (asfalto molhado, metal, prédios com contorno neon, postes de luz,
   arranha-céus, lojas com letreiro), início "Ruas da cidade", ferramentas renomeadas e objetos cyberpunk.
   Personagens: ficha pronta Cyberpunk, espécies Ciborgue e Androide, roupas, marcas, acessórios e cores neon.
   Conteúdo: armas, implantes, hacks, inimigos, loja "Mercado negro" e mapa de exemplo (Mestre → Campanha). */
MAP_STYLES.cyber=['🌃 Cyberpunk neon','Cidade noturna: asfalto molhado, metal e letreiros neon'];
const CYN={c:'#00e5ff',m:'#ff2bd6',y:'#ffd400',g:'#39ff88',p:'#b388ff',r:'#ff3b3b'};
const cyberOn=()=>{const g=T.game;if(!g)return false;if(g.cyber)return true;try{if(Object.values(T.maps||{}).some(m=>m&&m.style==='cyber'))return true}catch{}
 return tplFields(g.template).some(f=>f.type==='select'&&(f.choices||[]).some(c=>/ciborg|androide|netrunner/i.test(c.name)))};
/* ---------- texturas do chão ---------- */
const CYGROUND={f:'#1a1d27',r:'#14151b',c:'#2a2c34',g:'#0e261d',b:'#1b0f2b',n:'#2a251f',v:'#c5cfd8',a:'#052a28',z:'#18300c',l:'#24052c',k:'#0f111a'};
const CYTEXC={};
function cyTex(t,cell){const k=mapDpr(),key=t+'_'+cell+'_'+k;if(CYTEXC[key])return CYTEXC[key];
 const S=Math.max(16,Math.round(cell*2*k)),u=S/64,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d'),R=rng(t.charCodeAt(0)*131+7);
 x.fillStyle=CYGROUND[t]||'#15161c';x.fillRect(0,0,S,S);
 const dots=(n,col,r0,r1,a)=>{x.globalAlpha=a;x.fillStyle=col;for(let i=0;i<n;i++){x.beginPath();x.arc(R()*S,R()*S,Math.max(.3,(r0+R()*(r1-r0))*u),0,7);x.fill()}x.globalAlpha=1};
 const grid=(n,col,w,a)=>{x.globalAlpha=a;x.strokeStyle=col;x.lineWidth=w*u;x.beginPath();for(let i=0;i<=n;i++){const p=i*S/n;x.moveTo(p,0);x.lineTo(p,S);x.moveTo(0,p);x.lineTo(S,p)}x.stroke();x.globalAlpha=1};
 switch(t){
  case'f':for(let gy=0;gy<2;gy++)for(let gx=0;gx<2;gx++){const X=gx*S/2,Y=gy*S/2,g=x.createLinearGradient(X,Y,X+S/2,Y+S/2);g.addColorStop(0,'#252a37');g.addColorStop(1,'#171a23');x.fillStyle=g;x.fillRect(X+u,Y+u,S/2-2*u,S/2-2*u);x.fillStyle='#3d4456';[[3,3],[29,3],[3,29],[29,29]].forEach(([a,b])=>{x.beginPath();x.arc(X+a*u,Y+b*u,1.1*u,0,7);x.fill()})}
   x.globalAlpha=.22;x.strokeStyle='#56607a';x.lineWidth=1.1*u;for(let i=0;i<8;i++)for(let j=0;j<8;j++){const px=(i+.5)*S/8,py=(j+.5)*S/8;x.beginPath();if((i+j)%2){x.moveTo(px-2*u,py-2*u);x.lineTo(px+2*u,py+2*u)}else{x.moveTo(px-2*u,py+2*u);x.lineTo(px+2*u,py-2*u)}x.stroke()}x.globalAlpha=1;break;
  case'r':dots(260,'#23252e',.4,1.2,.9);dots(160,'#0b0c10',.4,1.4,.8);for(let i=0;i<3;i++){const px=S*(.2+.3*i)+R()*8*u,py=R()*S,g=x.createRadialGradient(px,py,1,px,py,(6+R()*7)*u);g.addColorStop(0,i%2?'rgba(255,43,214,.2)':'rgba(0,229,255,.22)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,S,S)}break;
  case'c':grid(4,'#15161b',1.4,1);dots(60,'#3d3f49',.3,.9,.7);break;
  case'g':dots(120,'#1d4a33',.6,2,.8);dots(40,CYN.g,.3,.7,.55);break;
  case'b':grid(4,CYN.m,1,.5);for(let gy=0;gy<4;gy++)for(let gx=0;gx<4;gx++){if(R()<.3){x.fillStyle=R()<.5?'rgba(255,43,214,.2)':'rgba(0,229,255,.16)';x.fillRect(gx*S/4+u,gy*S/4+u,S/4-2*u,S/4-2*u)}}break;
  case'n':dots(80,'#40382d',1,3.2,.9);dots(40,'#15120e',.6,2,.8);x.strokeStyle='#5c5249';x.lineWidth=1.2*u;for(let i=0;i<6;i++){const px=R()*S,py=R()*S;x.beginPath();x.moveTo(px,py);x.lineTo(px+(R()-.5)*14*u,py+(R()-.5)*14*u);x.stroke()}break;
  case'v':grid(4,'#9fb0c0',1,.9);x.globalAlpha=.55;x.strokeStyle=CYN.c;x.lineWidth=.8*u;x.beginPath();x.moveTo(0,S*.5);x.lineTo(S,S*.5);x.stroke();x.globalAlpha=1;break;
  case'a':for(let i=0;i<40;i++){const px=R()*S,py=R()*S,w=(4+R()*8)*u;x.globalAlpha=.5;x.strokeStyle=R()<.7?'#10a89b':'#7dffe9';x.lineWidth=.9*u;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+w/2,py-2*u,px+w,py);x.stroke()}x.globalAlpha=1;break;
  case'z':dots(30,'#3c7a12',3,8,.7);dots(30,'#9dff00',.5,1.4,.7);break;
  case'l':for(let i=0;i<6;i++){let a=R()*S,b=R()*S;x.strokeStyle=R()<.5?CYN.m:CYN.p;x.lineWidth=1.2*u;x.globalAlpha=.8;x.beginPath();x.moveTo(a,b);for(let s=0;s<5;s++){a+=(R()-.5)*16*u;b+=(R()-.5)*16*u;x.lineTo(a,b)}x.stroke()}x.globalAlpha=1;break;
  case'k':{x.fillStyle='#141725';x.fillRect(2*u,2*u,S-4*u,S-4*u);x.strokeStyle='#22273a';x.lineWidth=1.2*u;x.strokeRect(6*u,6*u,S-12*u,S-12*u);
   for(let i=0;i<3;i++){const vx=(10+R()*40)*u,vy=(10+R()*40)*u;x.fillStyle='#1d2133';x.fillRect(vx,vy,8*u,6*u);x.strokeStyle='#2c3248';x.strokeRect(vx,vy,8*u,6*u)}
   for(let i=0;i<7;i++){x.fillStyle=R()<.5?'rgba(255,190,90,.75)':'rgba(0,229,255,.6)';x.fillRect(R()*S,R()*S,1.6*u,1.6*u)}break}
 }
 CYTEXC[key]=c;return c}
function cyPat(x,t,cell){const p=x.createPattern(cyTex(t,cell),'repeat');try{p.setTransform(new DOMMatrix().scale(1/mapDpr()))}catch{}return p}
/* ---------- desenho do estilo ---------- */
function cyNeon(x,path,col,cell){[[Math.max(5,cell*.34),.12],[Math.max(2.5,cell*.15),.35],[Math.max(1.2,cell*.055),.95]].forEach(([w,a],i)=>{x.globalAlpha=a;x.strokeStyle=i===2?'#fff':col;x.lineWidth=w;x.stroke(path)});x.globalAlpha=1;x.strokeStyle=col;x.lineWidth=Math.max(1,cell*.03);x.globalAlpha=.9;x.stroke(path);x.globalAlpha=1}
function drawCyber(x,m,cell,o,bg){const W=m.w*cell,H=m.h*cell,BASE={d:'f',s:'f',p:'f',t:'c',m:'c',h:'c',w:'f'};
 x.fillStyle='#06060c';x.fillRect(0,0,W,H);
 if(bg){x.globalAlpha=m.bg.op??1;x.drawImage(bg,0,0,W,H);x.globalAlpha=1}
 else{x.strokeStyle='rgba(140,100,255,.07)';x.lineWidth=1;x.beginPath();for(let i=0;i<=m.w;i+=2){x.moveTo(i*cell,0);x.lineTo(i*cell,H)}for(let j=0;j<=m.h;j+=2){x.moveTo(0,j*cell);x.lineTo(W,j*cell)}x.stroke()}
 const tl=(i,j)=>tileAt(m,i,j),isR=(i,j)=>tl(i,j)==='r';
 const autoWall=(i,j)=>{if(tl(i,j)!==' '||bg)return false;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const t=tl(i+dx,j+dy);if(t!==' '&&!SOLID.has(t))return true}return false};
 const isWall=(i,j)=>SOLID.has(tl(i,j))||autoWall(i,j);
 /* chão */
 const types={};for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++){const t=tl(i,j);if(t===' '||SOLID.has(t))continue;const b=BASE[t]||t;(types[b]=types[b]||[]).push(i,j)}
 for(const t in types){const a=types[t],p=new Path2D();for(let q=0;q<a.length;q+=2)p.rect(a[q]*cell,a[q+1]*cell,cell,cell);x.fillStyle=cyPat(x,t,cell);x.fill(p);
  if(t==='a'||t==='z'||t==='l'){x.save();x.clip(p);x.globalCompositeOperation='lighter';x.fillStyle=t==='l'?'rgba(255,43,214,.12)':t==='z'?'rgba(157,255,0,.08)':'rgba(25,245,216,.08)';x.fill(p);x.restore()}}
 /* meio-fio e faixas da rua */
 const curb=new Path2D(),lane=new Path2D();
 for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++){if(!isR(i,j))continue;const X=i*cell,Y=j*cell;
  [[0,-1,X,Y,X+cell,Y],[0,1,X,Y+cell,X+cell,Y+cell],[-1,0,X,Y,X,Y+cell],[1,0,X+cell,Y,X+cell,Y+cell]].forEach(([dx,dy,a,b,c2,d])=>{const n=tl(i+dx,j+dy);if(n!=='r'&&n!==' '&&!SOLID.has(n)){curb.moveTo(a,b);curb.lineTo(c2,d)}});
  const hc=isR(i,j-1)&&isR(i,j+1)&&!isR(i,j-2)&&!isR(i,j+2),vc=isR(i-1,j)&&isR(i+1,j)&&!isR(i-2,j)&&!isR(i+2,j);
  if(hc&&!vc&&isR(i-1,j)&&isR(i+1,j)&&i%2===0){lane.rect(X+cell*.15,Y+cell*.46,cell*.7,cell*.08)}
  else if(vc&&!hc&&isR(i,j-1)&&isR(i,j+1)&&j%2===0){lane.rect(X+cell*.46,Y+cell*.15,cell*.08,cell*.7)}}
 x.strokeStyle='#454957';x.lineWidth=Math.max(1.5,cell*.08);x.stroke(curb);x.fillStyle='rgba(255,212,0,.75)';x.fill(lane);
 /* portas, escadas, alçapões */
 for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++){const t=tl(i,j),X=i*cell,Y=j*cell;
  if(t==='d'){const hor=walkable(tl(i-1,j))&&walkable(tl(i+1,j));x.fillStyle='#1c2030';x.fillRect(X+cell*.08,Y+cell*.08,cell*.84,cell*.84);const p=new Path2D();if(hor){p.moveTo(X+cell/2,Y+cell*.1);p.lineTo(X+cell/2,Y+cell*.9)}else{p.moveTo(X+cell*.1,Y+cell/2);p.lineTo(X+cell*.9,Y+cell/2)}cyNeon(x,p,CYN.c,cell*.6)}
  else if(t==='s'){for(let k2=0;k2<5;k2++){x.fillStyle=k2%2?'#2a2f3e':'#363c4e';x.fillRect(X+cell*.1,Y+cell*(.1+k2*.16),cell*.8,cell*.14)}x.fillStyle=CYN.y;x.globalAlpha=.8;x.fillRect(X+cell*.1,Y+cell*.1,cell*.8,cell*.03);x.globalAlpha=1}
  else if(t==='p'){const cx=X+cell/2,cy=Y+cell/2,r=cell*.4;x.save();x.beginPath();x.arc(cx,cy,r,0,7);x.clip();for(let k2=-4;k2<5;k2++){x.fillStyle=k2%2?'#111':CYN.y;x.beginPath();x.moveTo(cx+k2*r*.5-r,cy-r);x.lineTo(cx+k2*r*.5-r+r*.25,cy-r);x.lineTo(cx+k2*r*.5+r*.25,cy+r);x.lineTo(cx+k2*r*.5,cy+r);x.fill()}x.restore();x.fillStyle='#000';x.beginPath();x.arc(cx,cy,r*.7,0,7);x.fill()}}
 /* paredes e prédios com contorno neon */
 const neonC=new Path2D(),neonM=new Path2D();
 for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++){if(!isWall(i,j))continue;const X=i*cell,Y=j*cell,t=tl(i,j);
  if(t==='k'){x.fillStyle=cyPat(x,'k',cell);x.fillRect(X,Y,cell,cell)}else if(t==='w'){x.fillStyle='#0c0e16';x.fillRect(X+cell*.1,Y+cell*.1,cell*.8,cell*.8);x.strokeStyle='#2b3046';x.lineWidth=1;x.strokeRect(X+cell*.1,Y+cell*.1,cell*.8,cell*.8)}else{x.fillStyle='#0a0b12';x.fillRect(X,Y,cell,cell)}}
 for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++){if(!walkable(tl(i,j)))continue;const X=i*cell,Y=j*cell;
  [[0,-1,X,Y,X+cell,Y],[0,1,X,Y+cell,X+cell,Y+cell],[-1,0,X,Y,X,Y+cell],[1,0,X+cell,Y,X+cell,Y+cell]].forEach(([dx,dy,a,b,c2,d])=>{if(!isWall(i+dx,j+dy))return;const p=tl(i+dx,j+dy)==='k'?neonC:neonM;p.moveTo(a,b);p.lineTo(c2,d)})}
 x.lineCap='round';cyNeon(x,neonC,CYN.c,cell);cyNeon(x,neonM,CYN.m,cell);
 if(o.grid!==false){x.strokeStyle='rgba(0,229,255,.07)';x.lineWidth=1;x.beginPath();for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++){if(!walkable(tl(i,j))&&!bg)continue;x.rect(i*cell+.5,j*cell+.5,cell,cell)}x.stroke()}
 /* postes, arranha-céus e lojas */
 const glow=[];
 for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++){const t=tl(i,j);if(t!=='t'&&t!=='m'&&t!=='h')continue;const X=i*cell,Y=j*cell,cx=X+cell/2,cy=Y+cell/2,hv=hash2(i,j),col=[CYN.c,CYN.m,CYN.y,CYN.g,CYN.p][hv%5];
  if(t==='t'){glow.push([cx,cy,cell*2.1,hv%2?CYN.m:CYN.c]);x.fillStyle='#0c0d14';x.beginPath();x.arc(cx,cy,cell*.16,0,7);x.fill();x.fillStyle=hv%2?CYN.m:CYN.c;x.beginPath();x.arc(cx,cy,cell*.08,0,7);x.fill()}
  else if(t==='m'){const s=cell*1.36,bx=cx-s/2,by=cy-s/2;x.fillStyle='rgba(0,0,0,.55)';x.fillRect(bx+cell*.18,by+cell*.22,s,s);const g=x.createLinearGradient(bx,by,bx+s,by+s);g.addColorStop(0,'#232840');g.addColorStop(1,'#0b0d17');x.fillStyle=g;x.fillRect(bx,by,s,s);
   x.fillStyle='#161a2c';x.fillRect(bx+s*.14,by+s*.14,s*.72,s*.72);const R=rng(hv);for(let q=0;q<10;q++){x.fillStyle=R()<.6?'rgba(255,190,90,.85)':'rgba(0,229,255,.75)';x.fillRect(bx+s*(.18+R()*.6),by+s*(.18+R()*.6),Math.max(1,s*.05),Math.max(1,s*.05))}
   const e=new Path2D();e.moveTo(bx,by+s);e.lineTo(bx,by);e.lineTo(bx+s,by);cyNeon(x,e,col,cell*.55);x.fillStyle=CYN.r;x.beginPath();x.arc(bx+s*.78,by+s*.24,Math.max(1.5,cell*.06),0,7);x.fill();glow.push([bx+s*.78,by+s*.24,cell*.5,CYN.r])}
  else{const s=cell*1.04,bx=cx-s/2,by=cy-s/2;x.fillStyle='#131624';x.fillRect(bx,by,s,s);for(let q=0;q<5;q++){x.fillStyle=q%2?'#1d2236':shade(col,-.55);x.fillRect(bx+q*s/5,by+s*.62,s/5,s*.16)}
   const sg=new Path2D();sg.rect(bx+s*.16,by+s*.18,s*.68,s*.26);x.fillStyle=rgba(col,.25);x.fill(sg);cyNeon(x,sg,col,cell*.5);glow.push([cx,by+s*.3,cell*1.4,col])}}
 x.save();x.globalCompositeOperation='lighter';glow.forEach(([gx,gy,r,c2])=>{const g=x.createRadialGradient(gx,gy,1,gx,gy,r);g.addColorStop(0,rgba(c2,.28));g.addColorStop(1,rgba(c2,0));x.fillStyle=g;x.fillRect(gx-r,gy-r,r*2,r*2)});
 const R=rng(hash2(m.w,m.h));for(let q=0;q<6;q++){const gx=R()*W,gy=R()*H,r=Math.max(W,H)*(.18+R()*.2),c2=q%2?CYN.m:CYN.c,g=x.createRadialGradient(gx,gy,1,gx,gy,r);g.addColorStop(0,rgba(c2,.06));g.addColorStop(1,rgba(c2,0));x.fillStyle=g;x.fillRect(0,0,W,H)}x.restore();
 const v=x.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,10,.5)');x.fillStyle=v;x.fillRect(0,0,W,H)}
/* ---------- início "Ruas da cidade" e prévia ---------- */
function cyCity(w,h,seed){const a=new Array(w*h).fill('r'),R=rng(seed||7),road=3,bw=9,bh=7;
 for(let by=road;by<h;by+=bh+road)for(let bx=road;bx<w;bx+=bw+road){const x1=Math.min(w-1,bx+bw-1),y1=Math.min(h-1,by+bh-1);
  for(let y=by;y<=y1;y++)for(let x=bx;x<=x1;x++)a[y*w+x]=(x===bx||x===x1||y===by||y===y1)?'c':'k';
  if(x1-bx>=4&&y1-by>=4){a[(by+1)*w+bx+2+Math.floor(R()*(x1-bx-3))]='h';if(R()<.6)a[(y1-1)*w+bx+2+Math.floor(R()*(x1-bx-3))]='h';if(R()<.55)a[(by+Math.floor((y1-by)/2))*w+bx+Math.floor((x1-bx)/2)]='m'}
  a[by*w+bx]='t';if(x1>bx&&y1>by)a[y1*w+x1]='t'}
 return a.join('')}
{const _nm=newMapObj;newMapObj=function(name,style,start,w,h){if(start!=='city')return _nm.apply(this,arguments);const m=_nm(name,style,'empty',w,h);m.tiles=cyCity(w,h,w*7+h);m.spawn={x:1,y:1};if(style==='cyber'&&T.game&&!T.game.cyber)try{gamePatch({cyber:true})}catch{}return m}}
{const _sm=sampleMap;sampleMap=function(style){if(style!=='cyber')return _sm.apply(this,arguments);const m={w:12,h:7,style,tiles:'',objs:[{k:'🚗',x:1,y:4},{k:'🏮',x:9,y:5}],labels:[],spawn:null};
 const rows=['rrrrrrrrrrrr','rcccccrcccct','rckkhcrckmkc','rckkkcrckkkc','rcccccrccbcc','rrrrrrrrrbbb','aaaaaaaaaaaa'];m.tiles=rows.join('');return m}}
/* ---------- editor: nomes das ferramentas e objetos ---------- */
const CY_TOOLS={floor:['🔳','Piso metálico'],room:['⬜','Sala'],door:['🚪','Porta automática'],stairs:['🛗','Escada'],pit:['⚠️','Alçapão'],grass:['🌱','Jardim'],road:['🛣️','Asfalto'],cobble:['🔲','Calçada'],wood:['🟪','Piso neon'],sand:['🏚️','Entulho'],snow:['🧪','Laboratório'],water:['☣️','Canal tóxico'],swamp:['🟢','Lodo'],lava:['⚡','Energia'],forest:['💡','Poste de luz'],mount:['🏙️','Arranha-céu'],house:['🏪','Loja neon'],wall:['🏢','Prédio'],pillar:['⬛','Coluna']};
const CY_STAMPS=['🚗','🏍️','🚁','🛸','🤖','🦾','💻','🖥️','📡','🔋','🔌','💾','🧬','💉','💊','🔫','🕶️','🎧','💳','🎰','🍜','🏮','🚧','🚨','📦','🗑️','🧯','🛰️','☢️','⚡'];
STAMPS.push(...CY_STAMPS.filter(e=>!STAMPS.includes(e)));
{const _mm=MR.maps;MR.maps=function(...a){const r=_mm.apply(this,a);try{if(T.edit&&T.edit.style==='cyber'){$$('.mtool').forEach(b=>{const c=CY_TOOLS[b.dataset.t];if(c){b.title=c[1];b.innerHTML=`<span>${c[0]}</span><small>${c[1]}</small>`}});
  const st=$('#mStamps');if(st&&!st.dataset.cy){st.dataset.cy=1;const btns=$$('button[data-e]',st),cy=btns.filter(b=>CY_STAMPS.includes(b.dataset.e));cy.reverse().forEach(b=>st.prepend(b))}}}catch(e){console.warn(e)}return r}}
/* ---------- aparência: espécies, roupas, marcas, acessórios e cores ---------- */
RACES.ciborgue={n:'Ciborgue',hw:47,hh:58,jaw:.8,ears:'round',skins:['#f1cfb4','#deb193','#c48c69','#a36d4c','#7a4d33','#553522'],cyber:1,def:{hair:'raspado',acc:'implante'}};
RACES.androide={n:'Androide',hw:45,hh:59,jaw:.74,ears:'round',skins:['#eef2f6','#dfe5ec','#cfd7e1','#bcc6d3','#e8d9cc','#9aa8b8'],android:1,def:{hair:'curto',eyeColor:'#40d0c0',mouth:'neutra'}};
const CY_RACES=['ciborgue','androide'];
LOOK_OPTS.outfit.push(['jaqueta','🧥 Jaqueta neon'],['corpo','💼 Corporativo'],['tatico','🦺 Tático'],['netrunner','💻 Netrunner']);
LOOK_OPTS.marks.push(['circuito','Circuitos neon'],['codigo','Código de barras']);
LOOK_OPTS.acc.push(['visor','Visor HUD'],['oculos','Óculos espelhados'],['implante','Implantes no rosto'],['mascara','Máscara respiratória'],['fones','Fones neon']);
const CY_OUTFITS=['jaqueta','corpo','tatico','netrunner'],CY_ACC=['visor','oculos','implante','mascara','fones'];
HAIR_COLORS.push('#ff2bd6','#00e5ff','#9dff00','#8a2be2','#ff6a00');CLOTH_COLORS.push('#0d0d12','#141a2e','#2a0f3a','#ececf2');ACCENT_COLORS.push(CYN.c,CYN.m,CYN.y,CYN.g);BG_COLORS.push('#160a26','#071826','#0a1a14');
Object.assign(OUTFIT_COLORS,{jaqueta:['#141a2e',CYN.m],corpo:['#0d0d12','#ececf2'],tatico:['#2e3328',CYN.y],netrunner:['#0d0d12',CYN.c]});
{const _av=availRaces;availRaces=function(){const a=_av.apply(this,arguments),g=T.game||{};if(!cyberOn()){const f=a.filter(k=>!CY_RACES.includes(k));return f.length?f:['humano']}if(!g.hiddenRaces)return ['humano','ciborgue','androide',...a.filter(k=>k.startsWith('c:'))];return a}}
{const _rl=randomLook;randomLook=function(prev){const L=_rl.apply(this,arguments),on=cyberOn(),pk=a=>a[Math.floor(Math.random()*a.length)];
 if(!on){if(CY_OUTFITS.includes(L.outfit)){L.outfit='couro';[L.outfitColor,L.accent]=OUTFIT_COLORS.couro}if(CY_ACC.includes(L.acc))L.acc='nenhum';if(['circuito','codigo'].includes(L.marks))L.marks='nenhuma';return L}
 L.outfit=pk(CY_OUTFITS);L.accent=pk([CYN.c,CYN.m,CYN.y,CYN.g]);L.outfitColor=pk(['#0d0d12','#141a2e','#2a0f3a','#1a1a1c','#2e3328']);if(Math.random()<.45)L.hairColor=pk(['#ff2bd6','#00e5ff','#9dff00','#8a2be2']);if(Math.random()<.5)L.acc=pk(CY_ACC);if(Math.random()<.3)L.marks=pk(['circuito','codigo','tatuagem']);L.bg=pk(['#160a26','#071826','#0a1a14']);return L}}
{const _co=classOutfit;classOutfit=function(name){const s=norm(name||'');if(/netrun|hacker/.test(s))return'netrunner';if(/^solo|merc|seguran|policia/.test(s))return'tatico';if(/fixer|corpor|execut/.test(s))return'corpo';if(/techie|tecnic|medtech|nomad|nomade|rocker|piloto/.test(s))return'jaqueta';return _co.apply(this,arguments)}}
{const _sr=seatRaceLock;seatRaceLock=function(s){const r=_sr.apply(this,arguments);if(r)return r;const tpl=T.game&&T.game.template;if(!tpl||!s)return null;const f=tplFields(tpl).find(f=>f.type==='select'&&/ra[cç]a|esp[eé]cie|ancestral/i.test(f.label));const c=f&&choiceById(f,(s.values||{})[f.id]);if(!c)return null;const n=norm(c.name);return /ciborg|cyborg/.test(n)?'ciborgue':/androi|sintet/.test(n)?'androide':null}}
{const _dm=drawMarks;drawMarks=function(x,L,R,cx,cy,hw,hh,jaw,skin){_dm.apply(this,arguments);if(!R.cyber&&!R.android&&!['circuito','codigo'].includes(L.marks))return;
 x.save();x.clip(facePath(cx,cy,hw,hh,jaw));
 if(R.android){x.strokeStyle=rgba(shade(skin,-.45),.55);x.lineWidth=1;x.beginPath();x.moveTo(cx,cy-hh);x.lineTo(cx,cy-hh*.62);x.moveTo(cx-hw*.95,cy+hh*.05);x.quadraticCurveTo(cx-hw*.6,cy+hh*.12,cx-hw*.48,cy+hh*.5);x.moveTo(cx+hw*.95,cy+hh*.05);x.quadraticCurveTo(cx+hw*.6,cy+hh*.12,cx+hw*.48,cy+hh*.5);x.moveTo(cx-hw*.3,cy+hh*.78);x.lineTo(cx+hw*.3,cy+hh*.78);x.stroke()}
 if(R.cyber){const p=new Path2D();p.moveTo(cx+hw*.12,cy-hh*.62);p.lineTo(cx+hw*1.05,cy-hh*.5);p.lineTo(cx+hw*1.05,cy+hh*.42);p.lineTo(cx+hw*.55,cy+hh*.5);p.lineTo(cx+hw*.18,cy+hh*.12);p.closePath();const g=x.createLinearGradient(cx,cy-hh*.6,cx+hw,cy+hh*.4);g.addColorStop(0,'#c7ccd6');g.addColorStop(.5,'#7d8594');g.addColorStop(1,'#3c424d');x.fillStyle=g;x.fill(p);x.strokeStyle='#22262e';x.lineWidth=1.5;x.stroke(p);
  x.fillStyle='#2a2e36';[[.4,-.48],[.92,-.38],[.92,.3],[.5,.38],[.28,.02]].forEach(([a,b])=>{x.beginPath();x.arc(cx+hw*a,cy+hh*b,1.6,0,7);x.fill()});x.strokeStyle=rgba('#22262e',.7);x.lineWidth=1;x.beginPath();x.moveTo(cx+hw*.6,cy-hh*.55);x.lineTo(cx+hw*.75,cy+hh*.46);x.stroke()}
 if(L.marks==='circuito'){const col=L.accent&&CY_OUTFITS.includes(L.outfit)?L.accent:CYN.c;x.strokeStyle=col;x.lineWidth=1.4;x.shadowColor=col;x.shadowBlur=5;x.beginPath();x.moveTo(cx-hw*.95,cy+hh*.1);x.lineTo(cx-hw*.6,cy+hh*.1);x.lineTo(cx-hw*.5,cy+hh*.28);x.lineTo(cx-hw*.3,cy+hh*.28);x.moveTo(cx-hw*.8,cy-hh*.5);x.lineTo(cx-hw*.55,cy-hh*.5);x.lineTo(cx-hw*.45,cy-hh*.38);x.stroke();x.fillStyle=col;[[-.3,.28],[-.45,-.38]].forEach(([a,b])=>{x.beginPath();x.arc(cx+hw*a,cy+hh*b,1.8,0,7);x.fill()})}
 else if(L.marks==='codigo'){x.fillStyle=rgba('#111',.7);let px=cx-hw*.85;for(let i=0;i<12;i++){const w=i%3===0?2.2:1;x.fillRect(px,cy+hh*.05,w,hh*.16);px+=w+1.4}}
 x.restore()}}
function cyBody(cx,hw,ny,by){const b=new Path2D();b.moveTo(cx-hw*.42,ny);b.quadraticCurveTo(cx-hw*.5,ny+16,cx-92,ny+30);b.lineTo(cx-104,by);b.lineTo(cx+104,by);b.lineTo(cx+92,ny+30);b.quadraticCurveTo(cx+hw*.5,ny+16,cx+hw*.42,ny);b.closePath();return b}
{const _do=drawOutfit;drawOutfit=function(x,L,cx,cy,hw,hh,phase){const o=L.outfit;if(!CY_OUTFITS.includes(o))return _do.apply(this,arguments);if(phase==='back')return;
 const col=L.outfitColor||'#141a2e',ac=L.accent||CYN.c,ny=cy+hh*.86,by=240,body=cyBody(cx,hw,ny,by);
 const g=x.createLinearGradient(cx-100,ny,cx+100,by);g.addColorStop(0,shade(col,.18));g.addColorStop(.6,col);g.addColorStop(1,shade(col,-.5));x.fillStyle=g;x.fill(body);
 x.save();x.clip(body);const glowLine=(pts,w=2.2)=>{x.save();x.strokeStyle=ac;x.lineWidth=w;x.shadowColor=ac;x.shadowBlur=8;x.beginPath();pts.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.stroke();x.restore()};
 if(o==='jaqueta'){x.fillStyle=shade(col,-.35);x.beginPath();x.moveTo(cx-hw*.55,ny-6);x.lineTo(cx-hw*.2,ny+30);x.lineTo(cx-hw*.65,ny+18);x.fill();x.beginPath();x.moveTo(cx+hw*.55,ny-6);x.lineTo(cx+hw*.2,ny+30);x.lineTo(cx+hw*.65,ny+18);x.fill();
  x.fillStyle='#0a0a0e';x.beginPath();x.moveTo(cx-hw*.2,ny+30);x.lineTo(cx,ny+18);x.lineTo(cx+hw*.2,ny+30);x.lineTo(cx+6,by);x.lineTo(cx-6,by);x.fill();
  glowLine([[cx-hw*.2,ny+30],[cx-4,by]]);glowLine([[cx-96,ny+40],[cx-60,ny+30]],3);glowLine([[cx+96,ny+40],[cx+60,ny+30]],3);x.fillStyle=shade(col,.3);[-1,1].forEach(sd=>{x.beginPath();x.ellipse(cx+sd*84,ny+44,24,16,sd*.3,0,7);x.fill()})}
 else if(o==='corpo'){x.fillStyle='#ececf2';x.beginPath();x.moveTo(cx-hw*.3,ny);x.lineTo(cx,ny+44);x.lineTo(cx+hw*.3,ny);x.fill();x.fillStyle=ac;x.beginPath();x.moveTo(cx-5,ny+8);x.lineTo(cx+5,ny+8);x.lineTo(cx+7,ny+50);x.lineTo(cx,ny+58);x.lineTo(cx-7,ny+50);x.fill();
  x.fillStyle=shade(col,-.3);[-1,1].forEach(sd=>{x.beginPath();x.moveTo(cx+sd*hw*.32,ny-2);x.lineTo(cx+sd*8,ny+60);x.lineTo(cx+sd*hw*.7,ny+22);x.fill()});x.fillStyle=CYN.c;x.globalAlpha=.8;x.fillRect(cx+40,ny+38,14,3);x.globalAlpha=1}
 else if(o==='tatico'){x.fillStyle=shade(col,-.2);x.fillRect(cx-70,ny+20,140,by-ny);x.strokeStyle='#0c0d0a';x.lineWidth=1.5;for(let i=0;i<3;i++){x.strokeRect(cx-60+i*42,ny+60,34,24)}x.fillStyle='#0e0f0c';x.fillRect(cx-74,ny+18,16,by-ny);x.fillRect(cx+58,ny+18,16,by-ny);
  x.fillStyle=ac;x.fillRect(cx-58,ny+28,30,5);x.save();x.globalAlpha=.25;x.strokeStyle='#000';x.lineWidth=1;for(let i=0;i<6;i++)for(let j=0;j<3;j++){x.beginPath();const hx=cx-50+i*20+(j%2)*10,hy=ny+40+j*14;for(let q=0;q<6;q++){const an=q/6*Math.PI*2;x.lineTo(hx+Math.cos(an)*6,hy+Math.sin(an)*6)}x.closePath();x.stroke()}x.restore()}
 else if(o==='netrunner'){glowLine([[cx-hw*.42,ny],[cx-30,ny+30],[cx-30,ny+60],[cx-60,ny+80]],1.6);glowLine([[cx+hw*.42,ny],[cx+30,ny+30],[cx+30,ny+70],[cx+66,ny+86]],1.6);glowLine([[cx,ny+12],[cx,by]],1.6);
  x.fillStyle=ac;[[cx-30,ny+60],[cx+30,ny+70],[cx,ny+40]].forEach(([a,b])=>{x.beginPath();x.arc(a,b,3,0,7);x.fill()});x.strokeStyle='#222';x.lineWidth=3;x.beginPath();x.moveTo(cx-hw*.3,ny-4);x.bezierCurveTo(cx-70,ny+10,cx-90,ny+40,cx-100,by);x.stroke()}
 x.fillStyle=rgba('#b0e0ff',.06);x.fillRect(cx-104,ny,90,by-ny);x.restore();x.strokeStyle=rgba('#000',.6);x.lineWidth=1.5;x.stroke(body)}}
{const _dp=drawPortrait;drawPortrait=function(x,L,W,H){_dp.apply(this,arguments);try{if(L.img&&L.img.src)return;const R=raceOf(L),a=L.acc,cyAcc=CY_ACC.includes(a);if(!cyAcc&&!R.cyber&&!R.android)return;
 const cx=100,cy=100,hw=R.hw*(L.body==='f'&&!R.dragon?.94:1),hh=R.hh,ey=cy-hh*.1,ew=hw*.27;x.save();x.scale(W/200,H/240);
 const glow=(col,b)=>{x.shadowColor=col;x.shadowBlur=b};
 if(R.cyber&&a!=='visor'&&a!=='oculos'){x.save();glow(CYN.r,10);x.fillStyle=rgba(CYN.r,.9);x.beginPath();x.arc(cx+hw*.42,ey,ew*.32,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(cx+hw*.42,ey,ew*.1,0,7);x.fill();x.restore()}
 if(R.android){x.save();glow(CYN.c,8);x.strokeStyle=CYN.c;x.lineWidth=2.4;x.beginPath();x.arc(cx-hw*.82,cy-hh*.36,5,0,7);x.stroke();x.restore()}
 if(a==='visor'){x.save();const p=new Path2D(),y0=ey-ew*.6,h0=ew*1.2;if(p.roundRect)p.roundRect(cx-hw*1.04,y0,hw*2.08,h0,h0/2);else p.rect(cx-hw*1.04,y0,hw*2.08,h0);x.fillStyle=rgba(CYN.c,.32);x.fill(p);glow(CYN.c,10);x.strokeStyle=CYN.c;x.lineWidth=2;x.stroke(p);x.shadowBlur=0;x.strokeStyle=rgba('#fff',.7);x.lineWidth=1;x.beginPath();x.moveTo(cx-hw*.8,ey-ew*.2);x.lineTo(cx-hw*.4,ey-ew*.2);x.moveTo(cx+hw*.3,ey+ew*.25);x.lineTo(cx+hw*.75,ey+ew*.25);x.stroke();x.restore()}
 else if(a==='oculos'){x.save();[-1,1].forEach(sd=>{const lx=cx+sd*hw*.42,g=x.createLinearGradient(lx-ew,ey-ew*.5,lx+ew,ey+ew*.5);g.addColorStop(0,'#0b0b12');g.addColorStop(.55,'#1d1030');g.addColorStop(.62,rgba(CYN.m,.8));g.addColorStop(.7,'#101020');g.addColorStop(1,rgba(CYN.c,.6));x.fillStyle=g;x.beginPath();x.ellipse(lx,ey,ew*1.05,ew*.62,0,0,7);x.fill();x.strokeStyle='#050507';x.lineWidth=2;x.stroke()});x.strokeStyle='#050507';x.lineWidth=2.5;x.beginPath();x.moveTo(cx-hw*.42+ew,ey);x.lineTo(cx+hw*.42-ew,ey);x.moveTo(cx-hw*.42-ew,ey);x.lineTo(cx-hw*1.02,ey-2);x.moveTo(cx+hw*.42+ew,ey);x.lineTo(cx+hw*1.02,ey-2);x.stroke();x.restore()}
 else if(a==='implante'){x.save();glow(CYN.c,6);x.fillStyle=CYN.c;[0,1,2].forEach(i=>{x.beginPath();x.arc(cx-hw*.78,cy+hh*(-.05+i*.13),2.1,0,7);x.fill()});x.shadowBlur=0;x.fillStyle='#2a2e36';x.strokeStyle='#8a92a0';x.lineWidth=1;x.beginPath();x.arc(cx-hw*.92,cy+hh*.42,4,0,7);x.fill();x.stroke();x.restore()}
 else if(a==='mascara'){x.save();const my=cy+hh*.45,p=new Path2D();p.ellipse(cx,my,hw*.55,hh*.32,0,0,7);x.fillStyle='#1b1d24';x.fill(p);x.strokeStyle='#3a3e4a';x.lineWidth=1.5;x.stroke(p);[-1,1].forEach(sd=>{x.fillStyle='#2b2f3a';x.beginPath();x.arc(cx+sd*hw*.38,my+hh*.08,hw*.17,0,7);x.fill();x.strokeStyle=rgba(L.accent||CYN.c,.9);x.lineWidth=1.4;x.stroke()});x.strokeStyle='#0c0d12';x.lineWidth=1;for(let i=-2;i<=2;i++){x.beginPath();x.moveTo(cx+i*4,my-hh*.1);x.lineTo(cx+i*4,my+hh*.16);x.stroke()}x.restore()}
 else if(a==='fones'){x.save();x.strokeStyle='#15161c';x.lineWidth=6;x.beginPath();x.ellipse(cx,cy-hh*.1,hw*1.1,hh*1.08,0,Math.PI*1.08,Math.PI*1.92);x.stroke();[-1,1].forEach(sd=>{x.fillStyle='#1d1f27';x.beginPath();x.ellipse(cx+sd*hw*1.06,cy+hh*.05,hw*.2,hh*.24,0,0,7);x.fill();glow(L.accent||CYN.m,8);x.strokeStyle=L.accent||CYN.m;x.lineWidth=2;x.beginPath();x.ellipse(cx+sd*hw*1.06,cy+hh*.05,hw*.12,hh*.15,0,0,7);x.stroke();x.shadowBlur=0});x.restore()}
 x.restore()}catch(e){console.warn('retrato cyber',e)}}}
/* ---------- ficha pronta ---------- */
TPL_PRESETS.cyber=['Cyberpunk (neon e implantes)',[
 ['Identidade',[['Espécie','select',{pick:true,choices:[['Humano','Carne e osso, com poucos implantes.',{}],['Ciborgue','Metade máquina: mais resistente, menos humano.',{'Vigor':'14','Humanidade':'7'}],['Androide','Sintético que aprendeu a sentir.',{'Inteligência':'14','Técnica':'13'}]]}],
  ['Classe','select',{pick:true,choices:[['Solo','Mercenário de rua, mestre do combate.',{'Força':'15','Vigor':'14','Vida':'14'}],['Netrunner','Hacker que mergulha na rede e frita circuitos.',{'Inteligência':'16','Energia (RAM)':'12'}],['Techie','Conserta, monta e explode qualquer máquina.',{'Técnica':'16','Inteligência':'13'}],
   ['Medtech','Médico de rua: mantém o grupo vivo.',{'Técnica':'14','Inteligência':'14'}],['Fixer','Negocia, consegue tudo, conhece todo mundo.',{'Carisma':'16','Agilidade':'13'}],['Nômade','Piloto das estradas e atirador certeiro.',{'Agilidade':'15','Vigor':'13'}]]}],
  ['Apelido de rua','text'],['Nível','number',{def:1}]]],
 ['Status',[['Vida','bar',{max:12,master:true}],['Energia (RAM)','bar',{max:8,master:true}],['Humanidade','bar',{max:10,master:true}],['Defesa','number',{def:12}],['Deslocamento','text',{def:'9 m'}]]],
 ['Atributos',[['Força','attr',{def:10}],['Agilidade','attr',{def:10}],['Vigor','attr',{def:10}],['Inteligência','attr',{def:10}],['Técnica','attr',{def:10}],['Carisma','attr',{def:10}]]],
 ['Implantes e contatos',[['Cyberware','textarea'],['Contatos','textarea'],['Perícias','textarea']]],
 ['História',[['Aparência','textarea'],['Passado','textarea']]]]];
/* ---------- conteúdo: armas, implantes, hacks e inimigos ---------- */
function addCyberKit(){const g=T.game,r=RULES(),items=cl(g.items||[]),skills=cl(g.skills||[]),chars=cl(g.chars||[]),hpL=r.hp?fById(r.hp).label:'Vida',mpL=r.mp?fById(r.mp).label:hpL;
 const I0=(name,icon,type,o)=>{let e=items.find(x=>x.name===name);if(!e){e={id:uid(),name,icon,type,weight:'',value:'',desc:'',...o};items.push(e)}return e.id};
 const S0=(name,icon,type,o)=>{let e=skills.find(x=>x.name===name);if(!e){e={id:uid(),name,icon,type,cost:'',...o};skills.push(e)}return e.id};
 const F=attrLab('FOR'),D=attrLab('DES'),N=attrLab('INT');
 const it={pistola:I0('Pistola inteligente','🔫','Arma',{dmg:'1d8',atk:D,range:'12',effect:'1d8 + DES, alcance 12',weight:1,value:'150 eb',desc:'Mira assistida por chip.'}),
  rifle:I0('Rifle de assalto','🔫','Arma',{dmg:'2d6',atk:D,range:'20',effect:'2d6 + DES, alcance 20',weight:4,value:'500 eb'}),
  escopeta:I0('Escopeta de choque','💥','Arma',{dmg:'2d8',atk:D,range:'5',effect:'2d8 + DES, alcance 5',weight:4,value:'400 eb'}),
  katana:I0('Katana monomolecular','🗡️','Arma',{dmg:'1d10',atk:F,effect:'1d10 + FOR, corta aço',weight:2,value:'600 eb'}),
  mantis:I0('Lâminas Mantis','🦾','Arma',{dmg:'1d8',atk:F,effect:'1d8 + FOR, lâminas que saem do braço',weight:0,value:'900 eb'}),
  taser:I0('Taser','⚡','Arma',{dmg:'1d6',atk:D,range:'4',effect:'1d6 + DES, alcance 4',weight:1,value:'80 eb'}),
  emp:I0('Granada EMP','💣','Consumível',{dmg:'3d6',effect:'3d6 em máquinas, drones e ciborgues',weight:.5,value:'200 eb'}),
  injetor:I0('Injetor de cura','💉','Consumível',{heal:'2d4+2',healBar:hpL,effect:'Recupera 2d4+2 de '+hpL,weight:.2,value:'100 eb'}),
  stim:I0('Stim de RAM','💊','Consumível',{heal:'2d4',healBar:mpL,effect:'Recupera 2d4 de '+mpL,weight:.1,value:'80 eb'}),
  deck:I0('Deck de netrunner','💻','Equipamento',{slot:'Acessório',effect:'Permite hackear sistemas à distância',weight:1,value:'700 eb'}),
  jaqueta:I0('Jaqueta blindada','🧥','Armadura',{slot:'Armadura',ac:12,acDex:'DES completa',effect:'Defesa 12 + DES',weight:3,value:'300 eb'}),
  colete:I0('Colete tático','🦺','Armadura',{slot:'Armadura',ac:14,acDex:'DES até +2',effect:'Defesa 14 + DES (máx. 2)',weight:8,value:'650 eb'}),
  kiroshi:I0('Olhos Kiroshi','👁️','Equipamento',{slot:'Acessório',acBonus:1,effect:'+1 Defesa (visão térmica e zoom)',value:'800 eb'}),
  metralha:I0('Metralhadora acoplada','🔩','Arma',{dmg:'1d8',atk:D,range:'10',natural:true,effect:'Arma do drone'})};
 const sk={hack:S0('Hackear sistema','💻','Ativa',{dmg:'2d6',atk:N,mp:2,range:'12',effect:'Frita os circuitos do alvo: 2d6'}),curto:S0('Curto-circuito','⚡','Ativa',{dmg:'3d4',atk:'— (acerta sempre)',mp:3,range:'8',effect:'3d4, nunca erra'}),
  tiro:S0('Tiro certeiro','🎯','Ativa',{dmg:'2d8',atk:D,mp:2,range:'16',effect:'2d8 à distância'}),lamina:S0('Dança das lâminas','🌀','Ativa',{dmg:'2d8',atk:F,mp:2,range:'1',effect:'2d8 corpo a corpo'}),
  adren:S0('Adrenalina sintética','⏱️','Ativa',{heal:'1d10',atk:'— (acerta sempre)',mp:2,range:'0',effect:'Recupera 1d10 em si mesmo'}),socorro:S0('Primeiros socorros','🩹','Ativa',{heal:'1d8',atk:N,mp:2,range:'1',effect:'Cura 1d8 + INT ao tocar'}),
  camu:S0('Camuflagem óptica','👻','Passiva',{effect:'Fica quase invisível por 1 minuto (vantagem em furtividade)'})};
 const tpl=cl(g.template),cls=tplFields(tpl).find(f=>f.type==='select'&&/classe|arqu[eé]tipo|ocupa/i.test(f.label));let linked=0;
 const kit={solo:[[it.katana,1],[it.colete,1],[it.injetor,1]],netrunner:[[it.pistola,1],[it.deck,1],[it.stim,2]],techie:[[it.taser,1],[it.jaqueta,1],[it.emp,2]],medtech:[[it.pistola,1],[it.injetor,3]],fixer:[[it.pistola,1],[it.jaqueta,1]],'nômade':[[it.rifle,1],[it.jaqueta,1]],nomade:[[it.rifle,1],[it.jaqueta,1]]};
 const ksk={solo:[sk.lamina,sk.adren],netrunner:[sk.hack,sk.curto],techie:[sk.curto],medtech:[sk.socorro],fixer:[sk.tiro],'nômade':[sk.tiro],nomade:[sk.tiro]};
 if(cls)(cls.choices||[]).forEach(c=>{const k=String(c.name).toLowerCase();if(kit[k]&&!(c.items||[]).length){c.items=kit[k].map(([item,qty])=>({item,qty}));linked++}if(ksk[k]&&!(c.skills||[]).length){c.skills=ksk[k].slice();linked++}});
 const Fs=tplFields(tpl),vals=o=>{const v=defaultValues(tpl);if(r.hp)v[r.hp]={cur:o.hp,max:o.hp};if(r.def){const f=Fs.find(x=>x.id===r.def);v[r.def]=f&&f.type==='text'?String(o.def):o.def}Object.entries(o.a||{}).forEach(([k,n])=>{const f=fByRe(ALIAS[k],['attr','number']);if(f)v[f.id]=f.type==='attr'?n:Math.max(1,Math.round((n-6)/3))});return v};
 const M=[['Ganguista','🦹','#c2185b',{hp:9,def:12,a:{FOR:12,DES:13,CON:11}},[it.pistola],50],['Drone de segurança','🛸','#607d8b',{hp:8,def:14,a:{DES:15,CON:10}},[it.metralha],50],['Agente corporativo','🕴️','#37474f',{hp:14,def:13,a:{DES:14,INT:14,CON:12}},[it.pistola],100],['Ciborgue de aluguel','🤖','#455a64',{hp:24,def:15,a:{FOR:16,DES:12,CON:16}},[it.mantis],200],['Ciberpsicopata','😈','#b71c1c',{hp:55,def:15,a:{FOR:18,DES:14,CON:16}},[it.mantis,it.escopeta],700]];
 let nm=0;M.forEach(([name,emoji,color,st,weap,xp])=>{if(chars.some(c=>c.name===name&&!c.clone))return;chars.push({id:uid(),name,kind:'npc',emoji,color,values:vals(st),skills:[],inv:weap.map(item=>({k:uid(),item,qty:1})),token:null,xp,coins:Math.round(xp/2)});nm++});
 return {items,skills,chars,template:tpl,it,linked,nm}}
function cyDemoMap(){const m=newMapObj('Distrito Neon','cyber','city',36,26);
 m.objs=[{id:uid(),k:'🚗',x:6,y:1},{id:uid(),k:'🚗',x:20,y:2},{id:uid(),k:'🏍️',x:1,y:9},{id:uid(),k:'🍜',x:5,y:4},{id:uid(),k:'🏮',x:16,y:3},{id:uid(),k:'🚧',x:13,y:11},{id:uid(),k:'🤖',x:27,y:15},{id:uid(),k:'📦',x:9,y:16},{id:uid(),k:'🚨',x:25,y:21}];
 m.labels=[{id:uid(),t:'NEON 24H',x:7,y:3},{id:uid(),t:'Mercado negro',x:20,y:15},{id:uid(),t:'Torre Arasaka',x:31,y:6}];
 m.fogOn=false;return m}
/* ---------- Mestre → Campanha: aplicar o tema ---------- */
{const _mc=MR.camp;MR.camp=function(...a){const r=_mc.apply(this,a);try{const pad=$('#tMain .tpad');if(!pad||$('#cyCard'))return r;const isCy=tplFields(T.game.template).some(f=>(f.choices||[]).some(c=>/netrunner/i.test(c.name)));
 pad.insertAdjacentHTML('beforeend',`<div class="card cy-card" id="cyCard" style="margin-top:14px"><h3>🌃 Tema cyberpunk</h3><p class="small muted" style="margin-top:0">Prepara a mesa para uma campanha na cidade neon. Os mapas ganham o estilo <b>Cyberpunk neon</b> (Mestre → Mapas → Novo mapa) e os personagens ganham espécies, roupas, implantes e cores neon na aparência.</p>
  <label class="ckrow"><input type="checkbox" id="cyTpl" ${isCy?'':'checked'}> Ficha Cyberpunk — classes Solo, Netrunner, Techie, Medtech, Fixer e Nômade; espécies Humano, Ciborgue e Androide; Vida, RAM e Humanidade${isCy?' <span class="pill">já em uso</span>':''}</label>
  <label class="ckrow"><input type="checkbox" id="cyKit" checked> Armas, implantes e hacks (pistola inteligente, katana monomolecular, lâminas Mantis, deck de netrunner…) e inimigos (gangue, drone, agente corporativo, ciborgue, ciberpsicopata)</label>
  <label class="ckrow"><input type="checkbox" id="cyShop" checked> Loja <b>Mercado negro</b> (moeda: eb · personagem novo começa com 500)</label>
  <label class="ckrow"><input type="checkbox" id="cyMap" checked> Mapa de exemplo <b>Distrito Neon</b> (ruas, prédios, letreiros)</label>
  <button class="btn primary" id="cyGo">🌃 Aplicar tema cyberpunk</button></div>`);
 $('#cyGo').onclick=async()=>{const o={tpl:$('#cyTpl').checked,kit:$('#cyKit').checked,shop:$('#cyShop').checked,map:$('#cyMap').checked};if(!Object.values(o).some(Boolean))return;
  if(o.tpl&&!isCy&&T.seats.length&&!await confirmDlg('Trocar a ficha pelo modelo Cyberpunk? Valores dos jogadores em campos que deixarem de existir serão perdidos.','Trocar ficha'))return;
  const patch={cyber:true};if(o.tpl&&!isCy){patch.template=presetTpl('cyber');gamePatch(patch)}else gamePatch(patch);
  const done=[];let kit=null;
  if(o.kit||o.shop){kit=addCyberKit();const p={items:kit.items,skills:kit.skills};if(o.kit){p.chars=kit.chars;p.template=kit.template}gamePatch(p);if(o.kit)done.push(`conteúdo${kit.nm?` (${kit.nm} inimigos)`:''}`)}
  if(o.tpl&&!isCy)done.unshift('ficha Cyberpunk');
  if(o.shop&&kit){const I=kit.it,list=cl(shopsOf());if(!list.some(s=>s.name==='Mercado negro')){list.push({id:uid(),icon:'🏴',name:'Mercado negro',keeper:'Madame Kei',desc:'Armas, implantes e stims — sem perguntas.',open:false,ratio:.4,items:[[I.pistola,150],[I.rifle,500],[I.katana,600],[I.mantis,900],[I.taser,80],[I.emp,200],[I.injetor,100],[I.stim,80],[I.deck,700],[I.jaqueta,300],[I.colete,650],[I.kiroshi,800]].map(([item,price])=>({item,price,stock:INF}))});
    saveShops(list,{coinName:T.game.coinName||'eb',startCoins:T.game.startCoins||500})}done.push('loja Mercado negro')}
  if(o.map){const m=cyDemoMap();T.maps[m.id]=cl(m);sharedWrite('games/'+T.gid+'/maps/'+m.id,{set:cl(m)});if(!T.game.activeMap)gamePatch({activeMap:m.id});done.push('mapa Distrito Neon')}
  toast('🌃 Tema cyberpunk aplicado: '+done.join(', '));MR.camp()}}catch(e){console.warn('cyber',e)}return r}}
