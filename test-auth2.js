import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const auth = getAuth(app);

signInWithEmailAndPassword(auth, "test@example.com", "password123")
  .then(() => console.log("SUCCESS"))
  .catch((e) => { console.error("ERROR:", e.code); process.exit(1); });
