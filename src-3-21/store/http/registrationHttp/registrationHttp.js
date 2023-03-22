import axios from 'axios';

const http = axios.create({
  baseURL: process.env.REACT_APP_URL_API_REGISTRATIONS,
});

http.interceptors.request.use(function (config) {
  const token = localStorage.token;
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

export default http;
