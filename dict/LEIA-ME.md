# Dicionários do corretor do Inkmind

Arquivos de dados baixados pelo app quando a pessoa escolhe um dicionário (Revisar → Dicionários do corretor).
São distribuídos separadamente do código do app, cada um com a sua licença:

| Arquivo | Idioma | Origem | Licença |
|---|---|---|---|
| `pt-BR.trie.gz` | Português (Brasil) | VERO / LibreOffice, compilado pelo projeto cspell (`@cspell/dict-pt-br`) | GPL-3.0 ou posterior — `LICENSE-dict-pt-br.txt` |
| `pt-PT.trie.gz` | Português (Portugal) | Hunspell pt_PT, via cspell (`@cspell/dict-pt-pt`) | LGPL-3.0 — `LICENSE-dict-pt-pt.txt` |
| `en-US.trie.gz` | English (US) | SCOWL / Hunspell, via cspell (`@cspell/dict-en_us`) | MIT — `LICENSE-dict-en_us.txt` |
| `es-ES.trie.gz` | Español | Hunspell es, via cspell (`@cspell/dict-es-es`) | LGPL-3.0 — `LICENSE-dict-es-es.txt` |

O leitor desses arquivos (`js/lib/spell-worker.js`) usa a biblioteca `cspell-trie-lib` (MIT); o código-fonte do
leitor está em `tools/spell-worker-src.js`. Para gerar de novo:
`npx esbuild tools/spell-worker-src.js --bundle --format=iife --platform=browser --minify --target=es2020 --outfile=js/lib/spell-worker.js`
(com `cspell-trie-lib` instalado).
