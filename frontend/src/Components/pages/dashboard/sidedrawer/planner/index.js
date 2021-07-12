import React, { useState, useEffect, useCallback, useReducer } from "react";
import Paper from "@material-ui/core/Paper";
import { Grid, Typography, Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
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
import localService from "../../../services/localService";
import userService from "../../../services/userService";

const getData = (setData, setLoading) => {
  setLoading(true);
  return activityService.getAllActivities().then((activities) => {
    reminderService.getAllReminders().then((reminders) => {
      setData([...activities.data, ...reminders.data]);
      setLoading(false);
    });
  });
};

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

const mapAppointmentData = (appointment) => {
  if (appointment.eventType === "1") {
    return {
      id: appointment.activityId,
      startDate: localService.parseTimeToString(appointment.startDateTime),
      endDate: localService.parseTimeToString(appointment.endDateTime),
      title: appointment.name,
      description: appointment.description,
      eventType: appointment.eventType,
    };
  } else {
    return {
      id: appointment.reminderId,
      startDate: localService.parseTimeToString(appointment.endDateTime),
      title: appointment.name,
      description: appointment.description,
      eventType: appointment.eventType,
    };
  }
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
  const [currentAlert, setCurrentAlert] = useState({ severity: "", message: "" });
  const [resources, setResources] = useState([
    {
      fieldName: "tag",
      title: "Tag",
      instances: [],
    },
  ]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbarOpen(false);
  };
  useEffect(() => {
    userService.getUserInfo().then((response) => {
      const instances = response.data.tags
        .map((tag) => {
          return { id: tag, text: tag, fieldName: "tag" };
        })
        .concat({ id: "Reminder", text: "Reminder", fieldName: "tag", color: "#d50000" });
      setResources([
        {
          fieldName: "tag",
          title: "Tag",
          instances,
        },
      ]);
    });
  }, [data]);

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
      const addedActivityTag = added.newTag == undefined ? added.tag : added.newTag;
      userService
        .addTag(addedActivityTag)
        .then(() => {
          activityService
            .addActivity(
              added.startDate,
              added.endDate,
              added.title,
              added.description,
              addedActivityTag
            )
            .then(() => {
              getData(setData, setLoading);
              setCurrentAlert({ severity: "success", message: "Activity added!" });
              setSnackbarOpen(true);
            })
            .catch(() => {
              setCurrentAlert({ severity: "error", message: "Error creating activity!" });
              setSnackbarOpen(true);
            });
        })
        .catch(() => {
          setCurrentAlert({ severity: "error", message: "Error creating new tag!" });
          setSnackbarOpen(true);
        });
    }
    if (changed) {
      data.map((event) => {
        if (changed[event.id]) {
          const updatedEvent = { ...event, ...changed[event.id] };
          if (event.eventType === "1") {
            if (updatedEvent.tag !== "New Tag") {
              activityService
                .updateActivity(
                  updatedEvent.startDate,
                  updatedEvent.endDate,
                  updatedEvent.title,
                  updatedEvent.description,
                  event.id,
                  updatedEvent.tag
                )
                .then(() => {
                  getData(setData, setLoading);
                  setCurrentAlert({ severity: "success", message: "Activity updated!" });
                  setSnackbarOpen(true);
                })
                .catch(() => {
                  setCurrentAlert({ severity: "error", message: "Error updating activity!" });
                  setSnackbarOpen(true);
                });
            } else {
              if (updatedEvent.newTag === undefined) {
                setCurrentAlert({ severity: "error", message: "New tag cannot be empty!" });
                setSnackbarOpen(true);
              } else {
                userService
                  .addTag(updatedEvent.newTag)
                  .then(() => {
                    activityService
                      .updateActivity(
                        updatedEvent.startDate,
                        updatedEvent.endDate,
                        updatedEvent.title,
                        updatedEvent.description,
                        event.id,
                        updatedEvent.newTag
                      )
                      .then(() => {
                        getData(setData, setLoading);
                        setCurrentAlert({ severity: "success", message: "Activity updated!" });
                        setSnackbarOpen(true);
                      })
                      .catch(() => {
                        setCurrentAlert({ severity: "error", message: "Error updating activity!" });
                        setSnackbarOpen(true);
                      });
                  })
                  .catch(() => {
                    setCurrentAlert({ severity: "error", message: "Error creating new tag!" });
                    setSnackbarOpen(true);
                  });
              }
            }
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
                setCurrentAlert({ severity: "success", message: "Reminder updated!" });
                setSnackbarOpen(true);
              })
              .catch(() => {
                setCurrentAlert({ severity: "error", message: "Error updating reminder!" });
                setSnackbarOpen(true);
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
              setCurrentAlert({ severity: "success", message: "Activity deleted!" });
              setSnackbarOpen(true);
            });
          } else {
            reminderService.deleteReminder(deleted).then(() => {
              getData(setData, setLoading);
              setCurrentAlert({ severity: "success", message: "Reminder deleted!" });
              setSnackbarOpen(true);
            });
          }
        }
      });
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

    const onTagFieldChange = (nextValue) => {
      onFieldChange({ tag: nextValue });
    };

    const onCreateTagFieldChange = (nextValue) => {
      onFieldChange({ newTag: nextValue });
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
            justify="space-between"
            spacing={3}
          >
            <Grid item xs>
              <AppointmentForm.DateEditor
                value={appointmentData.startDate}
                onValueChange={onStartFieldChange}
              />
            </Grid>
            <Grid item xs={1}>
              <Typography align="center"> -</Typography>
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
        <Grid item xs>
          <AppointmentForm.Label text="Tag" type="title" />
        </Grid>
        <Grid item xs style={{ width: "90%" }}>
          <AppointmentForm.Select
            value={appointmentData.tag}
            availableOptions={resources[0].instances
              .filter((resource) => resource.id != "Reminder")
              .concat([{ id: "New Tag", text: "Add a new tag" }])}
            onValueChange={onTagFieldChange}
            placeholder="Add a Tag"
          />
        </Grid>
        {appointmentData.tag == "New Tag" ? (
          <>
            <Grid item xs>
              <AppointmentForm.Label text="Create a new Tag" type="title" />
            </Grid>
            <Grid item xs>
              <AppointmentForm.TextEditor
                value={appointmentData.newTag}
                onValueChange={onCreateTagFieldChange}
                placeholder="Create a new Tag"
              />
            </Grid>
          </>
        ) : null}
      </Grid>
    );
  };

  BasicLayout.propTypes = {
    onFieldChange: PropTypes.any,
    appointmentData: PropTypes.any,
  };

  return (
    <Paper>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert severity={currentAlert.severity}>
          <AlertTitle>{currentAlert.message}</AlertTitle>
        </Alert>
      </Snackbar>
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
        <Resources data={resources} mainResourceName="tag" />

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

export default Planner;
