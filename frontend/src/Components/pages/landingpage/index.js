import React from "react";
import { Grid } from "@material-ui/core";

const LandingPage = () => {
  return (
    <Grid container alignItems="center" justify="center" direction="column" spacing={2}>
      <Grid item xs>
        <div style={{ textAlign: "center", fontSize: 50 }}>Welcome to remiNdUs!</div>
      </Grid>
      <Grid item xs>
        <div style={{ textAlign: "center", fontSize: 20 }}>
          An activity planner for nus students, by nus students.
        </div>
      </Grid>
    </Grid>
  );
};

export default LandingPage;
