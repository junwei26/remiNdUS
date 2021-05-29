// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import firebase from "firebase";
import "firebase/auth";

try {
  firebase.initializeApp({
    apiKey: "AIzaSyBTxr_wgavgQfR0QRo_1s3YcjokfAru5gQ",
    authDomain: "remindus-76402.firebaseapp.com",
    projectId: "remindus-76402",
    storageBucket: "remindus-76402.appspot.com",
    messagingSenderId: "362679935759",
    appId: "1:362679935759:web:5b00bc21418416b56f547a",
    measurementId: "G-GE3HWW0N6K",
  });
} catch (err) {
  //skip already exists message which is not an actual error when hot-reloading according to github, maybe
  // See https://github.com/vercel/next.js/issues/1999
}

const fb = firebase;
export const firebaseAuth = firebase.auth();
export default fb;
