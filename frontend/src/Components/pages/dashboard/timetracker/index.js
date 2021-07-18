import React, { useState, useRef } from "react";
import { Paper, Typography, Grid, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Popup from "reactjs-popup";
import ActivitySelectorPopup from "./activityselectorpopup";
import activityService from "../../services/activityService";
import localService from "../../services/localService";

const useStyles = makeStyles((theme) => ({
  root: { height: 250, width: 250 },
  timeTracker: {
    ...theme.typography.button,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1),
    fontSize: 40,
  },
}));

const TimeTracker = () => {
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentActivity, setCurrentActivity] = useState({});
  const increment = useRef(null);

  const classes = useStyles();
  const handleStart = (activity) => {
    setIsActive(true);
    setIsPaused(true);
    setCurrentActivity(activity);
    increment.current = setInterval(() => {
      setTimer((timer) => timer + 1);
    }, 1000);
  };

  const handlePause = () => {
    clearInterval(increment.current);
    setIsPaused(false);
  };

  const handleResume = () => {
    setIsPaused(true);
    increment.current = setInterval(() => {
      setTimer((timer) => timer + 1);
    }, 1000);
  };

  const handleStop = () => {
    clearInterval(increment.current);
    setIsActive(false);
    setIsPaused(false);
    //send tracking data to backend here
    activityService
      .updateActivity(
        localService.parseTimeToString(currentActivity.startDateTime).toLocaleString(),
        localService.parseTimeToString(currentActivity.endDateTime).toLocaleString(),
        currentActivity.name,
        currentActivity.description + `  (Time spent on activity : ${formatTime()})`,
        currentActivity.activityId,
        currentActivity.tag
      )
      .then(() => {
        setTimer(0);
        setCurrentActivity({});
        alert("Time spent on activity successfully recorded!");
      });
  };

  const formatTime = () => {
    const getSeconds = `0${timer % 60}`.slice(-2);
    const minutes = `${Math.floor(timer / 60)}`;
    const getMinutes = `0${minutes % 60}`.slice(-2);
    const getHours = `0${Math.floor(timer / 3600)}`.slice(-2);

    return `${getHours} : ${getMinutes} : ${getSeconds}`;
  };

  const DisplayCurrentActivity = () => {
    if (currentActivity.name) {
      return <Typography>Currently tracking {currentActivity.name}</Typography>;
    } else {
      return <Typography>Start tracking an activity now!</Typography>;
    }
  };

  return (
    <Paper className={classes.root}>
      <Grid container alignItems="center" direction="column" justify="center" spacing={1}>
        <Grid item xs>
          <Typography>Activity Tracker </Typography>
        </Grid>
        <Grid item xs>
          <DisplayCurrentActivity />
        </Grid>
        <Grid item xs>
          <div className={classes.timeTracker}>{formatTime()}</div>
        </Grid>
        <Grid item xs>
          {!isActive && !isPaused ? (
            <Popup
              contentStyle={{ width: "400px" }}
              trigger={
                <Button variant="outlined" color="primary" onClick={handleStart}>
                  Start tracking
                </Button>
              }
              closeOnDocumentClick={false}
              modal
            >
              {(close) => <ActivitySelectorPopup start={handleStart} close={close} />}
            </Popup>
          ) : isPaused ? (
            <Button variant="outlined" color="primary" onClick={handlePause}>
              Pause tracking
            </Button>
          ) : (
            <Button variant="outlined" color="primary" onClick={handleResume}>
              Resume tracking
            </Button>
          )}
          <Button variant="outlined" color="primary" onClick={handleStop} disabled={!isActive}>
            Stop
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TimeTracker;
