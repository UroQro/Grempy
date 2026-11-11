import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDymXcCBEwUECjwbzpY38C_KpjufOGsPm4",
  authDomain: "grempy.firebaseapp.com",
  projectId: "grempy",
  storageBucket: "grempy.firebasestorage.app",
  messagingSenderId: "133017236873",
  appId: "1:133017236873:web:abd06e077205a762109d58",
  measurementId: "G-4W0B5L87S1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Inicializamos analytics solo si estamos en el navegador
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export const savePatientData = async (patientData) => {
  try {
    const docRef = await addDoc(collection(db, "pacientes_gremp"), {
      ...patientData,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error guardando paciente:", error);
    return { success: false, error };
  }
};
