import React, { useState, useEffect } from "react";
import {
  Grid,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import trackerService from "../services/trackerService";
import PieChart from "./pieChart";
import Progress from "antd/lib/progress";
import "antd/lib/progress/style/index.css";
import BarChart from "./barChart";
import localService from "../services/localService";

const useStyles = makeStyles(() => ({
  paper: { height: 300, width: 400, overflow: "auto" },
  buttons: { height: 50, width: 100 },
  right: { marginLeft: "auto" },
}));

const Analytics = () => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [productivityMsg, setProductivityMsg] = useState("");
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const classes = useStyles();

  useEffect(() => {
    trackerService.getTrackingData().then((response) => setData(response.data));
  }, []);

  const calculatePlannedActualPercentage = (activityArr) => {
    var plannedHrs = 0;
    var actualHrs = 0;
    activityArr.forEach((activity) => {
      actualHrs +=
        new Date(localService.parseTimeToString(activity.actualEndDateTime)) -
        new Date(localService.parseTimeToString(activity.actualStartDateTime));
      plannedHrs +=
        new Date(localService.parseTimeToString(activity.plannedEndDateTime)) -
        new Date(localService.parseTimeToString(activity.plannedStartDateTime));
    });
    return Math.round((actualHrs / plannedHrs) * 100);
  };

  const plannedActualPercentage = calculatePlannedActualPercentage(data);
  return (
    <>
      <Grid
        container
        direction="row"
        spacing={3}
        alignContent="center"
        alignItems="center"
        justify="center"
        style={{ minHeight: "60vh" }}
      >
        <Grid item>
          <Paper variant="outlined" className={classes.paper}>
            <Grid container direction="column" spacing={0} alignItems="center">
              <Grid item>
                <Typography>Productivity</Typography>
              </Grid>
              <Grid item>
                <Typography>{productivityMsg}</Typography>
              </Grid>
              <Grid item>
                <Progress
                  type="circle"
                  strokeColor={plannedActualPercentage > 100 ? "#ff0000" : "#00FF00"}
                  format={(percent) => {
                    if (plannedActualPercentage === 100) {
                      setProductivityMsg("Congrats you achieved exactly what you planned for!");
                      return "Congrats!";
                    } else if (plannedActualPercentage === 0) {
                      setProductivityMsg("No activity data recorded");
                      return ``;
                    } else if (plannedActualPercentage > 100) {
                      setProductivityMsg("You exceeded your planned time");
                      return `Exceed by ${percent}%`;
                    } else {
                      setProductivityMsg("Congrats you spent less time than planned!");
                      return `${percent}% more efficient`;
                    }
                  }}
                  percent={
                    plannedActualPercentage > 100
                      ? plannedActualPercentage - 100
                      : plannedActualPercentage === 0 || plannedActualPercentage === 100
                      ? plannedActualPercentage
                      : 100 - plannedActualPercentage
                  }
                  width={200}
                />
              </Grid>
              <Grid item className={classes.right}>
                <Button className={classes.button} onClick={handleClickOpen}>
                  Daily breakdown
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item>
          <Paper variant="outlined" className={classes.paper}>
            <Grid container direction="column" spacing={0} alignItems="center">
              <Grid item>
                <Typography>How are you spending your time?</Typography>
              </Grid>
              <Grid item>
                <PieChart data={data} />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{"Daily planned vs actual hours of activity"}</DialogTitle>
        <DialogContent>
          <BarChart data={data} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Analytics;
