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
} from "@material-ui/core";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, DateTimePicker, TimePicker } from "@material-ui/pickers";
import reminderService from "../../services/reminderService";

const useStyles = makeStyles(() => ({
  card: {
    padding: 10,
  },
}));

const addReminderButton = () => {
  const classes = useStyles();

  const nearestTime = 1000 * 60 * 15; // round up to nearest 15 minutes
  // const nearestMinutes = nearestTime / 1000 / 60;

  const roundUpDateTime = (date) => {
    return new Date(Math.ceil(date.getTime() / nearestTime) * nearestTime);
  };

  const currentDateTime = roundUpDateTime(new Date());
  const [date, setDate] = useState(1);
  const [endDateTime, setEndDateTime] = useState(roundUpDateTime(currentDateTime));
  const [recurring, setRecurring] = useState(false);
  const [active, setActive] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reminderName, setReminderName] = useState("");
  const [description, setDescription] = useState("");
  const [defaultLength, setDefaultLength] = useState("02:00");

  const [templateReminders, setTemplateReminders] = useState([]);
  const [chosenTemplateReminder, setChosenTemplateReminder] = useState(-1);
  const [frequency, setFrequency] = useState("weekly");
  const [menuItemArray, setMenuItemArray] = useState([
    <MenuItem value={-1} key={-1}>
      Choose an existing reminder...
    </MenuItem>,
  ]);

  const defaultLengthMenuItems = (() => {
    let tempMenuItems = [];
    const minuteIntervals = 15;
    const intervals = 60 / minuteIntervals;
    for (let i = 0; i < 24; ++i) {
      for (let j = 0; j < intervals; ++j) {
        tempMenuItems.push(
          <MenuItem
            key={i * intervals + j}
            value={`${i.toString().padStart(2, "0")}:${(j * minuteIntervals)
              .toString()
              .padStart(2, "0")}`}
          >
            {`${i.toString().padStart(2, "0")}:${(j * minuteIntervals)
              .toString()
              .padStart(2, "0")}`}
          </MenuItem>
        );
      }
    }

    return tempMenuItems;
  })();

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
    setDate(currentDateTime.getDate());
    setEndDateTime(currentDateTime);
  };

  const handleSetDefaultLength = (e) => {
    // const re = /^[0-9\b]+$/;

    // if (e.target.value === "" || re.test(e.target.value)) {
    //   setDefaultLength(e.target.value);
    // }
    setDefaultLength(e.target.value);
  };

  const handleSetActive = (e) => {
    setActive(e.target.checked);
  };

  const handleDialogClickOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const closeDialogAddReminder = () => {
    if (reminderName === "") {
      alert("Please input an reminder name");
      return;
    } else if (description === "") {
      alert("Please input an reminder description");
      return;
    }

    const templateReminderId =
      chosenTemplateReminder >= 0
        ? templateReminders[chosenTemplateReminder].templateReminderId
        : null;

    if (!recurring) {
      reminderService
        .addPlannedReminder(
          endDateTime,
          active,
          defaultLength,
          reminderName,
          description,
          templateReminderId
        )
        .then(() => {
          alert("Succesfully created reminder");
        })
        .catch((error) => {
          alert(
            `Issue creating planned reminder. Error status code: ${error.response.status}. ${error.response.data.message}`
          );
        });
    } else {
      reminderService
        .addRecurringReminder(
          frequency,
          `${endDateTime.getHours()}${endDateTime.getMinutes()}`,
          date,
          active,
          defaultLength,
          reminderName,
          description,
          templateReminderId
        )
        .then(() => {
          alert("Succesfully created reminder");
        })
        .catch((error) => {
          alert(
            `Issue creating recurring reminder. Error status code: ${error.response.status}. ${error.response.data.message}`
          );
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
        alert("Successfully retrieved template reminders");
      })
      .catch((error) => {
        alert(
          error === undefined
            ? `Issue retrieving template reminders. Error status code ${error.response.status}. ${error.response.data.message}`
            : "Error accessing API"
        );
      });
  };

  useEffect(() => {
    setMenuItemArray(
      [
        <MenuItem value={-1} key={-1}>
          Choose an existing reminder...
        </MenuItem>,
      ].concat(
        templateReminders.map((templateReminder, index) => (
          <MenuItem value={index} key={index}>
            {templateReminder.name}
          </MenuItem>
        ))
      )
    );
  }, [templateReminders]);

  useEffect(() => {
    if (dialogOpen === true) {
      getTemplateReminders();
    }
  }, [dialogOpen]);

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
      <ListItem button onClick={handleDialogClickOpen} key="Add Reminder">
        <ListItemText primary="Add Reminder" />
      </ListItem>
      <Dialog
        open={dialogOpen}
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
                  value={description}
                  onChange={handleSetDescription}
                  disabled={chosenTemplateReminder !== -1}
                />
              </Grid>
              {/* <Grid item style={{ width: "100%" }}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  name="defaultLength"
                  label="Set Default Length"
                  color="primary"
                  value={defaultLength}
                  onChange={handleSetDefaultLength}
                  disabled={chosenTemplateReminder !== -1}
                />
              </Grid> */}

              <Grid item style={{ width: "100%" }}>
                {/* <TimePicker
                  label="Default Length"
                  value={defaultLength}
                  onChange={handleSetDefaultLength}
                  format="HH:mm"
                  ampm
                  fullWidth
                  minutesStep={15}
                /> */}

                <InputLabel>
                  Set default length required (in hours:minutes) to complete reminder
                </InputLabel>
                <Select
                  value={defaultLength}
                  onChange={handleSetDefaultLength}
                  style={{ width: "100%" }}
                >
                  {defaultLengthMenuItems}
                </Select>
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
                <Grid item>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={active}
                        onChange={handleSetActive}
                        name="active"
                        color="primary"
                      />
                    }
                    label="Active Reminder"
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
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={closeDialogAddReminder} color="primary">
            Add Reminder
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default addReminderButton;
