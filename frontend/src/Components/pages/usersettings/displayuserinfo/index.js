import React from "react";
import { Grid } from "@material-ui/core";
import PropTypes from "prop-types";

const DisplayUserInfo = (props) => {
  return (
    <>
      <Grid container direction="row" justify="center" alignItems="center">
        <div>Name: {props.name}</div>
        <div>email: {props.email}</div>
        <div>photoUrl: {props.photoUrl}</div>
        <div>emailVerified: {props.emailVerified}</div>
        <div>uid: {props.uid}</div>
      </Grid>
    </>
  );
};

DisplayUserInfo.propTypes = {
  name: PropTypes.string,
  email: PropTypes.string,
  photoUrl: PropTypes.string,
  emailVerified: PropTypes.bool,
  uid: PropTypes.string,
};

export default DisplayUserInfo;
