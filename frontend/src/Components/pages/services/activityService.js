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
const updateActivity = (startDateTime, endDateTime, name, description, activityId, tag) => {
  return axios.post(ACTIVITY_API_URL + "/update", {
    uid: firebaseAuth.currentUser.uid,
    startDateTime: convertLocaleDateString(startDateTime),
    endDateTime: convertLocaleDateString(endDateTime),
    name,
    description,
    activityId,
    tag,
  });
};

const deleteActivity = (activityId) => {
  return axios.delete(ACTIVITY_API_URL + "/", {
    params: { uid: firebaseAuth.currentUser.uid, activityId },
  });
};

const addActivity = (startDateTime, endDateTime, name, description, tag) => {
  return axios.post(ACTIVITY_API_URL + "/create", {
    uid: firebaseAuth.currentUser.uid,
    startDateTime: convertLocaleDateString(startDateTime),
    endDateTime: convertLocaleDateString(endDateTime),
    name,
    description,
    tag,
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

export default { getAllActivities, updateActivity, deleteActivity, addActivity, getRangeActivity };
