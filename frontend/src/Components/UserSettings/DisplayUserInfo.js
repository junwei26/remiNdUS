import React from "react";
import { Grid } from "@material-ui/core";
import PropTypes from "prop-types";

const DisplayUserInfo = (props) => {
  return (
    <>
      <Grid
        container
        direction="column"
        justify="center"
        alignItems="flex-start"
        style={{
          width: "25%",
        }}
      >
        <Grid item>Name: {props.name}</Grid>
        <Grid item>email: {props.email}</Grid>
        <Grid item>photoUrl: {props.photoUrl}</Grid>
        <Grid item>emailVerified: {props.emailVerified}</Grid>
        <Grid item>uid: {props.uid}</Grid>
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
