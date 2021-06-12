import React, { useState } from "react";
import ChangeUserInfoButton from "./changeuserinfobutton";
import DisplayUserInfo from "./displayuserinfo";
import { firebaseAuth } from "../../../firebase";
import { Grid } from "@material-ui/core";
import ResetPasswordForm from "../../navigationbar/loginbutton/loginpopup/resetpasswordform";

const SettingsPage = () => {
  const user = firebaseAuth.currentUser;
  if (user != null) {
    const [name, setName] = useState(user.displayName);
    const [email, setEmail] = useState(user.email);
    const [photoUrl, setPhotoUrl] = useState(user.photoURL);
    const emailVerified = user.emailVerified;
    const uid = user.uid; // The user's ID, unique to the Firebase project. Do NOT use
    // this value to authenticate with your backend server, if
    // you have one. Use User.getToken() instead.

    const onChangeUserInfo = (newName, newPhotoUrl) => {
      setName(newName);
      setPhotoUrl(newPhotoUrl);
      setEmail(email);
    };

    return (
      <>
        <div style={{ textAlign: "center" }}>Welcome to the Settings Page</div>

        <Grid container direction="column" justify="center" alignItems="center" spacing={2}>
          <Grid item>
            <DisplayUserInfo
              name={name}
              email={email}
              photoUrl={photoUrl}
              emailVerified={emailVerified}
              uid={uid}
            />
          </Grid>
          <Grid item>
            <ChangeUserInfoButton onChangeUserInfo={onChangeUserInfo} />
          </Grid>
          <Grid item>
            <ResetPasswordForm />
          </Grid>
        </Grid>
      </>
    );
  } else {
    return <div>No user stuff to display</div>;
  }
};

export default SettingsPage;
