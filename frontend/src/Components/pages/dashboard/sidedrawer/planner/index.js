import React, { useEffect, useCallback, useReducer } from "react";
import Paper from "@material-ui/core/Paper";
import { Grid, Typography } from "@material-ui/core";
import LinearProgress from "@material-ui/core/LinearProgress";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import { ViewState, EditingState, IntegratedEditing } from "@devexpress/dx-react-scheduler";
import {
  Scheduler,
  WeekView,
  Appointments,
  Toolbar,
  DateNavigator,
  DragDropProvider,
  ViewSwitcher,
  AppointmentForm,
  AppointmentTooltip,
  TodayButton,
  MonthView,
  Resources,
  CurrentTimeIndicator,
} from "@devexpress/dx-react-scheduler-material-ui";
import activityService from "../../../services/activityService";
import reminderService from "../../../services/reminderService";

const getData = (setData, setLoading) => {
  setLoading(true);
  return activityService.getAllActivities().then((response1) => {
    reminderService.getAllReminder().then((response2) => {
      setData([...response1.data, ...response2.data]);
      setLoading(false);
    });
  });
};
let resources = [
  {
    fieldName: "eventType",
    title: "",
    instances: [
      { id: "1", text: "activity", color: "#673ab7" },
      { id: "2", text: "reminder", color: "#d50000" },
    ],
  },
];

const styles = {
  toolbarRoot: {
    position: "relative",
  },
  progress: {
    position: "absolute",
    width: "100%",
    bottom: 0,
    left: 0,
  },
};

const ToolbarWithLoading = withStyles(styles, { name: "Toolbar" })(
  ({ children, classes, ...restProps }) => (
    <div className={classes.toolbarRoot}>
      <Toolbar.Root {...restProps}>{children}</Toolbar.Root>
      <LinearProgress className={classes.progress} />
    </div>
  )
);

const parseTime = (dateTime) => {
  if (dateTime) {
    return new Date(
      dateTime.slice(0, 4),
      dateTime.slice(4, 6) - 1,
      dateTime.slice(6, 8),
      dateTime.slice(8, 10),
      dateTime.slice(10, 12)
    ).toLocaleString("en-US");
  }
  return "";
};

const mapAppointmentData = (appointment) => {
  if (appointment.eventType === "1") {
    return {
      id: appointment.activityId,
      startDate: parseTime(appointment.startDateTime),
      endDate: parseTime(appointment.endDateTime),
      title: appointment.name,
      description: appointment.description,
      eventType: appointment.eventType,
    };
  } else {
    return {
      id: appointment.reminderId,
      startDate: parseTime(appointment.dateTime),
      title: appointment.name,
      description: appointment.description,
      eventType: appointment.eventType,
    };
  }
};

const BasicLayout = ({ onFieldChange, appointmentData }) => {
  const onDescriptionFieldChange = (nextValue) => {
    onFieldChange({ description: nextValue });
  };
  const onNameFieldChange = (nextValue) => {
    onFieldChange({ title: nextValue });
  };

  const onStartFieldChange = (nextValue) => {
    onFieldChange({ startDate: nextValue });
  };

  const onEndFieldChange = (nextValue) => {
    onFieldChange({ endDate: nextValue });
  };

  return appointmentData.eventType == 2 ? (
    <Grid container direction="column" alignItems="left" alignContent="center">
      <Grid item xs>
        <AppointmentForm.Label text="Reminder" type="title" />
      </Grid>
      <Grid item xs>
        <AppointmentForm.TextEditor
          value={appointmentData.title}
          onValueChange={onNameFieldChange}
          placeholder="Add a name"
        />
      </Grid>
      <Grid item xs style={{ width: "90%" }}>
        <AppointmentForm.Label text="Deadline" type="title" />
      </Grid>
      <Grid item xs>
        <AppointmentForm.DateEditor
          value={appointmentData.startDate}
          onValueChange={onStartFieldChange}
        />
      </Grid>
      <Grid item xs style={{ width: "90%" }}>
        <AppointmentForm.Label text="Description" type="title" />
      </Grid>
      <Grid item xs>
        <AppointmentForm.TextEditor
          value={appointmentData.description}
          onValueChange={onDescriptionFieldChange}
          placeholder="Add a description"
        />
      </Grid>
    </Grid>
  ) : (
    <Grid container direction="column" alignItems="left" alignContent="center">
      <AppointmentForm.Label text="Activity" type="title" />
      <Grid item xs>
        <AppointmentForm.TextEditor
          value={appointmentData.title}
          onValueChange={onNameFieldChange}
          placeholder="Add a name"
        />
      </Grid>
      <AppointmentForm.Label text="Duration" type="title" />

      <Grid item xs>
        <Grid
          container
          direction="row"
          alignItems="center"
          alignContent="center"
          justify="center"
          spacing={3}
        >
          <Grid item xs>
            <AppointmentForm.DateEditor
              value={appointmentData.startDate}
              onValueChange={onStartFieldChange}
            />
          </Grid>
          <Grid item xs={1}>
            <Typography> - </Typography>
          </Grid>
          <Grid item xs>
            <AppointmentForm.DateEditor
              value={appointmentData.endDate}
              onValueChange={onEndFieldChange}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs>
        <AppointmentForm.Label text="Description" type="title" />
      </Grid>
      <Grid item xs>
        <AppointmentForm.TextEditor
          value={appointmentData.description}
          onValueChange={onDescriptionFieldChange}
          placeholder="Add a description"
        />
      </Grid>
    </Grid>
  );
};
const currentDate = () => {
  var d = new Date(),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

const initialState = {
  data: [],
  loading: false,
  currentDate: currentDate(),
  currentViewName: "Week",
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setLoading":
      return { ...state, loading: action.payload };
    case "setData":
      return { ...state, data: action.payload.map(mapAppointmentData) };
    case "setCurrentViewName":
      return { ...state, currentViewName: action.payload };
    case "setCurrentDate":
      return { ...state, currentDate: action.payload };
    default:
      return state;
  }
};

