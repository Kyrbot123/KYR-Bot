const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Running on Render (or anywhere with the env var set)
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Running locally on Termux
  const keyPath = path.join(__dirname, '..', 'serviceAccountKey.json');

  if (!fs.existsSync(keyPath)) {
    console.error('❌ No FIREBASE_SERVICE_ACCOUNT env var and no serviceAccountKey.json found.');
  }

  serviceAccount = require(keyPath);
}

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

module.exports = db;
