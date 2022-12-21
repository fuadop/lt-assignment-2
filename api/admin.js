import axios from "axios";
const Axios = axios.create({
  baseURL: "https://6bs2tmi7fh.execute-api.us-west-1.amazonaws.com/",
  validateStatus: undefined,
})

Axios.interceptors.request.use((req) => {
  req.headers.authorization = sessionStorage?.getItem("password-token");
  return req;
});

export default class Admin {
  static async adminSetTime(time = "") {
    return await Axios.post("/adminSetTime", { time });
  }

  static async adminGetSubmissions() {
    return await Axios.get("/adminGetSubmissions");
  }
}