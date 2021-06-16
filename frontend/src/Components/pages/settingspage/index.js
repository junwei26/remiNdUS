import React, { useState, useEffect } from "react";
import ChangeUserInfoButton from "./changeuserinfobutton";
import DisplayUserInfo from "./displayuserinfo";
import DisplaySettings from "./displaysettings";
import { firebaseAuth } from "../../../firebase";
import { Grid, Typography } from "@material-ui/core";
import axios from "axios";
import ResetPasswordForm from "../../navigationbar/loginbutton/loginpopup/resetpasswordform";

const getSettings = (
  dataUrl,
  uid,
  setUsername,
  setVerified,
  setTelegramHandle,
  setTelegramSendReminders,
  setTelegramReminderTiming,
  setLoading
) => {
  setLoading(true);

  return axios
    .get(dataUrl, { params: { uid: uid } })
    .then((response) => {
      setUsername(response.data.username);
      setVerified(response.data.verified);
      setTelegramHandle(response.data.telegramHandle);
      setTelegramSendReminders(response.data.telegramSendReminders);
      setTelegramReminderTiming(response.data.telegramReminderTiming);
      setLoading(false);
      alert("Successfully got user settings from the database");
    })
    .catch((error) => {
      alert(
        `Issue getting user settings. Error status code: ${error.response.status}. ${error.response.data.message}`
      );
    });
};

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

  const [loading, setLoading] = useState("False");

  // const dataUrl = "https://asia-southeast2-remindus-76402.cloudfunctions.net/backendAPI/api/user/";
  const dataUrl = "http://localhost:5001/remindus-76402/asia-southeast2/backendAPI/api/user/";

  useEffect(() => {
    getSettings(
      dataUrl,
      uid,
      setUsername,
      setVerified,
      setTelegramHandle,
      setTelegramSendReminders,
      setTelegramReminderTiming,
      setLoading
    );
  }, []);

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
        <Grid item style={{ width: "25%" }}>
          <Typography variant="h4">Profile</Typography>
          <DisplayUserInfo
            name={displayName}
            email={email}
            photoUrl={photoUrl}
            emailVerified={emailVerified}
            uid={uid}
          />
        </Grid>
        <Grid item style={{ width: "25%" }}>
          <ChangeUserInfoButton onChangeUserInfo={onChangeUserInfo} />
        </Grid>
        <Grid item style={{ width: "25%" }}>
          <Typography variant="h4">{loading ? "Settings (Loading)" : "Settings"}</Typography>
          <DisplaySettings
            username={username}
            verified={verified}
            telegramHandle={telegramHandle}
            telegramSendReminders={telegramSendReminders}
            telegramReminderTiming={telegramReminderTiming}
          />
        </Grid>
        <Grid item style={{ width: "25%" }}>
          <ResetPasswordForm />
        </Grid>
      </Grid>
    </>
  );
};

export default SettingsPage;
