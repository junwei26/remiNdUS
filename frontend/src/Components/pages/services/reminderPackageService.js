import axios from "axios";
import { firebaseAuth } from "../../../firebase";

const { REACT_APP_BACKEND_URL } = process.env;

const REMINDERPACKAGES_API_URL = REACT_APP_BACKEND_URL + "/reminderpackages";

const getReminderPackages = () => {
  return axios.get(REMINDERPACKAGES_API_URL + "/", {
    params: { uid: firebaseAuth.currentUser.uid },
  });
};

const getPublicReminderPackages = () => {
  return axios.get(REMINDERPACKAGES_API_URL + "/getpublic");
};

const addReminderPackage = (packageName, description, packageTag, reminderIds) => {
  return axios.post(REMINDERPACKAGES_API_URL + "/create", {
    uid: firebaseAuth.currentUser.uid,
    name: packageName,
    description: description,
    packageTag: packageTag,
    reminderIds: reminderIds,
  });
};

const shareReminderPackages = (reminderPackageIds, share) => {
  return axios.post(REMINDERPACKAGES_API_URL + "/share", {
    uid: firebaseAuth.currentUser.uid,
    reminderPackageIds: reminderPackageIds,
    share: share,
  });
};

const subscribeReminderPackages = (userUids, reminderPackageIds) => {
  return axios.post(REMINDERPACKAGES_API_URL + "/subscribe", {
    uid: firebaseAuth.currentUser.uid,
    userUids: userUids,
    reminderPackageIds: reminderPackageIds,
  });
};

const deleteReminderPackages = (reminderPackageIds) => {
  return axios.delete(REMINDERPACKAGES_API_URL + "/delete", {
    data: {
      uid: firebaseAuth.currentUser.uid,
      reminderPackageIds: reminderPackageIds,
    },
  });
};

export default {
  getReminderPackages,
  getPublicReminderPackages,
  subscribeReminderPackages,
  addReminderPackage,
  shareReminderPackages,
  deleteReminderPackages,
};
