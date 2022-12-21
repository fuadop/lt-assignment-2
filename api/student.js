import axios from "axios";
const Axios = axios.create({
  baseURL: "https://6bs2tmi7fh.execute-api.us-west-1.amazonaws.com",
  validateStatus: undefined
})

export default class Student {
  static async studentGetTime() {
    return await Axios.get("/studentGetTime");
  }

  static async studentSubmit(matric = "") {
    return await Axios.post("/studentSubmit", { matric });
  }
}