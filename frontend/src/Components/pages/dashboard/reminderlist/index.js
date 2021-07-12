import React, { useState, useEffect } from "react";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import ListItemText from "@material-ui/core/ListItemText";
import { Typography, ButtonGroup, Button, Grid } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import reminderService from "../../services/reminderService";
import localService from "../../services/localService";

const useStyles = makeStyles(() => ({
  root: { height: 400, width: 250, overflow: "auto" },
  buttongroup: { height: 50, width: 250 },
}));

const ReminderList = () => {
  const [reminders, setReminders] = useState([]);
  const [nextNumberOfDays, setNextNumberOfDays] = useState(7);

  useEffect(() => {
    const currentDate = new Date();
    const endDate = new Date();
    endDate.setDate(currentDate.getDate() + nextNumberOfDays);
    reminderService
      .getRangeReminder(currentDate.toLocaleString(), endDate.toLocaleString())
      .then((response) => setReminders(response.data));
  }, [nextNumberOfDays]);
  const classes = useStyles();
  return (
    <Grid container>
      <Grid item>
        <Typography>Upcoming Reminders</Typography>
      </Grid>
      <Grid item>
        <ButtonGroup
          className={classes.buttongroup}
          color="primary"
          aria-label="outlined primary button group"
        >
          {nextNumberOfDays === 7 ? (
            <Button
              variant="contained"
              onClick={() => {
                setNextNumberOfDays(7);
              }}
            >
              Next 7 days
            </Button>
          ) : (
            <Button
              onClick={() => {
                setNextNumberOfDays(7);
              }}
            >
              Next 7 days
            </Button>
          )}
          {nextNumberOfDays === 30 ? (
            <Button
              variant="contained"
              onClick={() => {
                setNextNumberOfDays(30);
              }}
            >
              Next 30 days
            </Button>
          ) : (
            <Button
              onClick={() => {
                setNextNumberOfDays(30);
              }}
            >
              Next 30 days
            </Button>
          )}
        </ButtonGroup>
      </Grid>
      <Grid item>
        <Paper fullWidth className={classes.root}>
          <List>
            {reminders
              .filter((reminder) => reminder.reminderType === "planned")
              .map((reminder) => {
                const reminderDisplayText =
                  localService.parseTimeShorter(reminder.endDateTime) + `\n${reminder.name}`;
                return (
                  <ListItem key={reminder.reminderId} divider={true}>
                    <ListItemText primary={reminderDisplayText} />
                  </ListItem>
                );
              })}
          </List>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ReminderList;
