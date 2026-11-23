"""Testes automáticos do Inkmind (rodam no GitHub Actions a cada envio).

Usam o Firebase falso (fbmock.js, gerado de fb/src/entry-mock.js), que imita as regras de segurança.
Rodar no computador:
  npx esbuild fb/src/entry-mock.js --bundle --format=esm --outfile=fbmock.js
  python3 -m http.server 8765 &      (na pasta do projeto)
  pip install playwright && python -m playwright install chromium
  python3 tests/run.py               (ou: python3 tests/run.py coautoria mapa)
"""
import asyncio, os, sys, time, traceback
from playwright.async_api import async_playwright

BASE = os.environ.get('INK_BASE', 'http://localhost:8765/')
CHROME = os.environ.get('CHROME_PATH')            # opcional: Chrome do sistema
LIBS = os.environ.get('LOCAL_LIBS')               # opcional: cópias locais das bibliotecas (sem internet)
HERE = os.path.dirname(os.path.abspath(__file__))
FB = "window.INK_FB={apiKey:'test',projectId:'demo',src:'./fbmock.js'};window.INK_TEST_PUBLIC=1;window.MOCK_ADMINS=['adm@teste.com'];window.INK_ADMINS=['adm@teste.com'];"
LIBMAP = {
  'dompurify@3.1.6/dist/purify.min.js': 'dompurify-3.1.6/package/dist/purify.min.js',
  'html2pdf.bundle.min.js': 'html2pdf.js-0.10.1/package/dist/html2pdf.bundle.min.js',
  'mammoth.browser.min.js': 'mammoth-1.6.0/package/mammoth.browser.min.js',
  'jszip.min.js': 'jszip-3.10.1/package/dist/jszip.min.js',
  'docx@8.5.0/build/index.umd.js': 'docx-8.5.0/package/build/index.umd.js',
  'marked@12.0.2/marked.min.js': 'marked-12.0.2/package/marked.min.js',
}

class Fail(Exception): pass
def check(cond, msg):
  if not cond: raise Fail(msg)
  print('   ✓', msg, flush=True)

async def route(r):
  u = r.request.url
  if u.startswith(BASE) or u.startswith('http://127.0.0.1') or not LIBS: return await r.continue_()
  for k, v in LIBMAP.items():
    if u.endswith(k): return await r.fulfill(path=os.path.join(LIBS, v), content_type='application/javascript')
  return await r.abort()

class Ctx:
  def __init__(self, b): self.b = b; self.errs = []
  async def __aenter__(self):
    self.ctx = await self.b.new_context(viewport={'width': 1360, 'height': 860}); await self.ctx.route('**/*', route); return self
  async def __aexit__(self, *a): await self.ctx.close()
  async def page(self, name, init=FB, url='index.html', vp=None):
    pg = await self.ctx.new_page()
    if vp: await pg.set_viewport_size(vp)
    pg.on('pageerror', lambda e: self.errs.append(f'{name}: {e}'))
    await pg.add_init_script(init); await pg.goto(BASE + url, wait_until='domcontentloaded'); return pg
  async def user(self, name, url='index.html', vp=None):
    pg = await self.page(name, url=url, vp=vp); await pg.wait_for_selector('#inkLogin', timeout=20000)
    await pg.fill('#ilE', name + '@teste.com'); await pg.fill('#ilP', 'segredo1'); await pg.click('#ilUp')
    for _ in range(90):                       # espera entrar; se a conta já existir, usa "Já tenho conta"
      if await pg.locator('.home').count(): return pg
      er = await pg.locator('#ilEr').inner_text() if await pg.locator('#ilEr').count() else ''
      if 'Entrar' in er and await pg.locator('#ilIn').count(): await pg.click('#ilIn')
      await pg.wait_for_timeout(500)
    info = await pg.evaluate("[location.href,(document.getElementById('ilEr')||{}).innerText||'',document.body.innerText.slice(0,200),!!window.INK&&!!INK.user]")
    raise Fail(f'{name} não conseguiu entrar: {info}')
  def no_errors(self): check(not self.errs, 'sem erros de JavaScript' + ('' if not self.errs else ': ' + ' | '.join(self.errs[:3])))

async def new_project(pg, kind, title):
  await pg.click(f'[data-act=newProject][data-type={kind}]'); await pg.fill('#np-t', title); await pg.click('.dlg-f .btn.primary'); await pg.wait_for_selector('#page[contenteditable=true]', timeout=15000)
async def type_in(pg, txt, wait=1500):
  await pg.click('#page'); await pg.keyboard.press('Control+End'); await pg.keyboard.type(txt); await pg.wait_for_timeout(wait)
async def open_table(pg):
  await pg.click('[data-act=openTableP]'); await pg.wait_for_selector('.tpltabs', timeout=15000); await pg.wait_for_timeout(1200); return await pg.evaluate('T.gid')
async def join_table(pg, gid, name='Jill'):
  await pg.evaluate(f"openTable('{gid}',{{}})"); await pg.wait_for_selector('#tLobby', timeout=15000); await pg.wait_for_timeout(500)
  await pg.click('[data-act=tEnter][data-as=player]'); await pg.wait_for_selector('#joinBox')
  await pg.fill('#jName', name); await pg.click('.choice:has-text("Guerreiro")'); await pg.click('#jGo'); await pg.wait_for_timeout(900)
  if await pg.locator('#lbSave').count(): await pg.click('#lbSave'); await pg.wait_for_timeout(300)
LS = "(k=>JSON.parse(localStorage['mockfs:'+k]||'null'))"

# ---------------- cenários ----------------
async def t_modo_local(b):
  async with Ctx(b) as c:
    pg = await c.page('local', init="window.INK_FB={};"); await pg.wait_for_selector('.home', timeout=20000)
    await new_project(pg, 'book', 'Livro Local'); await type_in(pg, 'Texto guardado no navegador.')
    await pg.evaluate('flushChapter()'); await pg.wait_for_timeout(500); await pg.reload(wait_until='domcontentloaded'); await pg.wait_for_selector('.home', timeout=20000)
    check(await pg.evaluate("S.projects.some(p=>p.title==='Livro Local')"), 'projeto continua na estante depois de recarregar')
    await pg.click('.book[data-id]'); await pg.wait_for_selector('#page', timeout=10000); await pg.wait_for_timeout(600)
    check('guardado no navegador' in await pg.evaluate("$('#page').innerText"), 'texto do capítulo foi salvo')
    c.no_errors()

async def t_conta_nuvem(b):
  async with Ctx(b) as c:
    pg = await c.user('autora'); await new_project(pg, 'book', 'Livro Nuvem'); await type_in(pg, 'Salvo no Firebase.')
    await pg.evaluate('flushWrites()'); await pg.wait_for_timeout(800)
    pid = await pg.evaluate('S.P.id')
    check(await pg.evaluate(f"!!{LS}('data/users/u_autora/p_{pid}')"), 'projeto gravado no espaço privado da conta')
    await pg.reload(wait_until='domcontentloaded'); await pg.wait_for_selector('.home', timeout=20000)
    await pg.evaluate(f"openProject('{pid}')"); await pg.wait_for_selector('#page', timeout=10000); await pg.wait_for_timeout(700)
    check('Salvo no Firebase' in await pg.evaluate("$('#page').innerText"), 'texto volta depois de recarregar')
    other = await c.user('intrusa')
    check(await other.evaluate(f"S.db.doc('data/users/u_autora/p_{pid}').get().then(()=>'leu',()=>'negado')") == 'negado', 'outra conta não lê os projetos dela')
    c.no_errors()

