# Inkmind — Estúdio de Histórias e RPG

Escreva • Publique • Jogue • Viva suas histórias

**Versão atual:** v21 — 18/11/2026 (mesa pública ou particular, entrada controlada)

App para escrever livros e criar/jogar RPG de mesa: editor com ferramentas do Word, compêndio do mundo, visualização de impressão com sumário automático, exportação (PDF, Word, EPUB, HTML, Markdown, TXT) e mesa de RPG com mapas, fichas e dados.

## Como abrir
Basta abrir o `index.html` num navegador, ou publicar pelo GitHub Pages (Settings → Pages → Deploy from a branch → `main` / `/ (root)`).

## Conta e nuvem (Firebase)
Ao abrir o site, o Inkmind pede para **entrar** (Google ou e-mail e senha). Com conta:
- livros e campanhas ficam salvos na nuvem e aparecem em qualquer aparelho;
- a **mesa de RPG ao vivo** funciona (mestre e jogadores, cada um no seu aparelho);
- dá para publicar na biblioteca (Explorar).

Também dá para **continuar sem conta**: aí tudo fica só no navegador daquele aparelho.
A geração de imagem por IA continua disponível só na versão dentro do Claude.

## Arquivos
- `index.html` — o app inteiro
- `img/` — logo, banner, ícones e marca d'água
- `inkmind-fb.js` — conexão com o Firebase (login, banco de dados, imagens)
- `sw.js` — serve as imagens enviadas
- `firestore.rules` — regras de segurança do banco
- `fb/` — código-fonte da conexão com o Firebase
