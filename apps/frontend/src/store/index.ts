import { configureStore } from "@reduxjs/toolkit";
// import { authApi } from "./authApi";
import { patientApi } from "./patientApi";
import { patientEncounterApi } from "./patientEncounterApi";
import { queueAssignmentApi } from "./queueAssignmentApi";
import { patientConditionApi } from "./patientConditionApi";
<<<<<<< HEAD
import { patientEncounterApi } from "./patientEncounterApi";
=======
import { scheduleApi } from "./scheduleApi";
>>>>>>> main
import authReducer from "./authSlice";
import patientReducer from "./patientSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patient: patientReducer,
    // [authApi.reducerPath]: authApi.reducer,

    [patientApi.reducerPath]: patientApi.reducer,
    [patientEncounterApi.reducerPath]: patientEncounterApi.reducer,
    [queueAssignmentApi.reducerPath]: queueAssignmentApi.reducer,
    [patientConditionApi.reducerPath]: patientConditionApi.reducer,
<<<<<<< HEAD
    [patientEncounterApi.reducerPath]: patientEncounterApi.reducer,
=======
    [scheduleApi.reducerPath]: scheduleApi.reducer,
>>>>>>> main
  },
  middleware: (getDefault) =>
    getDefault()
      // .concat(authApi.middleware)
      .concat(patientApi.middleware)
      .concat(patientEncounterApi.middleware)
      .concat(queueAssignmentApi.middleware)
      .concat(patientConditionApi.middleware)
<<<<<<< HEAD
      .concat(patientEncounterApi.middleware),
=======
      .concat(scheduleApi.middleware),
>>>>>>> main
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
