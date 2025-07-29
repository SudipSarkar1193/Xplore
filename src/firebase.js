import { useMutation } from "@tanstack/react-query";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import toast from "react-hot-toast";


const firebaseConfig = {
	apiKey: import.meta.env.VITE_APIKEY,
	authDomain: import.meta.env.VITE_AUTH,
	projectId: import.meta.env.VITE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_ST_BCT,
	messagingSenderId: import.meta.env.VITE_M_S_ID,
	appId: import.meta.env.VITE_APP_ID,
	measurementId: import.meta.env.VITE_MES_ID,
};



// Initialize Firebase
export const app = initializeApp(firebaseConfig);
