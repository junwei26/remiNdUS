import React from "react";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import ListItemText from "@material-ui/core/ListItemText";
import { Typography, Grid } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import localService from "../../services/localService";
import PropTypes from "prop-types";

const useStyles = makeStyles(() => ({
  root: { height: 400, width: 250, overflow: "auto" },
  buttongroup: { height: 50, width: 250 },
}));

const ActivityDurationRanking = (props) => {
  const processActivityData = (activityArr) => {
    const activityMap = new Map();
    activityArr.forEach((activity) => {
      if (activityMap.has(activity.tag)) {
        const tagDuration = activityMap.get(activity.tag);
        const currDuration =
          new Date(localService.parseTime(activity.actualEndDateTime)) -
          new Date(localService.parseTime(activity.actualStartDateTime));
        activityMap.set(activity.tag, tagDuration + currDuration);
      } else {
        activityMap.set(
          activity.tag,
          new Date(localService.parseTime(activity.actualEndDateTime)) -
            new Date(localService.parseTime(activity.actualStartDateTime))
        );
      }
    });
    const result = [];
    activityMap.forEach((duration, tag) => result.push({ duration: duration / 36e5, tag }));
    var totalHrs = 0;
    result.forEach((data) => (totalHrs += data.duration));
    return result
      .sort((activity1, activity2) => activity2.duration - activity1.duration)
      .map((data) => {
        return { tag: data.tag, percentage: Math.round((data.duration / totalHrs) * 100) };
      });
  };
  const dataArr = processActivityData(props.data);
  const classes = useStyles();
  return (
    <Grid container>
      <Grid item>
        <Typography>Top tags with the most time spent</Typography>
      </Grid>
      <Grid item>
        <Paper fullWidth className={classes.root}>
          <List>
            {dataArr.map((data) => {
              const displayText = `${data.tag} : ${data.percentage}%`;
              return (
                <ListItem key={data.tag} divider={true}>
                  <ListItemText primary={displayText} />
                </ListItem>
              );
            })}
          </List>
        </Paper>
      </Grid>
    </Grid>
  );
};

ActivityDurationRanking.propTypes = {
  data: PropTypes.array,
};

export default ActivityDurationRanking;
