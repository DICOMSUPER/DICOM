  // store/authSlice.ts
  import { createSlice, PayloadAction } from "@reduxjs/toolkit";
  import { Roles } from "../enums/user.enum";

  interface User {
    id: string;
    email: string;
    role: Roles;
  }

  interface AuthState {

    token: string | null;
  }

  const initialState: AuthState = {

    token: null,
  };

  const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
      setCredentials: (
        state,
        action: PayloadAction<{ token: string }>
      ) => {
        state.token = action.payload.token;  },
      logout: (state) => {
        state.token = null;

        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
      },
    
    },
  });

  export const { setCredentials, logout } = authSlice.actions;
  export default authSlice.reducer;
