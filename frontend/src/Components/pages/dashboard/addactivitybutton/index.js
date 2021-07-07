import React, { useState, useEffect } from "react";
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
import activityService from "../../services/activityService";

const useStyles = makeStyles(() => ({
  card: {
    padding: 10,
  },
}));

const AddActivityButton = () => {
  const classes = useStyles();

  const nearestTime = 1000 * 60 * 15; // round up to nearest 15 minutes
  // const nearestMinutes = nearestTime / 1000 / 60;

  const roundUpDateTime = (date) => {
    return new Date(Math.ceil(date.getTime() / nearestTime) * nearestTime);
  };

  const currentDateTime = roundUpDateTime(new Date());
  const [date, setDate] = useState(currentDateTime.getDate());
  const [startDateTime, setStartDateTime] = useState(currentDateTime);
  const [endDateTime, setEndDateTime] = useState(currentDateTime);
  const [recurring, setRecurring] = useState(false);
  const [active, setActive] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activityName, setActivityName] = useState("");
  const [description, setDescription] = useState("");

  const [templateActivities, setTemplateActivities] = useState([]);
  const [chosenTemplateActivity, setChosenTemplateReminder] = useState(-1);
  const [frequency, setFrequency] = useState("weekly");

  const handleSelectFrequencyChange = (e) => {
    if (frequency === "monthly" && e.target.value === "weekly" && date > 7) {
      setDate(1);
    }
    setFrequency(e.target.value);
  };

  const handleStartDateChange = (date) => {
    setStartDateTime(roundUpDateTime(date));
    setDate(date.getDate());
    // If new start date is greater (later) than end datetime, update end date
    if (date.getTime() > endDateTime.getTime()) {
      setEndDateTime(roundUpDateTime(date));
    }
  };

  const handleEndDateChange = (date) => {
    if (date.getTime() < startDateTime.getTime()) {
      setStartDateTime(roundUpDateTime(date));
      setDate(date.getDate());
    }
    setEndDateTime(roundUpDateTime(date));
  };

  const handleSetActivityName = (e) => {
    setActivityName(e.target.value);
  };

  const handleSetDescription = (e) => {
    setDescription(e.target.value);
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleSetRecurring = (e) => {
    setRecurring(e.target.checked);
    const currentDateTime = roundUpDateTime(new Date());
    setStartDateTime(currentDateTime);
    setDate(currentDateTime.getDate());
    setEndDateTime(currentDateTime);
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

  const closeDialogAddActivity = () => {
    if (activityName === "") {
      alert("Please input an activity name");
      return;
    } else if (description === "") {
      alert("Please input an activity description");
      return;
    }

    const templateActivityId =
      chosenTemplateActivity >= 0 ? templateActivities[chosenTemplateActivity].activityId : null;

    const defaultLength =
      chosenTemplateActivity < 0
        ? endDateTime.getTime() - startDateTime.getTime()
        : templateActivities[chosenTemplateActivity].defaultLength;

    if (!recurring) {
      activityService
        .addPlannedActivity(
          startDateTime,
          endDateTime,
          active,
          defaultLength,
          activityName,
          description,
          templateActivityId
        )
        .then(() => {
          alert("Succesfully created activity");
        })
        .catch((error) => {
          alert(
            `Issue creating activity. Error status code: ${error.response.status}. ${error.response.data.message}`
          );
        });
    } else {
      activityService
        .addRecurringActivity(
          frequency,
          `${startDateTime.getHours()}${startDateTime.getMinutes()}`,
          `${endDateTime.getHours()}${endDateTime.getMinutes()}`,
          date,
          active,
          defaultLength,
          activityName,
          description,
          templateActivityId
        )
        .then(() => {
          alert("Succesfully created activity");
        })
        .catch((error) => {
          alert(
            `Issue creating activity. Error status code: ${error.response.status}. ${error.response.data.message}`
          );
        });
    }

    handleDialogClose();
  };

  const handleChangeTemplateActivity = (e) => {
    setChosenTemplateReminder(e.target.value);
  };

  const getTemplateActivities = () => {
    activityService
      .getTemplateActivities()
      .then((response) => {
        setTemplateActivities(response.data);
        alert("Successfully retrieved template activities");
      })
      .catch((error) => {
        alert(
          error === undefined
            ? `Issue retrieving template activities. Error status code ${error.response.status}. ${error.response.data.message}`
            : "Error accessing API"
        );
      });
  };

  useEffect(() => {
    if (dialogOpen === true) {
      getTemplateActivities();
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
                <Select value={chosenTemplateActivity} onChange={handleChangeTemplateActivity}>
                  <MenuItem value={-1}>Choose an existing activity...</MenuItem>
                  {templateActivities.map((templateActivity, index) => {
                    <MenuItem value={index} key={index}>
                      {templateActivity.name}
                    </MenuItem>;
                  })}
                </Select>
              </Grid>
              <Grid item style={{ width: "100%" }}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  name="activityName"
                  label="Activity Name"
                  color="primary"
                  value={activityName}
                  onChange={handleSetActivityName}
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
                  autofocus
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
                    label="Recurring Activity"
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
                    label="Active activity"
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
                        label="Start Time"
                        value={startDateTime}
                        onChange={handleStartDateChange}
                        minutesStep={15}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TimePicker
                        label="End Time"
                        value={endDateTime}
                        onChange={handleEndDateChange}
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
              )}
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
