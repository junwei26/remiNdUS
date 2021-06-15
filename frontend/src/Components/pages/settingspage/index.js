import React, { useState } from "react";
import ChangeUserInfoButton from "./changeuserinfobutton";
import DisplayUserInfo from "./displayuserinfo";
import DisplaySettings from "./displaysettings";
import { firebaseAuth } from "../../../firebase";
import { Grid, Typography } from "@material-ui/core";
import axios from "axios";
import ResetPasswordForm from "../../navigationbar/loginbutton/loginpopup/resetpasswordform";

const SettingsPage = () => {
  const user = firebaseAuth.currentUser;
  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState();
  const [verified, setVerified] = useState(false);
  const [telegramHandle, setTelegramHandle] = useState();
  const [telegramSendReminders, setTelegramSendReminders] = useState(false);
  const [telegramReminderTiming, setTelegramReminderTiming] = useState();
  const [email, setEmail] = useState(user.email);
  const [photoUrl, setPhotoUrl] = useState(user.photoURL);
  const emailVerified = user.emailVerified;
  const uid = user.uid; // The user's ID, unique to the Firebase project. Do NOT use
  // this value to authenticate with your backend server, if
  // you have one. Use User.getToken() instead.

  // const dataUrl = "https://asia-southeast2-remindus-76402.cloudfunctions.net/backendAPI/api/user/";
  const dataUrl = "http://localhost:5001/remindus-76402/asia-southeast2/backendAPI/api/user/";

  axios
    .get(dataUrl, { params: { uid: uid } })
    .then((response) => {
      setUsername(response.data.username);
      setVerified(response.data.verified);
      setTelegramHandle(response.data.telegramHandle);
      setTelegramSendReminders(response.data.telegramSendReminders);
      setTelegramReminderTiming(response.data.telegramReminderTiming);
    })
    .catch((error) => {
      alert(
        `Issue getting user settings. Error status code: ${error.response.status}. ${error.response.data.message}`
      );
    });

  const onChangeUserInfo = (newName, newPhotoUrl) => {
    setDisplayName(newName);
    setPhotoUrl(newPhotoUrl);
    setEmail(email);
  };

  return (
    <>
      <Grid container direction="column" justify="center" alignItems="center" spacing={2}>
        <Grid item>
          <Typography>Welcome to the Settings Page</Typography>
        </Grid>
        <Grid item>
          <DisplayUserInfo
            name={displayName}
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
          <DisplaySettings
            username={username}
            verified={verified}
            telegramHandle={telegramHandle}
            telegramSendReminders={telegramSendReminders}
            telegramReminderTiming={telegramReminderTiming}
          />
        </Grid>
        <Grid item>
          <ResetPasswordForm />
        </Grid>
      </Grid>
    </>
  );
};

export default SettingsPage;
