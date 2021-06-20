import React, { useState } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Grid, TextField, Card, Typography } from "@material-ui/core";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, DateTimePicker } from "@material-ui/pickers";
import reminderService from "../../../services/reminderService";

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
}));

const AddReminderPopup = (props) => {
  const classes = useStyles();

  const roundUpTime = (date) => {
    const nearestTime = 1000 * 60 * 15; // round up to nearest 15 minutes
    return new Date(Math.ceil(date.getTime() / nearestTime) * nearestTime);
  };

  const [startDateTime, setStartDateTime] = useState(roundUpTime(new Date()));

  const handleStartDateChange = (date) => {
    setStartDateTime(roundUpTime(date));
  };

  const handleSubmitAddReminder = (e) => {
    e.preventDefault();

    if (e.target.reminderName.value === "") {
      alert("Please input a reminder name");
      return;
    } else if (e.target.description.value === "") {
      alert("Please input a reminder description");
      return;
    }

    reminderService
      .addReminder(
        e.target.startDateTime.value,
        e.target.reminderName.value,
        e.target.description.value
      )
      .then(() => {
        alert("Succesfully created reminder");
      })
      .catch((error) => {
        alert(
          `Issue creating reminder. Error status code: ${error.response.status}. ${error.response.data.message}`
        );
      });
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Card>
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
                <Typography>Add Reminder</Typography>
              </Grid>
              <Grid item className={classes.close}>
                <Button onClick={props.close}>X</Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item style={{ width: "100%" }}>
            <form noValidate autoComplete="off" onSubmit={handleSubmitAddReminder}>
              <Grid container direction="column" spacing={2}>
                <Grid item style={{ width: "80%" }}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    name="reminderName"
                    label="Reminder Name"
                    color="primary"
                    autofocus
                  />
                </Grid>
                <Grid item style={{ width: "80%" }}>
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
                <Grid item style={{ width: "80%" }}>
                  <DateTimePicker
                    variant="dialog"
                    label="Deadline"
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
                <Grid item style={{ width: "80%" }}>
                  <Button type="submit" fullWidth variant="contained" color="primary">
                    Add
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </Card>
    </MuiPickersUtilsProvider>
  );
};

AddReminderPopup.propTypes = {
  close: PropTypes.func,
};
export default AddReminderPopup;
