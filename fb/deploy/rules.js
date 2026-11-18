// Publica firestore.rules no projeto Firebase usando a chave de conta de serviço (segredo do GitHub).
const fs = require('fs');
const admin = require('firebase-admin');
const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({ credential: admin.credential.cert(sa), projectId: sa.project_id });
const src = fs.readFileSync(process.argv[2] || 'firestore.rules', 'utf8');
admin.securityRules().releaseFirestoreRulesetFromSource(src)
  .then(r => { console.log('Regras publicadas no projeto', sa.project_id, '→', r.name); process.exit(0); })
  .catch(e => { console.error('Falha ao publicar as regras:', e.message); process.exit(1); });
