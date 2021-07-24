import React, { useState, useEffect } from "react";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import ListItemText from "@material-ui/core/ListItemText";
import { Typography, ButtonGroup, Button, Grid, Tooltip } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import reminderService from "../../services/reminderService";
import localService from "../../services/localService";

const useStyles = makeStyles(() => ({
  root: { height: 400, width: 250 },
  buttongroup: { height: 50, width: 250 },
  list: { height: 350, width: 250, overflow: "auto" },
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
      .then((response) => {
        const reminders = response.data.map((reminder) => {
          if (reminder.reminderType === "recurring") {
            return localService
              .recurringRemindersGenerator(reminder, currentDate, nextNumberOfDays)
              .map((reminder) => {
                return {
                  ...reminder,
                  name: reminder.title,
                  endDateTime: localService.convertDateToString(new Date(reminder.startDate)),
                };
              });
          } else {
            return [reminder];
          }
        });

        const fullReminderList = [].concat.apply([], reminders).sort((left, right) => {
          return left.endDateTime < right.endDateTime ? -1 : 1;
        });

        setReminders(fullReminderList);
      });
  }, [nextNumberOfDays]);

  const classes = useStyles();

  return (
    <Grid container direction="column" justify="flex-start" alignItems="center">
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
        <Paper className={classes.root}>
          <List className={classes.list}>
            {reminders.map((reminder, index) => {
              const reminderDisplayText = (
                <Tooltip title={"Description: " + reminder.description} key={index}>
                  <div key={index}>
                    {localService.parseTimeToString(reminder.endDateTime)}
                    <br />
                    {reminder.name}
                  </div>
                </Tooltip>
              );
              return (
                <ListItem key={index} divider={true}>
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
