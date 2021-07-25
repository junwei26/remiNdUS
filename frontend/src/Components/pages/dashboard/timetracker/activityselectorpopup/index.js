import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Grid, Select, MenuItem, Card, Typography, Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import activityService from "../../../services/activityService";
import localService from "../../../services/localService";

const useStyles = makeStyles(() => ({
  topbar: {
    padding: 10,
  },
  title: {
    flexGrow: 1,
  },
  card: {
    padding: 10,
  },
  close: {
    position: "relative",
    left: 20,
    top: -20,
  },
  select: {
    width: 300,
  },
}));

const ActivitySelectorPopup = (props) => {
  const classes = useStyles();
  const [activity, setActivity] = useState("");
  const [activities, setActivities] = useState([]);
  const [currentAlert, setCurrentAlert] = useState({ severity: "", message: "" });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbarOpen(false);
  };
  useEffect(() => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const endDate = new Date();
    endDate.setDate(currentDate.getDate() + 1);
    endDate.setHours(0, 0, 0, 0);
    activityService
      .getAllActivities()
      .then((response) => {
        const filterActivities = (activity) => {
          if (activity.activityType === "recurring") {
            return (
              (activity.frequency === "monthly" && activity.date === currentDate.getDate()) ||
              (activity.frequency === "weekly" && currentDate.getDay() === activity.date)
            );
          } else {
            return (
              activity.startDateTime >= localService.convertDateToString(currentDate) &&
              activity.startDateTime <= localService.convertDateToString(endDate)
            );
          }
        };

        setActivities(response.data.filter(filterActivities));
      })
      .catch((e) => {
        setCurrentAlert({
          severity: "error",
          message: `Error retrieving activities.${e.response.data.message}`,
        });
        setSnackbarOpen(true);
      });
  }, []);

  return (
    <Card>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert severity={currentAlert.severity}>
          <AlertTitle>{currentAlert.message}</AlertTitle>
        </Alert>
      </Snackbar>
      <Grid
        container
        className={classes.card}
        direction="column"
        justify="center"
        alignItems="center"
        spacing={2}
      >
        {/* Close prompt button */}
        <Grid item style={{ width: "100%" }}>
          <Grid
            container
            className={classes.topbar}
            direction="row"
            justify="center"
            alignItems="center"
          >
            <Grid item className={classes.title}>
              <Typography>Select activity to track</Typography>
            </Grid>
            <Grid item className={classes.close}>
              <Button onClick={props.close}>X</Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item style={{ width: "100%" }}>
          <form
            noValidate
            autoComplete="off"
            onSubmit={(e) => {
              props.start({
                ...activity,
                actualStartDateTime: localService.convertDateToString(new Date()),
              });
              e.preventDefault();
              props.close();
            }}
          >
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <Select
                  labelId="activity-selector-label"
                  id="activitySelector"
                  value={activity}
                  renderValue={(value) => value.name}
                  onChange={(e) => {
                    setActivity(e.target.value);
                  }}
                  className={classes.select}
                >
                  {activities.map((activity) => (
                    <MenuItem value={activity} key={activity.id}>
                      {`${activity.name} (${activity.activityTag})`}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item style={{ width: "80%" }}>
                <Button type="submit" fullWidth variant="contained" color="primary">
                  Start Tracking
                </Button>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>
    </Card>
  );
};

ActivitySelectorPopup.propTypes = {
  close: PropTypes.func,
  start: PropTypes.func,
};
export default ActivitySelectorPopup;
