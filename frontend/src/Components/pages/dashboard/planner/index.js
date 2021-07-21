import React, { useState, useEffect, useCallback, useReducer } from "react";
import Paper from "@material-ui/core/Paper";
import { Grid, Typography, Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import LinearProgress from "@material-ui/core/LinearProgress";
import { withStyles, makeStyles } from "@material-ui/core/styles";
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
import PropTypes from "prop-types";
import activityService from "../../services/activityService";
import reminderService from "../../services/reminderService";
import localService from "../../services/localService";
import userService from "../../services/userService";

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

const useStyles = makeStyles(() => ({
  root: { height: "auto", width: "auto" },
}));

const Planner = (props) => {
  const classes = useStyles();

  const [currentDateObj, setCurrentDateObj] = useState(new Date());
  const generateDate = (dateObj) => {
    const padZero = (num) => (num < 10 ? "0" + num.toString() : num.toString());
    const year = dateObj.getFullYear().toString();
    const month = padZero(dateObj.getMonth() + 1);
    const day = padZero(dateObj.getDate());
    return year + month + day;
  };

  const [templateActivities, setTemplateActivities] = useState([]);
  const [templateActivitiesOptions, setTemplateActivitiesOptions] = useState([]);
  const [templateReminders, setTemplateReminders] = useState([]);
  const [templateRemindersOptions, setTemplateRemindersOptions] = useState([]);
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
        startDate: localService.parseTimeToString(
          generateDate(new Date(startMs)) + recurringActivity.startTime
        ),
        endDate: localService.parseTimeToString(
          generateDate(new Date(startMs)) + recurringActivity.endTime
        ),
        title: recurringActivity.name,
        description: recurringActivity.description,
        eventType: recurringActivity.eventType,
        tag: recurringActivity.activityTag,
        frequency: recurringActivity.frequency,
        date: recurringActivity.date,
        type: recurringActivity.activityType,
        templateId: recurringActivity.templateActivityId,
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
        startDate: localService.parseTimeToString(
          generateDate(new Date(startMs)) + recurringReminder.endTime
        ),
        title: recurringReminder.name,
        description: recurringReminder.description,
        eventType: recurringReminder.eventType,
        tag: "Reminder",
        frequency: recurringReminder.frequency,
        date: recurringReminder.date,
        type: recurringReminder.reminderType,
        templateId: recurringReminder.templateReminderId,
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
    if (appointment.frequency) {
      if (appointment.eventType === "1") return recurringActivitiesGenerator(appointment);
      else return recurringRemindersGenerator(appointment);
    }

    if (appointment.eventType === "1") {
      return {
        id: appointment.activityId,
        startDate: localService.parseTimeToString(appointment.startDateTime),
        endDate: localService.parseTimeToString(appointment.endDateTime),
        title: appointment.name,
        description: appointment.description,
        eventType: appointment.eventType,
        tag: appointment.activityTag,
        templateId: appointment.templateActivityId,
        type: appointment.activityType,
        frequency: null,
        date: null,
      };
    } else {
      return {
        id: appointment.reminderId,
        startDate: localService.parseTimeToString(appointment.endDateTime),
        title: appointment.name,
        description: appointment.description,
        eventType: appointment.eventType,
        tag: "Reminder",
        templateId: appointment.templateReminderId,
        type: appointment.reminderType,
        frequency: null,
        date: null,
      };
    }
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

  const initialState = {
    data: [],
    loading: false,
    currentDate: currentDateObj,
    currentViewName: "Week",
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  const { data, loading, currentViewName, currentDate } = state;

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

  useEffect(() => {
    activityService.getTemplateActivities().then((response) => {
      const instances = response.data
        .map((activityTemplate) => {
          return {
            id: activityTemplate.templateActivityId,
            text: activityTemplate.name,
            fieldName: "templateId",
          };
        })
        .concat({ id: 0, text: "Create new activity", fieldName: "templateId" });
      setTemplateActivities(response.data);
      setTemplateActivitiesOptions(instances);
    });
  }, [data]);

  useEffect(() => {
    reminderService.getTemplateReminders().then((response) => {
      const instances = response.data
        .map((reminderTemplate) => {
          return {
            id: reminderTemplate.templateReminderId,
            text: reminderTemplate.name,
            fieldName: "templateId",
          };
        })
        .concat({ id: 0, text: "Create new reminder", fieldName: "templateId" });
      setTemplateReminders(response.data);
      setTemplateRemindersOptions(instances);
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
  }, [setData, currentViewName, currentDate, props.plannerDataUpdate]);

  const handleChange = ({ added, changed, deleted }) => {
    if (added) {
      let tagFunction = Promise.resolve(null);
      let tag = added.tag;

      if (added.title === "") {
        alert("Please input a name");
        return;
      } else if (added.description === "") {
        alert("Please input a description");
        return;
      } else if (new Date(added.endDate).getTime() <= new Date(added.startDate).getTime()) {
        alert("End datetime cannot be earlier than start datetime");
        return;
      }

      if (added.tag === "New Tag") {
        if (added.newTag === undefined) {
          setCurrentAlert({
            severity: "error",
            message: "New activity tag cannot be empty!",
          });
          setSnackbarOpen(true);
          return;
        }

        tagFunction = userService.addTag(added.newTag);
        tag = added.newTag;
      }

      tagFunction
        .then(() => {
          if (added.type === "planned") {
            activityService
              .addPlannedActivity(
                localService.convertDateToString(new Date(added.startDate)),
                localService.convertDateToString(new Date(added.endDate)),
                tag,
                added.title,
                added.description,
                added.templateId
              )
              .then(() => {
                getData(setData, setLoading);
                setCurrentAlert({ severity: "success", message: "Activity added!" });
                setSnackbarOpen(true);
              })
              .catch((error) => {
                if (error.response) {
                  setCurrentAlert({
                    severity: "error",
                    message: `Error creating planned activity! Error status code: ${error.response.status}. ${error.response.data.message}`,
                  });
                } else {
                  setCurrentAlert({
                    severity: "error",
                    message: `Error creating planned activity. ${error}`,
                  });
                }
                setSnackbarOpen(true);
              });
          } else {
            activityService
              .addRecurringActivity(
                added.frequency,
                localService.convertDateToString(new Date(added.startDate)),
                localService.convertDateToString(new Date(added.endDate)),
                added.date,
                tag,
                added.title,
                added.description,
                added.templateId
              )
              .then(() => {
                getData(setData, setLoading);
                setCurrentAlert({ severity: "success", message: "Activity added!" });
                setSnackbarOpen(true);
              })
              .catch((error) => {
                if (error.response) {
                  setCurrentAlert({
                    severity: "error",
                    message: `Error creating recurring activity! Error status code: ${error.response.status}. ${error.response.data.message}`,
                  });
                } else {
                  setCurrentAlert({
                    severity: "error",
                    message: `Error creating recurring activity. ${error}`,
                  });
                }
                setSnackbarOpen(true);
              });
          }
        })
        .catch((error) => {
          if (error.response) {
            setCurrentAlert({
              severity: "error",
              message: `Error creating new activity tag! Error status code: ${error.response.status}. ${error.response.data.message}`,
            });
          } else {
            setCurrentAlert({
              severity: "error",
              message: `Error creating new activity tag. ${error}`,
            });
          }
          setSnackbarOpen(true);
        });
    }
    if (changed) {
      data.map((event) => {
        if (changed[event.id]) {
          const updatedEvent = { ...event, ...changed[event.id] };
          if (event.eventType == "1") {
            if (updatedEvent.title === "") {
              alert("Please input a name");
              return;
            } else if (updatedEvent.description === "") {
              alert("Please input a description");
              return;
            } else if (
              new Date(updatedEvent.endDate).getTime() <= new Date(updatedEvent.startDate).getTime()
            ) {
              alert("End datetime cannot be earlier than start datetime");
              return;
            }
            let tagFunction = Promise.resolve(null);
            let tag = updatedEvent.tag;

            if (updatedEvent.tag === "New Tag") {
              if (updatedEvent.newTag === undefined) {
                setCurrentAlert({
                  severity: "error",
                  message: "New activity tag cannot be empty!",
                });
                setSnackbarOpen(true);
                return;
              }

              tagFunction = userService.addTag(updatedEvent.newTag);
              tag = updatedEvent.newTag;
            }

            tagFunction
              .then(() => {
                if (updatedEvent.type === "planned") {
                  activityService
                    .updatePlannedActivity(
                      localService.convertDateToString(new Date(updatedEvent.startDate)),
                      localService.convertDateToString(new Date(updatedEvent.endDate)),
                      tag,
                      updatedEvent.title,
                      updatedEvent.description,
                      updatedEvent.templateId,
                      event.id
                    )
                    .then(() => {
                      getData(setData, setLoading);
                      setCurrentAlert({ severity: "success", message: "Activity updated!" });
                      setSnackbarOpen(true);
                    })
                    .catch((error) => {
                      if (error.response) {
                        setCurrentAlert({
                          severity: "error",
                          message: `Error updating planned activity! Error status code: ${error.response.status}. ${error.response.data.message}`,
                        });
                      } else {
                        setCurrentAlert({
                          severity: "error",
                          message: `Error updating planned activity. ${error}`,
                        });
                      }
                      setSnackbarOpen(true);
                    });
                } else {
                  activityService
                    .updateRecurringActivity(
                      updatedEvent.frequency,
                      `${updatedEvent.startDate
                        .getHours()
                        .toString()
                        .padStart(2, "0")}${updatedEvent.startDate
                        .getMinutes()
                        .toString()
                        .padStart(2, "0")}`,
                      `${updatedEvent.endDate
                        .getHours()
                        .toString()
                        .padStart(2, "0")}${updatedEvent.endDate
                        .getMinutes()
                        .toString()
                        .padStart(2, "0")}`,
                      updatedEvent.date,
                      tag,
                      updatedEvent.title,
                      updatedEvent.description,
                      updatedEvent.templateId,
                      event.id
                    )
                    .then(() => {
                      getData(setData, setLoading);
                      setCurrentAlert({ severity: "success", message: "Activity updated!" });
                      setSnackbarOpen(true);
                      if (
                        new Date(event.startDate).getFullYear() !=
                          updatedEvent.startDate.getFullYear() ||
                        new Date(event.startDate).getMonth() != updatedEvent.startDate.getMonth() ||
                        new Date(event.startDate).getDay() != updatedEvent.startDate.getDay()
                      ) {
                        setCurrentAlert({
                          severity: "info",
                          message: `Activity updated!. However note: For recurring activities, frequency/date has to be changed in the edit form instead.`,
                        });
                        setSnackbarOpen(true);
                      } else {
                        setCurrentAlert({ severity: "success", message: "Activity updated!" });
                        setSnackbarOpen(true);
                      }
                    })
                    .catch((error) => {
                      if (error.response) {
                        setCurrentAlert({
                          severity: "error",
                          message: `Error updating recurring activity. Error status code: ${error.response.status}. ${error.response.data.message}`,
                        });
                      } else {
                        setCurrentAlert({
                          severity: "error",
                          message: `Error updating recurring activity. ${error}`,
                        });
                      }
                      setSnackbarOpen(true);
                    });
                }
              })
              .catch((error) => {
                if (error.response) {
                  setCurrentAlert({
                    severity: "error",
                    message: `Error updating activity tag! Error status code: ${error.response.status}. ${error.response.data.message}`,
                  });
                } else {
                  setCurrentAlert({
                    severity: "error",
                    message: `Error updating activity tag. ${error}`,
                  });
                }
                setSnackbarOpen(true);
              });
          } else {
            if (updatedEvent.type === "planned") {
              reminderService
                .updatePlannedReminder(
                  `${updatedEvent.startDate
                    .getHours()
                    .toString()
                    .padStart(2, "0")}${updatedEvent.startDate
                    .getMinutes()
                    .toString()
                    .padStart(2, "0")}`,
                  updatedEvent.title,
                  updatedEvent.description,
                  updatedEvent.templateId,
                  event.id
                )
                .then(() => {
                  getData(setData, setLoading);
                  setCurrentAlert({ severity: "success", message: "Reminder updated!" });
                  setSnackbarOpen(true);
                })
                .catch((error) => {
                  if (error.response) {
                    setCurrentAlert({
                      severity: "error",
                      message: `Error updating planned reminder! Error status code: ${error.response.status}. ${error.response.data.message}`,
                    });
                  } else {
                    setCurrentAlert({
                      severity: "error",
                      message: `Error updating planned reminder. ${error}`,
                    });
                  }
                  setSnackbarOpen(true);
                });
            } else {
              reminderService
                .updateRecurringReminder(
                  updatedEvent.frequency,
                  `${updatedEvent.startDate
                    .getHours()
                    .toString()
                    .padStart(2, "0")}${updatedEvent.startDate
                    .getMinutes()
                    .toString()
                    .padStart(2, "0")}`,
                  updatedEvent.date,
                  updatedEvent.title,
                  updatedEvent.description,
                  updatedEvent.templateId,
                  event.id
                )
                .then(() => {
                  getData(setData, setLoading);
                  if (
                    new Date(event.startDate).getFullYear() !=
                      updatedEvent.startDate.getFullYear() ||
                    new Date(event.startDate).getMonth() != updatedEvent.startDate.getMonth() ||
                    new Date(event.startDate).getDay() != updatedEvent.startDate.getDay()
                  ) {
                    setCurrentAlert({
                      severity: "info",
                      message: `Reminder updated!. However note: For recurring reminders, frequency/date has to be changed in the edit form instead.`,
                    });
                    setSnackbarOpen(true);
                  } else {
                    setCurrentAlert({ severity: "success", message: "Reminder updated!" });
                    setSnackbarOpen(true);
                  }
                })
                .catch((error) => {
                  if (error.response) {
                    setCurrentAlert({
                      severity: "error",
                      message: `Error updating recurring reminder! Error status code: ${error.response.status}. ${error.response.data.message}`,
                    });
                  } else {
                    setCurrentAlert({
                      severity: "error",
                      message: `Error updating recurring reminder. ${error}`,
                    });
                  }
                  setSnackbarOpen(true);
                });
            }
          }
        }
      });
    }
    if (deleted !== null) {
      data.map((event) => {
        if (deleted === event.id) {
          if (event.eventType == "1") {
            const activityCollection =
              event.type === "planned" ? "plannedActivities" : "recurringActivities";
            activityService.deleteActivity(deleted, activityCollection).then(() => {
              getData(setData, setLoading);
              setCurrentAlert({ severity: "success", message: "Activity deleted!" });
              setSnackbarOpen(true);
            });
          } else {
            const reminderCollection =
              event.type === "planned" ? "plannedReminders" : "recurringReminders";
            reminderService.deleteReminder(deleted, reminderCollection).then(() => {
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
    // Using type as a field that does not exist for when creating a new item as opposed to editing
    const isEditing = appointmentData.eventType !== undefined;
    // let originalAppointmentData = [];
    const [recurring, setRecurring] = useState(appointmentData.type === "recurring");
    const [activityTag, setActivityTag] = useState(appointmentData.tag);
    const [chosenTemplateActivity, setChosenTemplateActivity] = useState(
      appointmentData.templateId === 0 || appointmentData.templateId === undefined
        ? 0
        : appointmentData.templateId
    );

    const [chosenTemplateReminder, setChosenTemplateReminder] = useState(
      appointmentData.templateId === 0 || appointmentData.templateId === undefined
        ? 0
        : appointmentData.templateId
    );

    const onTemplateActivityFieldChange = (nextValue) => {
      onFieldChange({ templateId: nextValue });
      setChosenTemplateActivity(nextValue);
      if (nextValue !== 0) {
        const chosenTemplateActivity = templateActivities.filter((templateActivity) => {
          return templateActivity.templateActivityId === nextValue;
        })[0];
        onFieldChange({ title: chosenTemplateActivity.name });
        onFieldChange({ description: chosenTemplateActivity.description });
        onFieldChange({ tag: chosenTemplateActivity.activityTag });
        setActivityTag(chosenTemplateActivity.activityTag);
      } else {
        // onFieldChange({ title: originalAppointmentData.title });
        // onFieldChange({ description: originalAppointmentData.description });
        onFieldChange({ title: "" });
        onFieldChange({ description: "" });
        onFieldChange({ tag: "" });
        setActivityTag("");
      }
    };

    const onTemplateReminderFieldChange = (nextValue) => {
      onFieldChange({ templateId: nextValue });
      setChosenTemplateReminder(nextValue);
      if (nextValue !== 0) {
        const chosenTemplateReminder = templateReminders.filter((templateReminder) => {
          return templateReminder.templateActivityId === nextValue;
        })[0];
        onFieldChange({ title: chosenTemplateReminder.name });
        onFieldChange({ description: chosenTemplateReminder.description });
      } else {
        // onFieldChange({ title: originalAppointmentData.title });
        // onFieldChange({ description: originalAppointmentData.description });
        onFieldChange({ title: "" });
        onFieldChange({ description: "" });
      }
    };

    const onNameFieldChange = (nextValue) => {
      onFieldChange({ title: nextValue });
    };

    const onRecurringFieldChange = (nextValue) => {
      setRecurring(nextValue);
      const newValue = nextValue ? "recurring" : "planned";
      onFieldChange({ type: newValue });
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
      onFieldChange({ tag: nextValue });
      setActivityTag(nextValue);
    };

    const onFrequencyFieldChange = (nextValue) => {
      onFieldChange({ frequency: nextValue });
    };

    const onDateFieldChange = (nextValue) => {
      onFieldChange({ date: nextValue });
    };

    const onCreateTagFieldChange = (nextValue) => {
      onFieldChange({ newTag: nextValue });
    };

    useEffect(() => {
      const initialFrequency = !appointmentData.frequency ? "weekly" : appointmentData.frequency;
      const initialType = !appointmentData.type ? "planned" : appointmentData.type;
      const initialDate = !appointmentData.date ? 1 : appointmentData.date;
      const initialStartDate = !appointmentData.startDate
        ? null
        : new Date(appointmentData.startDate);
      const initialEndDate = !appointmentData.endDate ? null : new Date(appointmentData.endDate);
      onFieldChange({ startDate: initialStartDate });
      onFieldChange({ endDate: initialEndDate });
      onFieldChange({ frequency: initialFrequency });
      onFieldChange({ type: initialType });
      onFieldChange({ date: initialDate });
      setActivityTag(appointmentData.tag);
      //   originalAppointmentData = { ...appointmentData };
    }, []);

    const weeklyDateOptions = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ].map((day, index) => {
      return { id: index + 1, text: day, fieldName: "date" };
    });

    const monthlyDateOptions = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
      27, 28, 29, 30, 31,
    ].map((date) => {
      return { id: date, text: date, fieldName: "date" };
    });

    return appointmentData.eventType === "2" ? (
      <Grid container direction="column" alignItems="left" alignContent="center" spacing={2}>
        {isEditing ? (
          <></>
        ) : (
          <Grid item xs style={{ width: "90%" }}>
            <AppointmentForm.Label text="Select Reminder" type="title" />
            <AppointmentForm.Select
              value={appointmentData.templateId}
              availableOptions={templateRemindersOptions}
              onValueChange={onTemplateReminderFieldChange}
              placeholder="Create an reminder"
            />
          </Grid>
        )}
        <Grid item xs style={{ width: "90%" }}>
          <AppointmentForm.Label text="Reminder Name" type="title" />
          <AppointmentForm.TextEditor
            value={appointmentData.title}
            onValueChange={onNameFieldChange}
            placeholder="Add a name"
            readOnly={!isEditing && chosenTemplateReminder !== 0}
          />
        </Grid>
        <Grid item xs style={{ width: "90%" }}>
          <AppointmentForm.Label text="Description" type="title" />
          <AppointmentForm.TextEditor
            value={appointmentData.description}
            onValueChange={onDescriptionFieldChange}
            placeholder="Add a description"
            readOnly={!isEditing && chosenTemplateReminder !== 0}
          />
          {appointmentData.templateId !== 0 ? (
            <Typography variant="body2">
              Note: Editing the name and description changes that of all other associated reminders.
            </Typography>
          ) : (
            <></>
          )}
        </Grid>
        <Grid item xs style={{ width: "90%" }}>
          <AppointmentForm.Label text="Deadline" type="title" />
          <AppointmentForm.DateEditor
            value={appointmentData.startDate}
            onValueChange={onStartFieldChange}
          />
        </Grid>
        <Grid item xs style={{ width: "90%" }}>
          <AppointmentForm.BooleanEditor
            label="Recurring"
            value={recurring}
            onValueChange={onRecurringFieldChange}
            readOnly={isEditing}
          />
        </Grid>
        {appointmentData.type === "recurring" ? (
          <Grid container item direction="row" justifyContent="space-between" alignItems="center">
            <Grid item xs style={{ width: "90%" }}>
              <AppointmentForm.Label text="Frequency" type="title" />
              <AppointmentForm.Select
                value={appointmentData.frequency}
                availableOptions={[
                  { id: "weekly", text: "Weekly" },
                  { id: "monthly", text: "Monthly" },
                ]}
                onValueChange={onFrequencyFieldChange}
              />
            </Grid>
            <Grid item xs style={{ width: "90%" }}>
              <AppointmentForm.Label text="Date" type="title" />
              <AppointmentForm.Select
                value={appointmentData.date}
                availableOptions={
                  appointmentData.frequency === "weekly" ? weeklyDateOptions : monthlyDateOptions
                }
                onValueChange={onDateFieldChange}
              />
            </Grid>
          </Grid>
        ) : (
          <></>
        )}
      </Grid>
    ) : (
      <Grid container direction="column" alignItems="left" alignContent="center" spacing={2}>
        {isEditing ? (
          <></>
        ) : (
          <Grid item xs style={{ width: "90%" }}>
            <AppointmentForm.Label text="Select Activity" type="title" />
            <AppointmentForm.Select
              value={chosenTemplateActivity}
              availableOptions={templateActivitiesOptions}
              onValueChange={onTemplateActivityFieldChange}
            />
          </Grid>
        )}
        <Grid item xs style={{ width: "90%" }}>
          <AppointmentForm.Label text="Activity Name" type="title" />
          <AppointmentForm.TextEditor
            value={appointmentData.title}
            onValueChange={onNameFieldChange}
            placeholder="Add a name"
            readOnly={!isEditing && chosenTemplateActivity !== 0}
          />
        </Grid>
        <Grid item xs style={{ width: "90%" }}>
          <AppointmentForm.Label text="Description" type="title" />
          <AppointmentForm.TextEditor
            value={appointmentData.description}
            onValueChange={onDescriptionFieldChange}
            placeholder="Add a description"
            readOnly={!isEditing && chosenTemplateActivity !== 0}
          />
          {appointmentData.templateId !== 0 ? (
            <Typography variant="body2">
              Note: Editing the name and description changes that of all other associated
              activities.
            </Typography>
          ) : (
            <></>
          )}
        </Grid>
        <Grid item xs style={{ width: "90%" }}>
          <AppointmentForm.BooleanEditor
            label="Recurring"
            value={recurring}
            onValueChange={onRecurringFieldChange}
            readOnly={isEditing}
          />
        </Grid>
        <Grid item xs style={{ width: "90%" }}>
          <AppointmentForm.Label text="Duration" type="title" />
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
        {appointmentData.type === "recurring" ? (
          <Grid container item direction="row" justifyContent="space-between" alignItems="center">
            <Grid item xs style={{ width: "90%" }}>
              <AppointmentForm.Label text="Frequency" type="title" />
              <AppointmentForm.Select
                value={appointmentData.frequency}
                availableOptions={[
                  { id: "weekly", text: "Weekly" },
                  { id: "monthly", text: "Monthly" },
                ]}
                onValueChange={onFrequencyFieldChange}
              />
            </Grid>
            <Grid item xs style={{ width: "90%" }}>
              <AppointmentForm.Label text="Date" type="title" />
              <AppointmentForm.Select
                value={appointmentData.date}
                availableOptions={
                  appointmentData.frequency === "weekly" ? weeklyDateOptions : monthlyDateOptions
                }
                onValueChange={onDateFieldChange}
              />
            </Grid>
          </Grid>
        ) : (
          <></>
        )}
        <Grid item xs>
          <AppointmentForm.Label text="Tag" type="title" />
        </Grid>
        <Grid item xs style={{ width: "90%" }}>
          <AppointmentForm.Select
            value={activityTag}
            availableOptions={resources[0].instances
              .filter((resource) => resource.id != "Reminder")
              .concat([{ id: "New Tag", text: "Add a new activity tag" }])}
            onValueChange={onTagFieldChange}
            placeholder="Add an activity tag"
            readOnly={!isEditing && chosenTemplateActivity !== 0}
          />
        </Grid>
        {appointmentData.tag == "New Tag" ? (
          <Grid item xs style={{ width: "90%" }}>
            <AppointmentForm.Label text="Create a new Tag" type="title" />
            <AppointmentForm.TextEditor
              value={appointmentData.newTag}
              onValueChange={onCreateTagFieldChange}
              placeholder="Create a new Tag"
            />
          </Grid>
        ) : null}
      </Grid>
    );
  };

  BasicLayout.propTypes = {
    onFieldChange: PropTypes.any,
    appointmentData: PropTypes.any,
  };

  return (
    <Paper className={classes.root}>
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

Planner.propTypes = {
  plannerDataUpdate: PropTypes.bool,
  setPlannerDataUpdate: PropTypes.func,
};

export default Planner;
