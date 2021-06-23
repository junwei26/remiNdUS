import React from "react";
import Sidedrawer from "./sidedrawer";
import ReminderList from "./reminderlist";
import { Grid } from "@material-ui/core";

const Dashboard = () => {
  return (
    <Grid container direction="row" justify="top" alignItems="top" spacing={2}>
      <Grid item xs>
        <Sidedrawer />
      </Grid>
      <Grid item xs={2}>
        <ReminderList />
      </Grid>
    </Grid>
  );
};

export default Dashboard;
