import React from "react";
import { Chart, PieSeries, Title, Tooltip } from "@devexpress/dx-react-chart-material-ui";
import { Animation, HoverState, EventTracker } from "@devexpress/dx-react-chart";
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
    activityMap.forEach((duration, tag) =>
      result.push({ duration: Math.round((duration / 36e5) * 10) / 10, tag })
    );
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
    <Chart data={dataArr} height={240} width={350}>
      <PieSeries valueField="duration" argumentField="tag" innerRadius={0.6} />
      <Title text="Breakdown of activities by tag" />
      <Animation />
      <EventTracker />
      <Tooltip contentComponent={Content} />
      <HoverState />
    </Chart>
  );
};

PieChart.propTypes = {
  data: PropTypes.array,
};

export default PieChart;
