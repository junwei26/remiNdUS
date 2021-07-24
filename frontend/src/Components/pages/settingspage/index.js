import React, { useState, useEffect } from "react";
import ChangeUserInfoButton from "./changeuserinfobutton";
import DisplayUserInfo from "./displayuserinfo";
import DisplaySettings from "./displaysettings";
import { firebaseAuth } from "../../../firebase";
import { Grid, Typography, TextField, Button, Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import axios from "axios";
import { sendPasswordReset } from "../../../firebaseAuth/email";

const { REACT_APP_BACKEND_URL } = process.env;

const SettingsPage = () => {
  const user = firebaseAuth.currentUser;
  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState("Loading");
  const [verified, setVerified] = useState("Loading");
  const [telegramHandle, setTelegramHandle] = useState("Loading");
  const [telegramSendReminders, setTelegramSendReminders] = useState("Loading");
  const [telegramReminderTiming, setTelegramReminderTiming] = useState("Loading");
  const [email, setEmail] = useState(user.email);
  const [photoUrl, setPhotoUrl] = useState(user.photoURL);
  const [currentAlert, setCurrentAlert] = useState({ severity: "", message: "" });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbarOpen(false);
  };
  const emailVerified = user.emailVerified;
  const uid = user.uid;

  const [loading, setLoading] = useState("False");

  const getSettings = (
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
      .get(REACT_APP_BACKEND_URL + "/user", { params: { uid: uid } })
      .then((response) => {
        setUsername(response.data.username);
        setVerified(response.data.verified);
        setTelegramHandle(response.data.telegramHandle);
        setTelegramSendReminders(response.data.telegramSendReminders);
        setTelegramReminderTiming(response.data.telegramReminderTiming);
        setLoading(false);
        setCurrentAlert({ severity: "info", message: "Retrieved user settings from database" });
        setSnackbarOpen(true);
      })
      .catch((error) => {
        setCurrentAlert({
          severity: "error",
          message: `Error retrieving user settings from database 
       Error status code: ${error.response.status}. ${error.response.data.message}`,
        });
        setSnackbarOpen(true);
      });
  };

  useEffect(() => {
    getSettings(
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

  const handleSendPasswordReset = (e) => {
    e.preventDefault();
    sendPasswordReset(e.target.email.value);
  };

  return (
    <>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert severity={currentAlert.severity}>
          <AlertTitle>{currentAlert.message}</AlertTitle>
        </Alert>
      </Snackbar>
      <Grid container direction="column" justify="center" alignItems="center" spacing={2}>
        <Grid item>
          <Typography>Welcome to the Settings Page</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h4">Profile</Typography>
          <DisplayUserInfo
            name={displayName}
            email={email}
            photoUrl={photoUrl}
            emailVerified={emailVerified}
            uid={uid}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <ChangeUserInfoButton onChangeUserInfo={onChangeUserInfo} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h4" fullWidth>
            {loading ? "Settings (Loading)" : "Settings"}
          </Typography>
          <DisplaySettings
            username={username}
            verified={verified}
            telegramHandle={telegramHandle}
            telegramSendReminders={telegramSendReminders}
            telegramReminderTiming={telegramReminderTiming}
            setUsername={setUsername}
            setTelegramHandle={setTelegramHandle}
            setTelegramSendReminders={setTelegramSendReminders}
            setTelegramReminderTiming={setTelegramReminderTiming}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <form noValidate onSubmit={handleSendPasswordReset}>
            <Grid container direction="column" justify="center" alignItems="center" spacing={2}>
              <Grid item style={{ width: "80%" }}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  name="email"
                  label="Email"
                  color="primary"
                  autoFocus
                />
              </Grid>
              <Grid item style={{ width: "80%" }}>
                <Button type="submit" fullWidth variant="contained" color="primary">
                  Send Reset Password Email
                </Button>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>
    </>
  );
};

export default SettingsPage;
