// src/api/userApi.ts
import axios from "axios";

const API_URL = "http://127.0.0.1:5000/users";

// Fetch all users
export const fetchUsers = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Fetch single user by ID
export const fetchUserById = async (userId: string) => {
  const response = await axios.get(`${API_URL}/${userId}`);
  return response.data;
};

// Register a user
export const registerUser = async (userData: { name: string; email: string; password: string; role: string }) => {
  const response = await axios.post(API_URL, userData);
  return response.data;
};
