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
      alert("Update of profile successful");
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
