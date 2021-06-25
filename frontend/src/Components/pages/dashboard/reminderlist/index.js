import React, { useState, useEffect } from "react";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import ListItemText from "@material-ui/core/ListItemText";
import { Typography, ButtonGroup, Button, Grid } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import reminderService from "../../services/reminderService";

const useStyles = makeStyles(() => ({
  root: { height: 400, width: 250, overflow: "auto" },
  buttongroup: { height: 50, width: 250 },
}));

const parseTime = (dateString) => {
  return (
    [dateString.slice(6, 8), dateString.slice(4, 6), dateString.slice(0, 4)].join("/") +
    "  " +
    [dateString.slice(8, 10), dateString.slice(10, 12)].join(":")
  );
};

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
          <Button
            onClick={() => {
              setNextNumberOfDays(7);
            }}
          >
            Next 7 days
          </Button>
          <Button
            onClick={() => {
              setNextNumberOfDays(30);
            }}
          >
            Next 30 days
          </Button>
        </ButtonGroup>
      </Grid>
      <Grid item>
        <Paper fullWidth className={classes.root}>
          <List>
            {reminders.map((reminder) => {
              const reminderDisplayText = parseTime(reminder.dateTime) + "  " + reminder.name;
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
