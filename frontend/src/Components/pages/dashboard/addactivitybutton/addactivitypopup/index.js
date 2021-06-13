import React, { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Grid, TextField, Card, Typography } from "@material-ui/core";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, DateTimePicker } from "@material-ui/pickers";
import { firebaseAuth } from "../../../../../firebase";

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

const AddActivityPopup = (props) => {
  const classes = useStyles();

  const roundUpTime = (date) => {
    const nearestTime = 1000 * 60 * 15; // round up to nearest 15 minutes
    return new Date(Math.ceil(date.getTime() / nearestTime) * nearestTime);
  };

  const [startDateTime, setStartDateTime] = useState(roundUpTime(new Date()));
  const [endDateTime, setEndDateTime] = useState(roundUpTime(new Date()));

  const handleStartDateChange = (date) => {
    setStartDateTime(roundUpTime(date));
  };

  const handleEndDateChange = (date) => {
    setEndDateTime(roundUpTime(date));
  };

  // Parses a given dateString (Current expected format is yyyy/MM/dd HH:mm) into yyyyMMddHHmm
  const parseTime = (dateString) => {
    return (
      dateString.slice(0, 4) +
      dateString.slice(5, 7) +
      dateString.slice(8, 10) +
      dateString.slice(11, 13) +
      dateString.slice(14, 16)
    );
  };

  const handleSubmitAddActivity = (e) => {
    e.preventDefault();

    if (e.target.activityName.value === "") {
      alert("Please input an activity name");
      return;
    } else if (e.target.description.value === "") {
      alert("Please input an activity description");
      return;
    }

    const parsedStartDateTime = parseTime(e.target.startDateTime.value);
    const parsedEndDateTime = parseTime(e.target.endDateTime.value);

    const activity = {
      uid: firebaseAuth.currentUser.uid,
      name: e.target.activityName.value,
      description: e.target.description.value,
      startDateTime: parsedStartDateTime,
      endDateTime: parsedEndDateTime,
    };
    axios
      .post(
        "https://asia-southeast2-remindus-76402.cloudfunctions.net/backendAPI/api/activity/create",
        activity
      ) //articleId receives the response
      .then(() => {
        alert("Succesfully created activity");
      })
      .catch((error) => {
        alert(
          `Issue creating activity. Error status code: ${error.response.status}. ${error.response.data.message}`
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
                <Typography>Add Activity</Typography>
              </Grid>
              <Grid item className={classes.close}>
                <Button onClick={props.close}>X</Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item style={{ width: "100%" }}>
            <form noValidate autoComplete="off" onSubmit={handleSubmitAddActivity}>
              <Grid container direction="column" spacing={2}>
                <Grid item style={{ width: "80%" }}>
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
                <Grid item style={{ width: "80%" }}>
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

AddActivityPopup.propTypes = {
  close: PropTypes.func,
};
export default AddActivityPopup;
