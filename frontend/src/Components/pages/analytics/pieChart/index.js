import React from "react";
import { Chart, PieSeries, Title, Tooltip } from "@devexpress/dx-react-chart-material-ui";
import { Animation, HoverState, EventTracker } from "@devexpress/dx-react-chart";
import { Grid } from "@material-ui/core";
import localService from "../../services/localService";
import PropTypes from "prop-types";

const PieChart = (props) => {
  const processActivityData = (activityArr) => {
    const activityMap = new Map();
    activityArr.forEach((activity) => {
      if (activityMap.has(activity.tag)) {
        const tagDuration = activityMap.get(activity.tag);
        const currDuration =
          new Date(localService.parseTimeToString(activity.actualEndDateTime)) -
          new Date(localService.parseTimeToString(activity.actualStartDateTime));
        activityMap.set(activity.tag, tagDuration + currDuration);
      } else {
        activityMap.set(
          activity.tag,
          new Date(localService.parseTimeToString(activity.actualEndDateTime)) -
            new Date(localService.parseTimeToString(activity.actualStartDateTime))
        );
      }
    });
    const result = [];
    activityMap.forEach((duration, tag) => result.push({ duration: duration / 36e5, tag }));
    return result;
  };
  const dataArr = processActivityData(props.data);
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

PieChart.propTypes = {
  data: PropTypes.array,
};

export default PieChart;
