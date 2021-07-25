import React from "react";
import Grid from "@material-ui/core/Grid";
import {
  Chart,
  ArgumentAxis,
  ValueAxis,
  BarSeries,
  Title,
  Tooltip,
  Legend,
} from "@devexpress/dx-react-chart-material-ui";
import { Stack, Animation, HoverState, EventTracker } from "@devexpress/dx-react-chart";
import PropTypes from "prop-types";
import localService from "../../services/localService";
import { withStyles } from "@material-ui/core/styles";

const legendStyles = () => ({
  root: {
    display: "flex",
    margin: "auto",
    flexDirection: "row",
  },
});
const legendRootBase = ({ classes, ...restProps }) => (
  <Legend.Root {...restProps} className={classes.root} />
);
const Root = withStyles(legendStyles, { name: "LegendRoot" })(legendRootBase);
const legendLabelStyles = () => ({
  label: {
    whiteSpace: "nowrap",
  },
});
const legendLabelBase = ({ classes, ...restProps }) => (
  <Legend.Label className={classes.label} {...restProps} />
);
const Label = withStyles(legendLabelStyles, { name: "LegendLabel" })(legendLabelBase);

const BarChart = (props) => {
  const processActivityData = (activityArr) => {
    const activityMap = new Map();
    activityArr.forEach((activity) => {
      const date = [
        activity.actualStartDateTime.slice(0, 4),
        activity.actualStartDateTime.slice(4, 6),
        activity.actualStartDateTime.slice(6, 8),
      ]
        .reverse()
        .join("/");
      const currActualDuration =
        new Date(localService.parseTimeToString(activity.actualEndDateTime)) -
        new Date(localService.parseTimeToString(activity.actualStartDateTime));
      const currPlannedDuration =
        new Date(localService.parseTimeToString(activity.plannedEndDateTime)) -
        new Date(localService.parseTimeToString(activity.plannedStartDateTime));

      if (activityMap.has(date)) {
        const { actualDuration, plannedDuration } = activityMap.get(date);
        activityMap.set(date, {
          actualDuration: currActualDuration + actualDuration,
          plannedDuration: currPlannedDuration + plannedDuration,
        });
      } else {
        activityMap.set(date, {
          actualDuration: currActualDuration,
          plannedDuration: currPlannedDuration,
        });
      }
    });
    const result = [];
    activityMap.forEach((obj, date) =>
      result.push({
        actualDuration: obj.actualDuration / 36e5,
        plannedDuration: obj.plannedDuration / 36e5,
        date,
      })
    );
    return result.sort((data1, data2) => {
      const date1 = data1.date.split("/");
      const date2 = data2.date.split("/");
      return (
        new Date(date1[2], date1[1] - 1, date1[0]) - new Date(date2[2], date2[1] - 1, date2[0])
      );
    });
  };
  const dataArr = processActivityData(props.data);
  const Content = ({ text, targetItem, ...restProps }) => {
    return (
      <Tooltip.Content {...restProps} text={`Number of hours : ${text}`} targetItem={targetItem} />
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
          <ArgumentAxis />
          <ValueAxis />
          <BarSeries
            name="Actual Duration"
            valueField="actualDuration"
            argumentField="date"
            color="#273ecf"
          />
          <BarSeries
            name="Planned Duration"
            valueField="plannedDuration"
            argumentField="date"
            color="#1db1de"
          />
          <Animation />
          <Title text="Planned vs Actual hours" />
          <Legend position="bottom" rootComponent={Root} labelComponent={Label} />
          <Stack />
          <EventTracker />
          <Tooltip contentComponent={Content} />
          <HoverState />
        </Chart>
      </Grid>
    </Grid>
  );
};

BarChart.propTypes = {
  data: PropTypes.array,
};

export default BarChart;
