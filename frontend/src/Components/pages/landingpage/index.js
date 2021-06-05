import React from "react";
import NavigationBar from "../../navigationbar";
import { Grid } from "@material-ui/core";

const LandingPage = () => {
  return (
    <Grid container direction="column" justify="space-between" alignItems="stretch" spacing={2}>
      <Grid item>
        <NavigationBar />
      </Grid>
      <Grid item style={{ minHeight: 300 }}>
        <div style={{ textAlign: "center" }}>Welcome to the Landing Page</div>
      </Grid>
    </Grid>
  );
};

export default LandingPage;
