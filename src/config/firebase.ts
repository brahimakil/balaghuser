import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCG2ZKCJDHCyXehaqOL66S7gb44o6wu7ow",
  authDomain: "balagh-adbc4.firebaseapp.com",
  projectId: "balagh-adbc4",
  storageBucket: "balagh-adbc4.firebasestorage.app",
  messagingSenderId: "849348028193",
  appId: "1:849348028193:web:66c65700b9454efe22c060",
  measurementId: "G-FG3Q3B40C8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

// Initialize Analytics (optional)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app; 