async def t_economia(b):
  async with Ctx(b) as c:
    pg = await c.user('escritor'); await new_project(pg, 'book', 'Economia')
    await pg.wait_for_timeout(1500); w0 = await pg.evaluate('INK.usage.session.w')
    for i in range(8): await type_in(pg, f' frase {i}.', wait=600)
    await pg.wait_for_timeout(2000); w1 = await pg.evaluate('INK.usage.session.w')
    check(1 <= w1 - w0 <= 6, f'8 trechos digitados geram poucas gravações ({w1 - w0})')
    await pg.evaluate('flushWrites()'); await pg.wait_for_timeout(800); pid = await pg.evaluate('S.P.id'); cid = await pg.evaluate('S.cid')
    check('frase 7' in (await pg.evaluate(f"{LS}('data/users/u_escritor/c_{cid}').html")), 'ao sair, o último texto é gravado')
    c.no_errors()

async def t_mesa_visitante(b):
  async with Ctx(b) as c:
    m = await c.user('mestre'); await new_project(m, 'rpg', 'Vale'); gid = await open_table(m)
    check(await m.evaluate('T.game.access') == 'public', 'mesa de teste nasce pública')
    v = await c.page('visitante'); await v.wait_for_selector('#inkLogin', timeout=20000)
    await v.click('#ilAn'); await v.fill('#ilNick', 'Lia'); await v.click('#ilAn'); await v.wait_for_selector('.home', timeout=20000)
    check(await v.evaluate('VISITOR()'), 'entrou como visitante')
    check(await v.evaluate("S.db.doc('games/xx1').set({masterId:S.uid,kind:'game'}).then(()=>'criou',()=>'negado')") == 'negado', 'visitante não cria mesa')
    await join_table(v, gid, 'Lia')
    check(await v.evaluate('T.seats.some(s=>s.uid===S.uid)'), 'visitante entra na mesa pública')
    await m.evaluate("setAccess('private')"); await m.wait_for_timeout(600)
    v2 = await c.page('visitante2', url=f'index.html?mesa={await m.evaluate("T.game.code")}'); await v2.wait_for_selector('#inkLogin', timeout=20000)
    await v2.click('#ilAn'); await v2.fill('#ilNick', 'Teo'); await v2.click('#ilAn'); await v2.wait_for_selector('#tAsk', timeout=20000)
    check(True, 'mesa particular: visitante novo vê a tela de pedido, não entra')
    c.no_errors()

async def t_combate(b):
  async with Ctx(b) as c:
    m = await c.user('mestre'); await new_project(m, 'rpg', 'Cripta'); gid = await open_table(m)
    await m.click('[data-act=tTab][data-t=maps]'); await m.click('.empty [data-act=mNew]'); await m.wait_for_selector('.stylecv'); await m.click('.dlg-f .primary'); await m.wait_for_timeout(800)
    mid = await m.evaluate('T.edit.id'); await m.evaluate(f"gamePatch({{activeMap:'{mid}'}})"); sp = await m.evaluate('T.edit.spawn')
    p = await c.user('jogador'); await join_table(p, gid)
    await p.evaluate(f"seatPatch(S.uid,{{pos:{{m:'{mid}',x:{sp['x']},y:{sp['y']}}}}})"); await p.wait_for_timeout(500)
    await m.click('[data-act=sessStart]'); await m.wait_for_timeout(600)
    for pg in (m, p):
      if await pg.locator('.intro-skip').count(): await pg.click('.intro-skip')
    await m.wait_for_timeout(1200)
    await m.click('[data-act=cbSpawn]'); await m.wait_for_selector('[data-q]'); await m.fill('[data-q] >> nth=0', '1'); await m.click('.dlg-f .primary'); await m.wait_for_timeout(700)
    gob = await m.evaluate('T.game.chars.filter(c=>c.clone&&c.token).map(c=>c.id)'); check(len(gob) == 1, 'goblin apareceu no mapa')
    await m.evaluate(f"gamePatch({{chars:T.game.chars.map(c=>c.id==='{gob[0]}'?{{...c,token:{{m:'{mid}',x:{sp['x']+1},y:{sp['y']}}}}}:c)}})"); await m.wait_for_timeout(600)
    await m.click('[data-act=cbStart]'); await m.wait_for_selector('[data-id]'); await m.click('.dlg-f .primary'); await m.wait_for_timeout(800)
    for i in range(4):
      if await m.evaluate('curId()===T.seats[0].uid'): break
      await m.click('[data-act=cbNext]'); await m.wait_for_timeout(500)
    await p.wait_for_timeout(2600)
    await p.evaluate("()=>{crypto.getRandomValues=a=>{a[0]=19;return a}}"); await p.click('[data-act=pAct][data-k=atk]'); await p.wait_for_selector('.tg'); await p.click('.tg:not([disabled]) >> nth=0'); await p.wait_for_timeout(4000)
    hp = await m.evaluate(f"(()=>{{const a=actorRef('npc','{gob[0]}');return a?hpOf(a).cur:0}})()")
    check(hp == 0, 'ataque crítico derrota o goblin')
    c.no_errors()

async def t_mapa_secreto(b):
  async with Ctx(b) as c:
    m = await c.user('mestre'); await new_project(m, 'rpg', 'Moinho'); gid = await open_table(m)
    check(await m.evaluate(f"[T.game.sv,{LS}('games/{gid}').sv]") == [1, 1], 'mesa protegida (mapa do mestre separado)')
    await m.evaluate('buildAdventure()'); await m.wait_for_timeout(2500)
    ids = await m.evaluate("(()=>{const ms=Object.values(T.maps),by=n=>ms.find(x=>x.name===n).id;return {v:by('Vila de Vale Raso'),p:by('Porão do Moinho')}})()")
    pub = await m.evaluate(f"{LS}('games/{gid}')")
    check(all(not ch.get('inv') for ch in pub['chars']), 'documento público não leva inventário dos monstros')
    check(not any('Grik' in ch['name'] for ch in pub['chars']), 'chefe escondido não aparece para os jogadores')
    p = await c.user('jogador'); await join_table(p, gid)
    check(await p.evaluate(f"S.db.collection('games/{gid}/gmmaps').get().then(()=>'leu',()=>'negado')") == 'negado', 'jogador não lê o mapa do mestre')
    check(await p.evaluate(f"S.db.doc('games/{gid}/secret/gm').get().then(()=>'leu',()=>'negado')") == 'negado', 'jogador não lê os segredos')
    await m.evaluate(f"gamePatch({{activeMap:'{ids['p']}'}})"); await p.evaluate(f"seatPatch(S.uid,{{pos:{{m:'{ids['p']}',x:20,y:6}}}})"); await p.wait_for_timeout(1800)
    names = await p.evaluate('T.game.chars.map(c=>c.name)')
    check('Goblin vigia' in names and not any('Grik' in n for n in names), 'jogador vê só os goblins perto dele')
    check(await m.evaluate("T.game.chars.filter(c=>c.inv&&c.inv.length).length") > 0, 'mestre continua com tudo')
    c.no_errors()

