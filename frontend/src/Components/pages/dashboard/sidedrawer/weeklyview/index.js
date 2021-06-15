import React, { useEffect, useCallback, useReducer } from "react";
import Paper from "@material-ui/core/Paper";
import LinearProgress from "@material-ui/core/LinearProgress";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import { ViewState, EditingState } from "@devexpress/dx-react-scheduler";
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
  EditRecurrenceMenu,
} from "@devexpress/dx-react-scheduler-material-ui";
import axios from "axios";
import { firebaseAuth } from "../../../../../firebase";

const getData = (setData, setLoading) => {
  const dataUrl =
    "https://asia-southeast2-remindus-76402.cloudfunctions.net/backendAPI/api/activity/";

  setLoading(true);

  return axios.get(dataUrl, { params: { uid: firebaseAuth.currentUser.uid } }).then((response) => {
    if (response.data) {
      setData(response.data);
      setLoading(false);
    } else {
      alert("No data!");
    }
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
const convertLocaleDateString = (dateStr) => {
  const padZero = (num) => (num < 10 ? "0" + num.toString() : num.toString());

  const date = new Date(dateStr);
  const year = date.getFullYear().toString();
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  const hour = padZero(date.getHours());
  const min = padZero(date.getMinutes());
  return year + month + day + hour + min;
};

const mapAppointmentData = (appointment) => {
  return {
    id: appointment.activityId,
    startDate: parseTime(appointment.startDateTime),
    endDate: parseTime(appointment.endDateTime),
    title: appointment.name,
    description: appointment.description,
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

const BasicLayout = ({ onFieldChange, appointmentData, ...restProps }) => {
  const onDescriptionFieldChange = (nextValue) => {
    onFieldChange({ description: nextValue });
  };

  return (
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
  detailsLabel: "Activity",
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

const WeeklyView = () => {
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
      axios
        .post(
          "https://asia-southeast2-remindus-76402.cloudfunctions.net/backendAPI/api/activity/create",
          {
            uid: firebaseAuth.currentUser.uid,
            startDateTime: convertLocaleDateString(added.startDate),
            endDateTime: convertLocaleDateString(added.endDate),
            name: added.title,
            description: added.description,
          }
        )
        .then(() => alert("Activity added!"))
        .catch((e) => {
          alert(e.response.data.message);
        });
    }
    if (changed) {
      data.map((activity) => {
        if (changed[activity.id]) {
          const updatedActivity = { ...activity, ...changed[activity.id] };

          axios
            .post(
              "https://asia-southeast2-remindus-76402.cloudfunctions.net/backendAPI/api/activity/update",
              {
                uid: firebaseAuth.currentUser.uid,
                startDateTime: convertLocaleDateString(updatedActivity.startDate),
                endDateTime: convertLocaleDateString(updatedActivity.endDate),
                name: updatedActivity.title,
                description: updatedActivity.description,
                activityId: activity.id,
              }
            )
            .then(() => alert("Activity updated!"))
            .catch((e) => {
              alert(e.response.data.message);
            });
        }
      });
    }
    if (deleted !== null) {
      axios
        .delete(
          "https://asia-southeast2-remindus-76402.cloudfunctions.net/backendAPI/api/activity/",
          { params: { uid: firebaseAuth.currentUser.uid, activityId: deleted } }
        )
        .then(() => {
          alert("Successfully deleted.");
        });
    }
  };
  return (
    <Paper>
      <Scheduler data={data} height={660}>
        <ViewState
          currentDate={currentDate}
          currentViewName={currentViewName}
          onCurrentViewNameChange={setCurrentViewName}
          onCurrentDateChange={setCurrentDate}
        />
        <WeekView startDayHour={7.5} endDayHour={17.5} />
        <MonthView startDayHour={7.5} endDayHour={17.5} />
        <Appointments />
        <Toolbar {...(loading ? { rootComponent: ToolbarWithLoading } : null)} />
        <EditingState onCommitChanges={handleChange} />
        <EditRecurrenceMenu />
        <DateNavigator />
        <TodayButton />
        <ViewSwitcher />
        <DragDropProvider allowDrag={() => true} allowResize={() => true} />
        <AppointmentTooltip showOpenButton showCloseButton showDeleteButton />
        <AppointmentForm
          basicLayoutComponent={BasicLayout}
          textEditorComponent={TextEditor}
          booleanEditorComponent={BooleanEditor}
          messages={messages}
        />
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
export default WeeklyView;
