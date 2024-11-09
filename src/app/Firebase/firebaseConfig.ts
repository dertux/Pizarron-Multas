// Importa las funciones necesarias desde el SDK de Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Importa Firestore

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBbGLlWCzeVCJySlobIw6T3xhA-h6YqTEg",
  authDomain: "pizarron-multas.firebaseapp.com",
  projectId: "pizarron-multas",
  storageBucket: "pizarron-multas.firebasestorage.app",
  messagingSenderId: "370053888046",
  appId: "1:370053888046:web:ccf50af2d5077dd77147bf",
  measurementId: "G-K6FLCY2WL6",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Inicializa Firestore y exporta la instancia

export { db }; // Exporta Firestore para que esté disponible en otros archivos
