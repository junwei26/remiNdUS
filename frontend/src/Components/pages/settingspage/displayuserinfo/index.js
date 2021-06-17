import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { ButtonGroup, Button, Typography } from "@material-ui/core";
import PropTypes from "prop-types";

const useStyles = makeStyles(() => ({
  buttonGroup: {
    flexGrow: 1,
    width: "100%",
  },
  button: {
    justifyContent: "flex-start",
    paddingTop: "5%",
    paddingBottom: "5%",
  },
}));

const DisplayUserInfo = (props) => {
  const classes = useStyles();

  return (
    <>
      <ButtonGroup
        className={classes.buttonGroup}
        variant="outlined"
        orientation="vertical"
        color="primary"
        aria-label="vertical contained primary button group"
      >
        <Button className={classes.button}>
          <Typography>Name: {props.name ? props.name : "NIL"}</Typography>
        </Button>
        <Button className={classes.button}>
          <Typography>Email: {props.email}</Typography>
        </Button>
        <Button className={classes.button}>
          <Typography>Photo URL: {props.photoUrl ? props.photoUrl : "NIL"}</Typography>
        </Button>
        <Button className={classes.button} disabled>
          <Typography>Email Verification: {props.emailVerified ? "Yes" : "No"}</Typography>
        </Button>
        <Button className={classes.button} disabled>
          <Typography>uid: {props.uid}</Typography>
        </Button>
      </ButtonGroup>
    </>
  );
};

DisplayUserInfo.propTypes = {
  name: PropTypes.string,
  email: PropTypes.string,
  photoUrl: PropTypes.string,
  emailVerified: PropTypes.string,
  uid: PropTypes.string,
};

export default DisplayUserInfo;
