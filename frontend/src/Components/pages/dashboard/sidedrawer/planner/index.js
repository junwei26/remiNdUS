import React, { useEffect, useCallback, useReducer } from "react";
import Paper from "@material-ui/core/Paper";
import LinearProgress from "@material-ui/core/LinearProgress";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import { ViewState, EditingState, IntegratedEditing } from "@devexpress/dx-react-scheduler";
import { purple, red } from "@material-ui/core/colors";
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

const getData = (setData, setLoading) => {
  setLoading(true);
  return activityService.getAllActivities().then((response) => {
    if (response.data) {
      setData(response.data);
      setLoading(false);
    } else {
      alert("No data!");
    }
  });
};
let resources = [
  {
    fieldName: "eventType",
    title: "",
    instances: [
      { id: 1, text: "activity", color: purple },
      { id: 2, text: "reminder", color: red },
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
  return {
    id: appointment.activityId,
    startDate: parseTime(appointment.startDateTime),
    endDate: parseTime(appointment.endDateTime),
    title: appointment.name,
    description: appointment.description,
    eventType: 1,
  };
};

const TextEditor = (props) => {
  if (props.type === "multilineTextEditor") {
    return null;
  }
  return <AppointmentForm.TextEditor {...props} />;
};

const BooleanEditor = (props) => {
  if (props.label === "") {
    return null;
  }
  return <AppointmentForm.BooleanEditor {...props} />;
};

const LabelEditor = (props) => {
  if (props.text == "eventType") {
    return null;
  }
  return <AppointmentForm.Label {...props} />;
};

const ResourceEditor = () => {
  return null;
};

const BasicLayout = ({ onFieldChange, appointmentData, ...restProps }) => {
  const onDescriptionFieldChange = (nextValue) => {
    onFieldChange({ description: nextValue });
  };
  return (
    <Paper>
      <AppointmentForm.Label
        text={appointmentData.eventType == 1 ? "Activity" : "Reminder"}
        type="title"
      />
      <AppointmentForm.BasicLayout
        appointmentData={appointmentData}
        onFieldChange={onFieldChange}
        {...restProps}
      >
        <AppointmentForm.Label text="Description" type="title" />
        <AppointmentForm.TextEditor
          value={appointmentData.description}
          onValueChange={onDescriptionFieldChange}
          placeholder="Add a description"
        />
      </AppointmentForm.BasicLayout>
    </Paper>
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

const messages = {
  moreInformationLabel: "",
  allDayLabel: "",
  repeatLabel: "",
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
      data.map((activity) => {
        if (changed[activity.id]) {
          const updatedActivity = { ...activity, ...changed[activity.id] };
          activityService
            .updateActivity(
              updatedActivity.startDate,
              updatedActivity.endDate,
              updatedActivity.title,
              updatedActivity.description,
              activity.id
            )
            .then(() => {
              getData(setData, setLoading);
              alert("Activity updated!");
            })
            .catch((e) => {
              alert(e.response.data.message);
            });
        }
      });
    }
    if (deleted !== null) {
      activityService.deleteActivity(deleted).then(() => {
        getData(setData, setLoading);
        alert("Successfully deleted.");
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
        <WeekView startDayHour={7.5} endDayHour={17.5} />
        <MonthView startDayHour={7.5} endDayHour={17.5} />
        <Appointments />
        <Resources data={resources} mainResourceName="eventType" />

        <AppointmentTooltip showOpenButton showCloseButton showDeleteButton />
        <AppointmentForm
          basicLayoutComponent={BasicLayout}
          textEditorComponent={TextEditor}
          booleanEditorComponent={BooleanEditor}
          resourceEditorComponent={ResourceEditor}
          labelComponent={LabelEditor}
          messages={messages}
        />
        <DragDropProvider />
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

TextEditor.propTypes = {
  type: PropTypes.string,
};

BooleanEditor.propTypes = {
  label: PropTypes.string,
};

LabelEditor.propTypes = {
  text: PropTypes.string,
};

export default Planner;
