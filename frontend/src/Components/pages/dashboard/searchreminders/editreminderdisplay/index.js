import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  TextField,
  Grid,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Checkbox,
  Typography,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, DateTimePicker, TimePicker } from "@material-ui/pickers";
import PropTypes from "prop-types";
import reminderService from "../../../services/reminderService";
import localService from "../../../services/localService";

const useStyles = makeStyles(() => ({
  card: {
    padding: 10,
  },
}));

const EditReminderDisplay = (props) => {
  const classes = useStyles();

  const nearestTime = 1000 * 60 * 15; // round up to nearest 15 minutes

  const roundUpDateTime = (date) => {
    return new Date(Math.ceil(date.getTime() / nearestTime) * nearestTime);
  };

  const currentDateTime = roundUpDateTime(new Date());
  const [date, setDate] = useState(1);
  const [endDateTime, setEndDateTime] = useState(
    roundUpDateTime(new Date(currentDateTime.getTime() + 1))
  );
  const [reminderName, setReminderName] = useState("");
  const [description, setDescription] = useState("");
  const [recurring, setRecurring] = useState(false);

  const [frequency, setFrequency] = useState("weekly");
  const [currentAlert, setCurrentAlert] = useState({ severity: "", message: "" });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbarOpen(false);
  };
  const handleSelectFrequencyChange = (e) => {
    setDate(1);
    setFrequency(e.target.value);
  };

  const handleEndDateChange = (date) => {
    setEndDateTime(roundUpDateTime(date));
  };

  const handleSetReminderName = (e) => {
    setReminderName(e.target.value);
  };

  const handleSetDescription = (e) => {
    setDescription(e.target.value);
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleSetRecurring = (e) => {
    setRecurring(e.target.checked);
    setDate(1);
    setEndDateTime(currentDateTime);
  };

  const handleDialogBack = () => {
    props.setEditingReminder(false);
    props.setSelectedRow(null);
    props.setDialogMaxWidth("lg");
    props.getAllReminders();
    props.setPlannerDataUpdate(!props.plannerDataUpdate);
  };

  const closeDialogUpdateReminder = () => {
    if (reminderName === "") {
      setCurrentAlert({ severity: "error", message: "Please input an reminder name" });
      setSnackbarOpen(true);
      return;
    } else if (description === "") {
      setCurrentAlert({ severity: "error", message: "Please input an reminder description" });
      setSnackbarOpen(true);
      return;
    } else if (endDateTime.getTime() < currentDateTime.getTime()) {
      setCurrentAlert({
        severity: "error",
        message: "Datetime cannot be earlier than current datetime",
      });
      setSnackbarOpen(true);
      return;
    }

    if (reminderName !== props.reminder.name || description !== props.reminder.description) {
      setCurrentAlert({
        severity: "info",
        message: "Note that changes to name or description applies to all reminders",
      });
      setSnackbarOpen(true);
    }

    if (!recurring) {
      reminderService
        .updatePlannedReminder(
          localService.convertDateToString(endDateTime),
          reminderName,
          description,
          props.reminder.templateReminderId,
          props.reminder.reminderId
        )
        .then(() => {
          setCurrentAlert({
            severity: "success",
            message: "Successfully updated reminder.",
          });
          setSnackbarOpen(true);
          handleDialogBack();
          return;
        })
        .catch((error) => {
          setCurrentAlert({
            severity: "error",
            message: `Issue updating planned reminder. Error status code: ${error.response.status}. ${error.response.data.message}`,
          });
          setSnackbarOpen(true);
        });
    } else {
      reminderService
        .updateRecurringReminder(
          frequency,
          `${endDateTime.getHours().toString().padStart(2, "0")}${endDateTime
            .getMinutes()
            .toString()
            .padStart(2, "0")}`,
          date,
          reminderName,
          description,
          props.reminder.templateReminderId,
          props.reminder.reminderId
        )
        .then(() => {
          setCurrentAlert({
            severity: "success",
            message: "Successfully updated reminder.",
          });
          handleDialogBack();
          return;
        })
        .catch((error) => {
          setCurrentAlert({
            severity: "error",
            message: `Issue updating recurring reminder. Error status code: ${error.response.status}. ${error.response.data.message}`,
          });
          setSnackbarOpen(true);
        });
    }
  };

  useEffect(() => {
    setReminderName(props.reminder.name);
    setDescription(props.reminder.description);

    if (props.reminder.reminderType === "planned") {
      setRecurring(false);
      setEndDateTime(new Date(localService.parseTimeToDate(props.reminder.endDateTime)));
    } else {
      setRecurring(true);
      setEndDateTime(new Date(localService.parseTimeToDate(props.reminder.endTime)));
      setDate(props.reminder.date);
    }
  }, []);

  const weeklyMenuItems = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  let monthlyMenuItems = [];
  for (let i = 1; i < 32; ++i) {
    monthlyMenuItems.push(
      <MenuItem key={i} value={i}>
        {i}
      </MenuItem>
    );
  }

  return (
    <>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert severity={currentAlert.severity}>
          <AlertTitle>{currentAlert.message}</AlertTitle>
        </Alert>
      </Snackbar>
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
                name="reminderName"
                label="Reminder Name"
                color="primary"
                value={reminderName}
                onChange={handleSetReminderName}
                autoFocus
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
                value={description}
                onChange={handleSetDescription}
              />
              <Typography>
                Note: Changing the name or description affects all reminders associated with the
                same template
              </Typography>
            </Grid>
            <Grid
              container
              item
              direction="row"
              justify="space-between"
              alignItems="center"
              style={{ width: "100%" }}
            >
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={recurring}
                      onChange={handleSetRecurring}
                      name="recurring"
                      color="primary"
                      disabled
                    />
                  }
                  label="Recurring Reminder"
                />
              </Grid>
            </Grid>
            {recurring ? (
              <>
                <Grid
                  container
                  item
                  direction="row"
                  justify="flex-start"
                  alignItems="center"
                  style={{ width: "100%" }}
                >
                  <Grid item xs={2}>
                    <Typography>Frequency:</Typography>
                  </Grid>
                  <Grid item>
                    <Select
                      value={frequency}
                      onChange={handleSelectFrequencyChange}
                      style={{ width: "auto" }}
                    >
                      <MenuItem value={"weekly"}>Weekly</MenuItem>
                      <MenuItem value={"monthly"}>Monthly</MenuItem>
                    </Select>
                  </Grid>
                </Grid>
                <Grid container item direction="row" justify="space-between" alignItems="center">
                  <Grid item xs={4}>
                    <TimePicker
                      label="End Time"
                      value={endDateTime}
                      onChange={handleEndDateChange}
                      error={endDateTime.getTime() < currentDateTime.getTime()}
                      helperText={
                        endDateTime.getTime() < currentDateTime.getTime()
                          ? "Must be later than current time"
                          : ""
                      }
                      fullWidth
                      minutesStep={15}
                    />
                  </Grid>
                  <Grid item>
                    <InputLabel>{frequency === "weekly" ? "Day" : "Date"}</InputLabel>
                    <Select value={date} onChange={handleDateChange} style={{ width: "auto" }}>
                      {frequency === "weekly"
                        ? weeklyMenuItems.map((day, index) => (
                            <MenuItem key={index} value={index + 1}>
                              {day}
                            </MenuItem>
                          ))
                        : monthlyMenuItems}
                    </Select>
                  </Grid>
                </Grid>
              </>
            ) : (
              //   <Grid container item direction="row" justify="space-between" alignItems="center">
              <Grid item style={{ width: "100%" }}>
                <DateTimePicker
                  variant="dialog"
                  label="End Date and Time"
                  name="endDateTime"
                  disablePast
                  showTodayButton
                  minutesStep={15}
                  todayLabel={"Now"}
                  value={endDateTime}
                  error={endDateTime.getTime() < currentDateTime.getTime()}
                  helperText={
                    endDateTime.getTime() < currentDateTime.getTime()
                      ? "Must be later than current datetime"
                      : ""
                  }
                  fullWidth
                  format="yyyy/MM/dd HH:mm"
                  onChange={handleEndDateChange}
                />
              </Grid>
              //   </Grid>
            )}
          </Grid>
        </MuiPickersUtilsProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogBack} color="primary">
          Back
        </Button>
        <Button onClick={closeDialogUpdateReminder} color="primary">
          Update Reminder
        </Button>
      </DialogActions>
    </>
  );
};

EditReminderDisplay.propTypes = {
  reminder: PropTypes.object,
  setEditingReminder: PropTypes.func,
  setDialogMaxWidth: PropTypes.func,
  setSelectedRow: PropTypes.func,
  getAllReminders: PropTypes.func,
  plannerDataUpdate: PropTypes.bool,
  setPlannerDataUpdate: PropTypes.func,
};

export default EditReminderDisplay;
