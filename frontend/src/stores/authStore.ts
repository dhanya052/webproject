// src/stores/authStore.ts
import { makeAutoObservable } from "mobx";
import { loginUser } from "../api/authapi";


class AuthStore {
  token: string | null = localStorage.getItem("token");
  isAuthenticated = !!this.token;

  constructor() {
    makeAutoObservable(this);
  }

  async login(email: string, password: string) {
    try {
      const data = await loginUser(email, password);
      this.token = data.token;
      this.isAuthenticated = true;
      localStorage.setItem("token", data.token);
    } catch (error: any) {
      throw error.response?.data?.error || "Login failed";
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    localStorage.removeItem("token");
  }
}

const authStore = new AuthStore();
export default authStore;
