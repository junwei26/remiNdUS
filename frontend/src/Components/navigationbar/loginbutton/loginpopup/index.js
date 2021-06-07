import React, { useState } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Grid, Card, Typography } from "@material-ui/core";
import LoginForm from "./loginform";
import ResetPasswordForm from "./resetpasswordform";

const useStyles = makeStyles(() => ({
  topbar: {
    padding: 10,
  },
  title: {
    flexGrow: 1,
  },
  card: {
    padding: 10,
  },
  close: {
    position: "relative",
    left: 20,
    top: -20,
  },
}));

const LoginPopup = (props) => {
  const classes = useStyles();
  const [loginActive, setLoginActive] = useState(true);

  const flipLoginActive = () => {
    setLoginActive(!loginActive);
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
              <Typography>{loginActive ? "Login" : "Forgot Password"}</Typography>
            </Grid>
            <Grid item className={classes.close}>
              <Button onClick={props.close}>X</Button>
            </Grid>
          </Grid>
        </Grid>
        {/* Login or reset password form */}
        <Grid item>
          {loginActive ? (
            <LoginForm flipLoginActive={flipLoginActive} />
          ) : (
            <ResetPasswordForm flipLoginActive={flipLoginActive} />
          )}
        </Grid>
        <Grid item>
          {loginActive ? (
            <Button onClick={flipLoginActive}>Forgot password?</Button>
          ) : (
            <Button onClick={flipLoginActive}>Back</Button>
          )}
        </Grid>
      </Grid>
    </Card>
  );
};

LoginPopup.propTypes = {
  close: PropTypes.func,
};

export default LoginPopup;
