# Como o código do Inkmind está organizado

O app não tem servidor próprio: é uma página (`index.html`) que carrega o estilo e os scripts, e guarda os dados
no Claude (versão artefato) ou no Firebase (versão do site, pelo `inkmind-fb.js`).

## Arquivos

| Arquivo | O que tem |
|---|---|
| `index.html` | Só a estrutura: carrega `css/inkmind.css` e os scripts de `js/` em ordem |
| `css/inkmind.css` | Todo o visual (temas claro/escuro, estante, editor, mesa, celular) |
| `js/01-base.js` | Utilidades, estado (`S`), armazenamento (`Store`), imagens, fontes, diálogos, cliques (`ACT`) |
| `js/02-estante.js` | Estante, pastas, abrir/criar projetos |
| `js/03-editor.js` | Área de trabalho: capítulos, editor, compêndio, galeria, estilo do livro, exportações |
| `js/04-mesa.js` | Mesa de jogo: abrir mesa, abas do mestre e do jogador, fichas, mapas e o desenho dos mapas |
| `js/05-mesa-extras.js` | Ficha pré-definida, presença, conta e senha do app, gerador de imagens, publicar e Explorar |
| `js/06-aparencia.js` | Retrato pintado do personagem e tokens |
| `js/07-mestre.js` | Personalização total do mestre |
| `js/08-tela-de-jogo.js` | Tela de jogo, dados animados, portas |
| `js/09-combate.js` | Regras jogáveis: combate, turnos, ações, XP |
| `js/10-aprender.js` | Aprender RPG: tutorial, regras básicas, guia do mestre |
| `js/11-mecanicas.js` | Os 13 módulos de mecânicas (perícias, loja, saque, condições…) e a aventura pronta |
| `js/12-backup.js` | Backup completo e restauração |
| `js/13-escrita-organizar.js` | Menções, compêndio flexível, comentários, versões, quadro |
| `js/14-paginacao.js` | Páginas reais (A4…), sumário, réguas, visualizar e PDF |
| `js/15-menus.js` | Menus agrupados, busca de ferramentas (Ctrl+K), celular |
| `js/16-ferramentas-word.js` | Localizar e substituir, link, cores, tabela, notas de rodapé, quebra de página |
| `js/17-online.js` | Site: entrar/sair, convites, mesas públicas e particulares, visitante |
| `js/18-site-publico.js` | Termos, excluir conta, denúncias, moderação, app instalável |
| `js/19-mapa-secreto.js` | O mestre publica para os jogadores só o que eles podem ver do mapa |
| `js/20-painel-mover.js` | Painel de status retrátil e ferramenta Mover do editor de mapa |
| `js/21-coautoria.js` | Escrita a várias mãos e leitores beta; levar projetos do Claude para o site |
| `js/22-economia.js` | Economia de leituras e gravações (plano grátis do Firebase) |
| `js/23-celular-dados.js` | Rolador de dados do editor com dados animados; escolhas deslizantes no celular |
| `js/24-livro-rpg.js` | Menus por tipo: livro com Wiki e dicionário; RPG com Publicar e Estilo em "Mais" |
| `js/25-dicionario.js` | Dicionário do escritor (palavras inventadas) dentro da Wiki/Compêndio; @ insere palavras |
| `js/26-revisor.js` | Revisor do escritor: dicionários baixáveis, ortografia, gramática, diálogos e estilo |
| `js/27-relatos.js` | Relatar problema/sugestão e registro automático de erros (coleção `feedback`, lida no painel 🛡 Moderação) |
| `js/lib/spell-worker.js` | Leitor dos dicionários (Web Worker), gerado de `tools/spell-worker-src.js` |
| `dict/` | Dicionários baixáveis (`*.trie.gz`) e suas licenças (`dict/LEIA-ME.md`) |
| `js/99-inicio.js` | Inicialização (sempre por último) |
| `fb/src/` | Conexão com o Firebase (`shim.js`), Firebase falso para testes (`mockfb.js`) |
| `firestore.rules` | Regras de segurança do banco |
| `tests/run.py` | Testes automáticos |

## Regras para mexer

- **A ordem dos scripts importa.** Os arquivos compartilham o mesmo escopo global, e várias partes
  "embrulham" funções de partes anteriores (ex.: `{const _rh=renderHome;renderHome=function(){…}}`).
  Uma parte nova vai num arquivo novo antes de `99-inicio.js`.
- Ao publicar uma versão nova, troque o `?v=NN` dos scripts em `index.html` e em `sw.js` (e o `ink-app-vNN`),
  para o navegador não usar arquivos velhos.
- Se mudar `fb/src`, gere de novo o `inkmind-fb.js`:
  `npx esbuild fb/src/entry-fb.js --bundle --format=esm --minify --target=es2020 --outfile=inkmind-fb.js`

## Testes automáticos

Rodam sozinhos no GitHub (aba **Actions → Testes do app**) a cada envio. Cada cenário abre o app num navegador
de verdade e confere o resultado: modo local, conta na nuvem, economia de gravações, mesa com visitante, combate,
segredos do mapa, coautoria, moderação e exclusão de conta, levar projetos do Claude para o site, celular (janela cabe na tela, dados animados), menus por tipo, revisor e relatos. `tools/varredura-celular.py` percorre ~60 telas em 320 px procurando coisas que saem da tela.

No computador: veja as instruções no topo de `tests/run.py`.

## Plano grátis do Firebase

Cota diária do projeto inteiro: 50 mil leituras, 20 mil gravações, 20 mil exclusões, 1 GiB guardado.
O painel 🛡 Moderação mostra o consumo do aparelho; o total fica no console do Firebase → Firestore → Uso.
