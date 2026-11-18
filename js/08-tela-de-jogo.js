/* ============ v7: tela de jogo, dados animados, portas cinematográficas ============ */
/* --- sons sintetizados (sem arquivos) --- */
const SND={ctx:null};const sndOn=()=>S.prefs.sound!==false;
function ac(){if(!sndOn())return null;try{SND.ctx=SND.ctx||new(window.AudioContext||window.webkitAudioContext)();if(SND.ctx.state==='suspended')SND.ctx.resume();return SND.ctx}catch{return null}}
function sNoise(t0,dur,freq,gain,q=1.2){const c=ac();if(!c)return;const n=Math.max(1,Math.floor(c.sampleRate*dur)),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3);const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=freq;f.Q.value=q;const g=c.createGain();g.gain.value=gain;s.connect(f).connect(g).connect(c.destination);s.start(c.currentTime+t0)}
const sClack=t=>sNoise(t,.05,2000+Math.random()*1800,.45,2);
const sThud=(t,v=.9)=>sNoise(t,.22,110,v,.8);
function sCreak(t0,dur){const c=ac();if(!c)return;const now=c.currentTime+t0,o=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain(),l=c.createOscillator(),lg=c.createGain();o.type='sawtooth';f.type='bandpass';f.Q.value=9;
 o.frequency.setValueAtTime(85,now);o.frequency.linearRampToValueAtTime(150,now+dur*.35);o.frequency.linearRampToValueAtTime(95,now+dur*.7);o.frequency.linearRampToValueAtTime(60,now+dur);f.frequency.setValueAtTime(800,now);f.frequency.linearRampToValueAtTime(1500,now+dur);
 g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(.11,now+.25);g.gain.setValueAtTime(.11,now+dur-.35);g.gain.linearRampToValueAtTime(0,now+dur);l.frequency.value=11;lg.gain.value=.05;l.connect(lg).connect(g.gain);o.connect(f).connect(g).connect(c.destination);o.start(now);l.start(now);o.stop(now+dur+.05);l.stop(now+dur+.05)}
function sChime(t0,gold){const c=ac();if(!c)return;[0,.09,.18].forEach((d,i)=>{const o=c.createOscillator(),g=c.createGain(),now=c.currentTime+t0+d;o.type='triangle';o.frequency.value=gold?[660,880,1320][i]:[220,185,147][i];g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.12,now+.02);g.gain.exponentialRampToValueAtTime(.0001,now+.6);o.connect(g).connect(c.destination);o.start(now);o.stop(now+.65)})}

/* --- dados animados no centro do mapa, para todos --- */
const DQ=[];let diceBusy=false;
function diceQueue(r){DQ.push(r);if(DQ.length>3)DQ.splice(0,DQ.length-3);if(!diceBusy)nextDice()}
function nextDice(){const r=DQ.shift();if(!r){diceBusy=false;return}diceBusy=true;playDice(r,nextDice)}
function diePath(x,f,s){x.beginPath();const P=(n,rot=-Math.PI/2,k=1)=>{for(let i=0;i<n;i++){const a=rot+i*Math.PI*2/n;i?x.lineTo(Math.cos(a)*s*k,Math.sin(a)*s*k):x.moveTo(Math.cos(a)*s*k,Math.sin(a)*s*k)}x.closePath()};
 if(f===4)P(3,-Math.PI/2,1.12);else if(f===6){const r=s*.82,c=s*.18;x.moveTo(-r+c,-r);x.arcTo(r,-r,r,r,c);x.arcTo(r,r,-r,r,c);x.arcTo(-r,r,-r,-r,c);x.arcTo(-r,-r,r,-r,c);x.closePath()}
 else if(f===8)P(4,-Math.PI/2,1.05);else if(f===10||f===100){x.moveTo(0,-s);x.lineTo(s*.9,-s*.1);x.lineTo(0,s);x.lineTo(-s*.9,-s*.1);x.closePath()}else if(f===12)P(5,-Math.PI/2,1);else if(f===20)P(6,-Math.PI/2,1);else{x.arc(0,0,s*.9,0,Math.PI*2)}}
