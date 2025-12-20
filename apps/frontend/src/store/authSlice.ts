// store/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { Roles } from "../common/enums/user.enum";

export interface User {
  id: string;
  email: string;
  role: Roles;
  firstName?: string;
  lastName?: string;
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

      // Save to localStorage only - cookies are set by backend with httpOnly flag
      // DO NOT set accessToken cookie here - it creates duplicates with the backend's httpOnly cookie
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("token", action.payload.token);
          localStorage.setItem("user", JSON.stringify(action.payload.user));
        } catch (err) {
          console.error("Failed to write auth to localStorage", err);
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;

      // Remove from localStorage only
      // The httpOnly accessToken cookie is cleared by backend's logout endpoint
      // We can only remove non-httpOnly cookies that might exist from old code
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Try to remove any stale non-httpOnly cookies (from old code versions)
        Cookies.remove("accessToken", { path: "/" });
        Cookies.remove("user", { path: "/" });
      }
    },
    loadCredentials: (state) => {
      if (typeof window !== "undefined") {
        // Load from localStorage only - accessToken cookie is httpOnly and can't be read by JS
        let token: string | null = null;
        let userString: string | null = null;

        try {
          token = localStorage.getItem("token");
          userString = localStorage.getItem("user");
        } catch (err) {
          console.error("Failed to read auth from localStorage", err);
        }

        if (token) {
          state.token = token;
        }

        if (userString) {
          try {
            const userData = JSON.parse(userString);
            // Validate user data structure before storing
            if (
              userData &&
              typeof userData === "object" &&
              typeof userData.id === "string" &&
              typeof userData.email === "string" &&
              userData.role
            ) {
              state.user = {
                id: userData.id,
                email: userData.email,
                role: userData.role,
                firstName: userData.firstName,
                lastName: userData.lastName,
              };
            } else {
              console.error("Invalid user data structure in localStorage");
              localStorage.removeItem("user");
              state.user = null;
            }
          } catch (error) {
            console.error("Failed to parse user data from localStorage:", error);
            localStorage.removeItem("user");
            state.user = null;
          }
        }
      }
    },
  },
});

export const { setCredentials, logout, loadCredentials } = authSlice.actions;
export default authSlice.reducer;
