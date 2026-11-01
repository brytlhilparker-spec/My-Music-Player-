const firebaseConfig = {
  apiKey: "AIzaSyAH-CwX4d_mcayxAFvFUFE9bLkc2iIMiEs",
  authDomain: "my-music-player-c204d.firebaseapp.com",
  projectId: "my-music-player-c204d",
  storageBucket: "my-music-player-c204d.firebasestorage.app",
  messagingSenderId: "1005616617367",
  appId: "1:1005616617367:web:8a42f81d00393b56ea96d2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


export {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
};