function drawDie(x,f,v,cx,cy,s,rot,col,glow){x.save();x.translate(cx,cy);x.rotate(rot);
 x.save();x.shadowColor='rgba(0,0,0,.55)';x.shadowBlur=s*.35;x.shadowOffsetY=s*.18;diePath(x,f,s);const g=x.createLinearGradient(-s,-s,s,s);g.addColorStop(0,shade(col,.45));g.addColorStop(.5,col);g.addColorStop(1,shade(col,-.45));x.fillStyle=g;x.fill();x.restore();
 if(glow){x.save();x.shadowColor=glow;x.shadowBlur=s*.7;diePath(x,f,s);x.strokeStyle=glow;x.lineWidth=s*.08;x.stroke();x.restore()}
 diePath(x,f,s);x.strokeStyle=shade(col,-.6);x.lineWidth=Math.max(1.5,s*.05);x.stroke();
 x.save();diePath(x,f,s);x.clip();x.strokeStyle='rgba(255,255,255,.22)';x.lineWidth=Math.max(1,s*.03);x.beginPath();
 if(f===20){for(let i=0;i<3;i++){const a=-Math.PI/2+i*Math.PI*2/3;x.moveTo(Math.cos(a)*s*.62,Math.sin(a)*s*.62);x.lineTo(Math.cos(a+Math.PI*2/3)*s*.62,Math.sin(a+Math.PI*2/3)*s*.62)}for(let i=0;i<6;i++){const a=-Math.PI/2+i*Math.PI/3;x.moveTo(Math.cos(a)*s,Math.sin(a)*s);x.lineTo(Math.cos(a+(i%2?Math.PI/3:-Math.PI/3))*s*.62*0+Math.cos(-Math.PI/2+Math.round(i/2)%3*Math.PI*2/3)*s*.62,Math.sin(-Math.PI/2+Math.round(i/2)%3*Math.PI*2/3)*s*.62)}}
 else if(f===8){x.moveTo(-s*1.05,0);x.lineTo(s*1.05,0)}else if(f===10||f===100){x.moveTo(-s*.9,-s*.1);x.lineTo(0,s*.25);x.lineTo(s*.9,-s*.1);x.moveTo(0,s*.25);x.lineTo(0,s)}else if(f===12){for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;x.moveTo(Math.cos(a)*s,Math.sin(a)*s);x.lineTo(Math.cos(a)*s*.58,Math.sin(a)*s*.58)}}
 x.stroke();x.fillStyle='rgba(255,255,255,.18)';x.beginPath();x.ellipse(-s*.3,-s*.38,s*.35,s*.16,-.5,0,Math.PI*2);x.fill();x.restore();
 const txt=f===100?String(v).padStart(2,'0'):String(v);x.font=`800 ${Math.round(s*(txt.length>2?.42:f===4?.5:.58))}px Cinzel,Georgia,serif`;x.textAlign='center';x.textBaseline='middle';x.lineWidth=s*.09;x.strokeStyle='rgba(0,0,0,.75)';x.lineJoin='round';const ty=f===4?s*.22:f===10||f===100?-s*.12:s*.03;x.strokeText(txt,0,ty);x.fillStyle=glow==='#ffd34a'?'#fff4c2':'#fff';x.fillText(txt,0,ty);
 if(v===6||v===9)if(f!==6&&f!==4){x.fillRect(-s*.18,ty+s*.32,s*.36,s*.05)}
 x.restore()}
