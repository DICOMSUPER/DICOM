// store/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { Roles } from "../enums/user.enum";

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

      // Save to localStorage and cookies with expiration (7 days)
      if (typeof window !== "undefined") {
        const expiresInDays = 7;
        try {
          localStorage.setItem("token", action.payload.token);
          localStorage.setItem("user", JSON.stringify(action.payload.user));
        } catch (err) {
          console.error("Failed to write auth to localStorage", err);
        }
        Cookies.set("accessToken", action.payload.token, {
          expires: expiresInDays,
          path: "/",
          sameSite: "none",   // ✅ Cho phép cross-site
          secure: true,
        });
        Cookies.set("user", JSON.stringify(action.payload.user), {
          expires: expiresInDays,
          path: "/",
          sameSite: "strict",
        });
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;

      // Remove from localStorage and cookies
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        Cookies.remove("accessToken");
        Cookies.remove("user");
      }
    },
    loadCredentials: (state) => {
      if (typeof window !== "undefined") {
        // Prefer localStorage (works even if cookie domain doesn't match), fallback to cookies
        let token: string | undefined | null = null;
        let userString: string | undefined | null = null;

        try {
          token = localStorage.getItem("token");
          userString = localStorage.getItem("user");
        } catch (err) {
          console.error("Failed to read auth from localStorage", err);
        }

        if (!token) token = Cookies.get("accessToken");
        if (!userString) userString = Cookies.get("user");

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
              console.error("Invalid user data structure in cookies");
              // Clear invalid cookie
              Cookies.remove("user");
              state.user = null;
            }
          } catch (error) {
            console.error("Failed to parse user data from cookies:", error);
            // Clear invalid cookie
            Cookies.remove("user");
            state.user = null;
          }
        }
      }
    },
  },
});

export const { setCredentials, logout, loadCredentials } =
  authSlice.actions;
export default authSlice.reducer;
