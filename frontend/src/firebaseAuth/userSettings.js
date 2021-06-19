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
      return true; // Clarify if this is okay? Returning success/failure. If so, then can add this to email.js as well
    })
    .catch((error) => {
      // An error happened.
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(`Error: Unable to sign out with error code ${errorCode}. ${errorMessage}`);
      return false;
    });
};

export const updateProfile = (newDisplayName, newPhotoURL) => {
  const user = firebaseAuth.currentUser;

  if (!isDisplayNameValid(newDisplayName)) {
    alert(`Error: Invalid display name, please try a different name`);
    return;
  }

  user
    .updateProfile({
      displayName: newDisplayName,
      photoURL: newPhotoURL,
    })
    .then(function () {
      // Update successful.
      alert("Update profile successful");
    })
    .catch(function (error) {
      // An error happened.
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(`Error: Unable to update profile with error code ${errorCode}. ${errorMessage}`);
      return false;
    });

  return true;
};

const isDisplayNameValid = (displayName) => {
  // Consider adding more checks. E.g. for vulgarities/offensive names, etc
  return displayName.length <= 3 || displayName.length > 20 ? false : true;
};

/*
 * Note the following link as to why we have to set password strength validation ourselves, and note that this password strength validation can be bypassed
 * by anyone through directly accessing our firebase API. As of now, strength validation is exactly the same as firebase's (No less than 7 characters) but with Confirm Password bar
 * https://stackoverflow.com/questions/36318198/set-minimum-password-length-firebase-email-password-authentication#:~:text=4%20Answers&text=There%20is%20currently%20no%20way,for%20Firebase%20email%2Bpassword%20Authentication.&text=A%20FirebaseAuthWeakPasswordException%20is%20thrown%20when,update%20an%20existing%20account's%20password.
 */
export const isNewPasswordValid = (newPassword, newPasswordConfirm) => {
  return newPassword != newPasswordConfirm ? false : newPasswordConfirm.length <= 6 ? false : true;
};
