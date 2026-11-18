# Integração com o Firebase

- `src/shim.js` — implementa a interface que o app usa dentro do Claude (`claude.use('db'|'user'|'assets'|'room')`) em cima do Firebase Auth + Firestore.
- `src/entry-fb.js` — liga o shim ao SDK real do Firebase. Gera `../inkmind-fb.js`.
- `src/mockfb.js` + `src/entry-mock.js` — Firebase falso para testes (localStorage).

Gerar de novo o pacote:

```
npm i firebase@13.4.0 esbuild
npx esbuild fb/src/entry-fb.js --bundle --format=esm --minify --target=es2020 --legal-comments=none --outfile=inkmind-fb.js
```

As imagens ficam na coleção `blobs` do Firestore (plano Spark, sem Cloud Storage) e são servidas em `/_blob/<id>` pelo `sw.js`.
As regras de segurança estão em `firestore.rules`.
