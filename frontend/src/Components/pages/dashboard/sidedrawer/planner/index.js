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
}

const Planner = () => {
  const [currentDateObj, setCurrentDateObj] = useState(new Date());
  const generateDate = (dateObj) => {
    const padZero = (num) => (num < 10 ? "0" + num.toString() : num.toString());
    const year = dateObj.getFullYear().toString();
    const month = padZero(dateObj.getMonth() + 1);
    const day = padZero(dateObj.getDate());
    return year + month + day;
  };
  
  const recurringActivitiesGenerator = (recurringActivity) => {
    const generatedActivities = [];
    let daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const year = currentDateObj.getFullYear();
    if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
      daysInMonths[1] = 29;
    }
    const weekMs = 6.048e8;
    var monthMs = daysInMonths[currentDateObj.getMonth()] * 8.64e7;
    var timeInterval = 0;
    const endDateObj = new Date(currentDateObj.getTime());
    const activityDay = new Date();
    endDateObj.setDate(currentDateObj.getDate() + 7);
    if (recurringActivity.frequency === "weekly") {
      activityDay.setDate(
        currentDateObj.getDate() + recurringActivity.date - currentDateObj.getDay()
      );
      timeInterval = weekMs;
    } else {
      activityDay.setDate(recurringActivity.date);
      timeInterval = monthMs;
    }
    let startMs = activityDay.getTime();
    const endMs = endDateObj.getTime();
    while (startMs <= endMs) {
      const activity = {
        id: recurringActivity.activityId,
        startDate: localService.parseTime(
          generateDate(new Date(startMs)) + recurringActivity.startTime
        ),
        endDate: localService.parseTime(
          generateDate(new Date(startMs)) + recurringActivity.endTime
        ),
        title: recurringActivity.name,
        description: recurringActivity.description,
        eventType: recurringActivity.eventType,
        tag: recurringActivity.activityTag,
      };

  if (recurringActivity.frequency === "monthly") {
    timeInterval = daysInMonths[new Date(startMs).getMonth()] * 8.64e7;
  }
  startMs += timeInterval;
  generatedActivities.push(activity);
}
return generatedActivities;
};
const recurringRemindersGenerator = (recurringReminder) => {
  const generatedReminders = [];
  let daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const year = currentDateObj.getFullYear();
  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
    daysInMonths[1] = 29;
  }
  const weekMs = 6.048e8;
  var monthMs = daysInMonths[currentDateObj.getMonth()] * 8.64e7;
  var timeInterval = 0;
  const endDateObj = new Date(currentDateObj.getTime());
  const reminderStartDay = new Date();
  endDateObj.setDate(currentDateObj.getDate() + 7);
  if (recurringReminder.frequency === "weekly") {
    reminderStartDay.setDate(
      currentDateObj.getDate() + recurringReminder.date - currentDateObj.getDay()
    );
    timeInterval = weekMs;
  } else {
    reminderStartDay.setDate(recurringReminder.date);
    timeInterval = monthMs;
  }
  let startMs = reminderStartDay.getTime();

  const endMs = endDateObj.getTime();
  while (startMs <= endMs) {
    const reminder = {
      id: recurringReminder.reminderId,
      startDate: localService.parseTime(
        generateDate(new Date(startMs)) + recurringReminder.endTime
      ),
      title: recurringReminder.name,
      description: recurringReminder.description,
      eventType: recurringReminder.eventType,
      tag: "Reminder",
    };
    if (recurringReminder.frequency === "monthly") {
      timeInterval = daysInMonths[new Date(startMs).getMonth()] * 8.64e7;
    }
    startMs += timeInterval;
    generatedReminders.push(reminder);
  }
  return generatedReminders;
};
const mapAppointmentData = (appointment) => {
  if (appointment.active) {
    if (appointment.frequency) {
      if (appointment.eventType === "1") return recurringActivitiesGenerator(appointment);
      else return recurringRemindersGenerator(appointment);
    }

    if (appointment.eventType === "1") {
      return [
        {
          id: appointment.activityId,
          startDate: localService.parseTime(appointment.startDateTime),
          endDate: localService.parseTime(appointment.endDateTime),
          title: appointment.name,
          description: appointment.description,
          eventType: appointment.eventType,
          tag: appointment.activityTag,
        },
      ];
    } else {
      return [
        {
          id: appointment.reminderId,
          startDate: localService.parseTime(appointment.endDateTime),
          title: appointment.name,
          description: appointment.description,
          eventType: appointment.eventType,
          tag: "Reminder",
        },
      ];
    }
  } else {
    return [{}]; // not active, do not display
  }

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
      return { ...state, data: action.payload.flatMap(mapAppointmentData) };
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
  const [templateActivities, setTemplateActivities] = useState([]);
  const [templateActivitiesOptions, setTemplateActivitiesOptions] = useState([]);
  const [currentAlert, setCurrentAlert] = useState({ severity: "", message: "" });
  const [resources, setResources] = useState([
    {
      fieldName: "activityTag",
      title: "Activity Tag",
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
        .map((activityTag) => {
          return { id: activityTag, text: activityTag, fieldName: "activityTag" };
        })
        .concat({ id: "Reminder", text: "Reminder", fieldName: "activityTag", color: "#d50000" });
      setResources([
        {
          fieldName: "activityTag",
          title: "Activity Tag",
          instances,
        },
      ]);
    });
  }, [data]);

  useEffect(() => {
    activityService.getTemplateActivities().then((response) => {
      const instances = response.data
        .map((activityTemplate) => {
          return {
            id: activityTemplate.templateActivityId,
            text: activityTemplate.name,
            fieldName: "activityTemplate",
          };
        })
        .concat({});
      setTemplateActivities(response.data);
      setTemplateActivitiesOptions(instances);
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
    setCurrentDateObj(currentDate);
  }, [setData, currentViewName, currentDate]);

  const handleChange = ({ added, changed, deleted }) => {
    if (added) {
      const addedActivityTag = added.newTag == undefined ? added.activityTag : added.newTag;
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
          setCurrentAlert({ severity: "error", message: "Error creating new activity tag!" });
          setSnackbarOpen(true);
        });
    }
    if (changed) {
      data.map((event) => {
        if (changed[event.id]) {
          const updatedEvent = { ...event, ...changed[event.id] };
          if (event.eventType === "1") {
            if (updatedEvent.activityTag !== "New Tag") {
              activityService
                .updateActivity(
                  updatedEvent.startDate,
                  updatedEvent.endDate,
                  updatedEvent.title,
                  updatedEvent.description,
                  event.id,
                  updatedEvent.activityTag
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
                setCurrentAlert({
                  severity: "error",
                  message: "New activity tag cannot be empty!",
                });
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
                    setCurrentAlert({
                      severity: "error",
                      message: "Error creating new activity tag!",
                    });
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
    let originalAppointmentData = [];

    const onTemplateActivityFieldChange = (nextValue) => {
      onFieldChange({ templateId: nextValue });
      if (nextValue !== -1 && nextValue !== -2) {
        const chosenTemplateActivity = templateActivities.filter((templateActivity) => {
          return templateActivity.templateActivityId === nextValue;
        })[0];
        onFieldChange({ title: chosenTemplateActivity.name });
        onFieldChange({ description: chosenTemplateActivity.description });
      } else {
        onFieldChange({ title: originalAppointmentData.title });
        onFieldChange({ description: originalAppointmentData.description });
      }
    };

    const onNameFieldChange = (nextValue) => {
      onFieldChange({ title: nextValue });
    };

    const onDescriptionFieldChange = (nextValue) => {
      onFieldChange({ description: nextValue });
    };
    const onStartFieldChange = (nextValue) => {
      onFieldChange({ startDate: nextValue });
    };

    const onEndFieldChange = (nextValue) => {
      onFieldChange({ endDate: nextValue });
    };

    const onTagFieldChange = (nextValue) => {
      onFieldChange({ activityTag: nextValue });
    };

    const onCreateTagFieldChange = (nextValue) => {
      onFieldChange({ newTag: nextValue });
    };


    const getTemplateActivities = () => {
      activityService
        .getTemplateActivities()
        .then((response) => {
          setTemplateActivities(response.data);
        })
        .catch((error) => {
          alert(
            error === undefined
              ? "Error accessing API"
              : `Issue retrieving template activities. Error status code ${error.response.status}. ${error.response.data.message}`
          );
        });
    };

    const handleChangeTemplateActivity = (e) => {
      setChosenTemplateActivity(e.target.value);
      if (e.target.value >= 0) {
        onNameFieldChange(templateActivities[e.target.value].name);
        onDescriptionFieldChange(templateActivities[e.target.value].description);
        setActivityTag(templateActivities[e.target.value].activityTag);
        setChosenActivityTag(-1);
        setActivityTagMenuItemArray(
          <MenuItem value={-1} key={-1}>
            {templateActivities[e.target.value].activityTag}
          </MenuItem>
        );
      } else {
        setActivityName("");
        setDescription("");
        setActivityTag("");
        setChosenActivityTag(-1);
      }
    };

    useEffect(() => {
      originalAppointmentData = { ...appointmentData };
    }, []);

    useEffect(() => {
      setTemplateActivitiesOptionsArray(
        [
          <MenuItem value={-1} key={-1}>
            Create new activity
          </MenuItem>,
        ].concat(
          templateActivities.map((templateActivity, index) => (
            <MenuItem value={index} key={index}>
              {templateActivity.name}
            </MenuItem>
          ))
        )
      );
    }, [templateActivities]);

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
        <Grid item xs>
          <AppointmentForm.Label text="Select Activity" type="title" />
        </Grid>
        <Grid item xs style={{ width: "90%" }}>
          <AppointmentForm.Select
            value={appointmentData.templateActivityId}
            availableOptions={templateActivitiesOptions}
            onValueChange={onTemplateActivityFieldChange}
            placeholder="Create an activity"
          />
        </Grid>
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
            value={appointmentData.activityTag}
            availableOptions={resources[0].instances
              .filter((resource) => resource.id != "Reminder")
              .concat([{ id: "New Tag", text: "Add a new activity tag" }])}
            onValueChange={onTagFieldChange}
            placeholder="Add an activity tag"
          />
        </Grid>
        {appointmentData.activityTag == "New Tag" ? (
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
        <Resources data={resources} mainResourceName="activityTag" />

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
