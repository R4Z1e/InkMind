import asyncio, json
from playwright.async_api import async_playwright
from table_test_fb import mk
CHK = r"""(name)=>{const W=Math.min(innerWidth,screen.width),H=innerHeight,out=[],rep=new Set();
 const clipScroll=el=>{for(let p=el.parentElement;p&&p!==document.body;p=p.parentElement){const s=getComputedStyle(p);if(/(auto|scroll)/.test(s.overflowX))return true}return false};
 const desc=el=>{let s=el.tagName.toLowerCase();if(el.id)s+='#'+el.id;if(el.className&&typeof el.className==='string')s+='.'+el.className.trim().split(/\s+/).slice(0,2).join('.');return s};
 for(const el of document.querySelectorAll('body *')){const r=el.getBoundingClientRect();if(r.width<2||r.height<2)continue;const cs=getComputedStyle(el);if(cs.visibility==='hidden'||cs.display==='none')continue;
  if(r.left>=W-1||r.right<=1)continue;
  if(r.right>W+3||r.left<-3){if(clipScroll(el))continue;let p=el.parentElement,dup=false;while(p){if(rep.has(p)){dup=true;break}p=p.parentElement}if(dup)continue;rep.add(el);out.push(desc(el)+' ['+Math.round(r.left)+'→'+Math.round(r.right)+']'+(el.innerText?' “'+el.innerText.trim().slice(0,30).replace(/\n/g,' ')+'”':''))}}
 const sw=document.documentElement.scrollWidth;return {name,page:(innerWidth>screen.width+1?"layout "+innerWidth+">"+screen.width+" ":"")+(sw>W+2?("página rola de lado: "+sw):""),items:out.slice(0,8)}}"""
async def chk(pg,name,shot=None):
  await pg.wait_for_timeout(450)
  r=await pg.evaluate(CHK,name)
  if r['page'] or r['items']: print('✗',name,r['page'],r['items'],flush=True)
  else: print('✓',name,flush=True)
  if shot: await pg.screenshot(path=f'/tmp/t/sw_{shot}.png')
async def step(pg,js,name,shot=None):
  try: await pg.evaluate(js); await chk(pg,name,shot)
  except Exception as e: print('?',name,str(e)[:90])
  await esc(pg)
async def esc(pg):
  for _ in range(3):
    if await pg.locator('.ik-pop').count(): await pg.keyboard.press('Escape'); await pg.wait_for_timeout(150)
    if await pg.locator('.ov').count(): await pg.evaluate("document.querySelectorAll('.ov').forEach(o=>o.remove())"); await pg.wait_for_timeout(150)
