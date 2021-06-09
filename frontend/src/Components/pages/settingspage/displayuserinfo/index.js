import React from "react";
import { Grid } from "@material-ui/core";
import PropTypes from "prop-types";

const DisplayUserInfo = (props) => {
  return (
    <>
      <Grid container direction="column" justify="center" alignItems="flex-start" spacing={2}>
        <Grid item>Name: {props.name}</Grid>
        <Grid item>Email: {props.email}</Grid>
        <Grid item>Photo URL: {props.photoUrl}</Grid>
        <Grid item>Email Verification: {props.emailVerified}</Grid>
        <Grid item>uid: {props.uid}</Grid>
      </Grid>
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
