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

TESTS = [('modo_local', t_modo_local), ('conta_nuvem', t_conta_nuvem), ('economia', t_economia), ('mesa_visitante', t_mesa_visitante),
         ('combate', t_combate), ('mapa_secreto', t_mapa_secreto), ('coautoria', t_coautoria), ('moderacao_conta', t_moderacao_conta),
         ('levar_para_o_site', t_levar_para_o_site), ('celular', t_celular)]

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
