import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Firebase 콘솔에서 받은 설정 정보를 여기에 붙여넣으세요
    apiKey: "AIzaSyAqxEhw18yzIW22_TVqiYWuJMGEnCHPJiE",
    authDomain: "token-f5683.firebaseapp.com",
    databaseURL: "https://token-f5683-default-rtdb.firebaseio.com",
    projectId: "token-f5683",
    storageBucket: "token-f5683.firebasestorage.app",
    messagingSenderId: "545302092695",
    appId: "1:545302092695:web:b9ab4e4d6965b25d6a42d2",
    measurementId: "G-H2MCF8C46M"
  
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);