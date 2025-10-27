// services/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAmfKR2xXeRcV_PUXa4hGbP6HcVgsfV2LY",          // Chave de API da Web
  authDomain: "projeto-mobile-unisuam-expo.firebaseapp.com",   // Formato padrão: <ID_DO_PROJETO>.firebaseapp.com
  projectId: "projeto-mobile-unisuam-expo",                   // ID do projeto
  storageBucket: "projeto-mobile-unisuam-expo.appspot.com",   // Formato padrão: <ID_DO_PROJETO>.appspot.com
  messagingSenderId: "172745544733",                          // Número do projeto
  appId: "1:172745544733:android:302965d795e8325f39a2f4",   // ID do aplicativo Android
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };