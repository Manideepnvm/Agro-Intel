import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const ML_SERVICE_URL = process.env.REACT_APP_ML_SERVICE_URL;

export const api = {
  // Auth endpoints
  login: (credentials) => axios.post(`${API_BASE_URL}/auth/login`, credentials),
  
  // Crop management endpoints
  getCrops: () => axios.get(`${API_BASE_URL}/crops`),
  addCrop: (cropData) => axios.post(`${API_BASE_URL}/crops`, cropData),
  
  // ML predictions endpoints
  predictCrop: (data) => axios.post(`${ML_SERVICE_URL}/predict/crop`, data),
  predictYield: (data) => axios.post(`${ML_SERVICE_URL}/predict/yield`, data),
}; 