async def t_coautoria(b):
  async with Ctx(b) as c:
    a = await c.user('autor'); await new_project(a, 'book', 'A Quatro Mãos'); await type_in(a, 'Começo do autor.')
    await a.evaluate('ACT.chAdd()'); await a.wait_for_timeout(800); await type_in(a, 'Segundo capítulo.')
    ch = await a.evaluate('S.P.chapters.map(c=>c.id)'); pid = await a.evaluate('S.P.id')
    await a.evaluate(f"openChapter('{ch[0]}')"); await a.wait_for_timeout(500)
    await a.click('[data-act=colShare]'); await a.wait_for_selector('.dlg-f .btn.primary'); await a.click('.dlg-f .btn.primary'); await a.wait_for_selector('.col-link', timeout=15000)
    links = await a.evaluate("[...document.querySelectorAll('.col-link input')].map(i=>i.value)"); await a.click('.dlg-f .btn.primary')
    check(len(links) == 2, 'links de coautor e de leitor beta criados')
    co = await c.user('coautor', url=links[0].split('/')[-1]); await co.wait_for_selector('.dlg-f .btn.primary', timeout=10000); await co.click('.dlg-f .btn.primary'); await co.wait_for_selector('#page', timeout=15000); await co.wait_for_timeout(1200)
    check(await co.evaluate('colRole()') == 'edit', 'coautor entrou pelo link')
    await co.evaluate(f"openChapter('{ch[0]}')"); await co.wait_for_timeout(1200)
    check(await co.evaluate("$('#page').contentEditable") == 'false', 'capítulo em uso pelo autor fica só leitura para o coautor')
    await type_in(a, ' Mais texto.', wait=6500)
    check('Mais texto' in await co.evaluate("$('#page').innerText"), 'coautor acompanha o texto ao vivo')
    await co.evaluate(f"openChapter('{ch[1]}')"); await co.wait_for_timeout(1000)
    check(await co.evaluate("$('#page').contentEditable") == 'true', 'capítulo livre: coautor edita')
    await co.evaluate('ACT.chAdd()'); await co.wait_for_timeout(2500)
    check(len(await a.evaluate('S.P.chapters')) == 3, 'capítulo criado pelo coautor aparece para o autor')
    be = await c.user('leitora', url=links[1].split('/')[-1]); await be.wait_for_selector('.dlg-f .btn.primary', timeout=10000); await be.click('.dlg-f .btn.primary'); await be.wait_for_selector('#page', timeout=15000); await be.wait_for_timeout(1000)
    check(await be.evaluate(f"S.db.doc('collab/{pid}/k/c_{ch[0]}').set({{html:'x'}}).then(()=>'gravou',()=>'negado')") == 'negado', 'leitora beta não altera o texto')
    await be.click('#colFab'); await be.wait_for_selector('#cdT'); await be.fill('#cdT', 'Gostei!'); await be.click('#cdForm button'); await be.wait_for_timeout(1200)
    check(await a.evaluate('S.col.notes.length') == 1, 'autor recebe o comentário da leitora')
    c.no_errors()

async def t_moderacao_conta(b):
  async with Ctx(b) as c:
    a = await c.user('autor'); await new_project(a, 'rpg', 'Mesa Ruim'); gid = await open_table(a)
    r = await c.user('leitor'); await r.evaluate('ACT.explore()'); await r.wait_for_timeout(2500)
    await r.click('#exMesaList .ex-more'); await r.wait_for_selector('.ik-pop'); await r.evaluate("[...document.querySelectorAll('.ik-pop .ik-it')][0].click()"); await r.wait_for_selector('.rp-opt')
    await r.click('.rp-opt input[value=hate]'); await r.click('.dlg-f .btn.primary'); await r.wait_for_timeout(600); await r.click('.dlg-f .btn.primary'); await r.wait_for_timeout(800)
    check(await r.evaluate("S.db.collection('reports').get().then(()=>'leu',()=>'negado')") == 'negado', 'só a moderação lê denúncias')
    check(len(await r.evaluate('Object.keys(S.prefs.blocked||{})')) == 1, 'bloqueio guardado')
    ad = await c.user('adm')
    await ad.evaluate("(()=>{const u=JSON.parse(sessionStorage.mockauth);u.emailVerified=true;sessionStorage.mockauth=JSON.stringify(u);INK.user.emailVerified=true})()")
    await ad.evaluate('ACT.modPanel(),0'); await ad.wait_for_selector('#modBox .mod-r', timeout=8000); await ad.click('#modBox [data-mh]'); await ad.wait_for_timeout(1000)
    check(await ad.evaluate(f"{LS}('games/{gid}').access") == 'private', 'moderação oculta e fecha a mesa')
    await a.evaluate('ACT.tBack&&ACT.tBack()'); await a.wait_for_timeout(500); await a.evaluate('ACT.home()'); await a.wait_for_timeout(300)
    await a.evaluate('ACT.inkDelete(),0'); await a.wait_for_selector('#delT'); await a.fill('#delT', 'EXCLUIR'); await a.fill('#delP', 'segredo1'); await a.click('.dlg-f .btn.danger')
    await a.wait_for_selector('#inkLogin .er.ok', timeout=20000)
    left = await a.evaluate("Object.keys(localStorage).filter(k=>/mockfs:(data\\/users\\/u_autor|games\\/|profiles\\/u_autor)/.test(k))")
    check(not left, 'excluir conta apaga projetos, mesas e perfil' + ('' if not left else f' (sobrou: {left[:4]})'))
    c.no_errors()

async def t_levar_para_o_site(b):
  mock = open(os.path.join(HERE, 'claude-mock.js')).read()
  site = BASE.replace('localhost', '127.0.0.1') + 'index.html'
  init = "if(location.href==='about:blank'){}else if(/importar=/.test(location.search)){" + FB + "}else{window.INK_SITE='" + site + "';" + mock + "\n}"
  async with Ctx(b) as c:
    await c.ctx.add_init_script(init)
    cl = await c.ctx.new_page(); await cl.goto(BASE + 'index.html?u=pedro'); await cl.wait_for_selector('.home', timeout=20000)
    await new_project(cl, 'book', 'Meu Romance'); await type_in(cl, 'Primeira frase.'); await cl.evaluate('ACT.home()'); await cl.wait_for_timeout(600)
    check(await cl.evaluate("!!document.getElementById('toSiteCard')"), 'no Claude aparece o cartão Levar para o site')
    await cl.click('[data-act=toSite]'); await cl.wait_for_selector('.dlg-f .btn.primary')
    async with c.ctx.expect_page() as np: await cl.click('.dlg-f .btn.primary')
    s = await np.value; await s.wait_for_selector('#inkLogin', timeout=20000)
    await s.fill('#ilE', 'pedro@teste.com'); await s.fill('#ilP', 'segredo1'); await s.click('#ilUp'); await s.wait_for_selector('.imp-list', timeout=30000)
    await s.click('.dlg-f .btn.primary'); await s.wait_for_timeout(5000)
    check('Meu Romance' in await s.evaluate('S.projects.map(p=>p.title)'), 'o site recebeu e importou o projeto')
    c.no_errors()

