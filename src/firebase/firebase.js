// import firebase from "firebase/app";
// import "firebase/auth";
// import "firebase/firestore";
// import "firebase/storage";
// import "firebase/functions";

// // Initialize Firebase
// const firebaseConfig = {
// 	apiKey: "AIzaSyAkwj7gCrYLa17fTKyg5mYymbN9Y-3rtDg",
// 	authDomain: "fast-in-transit.firebaseapp.com",
// 	databaseURL: "https://fast-in-transit-default-rtdb.firebaseio.com",
// 	projectId: "fast-in-transit",
// 	storageBucket: "fast-in-transit.appspot.com",
// 	messagingSenderId: "702731676615",
// 	appId: "1:702731676615:web:aeb0a04e623159e26787e2"
//   };

// firebase.initializeApp(firebaseConfig);
// const auth = firebase.auth();
// const firestore = firebase.firestore();
// const storage = firebase.storage();
// const functions = firebase.functions();
// const fieldValue = firebase.firestore.FieldValue;

// const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
// const facebookAuthProvider = new firebase.auth.FacebookAuthProvider();
// const githubAuthProvider = new firebase.auth.GithubAuthProvider();
// const twitterAuthProvider = new firebase.auth.TwitterAuthProvider();

// // Ignore undefined properties
// firebase.firestore().settings({
// 	ignoreUndefinedProperties: true,
// });

// export { auth, firestore, storage, functions, fieldValue, googleAuthProvider, githubAuthProvider, facebookAuthProvider, twitterAuthProvider };

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, GithubAuthProvider, TwitterAuthProvider } from "firebase/auth";
import { getFirestore, initializeFirestore, FieldValue } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAkwj7gCrYLa17fTKyg5mYymbN9Y-3rtDg",
  authDomain: "fast-in-transit.firebaseapp.com",
  databaseURL: "https://fast-in-transit-default-rtdb.firebaseio.com",
  projectId: "fast-in-transit",
  storageBucket: "fast-in-transit.appspot.com",
  messagingSenderId: "702731676615",
  appId: "1:702731676615:web:aeb0a04e623159e26787e2"
};

const firebaseApp = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(firebaseApp);
const firestore = initializeFirestore(firebaseApp, { ignoreUndefinedProperties: true });
const storage = getStorage(firebaseApp);
const functions = getFunctions(firebaseApp);
const fieldValue = FieldValue;

// Initialize auth providers
const googleAuthProvider = new GoogleAuthProvider();
const facebookAuthProvider = new FacebookAuthProvider();
const githubAuthProvider = new GithubAuthProvider();
const twitterAuthProvider = new TwitterAuthProvider();

export { auth, firestore, storage, functions, fieldValue, googleAuthProvider, githubAuthProvider, facebookAuthProvider, twitterAuthProvider };
