import axios from "axios";

export default async function post(url, data) {
  return axios.post(url, data);
}