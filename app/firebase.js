// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFLgwI0jhVorcu6zXUdkgxFna32pfuN8c",
  authDomain: "chat-app-project-42037.firebaseapp.com",
  projectId: "chat-app-project-42037",
  storageBucket: "chat-app-project-42037.appspot.com",
  messagingSenderId: "121629357135",
  appId: "1:121629357135:web:173ae66dcf0431875de63a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {auth, app}