async def t_celular(b):
  async with Ctx(b) as c:
    m = await c.user('mestre', vp={'width': 390, 'height': 844}); await new_project(m, 'rpg', 'Celular')
    await m.evaluate('ACT.dice()'); await m.wait_for_selector('#dice.open'); await m.click('#dice [data-roll="1d20"]'); await m.wait_for_timeout(800)
    check(await m.evaluate("!!document.querySelector('canvas.fx-over')"), 'rolador do editor mostra os dados animados')
    await m.wait_for_timeout(3200); check(await m.evaluate("/^\\d+$/.test($('#dice .res').textContent)"), 'resultado aparece depois da animação')
    await m.evaluate('ACT.dice()'); await m.click('[data-act=openTableP]'); await m.wait_for_selector('.tpltabs', timeout=15000); await m.wait_for_timeout(800)
    await m.click('[data-act=tTab][data-t=maps]'); await m.wait_for_timeout(500); await m.click('[data-act=mNew]'); await m.wait_for_selector('.stylecv'); await m.wait_for_timeout(400)
    w = await m.evaluate("[$('.dlg').getBoundingClientRect().width,innerWidth,$('.dlg .typepick').scrollWidth>$('.dlg .typepick').clientWidth]")
    check(w[0] <= w[1] and w[2], 'no celular a janela cabe na tela e os estilos deslizam para o lado')
    c.no_errors()

async def t_menus(b):
  async with Ctx(b) as c:
    m = await c.user('autor', vp={'width': 390, 'height': 844}); vis = "[...document.querySelectorAll('#tabs button')].filter(b=>b.offsetParent).map(b=>b.innerText.trim())"
    await new_project(m, 'book', 'Livro'); bar = await m.evaluate(vis)
    check(any(x.startswith('Wiki') for x in bar) and 'Mesa de jogo' not in bar, 'livro: Wiki na barra e sem Mesa de jogo')
    await m.evaluate('ACT.home()'); await m.wait_for_timeout(400); await new_project(m, 'rpg', 'Campanha'); bar = await m.evaluate(vis)
    check('Publicar' not in bar and 'Compêndio' in bar and 'Mesa de jogo' in bar, 'RPG: Publicar saiu da barra')
    await m.click('.ik-more'); await m.wait_for_timeout(300)
    check('Publicar' in await m.evaluate("[...document.querySelectorAll('.ik-pop .tx')].map(x=>x.innerText)"), 'RPG: Publicar continua em Mais')
    c.no_errors()

async def t_revisor(b):
  async with Ctx(b) as c:
    m = await c.user('autor'); await new_project(m, 'book', 'Revisão')
    check('Wiki e dicionário' in await m.evaluate("[...document.querySelectorAll('#tabs button')].map(b=>b.innerText).join('|')"), 'livro tem Wiki e dicionário')
    txt = ['- Vamos embora. — disse ele.', 'Ela caminhava derrepente e e pensava... Fazem dois anos.', 'Deu o livro à ele. Houveram problemas com o mestre Arin.', 'Escrevi uma palvra e a sombraluz brilhou.']
    html = ''.join(f'<p>{t}</p>' for t in txt)
    await m.evaluate(f"(()=>{{$('#page').innerHTML={html!r};markDirty();S.P.codex.push({{id:'c1',cat:'Personagem',name:'Aryn',img:null,tags:'',desc:'',attrs:[]}});S.P.dict=[{{id:'d1',w:'sombraluz',def:'luz sem sombra'}}];saveProject()}})()")
    await m.evaluate('ACT.rvOpen()'); await m.wait_for_selector('.rv-i', timeout=10000); await m.wait_for_timeout(500)
    rules = await m.evaluate('RV.issues.map(x=>x.rule)')
    check(all(r in rules for r in ['travessao', 'tagponto', 'derrepente', 'rep', 'retic', 'fazem', 'crasepron', 'houveram']), 'regras de gramática e diálogo encontradas')
    await m.evaluate('ACT.rvDicts(),0'); await m.wait_for_selector('[data-rvdl="pt-BR"]'); await m.click('[data-rvdl="pt-BR"]'); await m.wait_for_timeout(5000)
    if await m.locator('.ov').count(): await m.click('.dlg-f .btn.primary')
    await m.wait_for_timeout(2500)
    sp = await m.evaluate("RV.issues.filter(x=>x.cat==='sp').map(x=>x.word)")
    check('palvra' in sp and 'sombraluz' not in sp and 'caminhava' not in sp, 'dicionário baixado acha o erro e aceita a palavra inventada')
    check('Arin' in sp and await m.evaluate("RV.issues.find(x=>x.word==='Arin').sug[0]") == 'Aryn', 'nome parecido com o da wiki é apontado')
    await m.wait_for_timeout(1200)
    check(await m.evaluate("(RV.issues.find(x=>x.word==='palvra').sug||[])[0]") == 'palavra', 'primeira sugestão para “palvra” é “palavra”')
    c.no_errors()

async def t_relatos(b):
  async with Ctx(b) as c:
    u = await c.user('testador'); await u.evaluate('ACT.feedback(),0'); await u.wait_for_selector('#fbT')
    await u.fill('#fbT', 'O dado não apareceu.'); await u.click('.dlg-f .btn.primary'); await u.wait_for_timeout(800)
    docs = await u.evaluate("Object.keys(localStorage).filter(k=>k.startsWith('mockfs:feedback/')).map(k=>JSON.parse(localStorage[k]))")
    check(len(docs) == 1 and docs[0]['kind'] == 'bug' and docs[0]['ctx']['v'], 'relato enviado com versão e aparelho')
    check(await u.evaluate("S.db.collection('feedback').get().then(()=>'leu',()=>'negado')") == 'negado', 'só a moderação lê os relatos')
    await u.evaluate("setTimeout(()=>{null.teste},0)"); await u.wait_for_timeout(800)
    check(await u.evaluate("Object.keys(localStorage).filter(k=>k.startsWith('mockfs:feedback/')).map(k=>JSON.parse(localStorage[k])).some(d=>d.kind==='error')"), 'erro do app registrado sozinho')

