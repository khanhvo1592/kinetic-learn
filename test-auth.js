import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const auth = getAuth(app);

signInAnonymously(auth)
  .then((userCredential) => {
    console.log("SUCCESS:", userCredential.user.uid);
    process.exit(0);
  })
  .catch((error) => {
    console.error("ERROR:", error.code, error.message);
    process.exit(1);
  });
