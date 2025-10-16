import { configureStore } from "@reduxjs/toolkit";
// import { authApi } from "./authApi";
import { patientApi } from "./patientApi";
import { patientEncounterApi } from "./patientEncounterApi";
import { queueAssignmentApi } from "./queueAssignmentApi";
import { patientConditionApi } from "./patientConditionApi";
import { scheduleApi } from "./scheduleApi";
import authReducer from "./authSlice";
import patientReducer from "./patientSlice";
import { departmentApi } from "./departmentApi";
import { roomApi } from "./roomsApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patient: patientReducer,
    // [authApi.reducerPath]: authApi.reducer,

    [patientApi.reducerPath]: patientApi.reducer,
    [patientEncounterApi.reducerPath]: patientEncounterApi.reducer,
    [queueAssignmentApi.reducerPath]: queueAssignmentApi.reducer,
    [patientConditionApi.reducerPath]: patientConditionApi.reducer,
    [scheduleApi.reducerPath]: scheduleApi.reducer,
    [departmentApi.reducerPath]: departmentApi.reducer,
    [roomApi.reducerPath]: roomApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault()
      // .concat(authApi.middleware)
      .concat(patientApi.middleware)
      .concat(patientEncounterApi.middleware)
      .concat(queueAssignmentApi.middleware)
      .concat(patientConditionApi.middleware)
      .concat(scheduleApi.middleware)
      .concat(departmentApi.middleware)
      .concat(roomApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
