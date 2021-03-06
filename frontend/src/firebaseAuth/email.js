// These samples are intended for Web so this import would normally be
// done in HTML however using modules here is more convenient for
// ensuring sample correctness offline.
import { firebaseAuth } from "../firebase";
import axios from "axios";
import { updateProfile } from "./userSettings";

const { REACT_APP_URL, REACT_APP_BACKEND_URL } = process.env;

export function signInWithEmailPassword(email, password) {
  // [START auth_signin_password]
  firebaseAuth
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      localStorage.setItem("isLoggedIn", "true");
      window.location.replace(REACT_APP_URL + "/dashboard");
      // ...
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(`Error: Unable to login with error code ${errorCode}. ${errorMessage}`);
      return false;
    });
  // [END auth_signin_password]
}

export function signUpWithEmailPassword(email, password) {
  // [START auth_signup_password]
  firebaseAuth
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in
      var user = userCredential.user;
      // Send email verification
      sendEmailVerification(email);
      const userDetails = {
        uid: user.uid,
        username: email.substring(0, email.indexOf("@")),
        telegramHandle: "",
      };
      axios
        .post(REACT_APP_BACKEND_URL + "/user/create/", userDetails)
        .then(() => {
          updateProfile(userDetails.username, null);
          alert(`Signed up as user ${user.uid}. Please check your email for email verification.`);
          localStorage.setItem("isLoggedIn", "true");
          window.location.replace(REACT_APP_URL + "/dashboard");
        })
        .catch((error) => {
          alert(`Issue creating user database. Please inform the administrator ${error}`);
          return false;
        });

      // ...
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(`Error: Unable to sign up with error code ${errorCode}. ${errorMessage}`);
      return false;
    });
  // [END auth_signup_password]
}

export function sendEmailVerification() {
  // [START auth_send_email_verification]
  firebaseAuth.currentUser.sendEmailVerification().then(() => {
    // Email verification sent!
    alert("Emails verification sent!");
    return true;
  });
  // [END auth_send_email_verification]
}

export function sendPasswordReset(email) {
  // [START auth_send_password_reset]
  firebaseAuth
    .sendPasswordResetEmail(email)
    .then(() => {
      // Password reset email sent!
      alert(`Password reset email sent to ${email}`);
      return true;
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(`Error: Unable to send password reset with error code ${errorCode}. ${errorMessage}`);
      return false;
    });
  // [END auth_send_password_reset]
}

export function confirmPasswordReset(code, newPassword) {
  firebaseAuth
    .confirmPasswordReset(code, newPassword)
    .then(() => {
      alert("Password successfully reset");
      return true;
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(`Error: Unable to confirm password reset ${errorCode}. ${errorMessage}`);
      return false;
    });
}