function playDice(r,done){
 const host=$('#mapScroll')||$('#play')||$('#tMain'),rect=host?host.getBoundingClientRect():{left:0,top:0,width:innerWidth,height:innerHeight};
 const cv=document.createElement('canvas');cv.className='fx-over';document.body.appendChild(cv);const dpr=Math.min(2,window.devicePixelRatio||1),W=innerWidth,H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;const x=cv.getContext('2d');x.scale(dpr,dpr);
 const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2-20,all=(r.dice&&r.dice.length?r.dice:[{f:20,v:r.v}]),dice=all.slice(0,6),extra=all.length-dice.length;
 const s=clamp(Math.min(rect.width,rect.height)*.12,34,78),cols=Math.min(dice.length,3),gap=s*2.35;
 const col=r.color||'#8b3a2b',nat20=r.res?r.res==='crit':dice.length===1&&dice[0].f===20&&dice[0].v===20,nat1=r.res?r.res==='fumble':dice.length===1&&dice[0].f===20&&dice[0].v===1,glow=nat20?'#ffd34a':nat1?'#ff3b30':null;
 const D=dice.map((d,i)=>{const row=Math.floor(i/3),inRow=Math.min(3,dice.length-row*3),c=i%3;return{...d,tx:cx+(c-(inRow-1)/2)*gap,ty:cy+(row-(Math.ceil(dice.length/3)-1)/2)*gap*.95,sx:cx+(i%2?1:-1)*(rect.width*.55+Math.random()*80),sy:cy+rect.height*.35+Math.random()*60,r0:Math.random()*6,spin:(Math.random()<.5?-1:1)*(10+Math.random()*8)}});
 [0.25,0.5,0.72,0.9,1.02].forEach((t,i)=>D.forEach((d,j)=>sClack(t+j*.03+Math.random()*.03)));if(glow)sChime(1.25,nat20);
 const T0=performance.now(),TUM=1150,END=3700;let photo=null;if(r.look)photo=tokenSprite(r.look,64);
 const frame=()=>{const t=performance.now()-T0;x.clearRect(0,0,W,H);
  const fade=t<200?t/200:t>END-450?Math.max(0,(END-t)/450):1;x.globalAlpha=fade;
  x.fillStyle=`rgba(0,0,0,${.32*fade})`;x.fillRect(0,0,W,H);
  if(glow&&t>TUM){const k=clamp((t-TUM)/500,0,1),g=x.createRadialGradient(cx,cy,10,cx,cy,Math.max(rect.width,rect.height)*.6*k+1);g.addColorStop(0,nat20?'rgba(255,210,80,.45)':'rgba(255,40,30,.4)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,W,H)}
  D.forEach(d=>{const p=clamp(t/TUM,0,1),e=1-Math.pow(1-p,3),px=d.sx+(d.tx-d.sx)*e,bounce=Math.abs(Math.sin(p*Math.PI*3.2))*(1-p)*s*2.4,py=d.sy+(d.ty-d.sy)*e-bounce,rot=d.r0+d.spin*(1-e)*(1-e)+(p>=1?0:0),settle=t>TUM?1+.28*Math.max(0,1-(t-TUM)/220):1;
   const shown=p<.88?1+Math.floor(Math.random()*d.f):d.v;x.fillStyle='rgba(0,0,0,.35)';x.beginPath();x.ellipse(px,d.ty+s*1.05,s*.9*(1-bounce/(s*4)),s*.22,0,0,Math.PI*2);x.fill();
   drawDie(x,d.f,shown,px,py,s*settle,p<1?rot:rot*(1-clamp((t-TUM)/200,0,1)),col,t>TUM?glow:null)});
  if(t>TUM+120){const k=clamp((t-TUM-120)/260,0,1),by=cy+Math.ceil(dice.length/3)*gap*.5+s*.9+(1-k)*20,bw=Math.min(rect.width*.94,r.tg?560:440),bh=s*1.35;x.globalAlpha=fade*k;
   x.fillStyle='rgba(12,9,7,.88)';x.strokeStyle=glow||'rgba(201,164,74,.8)';x.lineWidth=2;x.beginPath();if(x.roundRect)x.roundRect(cx-bw/2,by,bw,bh,14);else x.rect(cx-bw/2,by,bw,bh);x.fill();x.stroke();
   let lx=cx-bw/2+14;if(photo){x.save();x.beginPath();x.arc(lx+bh*.36,by+bh/2,bh*.36,0,Math.PI*2);x.clip();x.drawImage(photo,lx,by+bh*.14,bh*.72,bh*.72);x.restore();lx+=bh*.82}
   const bigS=String(r.big??r.v);x.font=`800 ${Math.round(bh*(bigS.length>3?.4:.62))}px Cinzel,Georgia,serif`;const avail=cx+bw/2-16-x.measureText(bigS).width-14-lx,fit=(t,px,w)=>{let p=px;x.font=`${w} ${p}px Inter,sans-serif`;while(p>9&&x.measureText(t).width>avail){p--;x.font=`${w} ${p}px Inter,sans-serif`}return p};
   const t1=(r.who||'')+(r.l?' · '+r.l:''),t2=(r.e||'')+(extra>0?` (+${extra} dados)`:'');x.textAlign='left';x.textBaseline='middle';x.fillStyle='#e8dcc4';fit(t1,Math.round(bh*.24),600);x.fillText(t1,lx,by+bh*.34);x.fillStyle='#a89a84';fit(t2,Math.round(bh*.2),400);x.fillText(t2,lx,by+bh*.68);
   const bigT=String(r.big??r.v);x.textAlign='right';x.font=`800 ${Math.round(bh*(bigT.length>3?.4:.62))}px Cinzel,Georgia,serif`;x.fillStyle=r.res==='miss'||r.res==='fumble'?'#b9a9a0':r.heal?'#7fe08a':glow||'#f1d58a';x.fillText(bigT,cx+bw/2-16,by+bh*.54);
   if(glow){x.textAlign='center';x.font=`800 ${Math.round(s*.55)}px Cinzel,Georgia,serif`;x.lineWidth=5;x.strokeStyle='rgba(0,0,0,.8)';const tt=nat20?'CRÍTICO!':'FALHA CRÍTICA!',yy=Math.max(rect.top+s*.8,cy-gap*.5-s*1.6);x.strokeText(tt,cx,yy);x.fillStyle=glow;x.fillText(tt,cx,yy)}}
  x.globalAlpha=1;if(t<END)requestAnimationFrame(frame);else{cv.remove();done&&done()}};
 requestAnimationFrame(frame);
}
function seedRolls(kind){if(kind==='seats'&&!T.seedS){T.seedS=true;T.seats.forEach(s=>(s.rolls||[]).forEach(r=>r.id&&T.seenRolls.add(r.id)))}
 if(kind==='game'&&!T.seedG&&T.game){T.seedG=true;(T.game.mrolls||[]).forEach(r=>r.id&&T.seenRolls.add(r.id));T.lastTrans=T.game.trans&&T.game.trans.id}}
function scanRolls(){if(!T.seedS||!T.seedG)return;const all=[...T.seats.flatMap(s=>(s.rolls||[]).map(r=>({...r,who:s.name||'Jogador',look:s.look,color:s.color}))),...(T.game.mrolls||[]).map(r=>{const c=r.npc&&(T.game.chars||[]).find(x=>x.id===r.npc);return{...r,who:r.n||'Mestre',look:c?c.look:undefined,color:c?c.color:'#8b3a2b'}})];
 all.filter(r=>r.id&&!T.seenRolls.has(r.id)).sort((a,b)=>a.t-b.t).forEach(r=>{T.seenRolls.add(r.id);diceQueue(r);try{missFloat(r)}catch{}})}

/* --- portas no estilo dos clássicos de terror (troca de cenário) --- */
function playDoor(name,done){
 if($('.fx-door'))return;sCreak(.75,2.4);sThud(.62,1);sThud(3.35,.7);sThud(3.75,.6);
 const cv=document.createElement('canvas');cv.className='fx-over fx-door';document.body.appendChild(cv);const dpr=Math.min(2,window.devicePixelRatio||1),W=innerWidth,H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;const x=cv.getContext('2d');x.scale(dpr,dpr);
 const hv=[...String(name||'')].reduce((a,c)=>a+c.charCodeAt(0),0),kind=['madeira','ferro','pedra'][hv%3],base={madeira:'#5a3a22',ferro:'#3d4148',pedra:'#55504a'}[kind];
 const T0=performance.now(),DUR=4500;const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
 const frame=()=>{const t=performance.now()-T0;x.setTransform(dpr,0,0,dpr,0,0);x.fillStyle='#000';x.fillRect(0,0,W,H);
  const cam=1+Math.pow(clamp((t-1000)/2600,0,1),1.6)*1.1,shake=t>600&&t<780?(Math.random()-.5)*6:0,open=ease(clamp((t-760)/2400,0,1))*1.45;
  const dh=Math.min(H*.6,W*1.05),dw=dh*.5;x.save();x.translate(W/2+shake,H*.52);x.scale(cam,cam);
  const inner=x.createRadialGradient(0,-dh*.05,4,0,0,dh*.7);const light=Math.sin(open/1.45*Math.PI/2);inner.addColorStop(0,`rgba(${60+40*light},${70+40*light},${80+40*light},1)`);inner.addColorStop(1,'#020203');x.fillStyle=inner;x.fillRect(-dw/2,-dh/2,dw,dh);
  x.fillStyle=`rgba(150,170,180,${.06*light})`;for(let i=0;i<14;i++){const yy=-dh/2+((t/40+i*37)%dh);x.fillRect(-dw/2+((i*53)%dw),yy,1.2,1.2)}
  const fr=dw*.14;x.fillStyle='#1b1714';x.fillRect(-dw/2-fr,-dh/2-fr,dw+fr*2,fr);x.fillRect(-dw/2-fr,-dh/2,fr,dh);x.fillRect(dw/2,-dh/2,fr,dh);
  x.strokeStyle='rgba(255,255,255,.05)';x.lineWidth=1;for(let i=0;i<6;i++){x.beginPath();x.moveTo(-dw/2-fr,-dh/2+i*dh/6);x.lineTo(-dw/2,-dh/2+i*dh/6+4);x.moveTo(dw/2,-dh/2+i*dh/6+8);x.lineTo(dw/2+fr,-dh/2+i*dh/6+3);x.stroke()}
  const ca=Math.cos(open),sa=Math.sin(open),px=-dw/2+dw*ca,k=1-.28*sa,lum=.35+.65*ca;
  const Q=(u,v)=>{const xx=-dw/2+(px+dw/2)*u,kk=1+(k-1)*u;return[xx,v*dh/2*kk]};
  x.beginPath();x.moveTo(...Q(0,-1));x.lineTo(...Q(1,-1));x.lineTo(...Q(1,1));x.lineTo(...Q(0,1));x.closePath();
  const g=x.createLinearGradient(-dw/2,0,px,0);g.addColorStop(0,shade(base,-.2+.1*lum));g.addColorStop(1,shade(base,-.6+.5*lum));x.fillStyle=g;x.fill();x.strokeStyle='#0a0806';x.lineWidth=2;x.stroke();
  x.save();x.clip();x.strokeStyle=`rgba(0,0,0,${.35+.2*(1-lum)})`;x.lineWidth=1.4;
  if(kind==='madeira'){for(let i=1;i<5;i++){const a=Q(i/5,-1),b=Q(i/5,1);x.beginPath();x.moveTo(...a);x.lineTo(...b);x.stroke()}}
  else if(kind==='ferro'){x.lineWidth=dh*.035;x.strokeStyle=shade(base,-.5);[-.6,0,.6].forEach(v=>{x.beginPath();x.moveTo(...Q(0,v));x.lineTo(...Q(1,v));x.stroke()});x.fillStyle='rgba(200,200,210,.25)';for(let u=.1;u<1;u+=.2)[-.6,0,.6].forEach(v=>{const p=Q(u,v);x.beginPath();x.arc(p[0],p[1],dh*.008,0,7);x.fill()})}
  else{for(let j=0;j<8;j++){const a=Q(0,-1+j/4),b=Q(1,-1+j/4);x.beginPath();x.moveTo(...a);x.lineTo(...b);x.stroke()}}
  const hd=Q(.86,.02);x.fillStyle='#b89a5a';x.beginPath();x.ellipse(hd[0],hd[1],dh*.022*Math.max(.3,ca),dh*.022,0,0,Math.PI*2);x.fill();x.restore();
  x.fillStyle=`rgba(140,160,170,${.12*light})`;x.beginPath();x.moveTo(-dw/2,dh/2);x.lineTo(dw/2,dh/2);x.lineTo(dw*.9,dh*.95);x.lineTo(-dw*.9,dh*.95);x.closePath();x.fill();
  x.restore();
  const v=x.createRadialGradient(W/2,H/2,Math.min(W,H)*.15,W/2,H/2,Math.max(W,H)*.7);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.92)');x.fillStyle=v;x.fillRect(0,0,W,H);
  x.globalAlpha=.06+Math.random()*.03;x.globalCompositeOperation='overlay';x.fillStyle=grainPat(x);x.fillRect(0,0,W,H);x.globalCompositeOperation='source-over';x.globalAlpha=1;
  const fin=clamp((t-150)/500,0,1),fout=clamp((t-3250)/450,0,1);x.fillStyle=`rgba(0,0,0,${Math.max(1-fin,fout)})`;x.fillRect(0,0,W,H);
  if(t>3500&&name){x.globalAlpha=clamp((t-3500)/300,0,1)*clamp((DUR-t)/300,0,1);x.fillStyle='#cdbb94';x.font=`600 ${Math.round(Math.min(W,H)*.045)}px Cinzel,Georgia,serif`;x.textAlign='center';x.fillText(name,W/2,H/2);x.globalAlpha=1}
  if(t>3750)cv.style.opacity=String(Math.max(0,1-(t-3750)/700));
  if(t<DUR)requestAnimationFrame(frame);else{cv.remove();done&&done()}};
 requestAnimationFrame(frame);
}
function checkTrans(){const tr=T.game&&T.game.trans;if(!tr||tr.id===T.lastTrans)return;T.lastTrans=tr.id;if(Date.now()-tr.at>15000)return;if(T.localDoor&&Date.now()-T.localDoor<6000)return;const m=T.maps[tr.to];playDoor(m?m.name:'')}
function checkDoors(){if(!isMaster()||!T.game)return;T.doorSeen=T.doorSeen||{};
 if(!T.doorSeeded){if(!T.seedS)return;T.doorSeeded=true;T.seats.forEach(s=>{if(s.pos)T.doorSeen[s.uid]=s.pos.m+':'+s.pos.x+','+s.pos.y});return}
 if(T.transBusy)return;const m=T.maps[T.game.activeMap];if(!m||!m.links)return;
 for(const s of T.seats){if(!s.pos||s.pos.m!==m.id)continue;const key=s.pos.x+','+s.pos.y,prev=T.doorSeen[s.uid];T.doorSeen[s.uid]=m.id+':'+key;if(prev===m.id+':'+key)continue;const L=m.links[key];if(L&&T.maps[L.to]){doTransition(m,L,s);return}}}
function doTransition(m,L,s){T.transBusy=true;setTimeout(()=>T.transBusy=false,5000);const dest=T.maps[L.to],id=uid();
 if(dest.id===m.id){const tx=L.tx??(dest.spawn||{x:1}).x,ty=L.ty??(dest.spawn||{y:1}).y;setTimeout(()=>seatPatch(s.uid,{pos:{m:dest.id,x:tx,y:ty}}),1800);T.doorSeen[s.uid]=dest.id+':'+tx+','+ty}
 else{const sp=dest.spawn||{x:1,y:1};T.seats.filter(x=>x.pos&&x.pos.m===m.id).forEach((x,i)=>{const o=[[0,0],[1,0],[0,1],[1,1],[-1,0],[0,-1],[-1,1],[1,-1]][i%8],p={m:dest.id,x:clamp(sp.x+o[0],0,dest.w-1),y:clamp(sp.y+o[1],0,dest.h-1)};T.doorSeen[x.uid]=dest.id+':'+p.x+','+p.y;setTimeout(()=>seatPatch(x.uid,{pos:p}),1800)})}
 gamePatch({trans:{id,at:Date.now(),from:m.id,to:dest.id,who:s.uid}});setTimeout(()=>{if(dest.id!==m.id)gamePatch({activeMap:dest.id})},2600);T.lastTrans=id;playDoor(dest.name)}

/* --- sessão e tela de jogo --- */
function seatSummary(s){const tpl=T.game.template;return tplFields(tpl).filter(f=>f.type==='select'&&/ra[cç]a|classe|esp[eé]cie|ocupa|arqu/i.test(f.label)).map(f=>(choiceById(f,(s.values||{})[f.id])||{}).name).filter(Boolean).join(' · ')}
function showIntro(){if($('.intro'))return;const g=T.game,seats=T.seats.filter(s=>s.name);sThud(.1,.8);sThud(1.5,.6);
 const d=document.createElement('div');d.className='intro';
 d.innerHTML=`<div class="intro-in"><img class="intro-logo" src="img/mark.webp" alt=""><div class="intro-sub">Sessão ${(g.session&&g.session.n)||1}</div><h1 class="intro-t">${esc(g.title||'Mesa de jogo')}</h1><div class="intro-line"></div>
  ${seats.length?`<div class="intro-cap">Personagens da rodada</div><div class="intro-party">${seats.map((s,i)=>`<div class="ip" style="animation-delay:${1.7+i*.28}s">${s.look?`<img src="${lookAvatar(s.look,180)}" alt="">`:`<span class="ipe" style="background:${esc(s.color||'#555')}">${esc(s.emoji||'🙂')}</span>`}<b>${esc(s.name)}</b><small>${esc(seatSummary(s))}</small></div>`).join('')}</div>`:''}
  <button class="intro-skip" type="button">Pular ›</button></div>`;
 document.body.appendChild(d);const end=()=>{if(d.classList.contains('out'))return;d.classList.add('out');setTimeout(()=>{d.remove();if(T.view==='play'){fitPlay();redrawPlay()}},800)};d.querySelector('.intro-skip').onclick=end;setTimeout(end,1900+seats.length*280+2800)}
function handleSession(){const ss=T.game.session||{};
 if(ss.on&&ss.at!==T.sessAt){T.sessAt=ss.at;if(T.entered){T.view='play';renderTableShell();showIntro()}}
 else if(!ss.on&&T.view==='play'){T.view='tabs';T.sessAt=null;renderTableShell();renderTab();toast('Sessão encerrada pelo mestre')}
 updateSessBtn()}
function updateSessBtn(){const el=$('#tSessBtn');if(!el||!T.game)return;const ss=T.game.session||{};
 el.innerHTML=!T.entered?'':T.view==='play'?'':ss.on?`<button class="btn sm primary" data-act="pPlay">▶<span class="ik-ml"> Tela de jogo</span></button>`:isMaster()&&T.mode==='master'?`<button class="btn sm primary" data-act="sessStart">▶<span class="ik-ml"> Iniciar sessão</span></button>`:''}
ACT.sessStart=async()=>{const g=T.game;if(!T.maps[g.activeMap]){if(!await confirmDlg('Nenhum mapa está visível aos jogadores. Iniciar a sessão mesmo assim? (Escolha o mapa em Mapas → “Mostrar aos jogadores”.)','Iniciar'))return}
 saveMapD.flush();const n=((g.session&&g.session.n)||0)+1;gamePatch({session:{on:true,at:Date.now(),n}});handleSession()};
ACT.sessEnd=async()=>{if(!await confirmDlg('Encerrar a sessão? Todos voltam para as abas.','Encerrar'))return;gamePatch({session:{...(T.game.session||{}),on:false}});T.view='tabs';T.sessAt=null;renderTableShell();renderTab()};
ACT.pPlay=()=>{T.view='play';renderTableShell()};
ACT.pTabs=()=>{T.view='tabs';renderTableShell();renderTab()};
ACT.pSound=()=>{S.prefs.sound=!sndOn();savePrefs();const b=$('#pSnd');if(b)b.textContent=sndOn()?'🔊':'🔇';if(sndOn())sClack(0)};
function fitPlay(){const m=T.maps[T.game.activeMap],sc=$('#mapScroll');if(!m||!sc)return;const w=sc.clientWidth-40,h=sc.clientHeight-40;if(w<50||h<50)return;T.zoom=clamp(Math.min(w/(m.w*28),h/(m.h*28)),.3,2.2);T.playKey=null}
function renderPlay(){
 const g=T.game,m=T.maps[g.activeMap];T.shownMap=g.activeMap;const me=isMaster();
 $('#tSub').innerHTML=`<div class="play-bar"><b class="pb-map">🗺 ${esc(m?m.name:'Sem mapa')}</b><span class="sp"></span><button class="btn sm" data-act="tZoom" data-d="-1">−</button><button class="btn sm" data-act="tZoom" data-d="1">+</button><button class="btn sm" id="pSnd" data-act="pSound" title="Som">${sndOn()?'🔊':'🔇'}</button>${MOD('quests')||MOD('handouts')?'<button class="btn sm" data-act="pDiary">📖<span class="hide-m"> Diário</span></button>':''}<button class="btn sm fbtn" data-act="pFeed">📜<span class="hide-m"> Registro</span><b class="badge" id="feedB" style="display:none"></b></button><button class="btn sm" data-act="pTabs">☰ Abas</button>${me?'<button class="btn sm danger" data-act="sessEnd">■ Encerrar</button>':''}</div>`;
 const b=$('#tBody');b.className='tbl-b playv';
 b.innerHTML=`<div class="play" id="play"><div class="play-map"><div class="turns" id="turns" style="display:none"></div>${m?`<div class="mapscroll ${m.style==='dark'?'darkbg':''} play-scroll" id="mapScroll"><div class="mapstack"><canvas id="mapC"></canvas><canvas id="tokC" class="tokc"></canvas></div></div>`:`<div class="empty" style="color:#cbbf9f"><div class="big" style="color:#eee">Aguardando o mapa</div><p>${me?'Escolha um mapa em Mapas → “Mostrar aos jogadores”.':'O mestre ainda não revelou o mapa.'}</p></div>`}</div>
  <div class="actbar" id="actbar"></div><div class="party" id="party"></div>
  <aside class="feed diary" id="diary"><div class="feed-h"><b>📖 Diário da campanha</b><button class="btn sm ghost" data-act="pDiary">✕</button></div><div class="feed-l" id="diaL"></div></aside><aside class="feed" id="feed"><div class="feed-h"><b>📜 Registro da mesa</b><button class="btn sm ghost" data-act="pFeed">✕</button></div><div class="feed-l" id="feedL"></div><form class="feed-f" id="feedF"><input id="feedIn" placeholder="Mensagem para a mesa…" maxlength="280" autocomplete="off"><button class="btn sm primary">Enviar</button></form></aside></div>`;
 $('#feedF').onsubmit=e=>{e.preventDefault();const i=$('#feedIn');sendChat(i.value);i.value=''};
 if(m){fitPlay();bindMapCanvas($('#mapC'),$('#mapScroll'),{map:()=>T.maps[T.game.activeMap],redraw:redrawPlay,editor:false});T.playKey=null;redrawPlay();const s=mySeat();if(s&&!(s.pos&&s.pos.m===m.id)&&!me)seatPatch(S.uid,{pos:{m:m.id,x:(m.spawn||{x:1}).x,y:(m.spawn||{y:1}).y}})}
 renderParty();renderTurns();renderActBar();renderFeedBadge();
}
function renderParty(){const el=$('#party');if(!el)return;const bars=tplFields(T.game.template).filter(f=>f.type==='bar').slice(0,2);
 el.innerHTML=T.seats.map(s=>`<button class="pcard ${s.uid===S.uid?'me':''}" data-act="pCard" data-uid="${s.uid}">${avatarHTML(s,'pav')}<span class="pinfo"><b>${S.room?`<span class="odot ${playerOnline(s.uid)?'on':''}"></span>`:''}${esc(s.name||'—')}</b>${bars.map((f,i)=>{const v=fieldVal(f,s.values||{});return `<span class="sbar c${i}"><i style="width:${v.max?clamp(v.cur/v.max*100,0,100):0}%"></i><em>${esc(f.label.replace(/\s*\(.*\)/,''))} ${v.cur}/${v.max}</em></span>`}).join('')}<small class="plv">Nv ${lvlOf(actorRef('pc',s.uid))}${RULES().xp?' · '+(+s.xp||0)+' XP':''}${(s.cond||[]).length?' · '+esc(s.cond.join(', ')):''}</small></span></button>`).join('')||'<div class="muted small" style="padding:10px">Nenhum personagem na mesa ainda.</div>'}
ACT.pCard=async el=>{const u=el.dataset.uid,s=T.seats.find(x=>x.uid===u);if(!s)return;if(isMaster())return ACT.tPcMenu(el);
 await modal({title:esc(s.name),wide:true,body:`<div class="row" style="gap:14px;align-items:flex-start;flex-wrap:wrap">${s.look?`<img src="${lookAvatar(s.look,140)}" style="width:120px;height:120px;border-radius:50%" alt="">`:''}<div class="grow"><p class="muted">${esc(seatSummary(s))}</p>${s.uid===S.uid?`<div class="sheet">${sheetHTML(T.game.template,s.values||{},{ro:true})}</div><div class="card"><h3>Habilidades</h3>${skillsHTML(s.skills)}</div>`:''}</div></div>`,actions:[{label:'Fechar',cls:'primary'}]})};
ACT.pDice=async()=>{const s=mySeat(),attrs=tplFields(T.game.template).filter(f=>f.type==='attr');
 await modal({title:'🎲 Rolar dados',body:`<div class="dq" style="grid-template-columns:repeat(4,1fr)">${[4,6,8,10,12,20,100].map(n=>`<button class="btn" data-roll="1d${n}">d${n}</button>`).join('')}<button class="btn" data-roll="2d6">2d6</button></div>
  <div class="row"><input id="pdExp" placeholder="Ex.: 1d20+5"><button class="btn primary" id="pdGo">Rolar</button></div>
  ${s&&attrs.length?`<label class="f">Teste de atributo</label><div class="row wrap">${attrs.map(f=>{const md=modOf(fieldVal(f,s.values||{}));return `<button class="btn sm" data-roll="1d20${md}" data-lbl="${esc(f.label)}">${esc(f.label)} ${md}</button>`}).join('')}</div>`:''}`,
  onMount:(ov,close)=>{$$('[data-roll]',ov).forEach(b=>b.onclick=()=>{close();tRoll(b.dataset.roll,b.dataset.lbl)});$('#pdGo',ov).onclick=()=>{const v=$('#pdExp',ov).value;close();tRoll(v)};$('#pdExp',ov).onkeydown=e=>{if(e.key==='Enter'){const v=e.target.value;close();tRoll(v)}}},actions:[{label:'Fechar'}]})};
/* ligar portas no editor */
async function linkDoor(m,x,y){const key=x+','+y,cur=(m.links||{})[key],ids=Object.keys(T.maps);
 const v=await modal({title:'🚪 Porta para outro cenário',body:`<p class="muted small" style="margin-top:0">Quando um personagem passar por esta porta, todos veem a animação da porta abrindo e o grupo muda de cenário.</p><label class="f">Leva para</label><select id="lkTo">${ids.map(id=>`<option value="${id}" ${cur&&cur.to===id?'selected':''}>${id===m.id?'Este mesmo mapa (outra sala)':esc(T.maps[id].name)}</option>`).join('')}</select><p class="small muted">Em outro mapa, o grupo aparece no ponto ⭐ Início dele. No mesmo mapa, você escolhe o ponto de chegada com o próximo clique.</p>`,
  actions:[...(cur?[{label:'Remover ligação',cls:'danger',value:'rm'}]:[]),{label:'Cancelar'},{label:'Ligar porta',cls:'primary',onClick:ov=>$('#lkTo',ov).value}]});
 if(!v)return;pushUndo(m);m.links=m.links||{};if(v==='rm'){delete m.links[key];mapDirty();redrawEditor();return}
 m.links[key]={to:v};if(v===m.id){T.linkPending=key;toast('Agora clique onde os personagens vão aparecer')}else toast('Porta ligada a “'+T.maps[v].name+'”');mapDirty();redrawEditor()}
function refreshPlay(){const m=T.maps[T.game.activeMap];if(T.shownMap!==T.game.activeMap||(m&&!$('#mapC'))){renderPlay();return}redrawPlay();renderParty();renderTurns();renderActBar();const pb=$('.pb-map');if(pb&&m)pb.textContent='🗺 '+m.name}
function v7after(){try{if(T.needKit&&isMaster()){T.needKit=false;addStarterKit()}scanRolls();checkTrans();checkDoors();handleSession()}catch(e){console.warn('v7',e)}v8after();try{v11after()}catch(e){console.warn('v11',e)}}
/* quem moveu o próprio token vê a porta na hora */
const _moveToken=moveToken;
moveToken=function(tk,mid,x,y){_moveToken(tk,mid,x,y);const m=T.maps[mid],L=m&&m.links&&m.links[x+','+y];
 if(L&&T.maps[L.to]&&tk.kind==='pc'&&tk.id===S.uid&&!isMaster()){T.localDoor=Date.now();playDoor(T.maps[L.to].name)}};
