// store/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Roles } from "../enums/user.enum";
import Cookies from "js-cookie";
interface User {
  id: string;
  email: string;
  role: Roles;
}

interface AuthState {
  user: Partial<User> | User | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; userInfo: Partial<User> }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.userInfo;
      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.userInfo));
        Cookies.set("accessToken", action.payload.token);
        Cookies.set("user", JSON.stringify(action.payload.userInfo));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;

      Cookies.remove("accessToken");
      Cookies.remove("user");
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    },
    loadTokenFromStorage: (state) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");
        
        if (token) {
          state.token = token;
          Cookies.set("accessToken", token);
        }
        
        if (user) {
          try {
            const userData = JSON.parse(user);
            state.user = userData;
            Cookies.set("user", user);
          } catch (error) {
            console.error("Failed to parse user data from localStorage:", error);
          }
        }
      }
    },
  },
});

export const { setCredentials, logout, loadTokenFromStorage } = authSlice.actions;
export default authSlice.reducer;
