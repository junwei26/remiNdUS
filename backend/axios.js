import axios from "axios";
export default axios.create(
    {
        baseURL: "https://remindus-76402-default-rtdb.asia-southeast1.firebasedatabase.app/"
    }
)