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
} from "@material-ui/core";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, DateTimePicker, TimePicker } from "@material-ui/pickers";
import PropTypes from "prop-types";
import activityService from "../../../services/activityService";
import localService from "../../../services/localService";
import userService from "../../../services/userService";

const useStyles = makeStyles(() => ({
  card: {
    padding: 10,
  },
}));

const EditActivityDisplay = (props) => {
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

  const [activityTags, setActivityTags] = useState([]);
  const [chosenActivityTag, setChosenActivityTag] = useState(-1);
  const [frequency, setFrequency] = useState("weekly");
  const [activityTagMenuItemArray, setActivityTagMenuItemArray] = useState([
    <MenuItem value={-1} key={-1}>
      Choose an existing activity tag...
    </MenuItem>,
    <MenuItem value={-2} key={-2}>
      Create new activity tag
    </MenuItem>,
  ]);

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

  const handleDialogBack = () => {
    props.setEditingActivity(false);
    props.setSelectedRow(null);
    props.setDialogMaxWidth("lg");
  };

  const closeDialogUpdateActivity = () => {
    if (activityName === "") {
      alert("Please input an activity name");
      return;
    } else if (description === "") {
      alert("Please input an activity description");
      return;
    } else if (endDateTime.getTime() <= startDateTime.getTime()) {
      alert("End datetime cannot be earlier than start datetime");
      return;
    } else if (!activityTag) {
      alert("Activity must have an associated tag");
      return;
    }

    if (
      activityName !== props.activity.name ||
      description !== props.activity.description ||
      activityTag !== props.activity.activityTag
    ) {
      alert("Note that changes to name, description or activity tag applies to all activities");
    }

    userService.addTag(activityTag).then(() => {
      if (!recurring) {
        activityService
          .updatePlannedActivity(
            localService.convertDateToString(startDateTime),
            localService.convertDateToString(endDateTime),
            activityTag,
            activityName,
            description,
            props.activity.templateActivityId,
            props.activity.activityId
          )
          .then(() => {
            alert(
              "Successfully updated activity. It may take up to a minute for changes to be reflected."
            );
            handleDialogBack();
            return;
          })
          .catch((error) => {
            alert(
              `Issue updating planned activity. Error status code: ${error.response.status}. ${error.response.data.message}`
            );
          });
      } else {
        activityService
          .updateRecurringActivity(
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
            props.activity.templateActivityId,
            props.activity.activityId
          )
          .then(() => {
            alert("Successfully updated activity");
            handleDialogBack();
            return;
          })
          .catch((error) => {
            alert(
              `Issue updating recurring activity. Error status code: ${error.response.status}. ${error.response.data.message}`
            );
          });
      }
    });
  };

  const getActivityTags = () => {
    return userService
      .getUserInfo()
      .then((response) => {
        setActivityTags(response.data.tags);
        return response.data.tags;
      })
      .catch((error) => {
        alert(
          error === undefined
            ? "Error accessing API"
            : `Issue retrieving activity tags. Error status code ${error.response.status}. ${error.response.data.message}`
        );
      });
  };

  useEffect(() => {
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
  }, [activityTags]);

  useEffect(() => {
    getActivityTags().then((activityTags) => {
      setActivityName(props.activity.name);
      setDescription(props.activity.description);
      setActivityTag(props.activity.activityTag);
      setChosenActivityTag(activityTags.indexOf(props.activity.activityTag));

      if (props.activity.activityType === "planned") {
        setRecurring(false);
        setStartDateTime(new Date(localService.parseTimeToDate(props.activity.startDateTime)));
        setEndDateTime(new Date(localService.parseTimeToDate(props.activity.endDateTime)));
      } else {
        setRecurring(true);
        setStartDateTime(new Date(localService.parseTimeToDate(props.activity.startTime)));
        setEndDateTime(new Date(localService.parseTimeToDate(props.activity.endTime)));
        setDate(props.activity.date);
      }
    });
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
                value={activityName}
                onChange={handleSetActivityName}
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
            </Grid>
            <Grid item style={{ width: "100%" }}>
              <InputLabel>Select an activity Tag</InputLabel>
              <Select
                value={chosenActivityTag}
                onChange={handleChangeChosenActivityTag}
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
                      disabled
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
        <Button onClick={handleDialogBack} color="primary">
          Back
        </Button>
        <Button onClick={closeDialogUpdateActivity} color="primary">
          Update Activity
        </Button>
      </DialogActions>
    </>
  );
};

EditActivityDisplay.propTypes = {
  activity: PropTypes.object,
  setEditingActivity: PropTypes.func,
  setDialogMaxWidth: PropTypes.func,
  setSelectedRow: PropTypes.func,
};

export default EditActivityDisplay;