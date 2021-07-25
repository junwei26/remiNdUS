import React from "react";
import { Grid } from "@material-ui/core";
import SignupButton from "../../navigationbar/signupbutton";
import LandingPageCarousel from "./landingpagecarousel";

const LandingPage = () => {
  return (
    <Grid container alignItems="center" justify="center" direction="column" spacing={5}>
      <Grid item xs>
        <div style={{ textAlign: "center", fontSize: 50 }}>Welcome to remiNdUS!</div>
      </Grid>
      <Grid item xs>
        <div style={{ textAlign: "center", fontSize: 20 }}>
          An activity planner for nus students, by nus students.
        </div>
      </Grid>
      <Grid item xs>
        <SignupButton />
      </Grid>
      <Grid item xs>
        <LandingPageCarousel />
      </Grid>
    </Grid>
  );
};

export default LandingPage;
