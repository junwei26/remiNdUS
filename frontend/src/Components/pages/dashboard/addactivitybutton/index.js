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
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
} from "@material-ui/core";
import PropTypes from "prop-types";
import DateFnsUtils from "@date-io/date-fns";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import { MuiPickersUtilsProvider, DateTimePicker, TimePicker } from "@material-ui/pickers";
import activityService from "../../services/activityService";
import localService from "../../services/localService";
import userService from "../../services/userService";
import AddIcon from "@material-ui/icons/Add";

const useStyles = makeStyles(() => ({
  card: {
    padding: 10,
  },
}));

const AddActivityButton = (props) => {
  const classes = useStyles();

  const nearestTime = 1000 * 60 * 15; // round up to nearest 15 minutes

  const roundUpDateTime = (date) => {
    return new Date(Math.ceil(date.getTime() / nearestTime) * nearestTime);
  };

  const currentDateTime = roundUpDateTime(new Date());
  const [date, setDate] = useState(1);
  const [startDateTime, setStartDateTime] = useState(currentDateTime);
  const [endDateTime, setEndDateTime] = useState(
    roundUpDateTime(new Date(currentDateTime.getTime() + 1))
  );
  const [activityName, setActivityName] = useState("");
  const [description, setDescription] = useState("");
  const [activityTag, setActivityTag] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [templateActivities, setTemplateActivities] = useState([]);
  const [chosenTemplateActivity, setChosenTemplateActivity] = useState(-1);
  const [activityTags, setActivityTags] = useState([]);
  const [chosenActivityTag, setChosenActivityTag] = useState(-1);
  const [frequency, setFrequency] = useState("weekly");
  const [templateActivitiesMenuItemArray, setTemplateActivitiesMenuItemArray] = useState([
    <MenuItem value={-1} key={-1}>
      Create new activity
    </MenuItem>,
  ]);
  const [activityTagMenuItemArray, setActivityTagMenuItemArray] = useState([
    <MenuItem value={-1} key={-1}>
      Choose an existing activity tag...
    </MenuItem>,
    <MenuItem value={-2} key={-2}>
      Create new activity tag
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

  const handleStartDateChange = (date) => {
    setStartDateTime(roundUpDateTime(date));
    if (frequency === "monthly") {
      setDate(1);
    }
    // If new start date is greater (later) than end datetime or equal, update end date
    if (date.getTime() >= endDateTime.getTime()) {
      setEndDateTime(roundUpDateTime(new Date(roundUpDateTime(date).getTime() + 1)));
    }
  };

  const handleEndDateChange = (date) => {
    setEndDateTime(roundUpDateTime(date));
  };

  const handleSetActivityName = (e) => {
    setActivityName(e.target.value);
  };

  const handleSetDescription = (e) => {
    setDescription(e.target.value);
  };

  const handleChangeTemplateActivity = (e) => {
    setChosenTemplateActivity(e.target.value);
    if (e.target.value >= 0) {
      setActivityName(templateActivities[e.target.value].name);
      setDescription(templateActivities[e.target.value].description);
      setActivityTag(templateActivities[e.target.value].activityTag);
      setChosenActivityTag(-1);
      setActivityTagMenuItemArray(
        <MenuItem value={-1} key={-1}>
          {templateActivities[e.target.value].activityTag}
        </MenuItem>
      );
    } else {
      setActivityName("");
      setDescription("");
      setActivityTag("");
      setChosenActivityTag(-1);
    }
  };

  const handleChangeChosenActivityTag = (e) => {
    setChosenActivityTag(e.target.value);
    if (e.target.value >= 0) {
      setActivityTag(activityTags[e.target.value]);
    } else {
      setActivityTag("");
    }
  };

  const handleChangeActivityTag = (e) => {
    setActivityTag(e.target.value);
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleSetRecurring = (e) => {
    setRecurring(e.target.checked);
    setStartDateTime(currentDateTime);
    setDate(1);
    setEndDateTime(currentDateTime);
  };

  const handleDialogClickOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const closeDialogAddActivity = () => {
    if (activityName === "") {
      setCurrentAlert({
        severity: "error",
        message: "Please input an activity name",
      });
      setSnackbarOpen(true);
      return;
    } else if (description === "") {
      setCurrentAlert({
        severity: "error",
        message: "Please input an activity description",
      });
      setSnackbarOpen(true);
      return;
    } else if (endDateTime.getTime() <= startDateTime.getTime()) {
      setCurrentAlert({
        severity: "error",
        message: "End datetime cannot be earlier than start datetime",
      });
      setSnackbarOpen(true);
      return;
    } else if (!activityTag) {
      setCurrentAlert({
        severity: "error",
        message: "Activity must have an associated tag",
      });
      setSnackbarOpen(true);
      return;
    }

    const templateActivityId =
      chosenTemplateActivity >= 0
        ? templateActivities[chosenTemplateActivity].templateActivityId
        : null;

    userService.addTag(activityTag).then(() => {
      if (!recurring) {
        activityService
          .addPlannedActivity(
            localService.convertDateToString(startDateTime),
            localService.convertDateToString(endDateTime),
            activityTag,
            activityName,
            description,
            templateActivityId
          )
          .then(() => {
            setCurrentAlert({ severity: "success", message: "Succesfully created activity" });
            setSnackbarOpen(true);
            props.setPlannerDataUpdate(!props.plannerDataUpdate);
            handleDialogClose();
          })
          .catch((error) => {
            setCurrentAlert({
              severity: "error",
              message: `Issue creating planned activity. Error status code: ${error.response.status}. ${error.response.data.message}`,
            });
            setSnackbarOpen(true);
          });
      } else {
        activityService
          .addRecurringActivity(
            frequency,
            `${startDateTime.getHours().toString().padStart(2, "0")}${startDateTime
              .getMinutes()
              .toString()
              .padStart(2, "0")}`,
            `${endDateTime.getHours().toString().padStart(2, "0")}${endDateTime
              .getMinutes()
              .toString()
              .padStart(2, "0")}`,
            date,
            activityTag,
            activityName,
            description,
            templateActivityId
          )
          .then(() => {
            setCurrentAlert({
              severity: "success",
              message: "Succesfully created activity",
            });
            setSnackbarOpen(true);
            props.setPlannerDataUpdate(!props.plannerDataUpdate);
            handleDialogClose();
          })
          .catch((error) => {
            setCurrentAlert({
              severity: "error",
              message: `Issue creating recurring activity. Error status code: ${error.response.status}. ${error.response.data.message}`,
            });
            setSnackbarOpen(true);
          });
      }
    });
  };

  const getTemplateActivities = () => {
    activityService
      .getTemplateActivities()
      .then((response) => {
        setTemplateActivities(response.data);
      })
      .catch((error) => {
        setCurrentAlert({
          severity: "error",
          message:
            error === undefined
              ? "Error accessing API"
              : `Issue retrieving template activities. Error status code ${error.response.status}. ${error.response.data.message}`,
        });
        setSnackbarOpen(true);
      });
  };

  const getActivityTags = () => {
    userService
      .getUserInfo()
      .then((response) => {
        setActivityTags(response.data.tags);
      })
      .catch((error) => {
        setCurrentAlert({
          severity: "error",
          message:
            error === undefined
              ? "Error accessing API"
              : `Issue retrieving activity tags. Error status code ${error.response.status}. ${error.response.data.message}`,
        });
        setSnackbarOpen(true);
      });
  };

  useEffect(() => {
    if (dialogOpen === true) {
      setTemplateActivitiesMenuItemArray(
        [
          <MenuItem value={-1} key={-1}>
            Create new activity
          </MenuItem>,
        ].concat(
          templateActivities.map((templateActivity, index) => (
            <MenuItem value={index} key={index}>
              {templateActivity.name}
            </MenuItem>
          ))
        )
      );
    }
  }, [templateActivities]);

  useEffect(() => {
    if (dialogOpen === true) {
      setActivityTagMenuItemArray(
        [
          <MenuItem value={-1} key={-1}>
            Choose an existing activity tag...
          </MenuItem>,
          <MenuItem value={-2} key={-2}>
            Create new activity tag
          </MenuItem>,
        ].concat(
          activityTags.map((activityTag, index) => (
            <MenuItem value={index} key={index}>
              {activityTag}
            </MenuItem>
          ))
        )
      );
    }
  }, [activityTags]);

  useEffect(() => {
    if (dialogOpen === true) {
      getTemplateActivities();
      getActivityTags();
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
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert severity={currentAlert.severity}>
          <AlertTitle>{currentAlert.message}</AlertTitle>
        </Alert>
      </Snackbar>
      <ListItem button onClick={handleDialogClickOpen} key="Add Activity">
        <ListItemIcon>
          <AddIcon />
        </ListItemIcon>
        <ListItemText primary="Activity" />
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
                <InputLabel>Select from existing activity</InputLabel>
                <Select
                  value={chosenTemplateActivity}
                  onChange={handleChangeTemplateActivity}
                  style={{ width: "100%" }}
                >
                  {templateActivitiesMenuItemArray}
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
                  disabled={chosenTemplateActivity !== -1}
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
                  disabled={chosenTemplateActivity !== -1}
                />
              </Grid>
              <Grid item style={{ width: "100%" }}>
                <InputLabel>Select an activity Tag</InputLabel>
                <Select
                  value={chosenActivityTag}
                  onChange={handleChangeChosenActivityTag}
                  disabled={chosenTemplateActivity !== -1}
                  style={{ width: "100%" }}
                >
                  {activityTagMenuItemArray}
                </Select>
              </Grid>
              {chosenActivityTag == -2 ? (
                <Grid item style={{ width: "100%" }}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    name="activityTag"
                    label="Activity Tag"
                    color="primary"
                    value={activityTag}
                    onChange={handleChangeActivityTag}
                    disabled={chosenTemplateActivity !== -1}
                  ></TextField>
                </Grid>
              ) : null}
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
                        error={endDateTime.getTime() <= startDateTime.getTime()}
                        helperText={
                          endDateTime.getTime() <= startDateTime.getTime()
                            ? "Must be later than start time"
                            : ""
                        }
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
                      error={endDateTime.getTime() <= startDateTime.getTime()}
                      helperText={
                        endDateTime.getTime() <= startDateTime.getTime()
                          ? "Must be later than start datetime"
                          : ""
                      }
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

AddActivityButton.propTypes = {
  plannerDataUpdate: PropTypes.bool,
  setPlannerDataUpdate: PropTypes.func,
};

export default AddActivityButton;
