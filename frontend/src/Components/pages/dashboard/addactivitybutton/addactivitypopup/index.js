import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  Grid,
  TextField,
  Card,
  Typography,
  Select,
  MenuItem,
  InputLabel,
} from "@material-ui/core";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, DateTimePicker } from "@material-ui/pickers";
import activityService from "../../../services/activityService";
import userService from "../../../services/userService";

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
  select: {
    width: 300,
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
  const [tags, setTags] = useState([]);
  const [tag, setTag] = useState("");

  useEffect(() => {
    userService.getUserInfo().then((response) => setTags(response.data.tags));
  }, []);

  const handleStartDateChange = (date) => {
    setStartDateTime(roundUpTime(date));
  };

  const handleEndDateChange = (date) => {
    setEndDateTime(roundUpTime(date));
  };

  const handleTagChange = (e) => {
    setTag(e.target.value);
  };

  const handleSubmitAddActivity = (e) => {
    e.preventDefault();
    const activityTag = tag == "New Tag" ? e.target.newTag.value : tag;
    if (e.target.activityName.value === "") {
      alert("Please input an activity name");
      return;
    } else if (e.target.description.value === "") {
      alert("Please input an activity description");
      return;
    }
    userService
      .addTag(activityTag)
      .then(() => {
        activityService
          .addActivity(
            e.target.startDateTime.value,
            e.target.endDateTime.value,
            e.target.activityName.value,
            e.target.description.value,
            activityTag
          )
          .then(() => {
            alert("Succesfully created activity");
          })
          .catch((error) => {
            alert(
              `Issue creating activity. Error status code: ${error.response.status}. ${error.response.data.message}`
            );
          });
      })
      .catch(() => {
        alert("Error creating new tag");
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
                  <InputLabel id="selectTag">Tag</InputLabel>
                  <Select
                    className={classes.select}
                    value={tag}
                    labelId="selectTag"
                    onChange={handleTagChange}
                  >
                    {tags.map((tag) => (
                      <MenuItem value={tag} key={tag}>
                        {tag}
                      </MenuItem>
                    ))}
                    <MenuItem value={"New Tag"}> Create a new Tag </MenuItem>
                  </Select>
                </Grid>
                {tag == "New Tag" ? (
                  <Grid item style={{ width: "80%" }}>
                    <TextField
                      variant="outlined"
                      required
                      fullWidth
                      name="newTag"
                      label="Create a new tag"
                      color="primary"
                      autofocus
                    />
                  </Grid>
                ) : (
                  <></>
                )}
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
