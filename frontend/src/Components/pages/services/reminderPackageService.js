import axios from "axios";
import { firebaseAuth } from "../../../firebase";

const { REACT_APP_BACKEND_URL } = process.env;

const REMINDERPACKAGES_API_URL = REACT_APP_BACKEND_URL + "/reminderpackages";

const getReminderPackages = () => {
  return axios.get(REMINDERPACKAGES_API_URL + "/", {
    params: { uid: firebaseAuth.currentUser.uid },
  });
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

const deleteReminderPackage = (reminderPackageIds) => {
  return axios.delete(REMINDERPACKAGES_API_URL + "/delete", {
    uid: firebaseAuth.currentUser.uid,
    reminderPackageIds: reminderPackageIds,
  });
};

export default { getReminderPackages, addReminderPackage, deleteReminderPackage };
