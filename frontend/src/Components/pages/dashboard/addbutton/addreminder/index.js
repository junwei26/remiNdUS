import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  TextField,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Checkbox,
  Typography,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
} from "@material-ui/core";
import PropTypes from "prop-types";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, DateTimePicker, TimePicker } from "@material-ui/pickers";
import reminderService from "../../../services/reminderService";
import localService from "../../../services/localService";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";

const useStyles = makeStyles(() => ({
  card: {
    padding: 10,
  },
}));

const addReminderButton = (props) => {
  const classes = useStyles();

  const nearestTime = 1000 * 60 * 15; // round up to nearest 15 minutes

  const roundUpDateTime = (date) => {
    return new Date(Math.ceil(date.getTime() / nearestTime) * nearestTime);
  };

  const currentDateTime = roundUpDateTime(new Date());
  const [date, setDate] = useState(1);
  const [endDateTime, setEndDateTime] = useState(roundUpDateTime(currentDateTime));
  const [recurring, setRecurring] = useState(false);
  const [reminderName, setReminderName] = useState("");
  const [description, setDescription] = useState("");

  const [templateReminders, setTemplateReminders] = useState([]);
  const [chosenTemplateReminder, setChosenTemplateReminder] = useState(-1);
  const [frequency, setFrequency] = useState("weekly");
  const [menuItemArray, setMenuItemArray] = useState([
    <MenuItem value={-1} key={-1}>
      Create new Reminder
    </MenuItem>,
  ]);
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

  const handleDialogClose = () => {
    props.setDialogOpen(false);
  };

  const closeDialogAddReminder = () => {
    if (reminderName === "") {
      setCurrentAlert({ severity: "error", message: "Please input an reminder name" });
      setSnackbarOpen(true);
      return;
    } else if (description === "") {
      setCurrentAlert({ severity: "error", message: "Please input an reminder description" });
      setSnackbarOpen(true);
      return;
    }

    const templateReminderId =
      chosenTemplateReminder >= 0
        ? templateReminders[chosenTemplateReminder].templateReminderId
        : null;

    if (!recurring) {
      reminderService
        .addPlannedReminder(
          localService.convertDateToString(endDateTime),
          reminderName,
          description,
          templateReminderId
        )
        .then(() => {
          setCurrentAlert({ severity: "success", message: "Succesfully created reminder" });
          setSnackbarOpen(true);
          props.setPlannerDataUpdate(!props.plannerDataUpdate);
        })
        .catch((error) => {
          setCurrentAlert({
            severity: "error",
            message: `Issue creating planned reminder. Error status code: ${error.response.status}. ${error.response.data.message}`,
          });
          setSnackbarOpen(true);
        });
    } else {
      reminderService
        .addRecurringReminder(
          frequency,
          `${endDateTime.getHours().toString().padStart(2, "0")}${endDateTime
            .getMinutes()
            .toString()
            .padStart(2, "0")}`,
          date,
          reminderName,
          description,
          templateReminderId
        )
        .then(() => {
          setCurrentAlert({ severity: "success", message: "Succesfully created reminder" });
          setSnackbarOpen(true);
          props.setPlannerDataUpdate(!props.plannerDataUpdate);
        })
        .catch((error) => {
          setCurrentAlert({
            severity: "error",
            message: `Issue creating recurring reminder. Error status code: ${error.response.status}. ${error.response.data.message}`,
          });
          setSnackbarOpen(true);
        });
    }

    handleDialogClose();
  };

  const handleChangeTemplateReminder = (e) => {
    setChosenTemplateReminder(e.target.value);
    if (e.target.value >= 0) {
      setReminderName(templateReminders[e.target.value].name);
      setDescription(templateReminders[e.target.value].description);
    } else {
      setReminderName("");
      setDescription("");
    }
  };

  const getTemplateReminders = () => {
    reminderService
      .getTemplateReminders()
      .then((response) => {
        setTemplateReminders(response.data);
      })
      .catch((error) => {
        setCurrentAlert({
          severity: "error",
          message:
            error === undefined
              ? `Issue retrieving template reminders. Error status code ${error.response.status}. ${error.response.data.message}`
              : "Error accessing API",
        });
        setSnackbarOpen(true);
      });
  };

  useEffect(() => {
    if (props.dialogOpen === true) {
      setMenuItemArray(
        [
          <MenuItem value={-1} key={-1}>
            Create new reminder
          </MenuItem>,
        ].concat(
          templateReminders.map((templateReminder, index) => (
            <MenuItem value={index} key={index}>
              {templateReminder.name}
            </MenuItem>
          ))
        )
      );
    }
  }, [templateReminders]);

  useEffect(() => {
    if (props.dialogOpen === true) {
      getTemplateReminders();
    }
  }, [props.dialogOpen]);

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

  const handleSetAddActivity = () => {
    props.setAddActivity(true);
  };

  return (
    <>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert severity={currentAlert.severity}>
          <AlertTitle>{currentAlert.message}</AlertTitle>
        </Alert>
      </Snackbar>
      <Dialog
        open={props.dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="form-dialog-title"
        fullWidth
      >
        <DialogTitle id="form-dialog-title">Add Reminder</DialogTitle>
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
                <InputLabel>Select from existing reminder</InputLabel>
                <Select
                  value={chosenTemplateReminder}
                  onChange={handleChangeTemplateReminder}
                  style={{ width: "100%" }}
                >
                  {menuItemArray}
                </Select>
              </Grid>
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
                  disabled={chosenTemplateReminder !== -1}
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
                  disabled={chosenTemplateReminder !== -1}
                />
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
                    <Grid item>
                      <TimePicker
                        label="Deadline Time"
                        value={endDateTime}
                        onChange={handleEndDateChange}
                        minutesStep={15}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <InputLabel>{frequency === "weekly" ? "Day" : "Date"}</InputLabel>
                      <Select value={date} onChange={handleDateChange} style={{ width: "100%  " }}>
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
                // <Grid container item direction="row" justify="space-between" alignItems="center">
                <Grid item style={{ width: "100%" }}>
                  <DateTimePicker
                    variant="dialog"
                    label="End Date and Time"
                    name="endDateTime"
                    disablePast
                    showTodayButton
                    fullWidth
                    minutesStep={15}
                    todayLabel={"Now"}
                    value={endDateTime}
                    format="yyyy/MM/dd HH:mm"
                    onChange={handleEndDateChange}
                  />
                </Grid>
                // </Grid>
              )}
            </Grid>
          </MuiPickersUtilsProvider>
        </DialogContent>
        <DialogActions>
          <Grid container direction="row" justify="space-between" alignItems="center">
            <Grid item>
              <Button onClick={handleSetAddActivity}>ADD ACTIVITY INSTEAD</Button>
            </Grid>
            <Grid item>
              <Button onClick={handleDialogClose} color="primary">
                Cancel
              </Button>
              <Button onClick={closeDialogAddReminder} color="primary">
                Add Reminder
              </Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
    </>
  );
};

addReminderButton.propTypes = {
  plannerDataUpdate: PropTypes.bool,
  setPlannerDataUpdate: PropTypes.func,
  setAddActivity: PropTypes.func,
  dialogOpen: PropTypes.bool,
  setDialogOpen: PropTypes.func,
};

export default addReminderButton;
