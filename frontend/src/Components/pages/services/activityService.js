import axios from "axios";
import { firebaseAuth } from "../../../firebase";

const { REACT_APP_BACKEND_URL } = process.env;

const ACTIVITY_API_URL = REACT_APP_BACKEND_URL + "/activity";

const getAllActivities = () => {
  return axios.get(ACTIVITY_API_URL + "/", { params: { uid: firebaseAuth.currentUser.uid } });
};

const getTemplateActivities = () => {
  return axios.get(ACTIVITY_API_URL + "/template", {
    params: { uid: firebaseAuth.currentUser.uid },
  });
};

const updatePlannedActivity = (
  startDateTime,
  endDateTime,
  activityTag,
  name,
  description,
  templateActivityId,
  activityId
) => {
  return axios.post(ACTIVITY_API_URL + "/update", {
    uid: firebaseAuth.currentUser.uid,
    name,
    description,
    startDateTime,
    endDateTime,
    templateActivityId,
    activityTag,
    activityId,
    updateTemplate: true,
    activityCollection: "plannedActivities",
  });
};

const updateRecurringActivity = (
  frequency,
  startTime,
  endTime,
  date,
  activityTag,
  name,
  description,
  templateActivityId,
  activityId
) => {
  return axios.post(ACTIVITY_API_URL + "/update", {
    uid: firebaseAuth.currentUser.uid,
    name,
    description,
    frequency,
    startTime,
    endTime,
    date,
    templateActivityId,
    activityTag,
    activityId,
    updateTemplate: true,
    activityCollection: "recurringActivities",
  });
};

const deleteActivity = (activityId, activityCollection) => {
  return axios.delete(ACTIVITY_API_URL + "/", {
    data: {
      uid: firebaseAuth.currentUser.uid,
      activityId,
      activityCollection,
    },
  });
};

const addPlannedActivity = (
  startDateTime,
  endDateTime,
  activityTag,
  name = null,
  description = null,
  templateActivityId = null
) => {
  return axios.post(ACTIVITY_API_URL + "/create", {
    uid: firebaseAuth.currentUser.uid,
    name,
    description,
    startDateTime,
    endDateTime,
    templateActivityId,
    activityTag,
  });
};

const addRecurringActivity = (
  frequency,
  startTime,
  endTime,
  date,
  activityTag,
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
    templateActivityId,
    activityTag,
  });
};

const getRangeActivity = (currentDateTime, endDateTime) => {
  return axios.get(ACTIVITY_API_URL + "/getRange", {
    params: {
      uid: firebaseAuth.currentUser.uid,
      currentDateTime,
      endDateTime,
    },
  });
};

export default {
  getAllActivities,
  getTemplateActivities,
  deleteActivity,
  addPlannedActivity,
  addRecurringActivity,
  updatePlannedActivity,
  updateRecurringActivity,
  getRangeActivity,
};
