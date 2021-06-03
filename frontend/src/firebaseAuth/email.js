// These samples are intended for Web so this import would normally be
// done in HTML however using modules here is more convenient for
// ensuring sample correctness offline.
import { firebaseAuth } from "../firebase";

export function signInWithEmailPassword(email, password) {
  // [START auth_signin_password]
  firebaseAuth
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in
      var user = userCredential.user;
      alert(`Successfully logged in as user ${user.displayName}!`);
      // ...
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(`Error: Unable to login with error code ${errorCode}. ${errorMessage}`);
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
      alert(`Signed up as user ${user}. Please check your email for email verification.`);
      // ...
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(`Error: Unable to sign up with error code ${errorCode}. ${errorMessage}`);
    });
  // [END auth_signup_password]
}

export function sendEmailVerification() {
  // [START auth_send_email_verification]
  firebaseAuth.currentUser.sendEmailVerification().then(() => {
    // Email verification sent!
    alert("Emails verification sent!");
  });
  // [END auth_send_email_verification]
}

export function sendPasswordReset(email) {
  // [START auth_send_password_reset]
  firebaseAuth
    .sendPasswordResetEmail(email)
    .then(() => {
      // Password reset email sent!
      alert("Password reset email sent.");
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(`Error: Unable to send password reset with error code ${errorCode}. ${errorMessage}`);
    });
  // [END auth_send_password_reset]
}

export function confirmPasswordReset(code, newPassword) {
  firebaseAuth
    .confirmPasswordReset(code, newPassword)
    .then(() => {
      alert("Password successfully reset");
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(`Error: Unable to confirm password reset ${errorCode}. ${errorMessage}`);
    });
}
