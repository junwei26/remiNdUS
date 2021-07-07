import axios from "axios";
import { firebaseAuth } from "../../../firebase";

const { REACT_APP_BACKEND_URL } = process.env;

const ACTIVITY_API_URL = REACT_APP_BACKEND_URL + "/activity";

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

const getAllActivities = () => {
  return axios.get(ACTIVITY_API_URL + "/", { params: { uid: firebaseAuth.currentUser.uid } });
};

const getTemplateActivities = () => {
  return axios.get(ACTIVITY_API_URL + "/template", {
    params: { uid: firebaseAuth.currentUser.uid },
  });
};

const updateActivity = (startDateTime, endDateTime, name, description, activityId) => {
  return axios.post(ACTIVITY_API_URL + "/update", {
    uid: firebaseAuth.currentUser.uid,
    startDateTime: convertLocaleDateString(startDateTime),
    endDateTime: convertLocaleDateString(endDateTime),
    name,
    description,
    activityId,
  });
};

const deleteActivity = (activityId) => {
  return axios.delete(ACTIVITY_API_URL + "/", {
    params: { uid: firebaseAuth.currentUser.uid, activityId },
  });
};

const addPlannedActivity = (
  startDateTime,
  endDateTime,
  active,
  defaultLength,
  name = null,
  description = null,
  templateActivityId = null
) => {
  return axios.post(ACTIVITY_API_URL + "/create", {
    uid: firebaseAuth.currentUser.uid,
    name,
    description,
    startDateTime: convertLocaleDateString(startDateTime),
    endDateTime: convertLocaleDateString(endDateTime),
    active,
    defaultLength,
    templateActivityId,
  });
};

const addRecurringActivity = (
  frequency,
  startTime,
  endTime,
  date,
  active,
  defaultLength,
  name = null,
  description = null,
  templateActivityId = null
) => {
  return axios.post(ACTIVITY_API_URL + "/create", {
    uid: firebaseAuth.currentUser.uid,
    name,
    description,
    frequency,
    startTime,
    endTime,
    date,
    active,
    defaultLength,
    templateActivityId,
  });
};

const getRangeActivity = (currentDateTime, endDateTime) => {
  return axios.get(ACTIVITY_API_URL + "/getRange", {
    params: {
      uid: firebaseAuth.currentUser.uid,
      currentDateTime: convertLocaleDateString(currentDateTime),
      endDateTime: convertLocaleDateString(endDateTime),
    },
  });
};

export default {
  getAllActivities,
  getTemplateActivities,
  updateActivity,
  deleteActivity,
  addPlannedActivity,
  addRecurringActivity,
  getRangeActivity,
};