async def menu(pg,sel,name):
  try: await pg.click(sel,timeout=3000); await chk(pg,name)
  except Exception as e: print('?',name,'não abriu',str(e)[:60])
  await esc(pg)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    ctx=await b.new_context(viewport={'width':320,'height':640},is_mobile=True,has_touch=True,device_scale_factor=2); errs=[]
    m=await mk(ctx,'mestre',errs,vp={'width':320,'height':640})
    await chk(m,'estante','home')
    await menu(m,'.home-h .acct','menu conta')
    await m.click('[data-act=newProject][data-type=book]'); await chk(m,'novo projeto (diálogo)','newp'); 
    await m.fill('#np-t','Livro'); await m.click('.dlg-f .btn.primary'); await m.wait_for_selector('#page[contenteditable=true]')
    await m.evaluate("$('#page').innerHTML='<p>Texto de teste com várias palavras para revisar derrepente.</p><p>— Olá. — disse ele.</p>';markDirty()")
    await chk(m,'editor livro','ed')
    for k,n in [('fmt','Aa'),('ins','Inserir'),('rev','Revisar'),('view','Exibir')]:
      await menu(m,f'[data-act=tbMenu][data-m={k}]',f'menu {n}')
    await menu(m,'.ik-more','Mais (livro)')
    await m.evaluate("ACT.side()"); await chk(m,'capítulos (lateral)'); await m.evaluate("closeSide()")
    for v in ['board','codex','gallery','style','publish']:
      await m.evaluate(f"showView('{v}')"); await chk(m,'tela '+v,v)
    for t in ['table','board','timeline']:
      await m.evaluate(f"showView('codex')"); await m.evaluate(f"S.codexView='{t}';RENDER.codex()"); await chk(m,'wiki '+t)
    await m.evaluate("S.codexView='cards';S.cxMode='dict';RENDER.codex()"); await chk(m,'dicionário','dict'); await m.evaluate("S.cxMode='wiki'")
    await step(m,"ACT.dictNew(),0",'nova palavra')
    for t in ['print','export','convert']:
      try: await m.evaluate(f"showView('{t}')"); await chk(m,'publicar '+t,'pub_'+t)
      except Exception as e: print('? publicar',t,str(e)[:80])
    await m.evaluate("showView('write')"); await m.wait_for_timeout(800)
    await m.evaluate("ACT.rvOpen()"); await m.wait_for_timeout(900); await chk(m,'revisor','rev'); await m.evaluate("ACT.rvOpen()")
    await step(m,"ACT.rvDicts(),0",'dicionários do corretor')
    await step(m,"ACT.dice()",'rolador'); await m.evaluate("try{ACT.dice()}catch{}")
    await step(m,"ACT.colShare(),0",'compartilhar')
    await step(m,"ACT.feedback(),0",'relatar problema')
    await step(m,"ACT.wordCount&&ACT.wordCount(),0",'contagem de palavras')
    await step(m,"fdOpen&&fdOpen(true)",'localizar/substituir'); await m.keyboard.press('Escape')
    await m.evaluate("ACT.home()"); await m.wait_for_timeout(500)
    await m.evaluate("ACT.explore()"); await m.wait_for_timeout(1500); await chk(m,'explorar','explore')
    await m.evaluate("ACT.home()"); await m.wait_for_timeout(500)
    await m.click('[data-act=newProject][data-type=rpg]'); await m.fill('#np-t','Camp'); await m.click('.dlg-f .btn.primary'); await m.wait_for_selector('#page[contenteditable=true]')
    await chk(m,'editor RPG'); await menu(m,'.ik-more','Mais (RPG)')
    await m.click('[data-act=openTableP]'); await m.wait_for_selector('.tpltabs',timeout=15000); await m.wait_for_timeout(800)
    await m.evaluate("buildAdventure()"); await m.wait_for_timeout(1500)
    for t in ['tpl','chars','look','maps','skills','items','rules','mech','camp','guide']:
      try: await m.evaluate(f"(()=>{{const b=document.querySelector('[data-act=tTab][data-t={t}]');if(b)b.click();else throw 0}})()"); await chk(m,'mestre: '+t,'m_'+t)
      except Exception as e: print('? aba',t)
    await m.evaluate("ACT.tStatus()"); await chk(m,'painel status (celular)'); await m.evaluate("ACT.tStatus()")
    await step(m,"playersModal&&playersModal(),0",'jogadores')
    await step(m,"ACT.gmTools&&ACT.gmTools(),0",'ferramentas do mestre')
    await step(m,"ACT.tInvite&&ACT.tInvite(),0",'convidar')
    gid=await m.evaluate("T.gid")
    pl=await mk(ctx,'jogador',errs,vp={'width':320,'height':640})
    await pl.evaluate(f"openTable('{gid}',{{}})"); await pl.wait_for_selector('#tLobby',timeout=15000); await pl.wait_for_timeout(500); await chk(pl,'lobby','lobby')
    await pl.click('[data-act=tEnter][data-as=player]'); await pl.wait_for_selector('#joinBox'); await chk(pl,'criar personagem','join')
    await pl.fill('#jName','Jill'); await pl.click('.choice:has-text("Guerreiro")'); await pl.click('#jGo'); await pl.wait_for_timeout(900)
    await chk(pl,'aparência','p_look')
    for t in ['sheet','map','bag','dice','learn']:
      try: await pl.evaluate(f"(()=>{{const b=document.querySelector('[data-act=tTab][data-t={t}]');if(b)b.click();else throw 0}})()"); await chk(pl,'jogador: '+t,'p_'+t)
      except: print('? aba jogador',t)
    await m.click('[data-act=sessStart]'); await m.wait_for_timeout(800)
    for g in (m,pl):
      try:
        if await g.locator('.intro-skip').count(): await g.click('.intro-skip',timeout=4000)
      except Exception as e: print('? pular intro', 'mestre' if g is m else 'jogador', await g.evaluate("(()=>{const s=document.querySelector('.intro-skip');if(!s)return 'sem';const r=s.getBoundingClientRect();const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return [innerWidth,Math.round(r.left),Math.round(r.top),e&&(e.className||e.tagName),getComputedStyle(s).zIndex]})()"))
    await pl.wait_for_timeout(1500); await chk(pl,'sessão (jogador)','play_p'); await chk(m,'sessão (mestre)','play_m')
    await m.evaluate("ACT.pDiary&&ACT.pDiary()"); await chk(m,'diário'); await m.evaluate("ACT.pDiary&&ACT.pDiary()")
    await m.evaluate("ACT.pFeed&&ACT.pFeed()"); await chk(m,'registro da mesa'); await m.evaluate("ACT.pFeed&&ACT.pFeed()")
    print('ERROS JS:',[e for e in errs if 'ERR_FAILED' not in e][:6])
    await b.close()
asyncio.run(main())
