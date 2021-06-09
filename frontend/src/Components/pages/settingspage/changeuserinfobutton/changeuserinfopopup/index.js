import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { TextField, Button, Grid, Card, Typography } from "@material-ui/core";
import { firebaseAuth } from "../../../../../firebase";
import * as userSettings from "../../../../../firebaseAuth/userSettings";

const useStyles = makeStyles(() => ({
  title: {
    flexGrow: 1,
  },
  card: {
    padding: 10,
  },
  close: {
    position: "relative",
    left: 10,
    top: -10,
  },
  input: {
    width: "80%",
    flexGrow: 1,
  },
}));

const ChangeUserInfoPopup = (props) => {
  const classes = useStyles();

  const handleSubmitChangeUserInfo = (e) => {
    e.preventDefault();
    if (userSettings.updateProfile(e.target.name.value, e.target.photoURL.value)) {
      props.onChangeUserInfo(e.target.name.value, e.target.photoURL.value);
    }
  };

  return (
    <Card>
      <Grid container direction="column" className={classes.card} spacing={2}>
        {/* Close prompt button */}
        <Grid item>
          <Grid
            container
            className={classes.topbar}
            direction="row"
            justify="center"
            alignItems="center"
          >
            <Grid item className={classes.title}>
              <Typography>Change User Information</Typography>
            </Grid>
            <Grid item className={classes.close}>
              <Button onClick={props.close}>X</Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <form noValidate autoComplete="off" onSubmit={handleSubmitChangeUserInfo}>
          <Grid container direction="column" justify="center" alignItems="center" spacing={2}>
            <Grid item className={classes.input}>
              <TextField
                required
                fullWidth
                id="filled-required"
                name="name"
                label="New Name"
                defaultValue={`${firebaseAuth.currentUser.displayName}`}
                variant="filled"
              />
            </Grid>
            <Grid item className={classes.input}>
              <TextField
                fullWidth
                id="filled-required"
                name="photoURL"
                label="Photo URL"
                defaultValue={`${firebaseAuth.currentUser.photoURL}`}
                variant="filled"
              />
            </Grid>
            <Grid item className={classes.input}>
              <Button fullWidth variant="contained" color="primary" type="submit">
                Submit Changes
              </Button>
            </Grid>
            <Grid item></Grid>
          </Grid>
        </form>
      </Grid>
    </Card>
  );
};

ChangeUserInfoPopup.propTypes = {
  onChangeUserInfo: PropTypes.func,
  close: PropTypes.func,
};

export default ChangeUserInfoPopup;
