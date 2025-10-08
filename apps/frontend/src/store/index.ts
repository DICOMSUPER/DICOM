
import { configureStore } from "@reduxjs/toolkit";
// import { authApi } from "./authApi";
import { patientApi } from "./patientApi";
import { queueAssignmentApi } from "./queueAssignmentApi";
import { patientConditionApi } from "./patientConditionApi";
import authReducer from "./authSlice";
import patientReducer from "./patientSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patient: patientReducer,
    // [authApi.reducerPath]: authApi.reducer,
    [patientApi.reducerPath]: patientApi.reducer,
    [queueAssignmentApi.reducerPath]: queueAssignmentApi.reducer,
    [patientConditionApi.reducerPath]: patientConditionApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault()
      // .concat(authApi.middleware)
      .concat(patientApi.middleware)
      .concat(queueAssignmentApi.middleware)
      .concat(patientConditionApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
