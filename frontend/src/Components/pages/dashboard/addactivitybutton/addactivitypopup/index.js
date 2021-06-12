import React, { useState } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Grid, TextField, Card, Typography } from "@material-ui/core";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, TimePicker, DatePicker } from "@material-ui/pickers";

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

  const [startDateTime, setStartDateTime] = useState(new Date("2021-06-12T12:00:00"));
  const [endDateTime, setEndDateTime] = useState(new Date("2021-06-12T14:00:00"));

  const handleStartDateChange = (date) => {
    setStartDateTime(date);
  };

  const handleEndDateChange = (date) => {
    setEndDateTime(date);
  };

  const handleSubmitAddActivity = (e) => {
    e.preventDefault();
    alert(
      `ActivityName: ${e.target.activityName.value}\nDescription:${e.target.description.value}\nDate: ${e.target.date.value}\nStart Time:${e.target.startTime.value}\nEnd Time:${e.target.endTime.value}`
    );
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
            <form noValidate onSubmit={handleSubmitAddActivity}>
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
                  <DatePicker
                    disableToolbar
                    variant="inline"
                    format="MM/dd/yyyy"
                    margin="normal"
                    id="date-picker-inline"
                    label="Date picker inline"
                    name="date"
                    value={startDateTime}
                    onChange={handleStartDateChange}
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                    }}
                  />
                </Grid>
                <Grid item style={{ width: "80%" }}>
                  <TimePicker
                    margin="normal"
                    id="time-picker"
                    label="Time picker"
                    name="startTime"
                    minutesStep="15"
                    value={startDateTime}
                    onChange={handleStartDateChange}
                    KeyboardButtonProps={{
                      "aria-label": "change start time",
                    }}
                  />
                </Grid>
                <Grid item style={{ width: "80%" }}>
                  <TimePicker
                    margin="normal"
                    id="time-picker"
                    label="Time picker"
                    name="endTime"
                    minutesStep="15"
                    value={endDateTime}
                    onChange={handleEndDateChange}
                    KeyboardButtonProps={{
                      "aria-label": "change end time",
                    }}
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
