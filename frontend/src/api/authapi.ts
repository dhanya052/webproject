// src/api/authApi.ts
import axios from "axios";

const API_URL = "http://127.0.0.1:5000/users";

// Login API
export const loginUser = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data;
};
