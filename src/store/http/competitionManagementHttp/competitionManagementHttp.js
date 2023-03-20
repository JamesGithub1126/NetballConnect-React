import axios from 'axios';

const competitionManagementHttp = axios.create({
  baseURL: process.env.REACT_APP_URL_API_COMPETITION,
});
competitionManagementHttp.defaults.timeout = 180000;

competitionManagementHttp.interceptors.request.use(function (config) {
  const token = localStorage.token;
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

export default competitionManagementHttp;
