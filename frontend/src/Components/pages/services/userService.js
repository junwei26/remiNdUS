import axios from "axios";
import { firebaseAuth } from "../../../firebase";

const { REACT_APP_BACKEND_URL } = process.env;

const USER_API_URL = REACT_APP_BACKEND_URL + "/user";

const getUserInfo = () => {
  return axios.get(USER_API_URL, { params: { uid: firebaseAuth.currentUser.uid } });
};

const addTag = (activityTag) => {
  return axios.post(USER_API_URL + "/addTag", { uid: firebaseAuth.currentUser.uid, activityTag });
};

export default { getUserInfo, addTag };