async def t_zoom(b):
  async with Ctx(b) as c:
    m = await c.user('mestre', vp={'width': 390, 'height': 844}); await new_project(m, 'rpg', 'Zoom'); await open_table(m)
    await m.evaluate('buildAdventure()'); await m.wait_for_timeout(1200); await m.click('[data-act=tTab][data-t=maps]'); await m.wait_for_timeout(700)
    check(await m.evaluate("!!document.getElementById('mzCtl')"), 'editor de mapa tem os botões de zoom')
    await m.click('#mzCtl [data-act=mzIn]'); await m.wait_for_timeout(300); check(await m.inner_text('#mzCtl .mz-v') == '125%', 'botão + aproxima')
    await m.click('#mzCtl [data-act=mzFit]'); await m.wait_for_timeout(300)
    check(await m.evaluate("$('#mapC').getBoundingClientRect().width<=$('#mapScroll').clientWidth"), 'ver o mapa inteiro cabe na tela')
    tiles = await m.evaluate('T.edit.tiles'); z0 = await m.evaluate('T.zoom')
    await m.evaluate("""()=>{const cv=$('#mapC'),r=cv.getBoundingClientRect(),cx=r.left+80,cy=r.top+80,ev=(t,id,x,y)=>cv.dispatchEvent(new PointerEvent(t,{pointerId:id,pointerType:'touch',clientX:x,clientY:y,bubbles:true,cancelable:true}));
      ev('pointerdown',1,cx-20,cy);ev('pointerdown',2,cx+20,cy);for(let i=1;i<=5;i++){ev('pointermove',1,cx-20-i*8,cy);ev('pointermove',2,cx+20+i*8,cy)}ev('pointerup',2,cx+60,cy);ev('pointerup',1,cx-60,cy)}""")
    await m.wait_for_timeout(500)
    check(await m.evaluate('T.zoom') > z0 and await m.evaluate('T.edit.tiles') == tiles, 'pinça com dois dedos aproxima sem desenhar no mapa')
    c.no_errors()

async def t_telao(b):
  async with Ctx(b) as c:
    await c.ctx.add_init_script(FB)
    m = await c.user('mestre'); await new_project(m, 'rpg', 'Telão'); gid = await open_table(m)
    await m.evaluate('buildAdventure()'); await m.wait_for_timeout(1500)
    ids = await m.evaluate("(()=>{const ms=Object.values(T.maps),by=n=>ms.find(x=>x.name===n).id;return {p:by('Porão do Moinho')}})()")
    p = await c.user('jogador'); await join_table(p, gid)
    await m.evaluate(f"gamePatch({{activeMap:'{ids['p']}'}})"); await p.evaluate(f"seatPatch(S.uid,{{pos:{{m:'{ids['p']}',x:20,y:6}}}})"); await m.wait_for_timeout(1500)
    check(await m.evaluate("!!document.querySelector('.tbl-h [data-act=telao]')"), 'mestre tem o botão Telão')
    await m.click('.tbl-h [data-act=telao]'); await m.wait_for_selector('.tv-opt')
    async with c.ctx.expect_page() as np: await m.click('.tv-opt[data-v=here]')
    tv = await np.value; await tv.wait_for_load_state('domcontentloaded')
    for _ in range(40):
      if await tv.evaluate("!!(window.T&&T.screen&&T.game&&document.getElementById('mapC'))"): break
      await tv.wait_for_timeout(500)
    st = await tv.evaluate("[T.screen,isMaster(),T.view,document.body.classList.contains('telao')]")
    check(st == [True, False, 'play', True], 'telão abre como espectador, na tela de jogo')
    names = await tv.evaluate('T.game.chars.map(c=>c.name)')
    check('Goblin vigia' in names and not any('Grik' in n for n in names), 'telão mostra só os monstros que os jogadores veem')
    check(await tv.evaluate('T.secret') in (None, {}) and not await tv.evaluate('!!T.gmMaps'), 'telão não carrega os segredos nem o mapa do mestre')
    check(await m.evaluate('T.seats.length') == 1, 'telão não ocupa vaga de jogador')
    check(await tv.evaluate("getComputedStyle(document.querySelector('.tbl-h')).display") == 'none', 'telão esconde os controles da mesa')

