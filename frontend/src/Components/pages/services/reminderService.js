import axios from "axios";
import { firebaseAuth } from "../../../firebase";

const { REACT_APP_BACKEND_URL } = process.env;

const REMINDER_API_URL = REACT_APP_BACKEND_URL + "/reminder";

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

const getAllReminders = () => {
  return axios.get(REMINDER_API_URL + "/", { params: { uid: firebaseAuth.currentUser.uid } });
};

const getAllLocalReminders = () => {
  return axios.get(REMINDER_API_URL + "/local", { params: { uid: firebaseAuth.currentUser.uid } });
};

const getReminders = (reminderIds, uid = firebaseAuth.currentUser.uid) => {
  return axios.get(REMINDER_API_URL + "/get", { params: { uid, reminderIds } });
};

const updateReminder = (dateTime, name, description, reminderId) => {
  return axios.post(REMINDER_API_URL + "/update", {
    uid: firebaseAuth.currentUser.uid,
    dateTime: convertLocaleDateString(dateTime),
    name,
    description,
    reminderId,
  });
};

const getRangeReminder = (currentDateTime, endDateTime) => {
  return axios.get(REMINDER_API_URL + "/getRange", {
    params: {
      uid: firebaseAuth.currentUser.uid,
      currentDateTime: convertLocaleDateString(currentDateTime),
      endDateTime: convertLocaleDateString(endDateTime),
    },
  });
};

const deleteReminder = (reminderId, reminderCollection) => {
  return axios.delete(REMINDER_API_URL + "/", {
    data: {
      uid: firebaseAuth.currentUser.uid,
      reminderId,
      reminderCollection,
    },
  });
};

const addReminder = (dateTime, name, description) => {
  return axios.post(REMINDER_API_URL + "/create", {
    uid: firebaseAuth.currentUser.uid,
    dateTime: convertLocaleDateString(dateTime),
    name,
    description,
  });
};

const getTemplateReminders = () => {
  return axios.get(REMINDER_API_URL + "/template", {
    params: { uid: firebaseAuth.currentUser.uid },
  });
};

const addPlannedReminder = (
  endDateTime,
  name = null,
  description = null,
  templateReminderId = null
) => {
  return axios.post(REMINDER_API_URL + "/create", {
    uid: firebaseAuth.currentUser.uid,
    endDateTime,
    name,
    description,
    templateReminderId,
  });
};

const addRecurringReminder = (
  frequency,
  endTime,
  date,
  name = null,
  description = null,
  templateReminderId = null
) => {
  return axios.post(REMINDER_API_URL + "/create", {
    uid: firebaseAuth.currentUser.uid,
    frequency,
    endTime,
    date,
    name,
    description,
    templateReminderId,
  });
};

const updatePlannedReminder = (endDateTime, name, description, templateReminderId, reminderId) => {
  return axios.post(REMINDER_API_URL + "/update", {
    uid: firebaseAuth.currentUser.uid,
    endDateTime,
    name,
    description,
    templateReminderId,
    reminderId,
    updateTemplate: true,
    reminderCollection: "plannedReminders",
  });
};

const updateRecurringReminder = (
  frequency,
  endTime,
  date,
  name,
  description,
  templateReminderId,
  reminderId
) => {
  return axios.post(REMINDER_API_URL + "/update", {
    uid: firebaseAuth.currentUser.uid,
    frequency,
    endTime,
    date,
    name,
    description,
    templateReminderId,
    reminderId,
    updateTemplate: true,
    reminderCollection: "recurringReminders",
  });
};

export default {
  getAllReminders,
  getAllLocalReminders,
  getReminders,
  updateReminder,
  deleteReminder,
  addReminder,
  getRangeReminder,
  getTemplateReminders,
  addPlannedReminder,
  addRecurringReminder,
  updatePlannedReminder,
  updateRecurringReminder,
};
