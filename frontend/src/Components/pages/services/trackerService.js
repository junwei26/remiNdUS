import axios from "axios";
import { firebaseAuth } from "../../../firebase";

const { REACT_APP_BACKEND_URL } = process.env;

const TRACKER_API_URL = REACT_APP_BACKEND_URL + "/tracker";

const getTrackingData = () => {
  return axios.get(TRACKER_API_URL, { params: { uid: firebaseAuth.currentUser.uid } });
};

const addTrackedActivity = (trackedActivity) => {
  return axios.post(TRACKER_API_URL + "/create", {
    uid: firebaseAuth.currentUser.uid,
    ...trackedActivity,
  });
};

export default { getTrackingData, addTrackedActivity };
