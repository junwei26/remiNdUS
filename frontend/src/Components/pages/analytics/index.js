import PieChart from "./pieChart";
import BarChart from "./barChart";
import React from "react";
import { Grid } from "@material-ui/core";
import ActivityDurationRanking from "./activitydurationranking";

const DummyData = [
  {
    name: "test 1",
    tag: "tag 1",
    plannedStartDateTime: "202101010000",
    plannedEndDateTime: "202101010500",
    actualStartDateTime: "202101010000",
    actualEndDateTime: "202101010500",
  },
  {
    name: "test 2",
    tag: "tag 1",
    plannedStartDateTime: "202101010000",
    plannedEndDateTime: "202101010500",
    actualStartDateTime: "202101010000",
    actualEndDateTime: "202101010500",
  },
  {
    name: "test 3",
    tag: "tag 2",
    plannedStartDateTime: "202101010000",
    plannedEndDateTime: "202101010500",
    actualStartDateTime: "202101010000",
    actualEndDateTime: "202101010500",
  },
  {
    name: "test 4",
    tag: "tag 2",
    plannedStartDateTime: "202101020000",
    plannedEndDateTime: "202101020500",
    actualStartDateTime: "202101020000",
    actualEndDateTime: "202101020500",
  },
  {
    name: "test 5",
    tag: "tag 3",
    plannedStartDateTime: "202101030000",
    plannedEndDateTime: "202101030500",
    actualStartDateTime: "202101030000",
    actualEndDateTime: "202101030500",
  },
  {
    name: "test 6",
    tag: "tag 3",
    plannedStartDateTime: "202101030000",
    plannedEndDateTime: "202101030500",
    actualStartDateTime: "202101030000",
    actualEndDateTime: "202101030500",
  },
  {
    name: "test 7",
    tag: "tag 4",
    plannedStartDateTime: "202101030000",
    plannedEndDateTime: "202101030500",
    actualStartDateTime: "202101030000",
    actualEndDateTime: "202101030500",
  },
  {
    name: "test 8",
    tag: "tag 4",
    plannedStartDateTime: "202101030000",
    plannedEndDateTime: "202101030500",
    actualStartDateTime: "202101030000",
    actualEndDateTime: "202101030500",
  },
  {
    name: "test 9",
    tag: "tag 4",
    plannedStartDateTime: "202101010000",
    plannedEndDateTime: "202101010500",
    actualStartDateTime: "202101010000",
    actualEndDateTime: "202101010500",
  },
  {
    name: "test 10",
    tag: "tag 4",
    plannedStartDateTime: "202101010000",
    plannedEndDateTime: "202101010500",
    actualStartDateTime: "202101010000",
    actualEndDateTime: "202101010500",
  },
  {
    name: "test 11",
    tag: "tag 5",
    plannedStartDateTime: "202101010000",
    plannedEndDateTime: "202101010500",
    actualStartDateTime: "202101010000",
    actualEndDateTime: "202101010500",
  },
  {
    name: "test 12",
    tag: "tag 6",
    plannedStartDateTime: "202101010000",
    plannedEndDateTime: "202101010500",
    actualStartDateTime: "202101010000",
    actualEndDateTime: "202101010500",
  },
  {
    name: "test 13",
    tag: "tag 6",
    plannedStartDateTime: "202101010000",
    plannedEndDateTime: "202101010500",
    actualStartDateTime: "202101010000",
    actualEndDateTime: "202101010500",
  },
  {
    name: "test 14",
    tag: "tag 6",
    plannedStartDateTime: "202101010000",
    plannedEndDateTime: "202101010500",
    actualStartDateTime: "202101010000",
    actualEndDateTime: "202101010500",
  },
  {
    name: "test 15",
    tag: "tag 6",
    plannedStartDateTime: "202101010000",
    plannedEndDateTime: "202101010500",
    actualStartDateTime: "202101010000",
    actualEndDateTime: "202101010500",
  },
  {
    name: "test 16",
    tag: "tag 6",
    plannedStartDateTime: "202101010000",
    plannedEndDateTime: "202101010500",
    actualStartDateTime: "202101010000",
    actualEndDateTime: "202101010500",
  },
];
const Analytics = () => {
  return (
    <Grid container direction="row" spacing={3}>
      <Grid item xs>
        <Grid container direction="column">
          <Grid item>
            <BarChart data={DummyData} />
          </Grid>
          <Grid item>
            <PieChart data={DummyData} />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={2}>
        <ActivityDurationRanking data={DummyData} />
      </Grid>
    </Grid>
  );
};

export default Analytics;
