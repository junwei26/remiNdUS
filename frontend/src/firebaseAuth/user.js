import { firebaseAuth } from "../firebase";

export const isLoggedIn = () => {
  return firebaseAuth.currentUser !== null;
};

export const signOut = () => {
  firebaseAuth
    .signOut()
    .then(() => {
      // Sign-out successful.
      alert("Sign Out Successful. See you again!");
    })
    .catch((error) => {
      // An error happened.
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(`Error: Unable to sign out with error code ${errorCode}. ${errorMessage}`);
    });
};
