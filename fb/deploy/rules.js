// Publica firestore.rules no projeto Firebase usando a chave de conta de serviço (segredo do GitHub).
const fs = require('fs');
const admin = require('firebase-admin');
const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
console.log('Projeto:', sa.project_id, '| conta de serviço:', sa.client_email);
admin.initializeApp({ credential: admin.credential.cert(sa), projectId: sa.project_id });
const src = fs.readFileSync(process.argv[2] || 'firestore.rules', 'utf8');
(async () => {
  for (let i = 1; i <= 3; i++) {
    try {
      const r = await admin.securityRules().releaseFirestoreRulesetFromSource(src);
      console.log('Regras publicadas →', r.name); process.exit(0);
    } catch (e) {
      console.error(`Tentativa ${i}: ${e.code || ''} ${e.message}`);
      if (e.errorInfo) console.error(JSON.stringify(e.errorInfo));
      if (i < 3) await new Promise(r => setTimeout(r, 20000));
    }
  }
  process.exit(1);
})();
