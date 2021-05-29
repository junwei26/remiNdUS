import React from "react";
import AccountComponent from "./Components/AccountComponent";
// import { firebaseAuth } from "./firebase";

// var user = firebase.auth().currentUser;
// var name, email, photoUrl, uid, emailVerified;

// if (user != null) {
//   name = user.displayName;
//   email = user.email;
//   photoUrl = user.photoURL;
//   emailVerified = user.emailVerified;
//   uid = user.uid; // The user's ID, unique to the Firebase project. Do NOT use
//   // this value to authenticate with your backend server, if
//   // you have one. Use User.getToken() instead.
// }

const App = () => {
  return <AccountComponent />;
};

export default App;