async def t_rotulo(b):
  async with Ctx(b) as c:
    pg = await c.page('rotulo', init="window.INK_FB={};"); await pg.wait_for_selector('.home', timeout=20000)
    await new_project(pg, 'book', 'Com Prólogo'); await type_in(pg, 'Era uma vez.', 600)
    await pg.click('#kicker'); await pg.wait_for_selector('.kick-pop'); await pg.click('.kick-pop button:has-text("Prólogo")'); await pg.wait_for_timeout(400)
    check(await pg.evaluate("$('#kicker').textContent") == 'Prólogo', 'rótulo trocado para Prólogo no editor')
    await pg.evaluate('ACT.chAdd()'); await pg.wait_for_timeout(900)
    st = await pg.evaluate("[$('#kicker').textContent,P().chapters[1].title,chNum(P().chapters[0].id)]")
    check(st[0] == 'Capítulo 1' and st[1] == 'Capítulo 1' and st[2] is None, f'capítulo seguinte vira Capítulo 1 ({st})')
    await pg.click('#kicker'); await pg.wait_for_selector('.kick-pop'); await pg.keyboard.press('Control+A'); await pg.keyboard.type('Parte da Tempestade'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(300)
    check(await pg.evaluate("$('#kicker').textContent") == 'Parte da Tempestade', 'rótulo livre digitado')
    await pg.click('#kicker'); await pg.wait_for_selector('.kick-pop'); await pg.click('.kp-auto'); await pg.wait_for_timeout(300)
    check(await pg.evaluate("$('#kicker').textContent") == 'Capítulo 1', 'volta para número automático')
    await pg.evaluate('flushChapter()')
    out = await pg.evaluate("(async()=>{S.exp=S.exp||{};S.exp.scope='all';const chs=await gather();return [chs.map(chapterHTML).join(''),buildTXT(chs),tocHTML(chs)]})()")
    check('>Prólogo<' in out[0] and '>Capítulo 1<' in out[0], 'exportação mostra Prólogo e Capítulo 1')
    check('PRÓLOGO' in out[1] and 'CAPÍTULO 1' in out[1], 'TXT mostra os rótulos')
    check('1. Capítulo 1' in out[2] and '>Era' not in out[2], 'sumário numera só os capítulos')
    c.no_errors()

async def t_previa_celular(b):
  async with Ctx(b) as c:
    pg = await c.page('previa', init="window.INK_FB={};", vp={'width': 390, 'height': 844}); await pg.wait_for_selector('.home', timeout=20000)
    await new_project(pg, 'book', 'Prévia'); await type_in(pg, 'Uma frase para a folha. ' * 30, 600)
    await pg.evaluate("showView('print')"); await pg.wait_for_selector('#pvGrip'); await pg.wait_for_timeout(1500)
    check(await pg.evaluate("$('.pv').classList.contains('pv-min') && $('.pv-side').offsetHeight < 70"), 'no celular os ajustes começam recolhidos')
    await pg.click('#pvFold'); await pg.wait_for_timeout(300)
    h1 = await pg.evaluate("$('.pv-side').offsetHeight"); check(h1 > 150, f'tocar em Ajustes abre o painel ({h1}px)')
    g = await pg.locator('#pvGrip').bounding_box(); y = g['y'] + 10
    await pg.mouse.move(195, y); await pg.mouse.down(); await pg.mouse.move(195, y + 160, steps=8); await pg.mouse.up(); await pg.wait_for_timeout(300)
    h2 = await pg.evaluate("$('.pv-side').offsetHeight"); check(h2 > h1 + 100, f'arrastar a alça aumenta o painel ({h1} → {h2}px)')
    z0 = await pg.evaluate("S.pvZoom||pvFit()")
    await pg.evaluate("""(()=>{const sc=$('#pvScroll'),r=sc.getBoundingClientRect(),cy=r.top+200;
      const T=(id,x)=>new Touch({identifier:id,target:sc,clientX:x,clientY:cy});
      const ev=(type,ts)=>sc.dispatchEvent(new TouchEvent(type,{touches:ts,targetTouches:ts,changedTouches:ts,bubbles:true,cancelable:true}));
      ev('touchstart',[T(1,150),T(2,250)]);ev('touchmove',[T(1,100),T(2,300)]);ev('touchend',[])})()""")
    z1 = await pg.evaluate("S.pvZoom"); check(z1 and z1 > z0 * 1.8, f'pinça com dois dedos aumenta a folha ({z0:.2f} → {z1})')
    await pg.reload(wait_until='domcontentloaded'); await pg.wait_for_selector('.home, #page', timeout=20000)
    check(await pg.evaluate("JSON.parse(localStorage['ink.pvSide']).min===false"), 'tamanho escolhido fica guardado')
    c.no_errors()

async def t_modificacoes(b):
  async with Ctx(b) as c:
    a = await c.user('autor'); await new_project(a, 'book', 'Registro'); await type_in(a, 'O vento soprava forte na montanha.')
    await a.evaluate('ACT.chAdd()'); await a.wait_for_timeout(800); await type_in(a, 'A vila dormia em silêncio.')
    ch = await a.evaluate('S.P.chapters.map(c=>c.id)')
    mine = await a.evaluate("modList().map(e=>[e.title,e.snip,e.by===modMe()])")
    check(len(mine) == 2 and all(x[2] for x in mine) and 'vila dormia' in mine[0][1], f'mudanças do autor aparecem com trecho ({mine})')
    check(await a.locator('#modBox .mod').count() == 2 and 'por você' in await a.evaluate("$('#modBox').innerText"), 'lista Últimas modificações embaixo de Rascunhos')
    await a.evaluate(f"openChapter('{ch[0]}')"); await a.wait_for_timeout(500)
    await a.click('[data-act=colShare]'); await a.wait_for_selector('.dlg-f .btn.primary'); await a.click('.dlg-f .btn.primary'); await a.wait_for_selector('.col-link', timeout=15000)
    links = await a.evaluate("[...document.querySelectorAll('.col-link input')].map(i=>i.value)"); await a.click('.dlg-f .btn.primary')
    co = await c.user('coautor', url=links[0].split('/')[-1]); await co.wait_for_selector('.dlg-f .btn.primary', timeout=10000); await co.click('.dlg-f .btn.primary'); await co.wait_for_selector('#page', timeout=15000); await co.wait_for_timeout(1200)
    await co.evaluate(f"openChapter('{ch[1]}')"); await co.wait_for_timeout(1000)
    await co.click('#page'); await co.keyboard.press('Control+Home'); await co.keyboard.type('Um dragão pousou no telhado. '); await co.wait_for_timeout(1600)
    await co.evaluate('flushWrites()'); await a.wait_for_timeout(2500)
    un = await a.evaluate("modUnread().map(e=>[e.title,e.snip,e.name])")
    check(len(un) == 1 and 'dragão pousou' in un[0][1], f'autor vê a mudança do coautor com o trecho ({un})')
    check(await a.locator('#modBox .mod.unread').count() == 1 and await a.locator('#modBox .mod-badge').count() == 1, 'mudança nova aparece destacada com selo')
    check(await a.locator('#modToast').count() == 1, 'aviso aparece na tela do autor')
    await a.click('#modToast .mt-go'); await a.wait_for_timeout(900)
    check(await a.evaluate('S.cid') == ch[1], 'clicar no aviso abre o capítulo alterado')
    check(await a.evaluate("!CSS.highlights||CSS.highlights.has('ink-mod')"), 'trecho alterado fica marcado')
    check(await a.evaluate('modUnread().length') == 0 and await a.locator('#modBox .mod-badge').count() == 0, 'depois de ver, o selo some')
    check(len(await a.evaluate(f"modList().filter(e=>e.cid==='{ch[0]}')")) == 1, 'a mudança antiga do autor continua na lista (as listas se somam)')
    c.no_errors()

async def t_lojas(b):
  async with Ctx(b) as c:
    m = await c.user('mestre'); await new_project(m, 'rpg', 'Mercado'); gid = await open_table(m)
    await m.evaluate("gamePatch({items:[{id:'i1',name:'Poção de cura',icon:'🧪',type:'Consumível',value:'50 PO'},{id:'i2',name:'Espada longa',icon:'🗡️',type:'Arma',value:'15'}]})"); await m.wait_for_timeout(400)
    await m.click('[data-act=tTab][data-t=shop]'); await m.wait_for_selector('[data-sh=new]')
    await m.fill('#shStart', '100'); await m.dispatch_event('#shStart', 'change'); await m.fill('#shCoin', 'PO'); await m.dispatch_event('#shCoin', 'change')
    await m.click('[data-sh=new]'); await m.wait_for_selector('.shop-tpl'); await m.click('.shop-tpl[data-v=botica]'); await m.wait_for_selector('.shop-ed')
    sh = await m.evaluate("shopsOf().map(s=>[s.name,s.items.map(e=>[e.item,e.price])])")
    check(sh == [['Botica', [['i1', 50]]]], f'loja Botica criada com a poção pelo tipo e preço do Valor ({sh})')
    await m.fill('.shop-row[data-item=i1] [data-s]', '2'); await m.dispatch_event('.shop-row[data-item=i1] [data-s]', 'change'); await m.wait_for_timeout(200)
    await m.click('.shop-ed .toggle'); await m.wait_for_timeout(500)
    check(await m.evaluate("shopsOf()[0].open && shopsOf()[0].items[0].stock===2"), 'estoque 2 e loja aberta')
    if os.environ.get('SHOTS'): await m.screenshot(path='/tmp/loja_m.png', full_page=True)
    p = await c.user('jogador'); await join_table(p, gid)
    check(await p.evaluate('mySeat().coins') == 100, 'personagem novo começa com 100 moedas')
    await p.wait_for_selector('[data-act=tTab][data-t=shop]', timeout=8000); await p.click('[data-act=tTab][data-t=shop]'); await p.wait_for_selector('[data-buy=i1]')
    check('100' in await p.evaluate("$('.shop-purse').innerText") and 'PO' in await p.evaluate("$('.shop-purse').innerText"), 'jogador vê a bolsa com o nome da moeda')
    if os.environ.get('SHOTS'): await p.set_viewport_size({'width':390,'height':800}); await p.wait_for_timeout(400); await p.screenshot(path='/tmp/loja_p.png'); await p.set_viewport_size({'width':1280,'height':800})
    await p.click('[data-buy=i1]'); await p.wait_for_timeout(1500)
    st = await p.evaluate("[mySeat().coins,(mySeat().inv||[]).filter(e=>e.item==='i1').reduce((a,e)=>a+e.qty,0),shopsOf()[0].items[0].stock]")
    check(st == [50, 1, 1], f'compra: tira 50 moedas, poção na mochila, estoque baixa para 1 ({st})')
    await p.click('[data-buy=i1]'); await p.wait_for_timeout(1500)
    check(await p.evaluate("$('[data-buy=i1]').disabled && /Esgotado/.test($('[data-buy=i1]').textContent)"), 'estoque acabou: Esgotado')
    await p.click('[data-sht=sell]'); await p.wait_for_selector('[data-sell]'); await p.click('[data-sell] >> nth=0'); await p.wait_for_timeout(1200)
    check(await p.evaluate('mySeat().coins') == 25, 'vender devolve metade do preço')
    await m.wait_for_timeout(500)
    check('Botica' in await m.evaluate("$('#tMain').innerText") and 'comprou Poção de cura' in await m.evaluate("$('#tMain').innerText"), 'mestre vê as compras na aba Lojas')
    await m.click('.shop-ed .toggle'); await m.wait_for_timeout(1200)
    check(await p.locator('[data-act=tTab][data-t=shop]').count() == 1 and 'Nenhuma loja aberta' in await p.evaluate("$('#tMain').innerText"), 'loja fechada some para o jogador')
    c.no_errors()

async def t_cyberpunk(b):
  async with Ctx(b) as c:
    m = await c.user('mestre'); await new_project(m, 'rpg', 'Neon'); gid = await open_table(m)
    check(await m.evaluate("!availRaces().includes('ciborgue')"), 'mesa de fantasia não mostra ciborgue/androide')
    await m.evaluate("T.mtab='camp';renderSubtabs();renderTab()"); await m.wait_for_selector('#cyGo')
    await m.click('#cyGo'); await m.wait_for_timeout(1200)
    st = await m.evaluate("""[tplFields(T.game.template).find(f=>f.label==='Classe').choices.map(c=>c.name).join(','),
      T.game.items.some(i=>i.name==='Katana monomolecular'), T.game.chars.some(c=>c.name==='Ciberpsicopata'),
      shopsOf().some(s=>s.name==='Mercado negro'), Object.values(T.maps).some(x=>x.name==='Distrito Neon'&&x.style==='cyber'), T.game.coinName, T.game.startCoins,
      tplFields(T.game.template).find(f=>f.label==='Classe').choices.find(c=>c.name==='Netrunner').items.length>0]""")
    check(st[0] == 'Solo,Netrunner,Techie,Medtech,Fixer,Nômade', f'ficha Cyberpunk com as classes ({st[0]})')
    check(st[1] and st[2] and st[3] and st[4], f'armas, inimigos, Mercado negro e mapa Distrito Neon criados ({st[1:5]})')
    check(st[5] == 'eb' and st[6] == 500 and st[7], 'moeda eb, 500 iniciais e classes equipadas')
    check(await m.evaluate("availRaces().join(',')") == 'humano,ciborgue,androide', 'mesa cyberpunk oferece Humano, Ciborgue e Androide')
    await m.evaluate("T.mtab='maps';T.edit=cl(Object.values(T.maps).find(x=>x.name==='Distrito Neon'));renderSubtabs();renderTab()"); await m.wait_for_selector('#mapC'); await m.wait_for_timeout(600)
    check(await m.evaluate("$('.mtool[data-t=road]').title") == 'Asfalto', 'ferramentas com nomes cyberpunk (Asfalto, Prédio, Loja neon…)')
    if os.environ.get('SHOTS'): await m.screenshot(path='/tmp/cy_map.png')
    imgs = await m.evaluate("""[['ciborgue','tatico','visor','#00e5ff'],['androide','netrunner','fones','#ff2bd6'],['humano','jaqueta','oculos','#9dff00'],['ciborgue','corpo','mascara','#ff6a00']].map(([r,o,a,h],i)=>{const L=defaultLook(r,o,'p'+i);Object.assign(L,{acc:a,hairColor:h,marks:i===2?'circuito':'nenhuma',outfitColor:OUTFIT_COLORS[o][0],accent:OUTFIT_COLORS[o][1]});return lookAvatar(L,160)})""")
    check(all(x.startswith('data:image/png') for x in imgs), 'retratos cyberpunk desenhados')
    if os.environ.get('SHOTS'):
      await m.evaluate("document.body.insertAdjacentHTML('beforeend','<div id=cyP style=\"position:fixed;inset:0;z-index:9999;background:#111;display:flex;gap:8px;padding:20px\"></div>')")
      await m.evaluate("""[['ciborgue','tatico','visor','#00e5ff'],['androide','netrunner','fones','#ff2bd6'],['humano','jaqueta','oculos','#9dff00'],['ciborgue','corpo','mascara','#ff6a00'],['androide','jaqueta','implante','#8a2be2']].forEach(([r,o,a,h],i)=>{const L=defaultLook(r,o,'p'+i);Object.assign(L,{acc:a,hairColor:h,marks:i===2?'circuito':'nenhuma',outfitColor:OUTFIT_COLORS[o][0],accent:OUTFIT_COLORS[o][1],bg:'#160a26'});const cv=document.createElement('canvas');cv.width=200;cv.height=240;cv.style.cssText='width:200px;height:240px;flex:none';drawPortrait(cv.getContext('2d'),L,200,240);document.getElementById('cyP').appendChild(cv)})""")
      await m.wait_for_timeout(300); await m.screenshot(path='/tmp/cy_look.png', clip={'x':0,'y':0,'width':1100,'height':290})
    c.no_errors()

async def t_offline_abrir(b):
  import subprocess
  root = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); port = 8779
  srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '--bind', '127.0.0.1'], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
  ctx = await b.new_context(viewport={'width': 1200, 'height': 800}); errs = []
  try:
    await asyncio.sleep(1)
    pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script("window.INK_FB={};")
    await pg.goto(f'http://localhost:{port}/index.html'); await pg.wait_for_selector('.home', timeout=20000)
    await pg.evaluate("navigator.serviceWorker.ready.then(()=>1)")
    n = 0
    for _ in range(40):
      n = await pg.evaluate("caches.keys().then(ks=>ks.find(k=>k.startsWith('ink-app-'))).then(k=>k?caches.open(k).then(c=>c.keys()).then(x=>x.length):0)")
      if n > 40: break
      await pg.wait_for_timeout(500)
    check(n > 40, f'arquivos do app guardados no aparelho ({n})')
    await pg.evaluate("localStorage.setItem('escritas:p_off1',JSON.stringify({id:'off1',kind:'project',type:'book',title:'Livro de teste',chapters:[],drafts:[],updatedAt:Date.now()}))")
    srv.terminate(); srv.wait()
    t0 = time.time(); await pg.reload(wait_until='domcontentloaded'); await pg.wait_for_selector('.home', timeout=15000)
    check(True, f'sem servidor/internet o app abre do mesmo jeito ({time.time()-t0:.1f} s)')
    check(await pg.evaluate("!!window.DOMPurify && /<b>/.test(sanitize('<b>ok</b><img src=x onerror=alert(1)>'))") if await pg.evaluate("typeof sanitize==='function'") else await pg.evaluate("!!window.DOMPurify"), 'limpeza de HTML (DOMPurify) funciona offline: a formatação do texto não se perde')
    check(not errs, 'sem erros de JavaScript offline' + ('' if not errs else ': ' + ' | '.join(errs[:3])))
  finally:
    try: srv.terminate()
    except Exception: pass
    await ctx.close()

