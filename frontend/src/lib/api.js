import axios from "axios";

// The API runs as a Netlify Function on the same domain unless REACT_APP_BACKEND_URL is set.
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
export const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

export default api;
