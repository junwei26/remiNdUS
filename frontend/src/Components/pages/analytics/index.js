import React from "react";
import { Chart, PieSeries, Title, Tooltip } from "@devexpress/dx-react-chart-material-ui";
import { Animation, HoverState, EventTracker } from "@devexpress/dx-react-chart";
import { Grid } from "@material-ui/core";
import localService from "../services/localService";
import PropTypes from "prop-types";
const DummyData = [
  { name: "test 1", tag: "tag 1", startDateTime: "202101010000", endDateTime: "202101010500" },
  { name: "test 2", tag: "tag 1", startDateTime: "202101010000", endDateTime: "202101010500" },
  { name: "test 3", tag: "tag 2", startDateTime: "202101010000", endDateTime: "202101010500" },
  { name: "test 4", tag: "tag 2", startDateTime: "202101010000", endDateTime: "202101010500" },
  { name: "test 5", tag: "tag 3", startDateTime: "202101010000", endDateTime: "202101010500" },
  { name: "test 6", tag: "tag 3", startDateTime: "202101010000", endDateTime: "202101010500" },
  { name: "test 7", tag: "tag 4", startDateTime: "202101010000", endDateTime: "202101010500" },
  { name: "test 8", tag: "tag 4", startDateTime: "202101010000", endDateTime: "202101010500" },
  { name: "test 9", tag: "tag 4", startDateTime: "202101010000", endDateTime: "202101010500" },
  { name: "test 10", tag: "tag 4", startDateTime: "202101010000", endDateTime: "202101010500" },
  { name: "test 11", tag: "tag 5", startDateTime: "202101010000", endDateTime: "202101010500" },
  { name: "test 12", tag: "tag 6", startDateTime: "202101010000", endDateTime: "202101010500" },
  { name: "test 13", tag: "tag 6", startDateTime: "202101010000", endDateTime: "202101010500" },
  { name: "test 14", tag: "tag 6", startDateTime: "202101010000", endDateTime: "202101010500" },
  { name: "test 15", tag: "tag 6", startDateTime: "202101010000", endDateTime: "202101010500" },
  { name: "test 16", tag: "tag 6", startDateTime: "202101010000", endDateTime: "202101010500" },
];

const processActivityData = (activityArr) => {
  const activityMap = new Map();
  activityArr.forEach((activity) => {
    if (activityMap.has(activity.tag)) {
      const tagDuration = activityMap.get(activity.tag);
      const currDuration =
        new Date(localService.parseTime(activity.endDateTime)) -
        new Date(localService.parseTime(activity.startDateTime));
      activityMap.set(activity.tag, tagDuration + currDuration);
    } else {
      activityMap.set(
        activity.tag,
        new Date(localService.parseTime(activity.endDateTime)) -
          new Date(localService.parseTime(activity.startDateTime))
      );
    }
  });
  const result = [];
  activityMap.forEach((duration, tag) => result.push({ duration: duration / 36e5, tag }));
  return result;
};
const dataArr = processActivityData(DummyData);
const Analytics = () => {
  const Content = ({ text, targetItem, ...restProps }) => {
    return (
      <Tooltip.Content
        {...restProps}
        text={`tag : ${dataArr[targetItem.point].tag} duration : ${text}`}
        targetItem={targetItem}
      />
    );
  };
  Content.propTypes = {
    text: PropTypes.string,
    targetItem: PropTypes.object,
  };
  return (
    <Grid container>
      <Grid item xs>
        <Chart data={dataArr}>
          <PieSeries valueField="duration" argumentField="tag" innerRadius={0.6} />
          <Title text="Breakdown of activities by tag" />
          <Animation />
          <EventTracker />
          <Tooltip contentComponent={Content} />
          <HoverState />
        </Chart>
      </Grid>
    </Grid>
  );
};

export default Analytics;