const Planner = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { data, loading, currentViewName, currentDate } = state;
  const setCurrentViewName = useCallback(
    (nextViewName) =>
      dispatch({
        type: "setCurrentViewName",
        payload: nextViewName,
      }),
    [dispatch]
  );
  const setData = useCallback(
    (nextData) =>
      dispatch({
        type: "setData",
        payload: nextData,
      }),
    [dispatch]
  );
  const setCurrentDate = useCallback(
    (nextDate) =>
      dispatch({
        type: "setCurrentDate",
        payload: nextDate,
      }),
    [dispatch]
  );
  const setLoading = useCallback(
    (nextLoading) =>
      dispatch({
        type: "setLoading",
        payload: nextLoading,
      }),
    [dispatch]
  );

  useEffect(() => {
    getData(setData, setLoading);
  }, [setData, currentViewName, currentDate]);

  const handleChange = ({ added, changed, deleted }) => {
    if (added) {
      activityService
        .addActivity(added.startDate, added.endDate, added.title, added.description)
        .then(() => {
          getData(setData, setLoading);
          alert("Activity added!");
        })
        .catch((e) => {
          alert(e.response.data.message);
        });
    }
    if (changed) {
      data.map((event) => {
        if (changed[event.id]) {
          const updatedEvent = { ...event, ...changed[event.id] };
          if (event.eventType === "1") {
            activityService
              .updateActivity(
                updatedEvent.startDate,
                updatedEvent.endDate,
                updatedEvent.title,
                updatedEvent.description,
                event.id
              )
              .then(() => {
                getData(setData, setLoading);
                alert("Activity updated!");
              })
              .catch((e) => {
                alert(e.response.data.message);
              });
          } else {
            reminderService
              .updateReminder(
                updatedEvent.startDate,
                updatedEvent.title,
                updatedEvent.description,
                event.id
              )
              .then(() => {
                getData(setData, setLoading);
                alert("Reminder updated!");
              })
              .catch((e) => {
                alert(e.response.data.message);
              });
          }
        }
      });
    }
    if (deleted !== null) {
      data.map((event) => {
        if (deleted === event.id) {
          if (event.eventType == "1") {
            activityService.deleteActivity(deleted).then(() => {
              getData(setData, setLoading);
              alert("Activity successfully deleted.");
            });
          } else {
            reminderService.deleteReminder(deleted).then(() => {
              getData(setData, setLoading);
              alert("Reminder successfully deleted.");
            });
          }
        }
      });
    }
  };
  return (
    <Paper>
      <Scheduler data={data}>
        <ViewState
          currentDate={currentDate}
          currentViewName={currentViewName}
          onCurrentViewNameChange={setCurrentViewName}
          onCurrentDateChange={setCurrentDate}
        />

        <EditingState onCommitChanges={handleChange} />
        <IntegratedEditing />
        <WeekView startDayHour={8} endDayHour={24} />
        <MonthView startDayHour={8} endDayHour={24} />
        <Appointments />
        <Resources data={resources} mainResourceName="eventType" />

        <AppointmentTooltip showOpenButton showCloseButton showDeleteButton />
        <AppointmentForm basicLayoutComponent={BasicLayout} />
        <DragDropProvider allowResize={() => false} />
        <Toolbar {...(loading ? { rootComponent: ToolbarWithLoading } : null)} />
        <DateNavigator />
        <TodayButton />
        <ViewSwitcher />
        <CurrentTimeIndicator />
      </Scheduler>
    </Paper>
  );
};
BasicLayout.propTypes = {
  onFieldChange: PropTypes.any,
  appointmentData: PropTypes.any,
};

export default Planner;