async def t_offline_rascunhos(b):
  async with Ctx(b) as c:
    a = await c.user('offlinista'); await new_project(a, 'book', 'Diário'); await type_in(a, 'Texto escrito com internet.', 2500)
    await a.evaluate('flushWrites&&flushWrites()'); await a.wait_for_timeout(800)
    cid = await a.evaluate('S.cid')
    await c.ctx.set_offline(True); await a.wait_for_timeout(300)
    if os.environ.get('SHOTS'): await a.wait_for_timeout(300); await a.screenshot(path='/tmp/off1.png')
    check(await a.locator('#offBanner').count() == 1 and 'Sem internet' in await a.evaluate("$('#status').innerText"), 'aviso de sem internet aparece')
    await type_in(a, ' Frase escrita sem internet.', 1800); await a.evaluate('flushWrites()'); await a.wait_for_timeout(400)
    j = await a.evaluate("Object.keys(offJ.load().e)")
    cloud = await a.evaluate(f"_offGet('c_{cid}').then(d=>d&&d.html||'')")
    check(f'c_{cid}' in j and 'sem internet' not in cloud, f'sem internet o texto fica no aparelho e não vai para o capítulo na nuvem ({j})')
    await a.evaluate('ACT.chAdd()'); await a.wait_for_timeout(900); await type_in(a, 'Capítulo inteiro criado offline.', 1800); await a.evaluate('flushWrites()'); await a.wait_for_timeout(400)
    newid = await a.evaluate('S.cid')
    await a.evaluate(f"openChapter('{cid}')"); await a.wait_for_timeout(700)
    check('sem internet' in await a.evaluate("$('#page').innerText"), 'ao voltar no capítulo, o texto offline continua na tela')
    await c.ctx.set_offline(False); await a.wait_for_timeout(5000)
    st = await a.evaluate(f"""[P().drafts.map(id=>P().chapters.find(c=>c.id===id).title), P().drafts.includes('{newid}'), offJ.count(), S.cid!=='{cid}', !!$('#offBar'), !!$('#offDone')]""")
    check(any('(offline' in t for t in st[0]) and st[1], f'internet de volta: cópia offline e capítulo novo foram para Rascunhos ({st[0]})')
    check(st[2] == 0 and st[3] and st[4] and st[5], f'diário limpo, rascunho aberto com a faixa e aviso na tela ({st[2:]})')
    if os.environ.get('SHOTS'): await a.screenshot(path='/tmp/off2.png')
    orig = await a.evaluate(f"_offGet('c_{cid}').then(d=>d&&d.html||'')")
    check('com internet' in orig and 'sem internet' not in orig, 'o capítulo original não foi mexido')
    await a.click('#offRep'); await a.wait_for_selector('.dlg-f .btn.primary'); await a.click('.dlg-f .btn.primary'); await a.wait_for_timeout(1500)
    await a.evaluate('flushWrites&&flushWrites()'); await a.wait_for_timeout(800)
    orig = await a.evaluate(f"_offGet('c_{cid}').then(d=>d&&d.html||'')")
    check('sem internet' in orig and await a.evaluate(f"S.cid==='{cid}' && !P().chapters.some(c=>/\\(offline/.test(c.title))"), 'Substituir leva o texto offline para o capítulo e apaga o rascunho')
    c.no_errors()

