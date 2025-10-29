// store/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { Roles } from "../enums/user.enum";

interface User {
  id: string;
  email: string;
  role: Roles;
}

interface AuthState {
  user: User | null;
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
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;

      // Save to localStorage and cookies
      if (typeof window !== "undefined") {
        // localStorage.setItem("token", action.payload.token);
        // localStorage.setItem("user", JSON.stringify(action.payload.user));
        Cookies.set("accessToken", action.payload.token);
        Cookies.set("user", JSON.stringify(action.payload.user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;

      // Remove from localStorage and cookies
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      Cookies.remove("accessToken");
      Cookies.remove("user");
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
            console.error(
              "Failed to parse user data from localStorage:",
              error
            );
          }
        }
      }
    },
  },
});

export const { setCredentials, logout, loadTokenFromStorage } =
  authSlice.actions;
export default authSlice.reducer;
