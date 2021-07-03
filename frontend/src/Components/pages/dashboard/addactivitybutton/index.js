import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  TextField,
  // Card,
  Grid,
  Dialog,
  // Typography,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, DateTimePicker } from "@material-ui/pickers";
import activityService from "../../services/activityService";

const useStyles = makeStyles(() => ({
  card: {
    padding: 10,
  },
}));

const AddActivityButton = () => {
  const classes = useStyles();

  const roundUpTime = (date) => {
    const nearestTime = 1000 * 60 * 15; // round up to nearest 15 minutes
    return new Date(Math.ceil(date.getTime() / nearestTime) * nearestTime);
  };

  const [startDateTime, setStartDateTime] = useState(roundUpTime(new Date()));
  const [endDateTime, setEndDateTime] = useState(roundUpTime(new Date()));
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleStartDateChange = (date) => {
    setStartDateTime(roundUpTime(date));
  };

  const handleEndDateChange = (date) => {
    setEndDateTime(roundUpTime(date));
  };

  const handleDialogClickOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const closeDialogAddActivity = (e) => {
    e.preventDefault();

    if (e.target.activityName.value === "") {
      alert("Please input an activity name");
      return;
    } else if (e.target.description.value === "") {
      alert("Please input an activity description");
      return;
    }

    activityService
      .addActivity(
        e.target.startDateTime.value,
        e.target.endDateTime.value,
        e.target.activityName.value,
        e.target.description.value
      )
      .then(() => {
        alert("Succesfully created activity");
      })
      .catch((error) => {
        alert(
          `Issue creating activity. Error status code: ${error.response.status}. ${error.response.data.message}`
        );
      });

    handleDialogClose();
  };

  return (
    <>
      <ListItem button onClick={handleDialogClickOpen} key="Add Activity">
        <ListItemText primary="Add Activity" />
      </ListItem>
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="form-dialog-title"
        fullWidth
      >
        <DialogTitle id="form-dialog-title">Add Activity</DialogTitle>
        <DialogContent>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Grid
              container
              className={classes.card}
              direction="column"
              justify="space-between"
              alignItems="center"
              spacing={2}
            >
              <Grid item style={{ width: "100%" }}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  name="activityName"
                  label="Activity Name"
                  color="primary"
                  autofocus
                />
              </Grid>
              <Grid item style={{ width: "100%" }}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  name="description"
                  label="Description"
                  color="primary"
                  autofocus
                />
              </Grid>
              <Grid container item direction="row" justify="space-between" alignItems="center">
                <Grid item>
                  <DateTimePicker
                    variant="dialog"
                    label="Start Date and Time"
                    name="startDateTime"
                    disablePast
                    showTodayButton
                    minutesStep={15}
                    todayLabel={"Now"}
                    value={startDateTime}
                    format="yyyy/MM/dd HH:mm"
                    onChange={handleStartDateChange}
                  />
                </Grid>
                <Grid item>
                  <DateTimePicker
                    variant="dialog"
                    label="End Date and Time"
                    name="endDateTime"
                    disablePast
                    showTodayButton
                    minutesStep={15}
                    todayLabel={"Now"}
                    value={endDateTime}
                    format="yyyy/MM/dd HH:mm"
                    onChange={handleEndDateChange}
                  />
                </Grid>
              </Grid>
            </Grid>
          </MuiPickersUtilsProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={closeDialogAddActivity} color="primary">
            Add Activity
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddActivityButton;
