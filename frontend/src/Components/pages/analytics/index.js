import PieChart from "./pieChart";
import BarChart from "./barChart";
import React, { useState, useEffect } from "react";
import { Grid } from "@material-ui/core";
import ActivityDurationRanking from "./activitydurationranking";
import trackerService from "../services/trackerService";

const Analytics = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    trackerService.getTrackingData().then((response) => setData(response.data));
  }, []);

  return (
    <Grid container direction="row" spacing={3}>
      <Grid item xs>
        <Grid container direction="column">
          <Grid item>
            <BarChart data={data} />
          </Grid>
          <Grid item>
            <PieChart data={data} />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={2}>
        <ActivityDurationRanking data={data} />
      </Grid>
    </Grid>
  );
};

export default Analytics;
