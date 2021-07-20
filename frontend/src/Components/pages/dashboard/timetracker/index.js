import React, { useState, useRef, useEffect } from "react";
import { Paper, Typography, Grid, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Popup from "reactjs-popup";
import ActivitySelectorPopup from "./activityselectorpopup";
import localService from "../../services/localService";
import trackerService from "../../services/trackerService";

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
  const [currentActivity, setCurrentActivity] = useState({});
  const increment = useRef(null);

  const classes = useStyles();
  const handleStart = (activity) => {
    const currentDate = new Date();
    setIsActive(true);
    setCurrentActivity(activity);
    if (!localStorage.getItem("CurrentTrackedActivity")) {
      localStorage.setItem(
        "CurrentTrackedActivity",
        JSON.stringify({
          ...activity,
          actualStartDateTime: localService.convertDateToString(currentDate),
        })
      );
    }
    increment.current = setInterval(() => {
      setTimer((timer) => timer + 1);
    }, 1000);
  };
  useEffect(() => {
    const storedActivity = localStorage.getItem("CurrentTrackedActivity");
    if (storedActivity) {
      const parsedStoredActivity = JSON.parse(storedActivity);
      const currentDateObj = new Date();
      setTimer(
        Math.round(
          (currentDateObj -
            localService.parseTimeToDate(parsedStoredActivity.actualStartDateTime)) /
            1000
        )
      );
      handleStart(parsedStoredActivity);
    }
  }, []);
  const handleStop = () => {
    clearInterval(increment.current);
    setIsActive(false);
    setTimer(0);
    setCurrentActivity({});
    const actualEndDateTime = localService.convertDateToString(new Date());
    const currentDate = actualEndDateTime.slice(0, 8);
    const trackedActivity = {
      name: currentActivity.name,
      tag: currentActivity.activityTag,
      plannedStartDateTime:
        currentActivity.activityType === "planned"
          ? currentActivity.startDateTime
          : currentDate + currentActivity.startTime,
      plannedEndDateTime:
        currentActivity.activityType === "planned"
          ? currentActivity.endDateTime
          : currentDate + currentActivity.endTime,
      actualStartDateTime: currentActivity.actualStartDateTime,
      actualEndDateTime,
    };

    trackerService.addTrackedActivity(trackedActivity).then(() => {
      localStorage.removeItem("CurrentTrackedActivity");
      alert("Activity tracked");
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
      <Grid
        container
        alignContent="center"
        alignItems="center"
        direction="column"
        justify="center"
        spacing={1}
      >
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
          <Popup
            contentStyle={{ width: "400px" }}
            trigger={
              <Button
                variant="outlined"
                color="primary"
                onClick={(e) => {
                  e.preventDefault();
                }}
                disabled={isActive}
              >
                Start tracking
              </Button>
            }
            closeOnDocumentClick={false}
            modal
          >
            {(close) => <ActivitySelectorPopup start={handleStart} close={close} />}
          </Popup>
          <Button variant="outlined" color="primary" onClick={handleStop} disabled={!isActive}>
            Stop
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TimeTracker;