async def t_offline_mesa(b):
  async with Ctx(b) as c:
    m = await c.user('mestreoff'); await new_project(m, 'rpg', 'Mesa off'); gid = await open_table(m)
    await c.ctx.set_offline(True); await m.wait_for_timeout(300)
    await m.evaluate("gamePatch({gmNotes:'Preparado sem internet'})"); await m.wait_for_timeout(300)
    check(await m.evaluate('S.offGame===true'), 'mudança na mesa sem internet fica na fila')
    await c.ctx.set_offline(False); await m.wait_for_timeout(2500)
    txt = await m.evaluate("[...document.querySelectorAll('.toast,.toasts *')].map(e=>e.innerText).join(' | ')")
    check(await m.evaluate('S.offGame===false') and 'sincronizada' in txt, f'internet de volta: mesa sincronizada ({txt[:120]})')
    c.no_errors()

TESTS = [('modo_local', t_modo_local), ('conta_nuvem', t_conta_nuvem), ('economia', t_economia), ('mesa_visitante', t_mesa_visitante),
         ('combate', t_combate), ('mapa_secreto', t_mapa_secreto), ('coautoria', t_coautoria), ('moderacao_conta', t_moderacao_conta),
         ('levar_para_o_site', t_levar_para_o_site), ('celular', t_celular), ('menus', t_menus), ('revisor', t_revisor), ('relatos', t_relatos), ('zoom', t_zoom), ('telao', t_telao), ('rotulo', t_rotulo), ('previa_celular', t_previa_celular), ('modificacoes', t_modificacoes), ('lojas', t_lojas), ('cyberpunk', t_cyberpunk), ('offline_abrir', t_offline_abrir), ('offline_rascunhos', t_offline_rascunhos), ('offline_mesa', t_offline_mesa)]

async def main():
  only = sys.argv[1:]; fails = []
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path=CHROME, args=['--no-sandbox']) if CHROME else await p.chromium.launch()
    for name, fn in TESTS:
      if only and not any(o in name for o in only): continue
      for tent in (1, 2):                     # testes de navegador às vezes oscilam: tenta de novo uma vez
        print(f'▶ {name}' + (' (2ª tentativa)' if tent == 2 else ''), flush=True); t0 = time.time()
        try: await asyncio.wait_for(fn(b), 300); print(f'  ok ({time.time() - t0:.0f} s)', flush=True); break
        except Exception as e:
          print(f'  ✗ FALHOU: {e if isinstance(e, Fail) else repr(e)[:400]}', flush=True)
          if not isinstance(e, Fail): traceback.print_exc(limit=2)
          if tent == 2: fails.append(name)
    await b.close()
  print('\nResultado:', 'tudo certo ✅' if not fails else f'{len(fails)} falha(s): {", ".join(fails)} ❌')
  sys.exit(1 if fails else 0)

asyncio.run(main())
