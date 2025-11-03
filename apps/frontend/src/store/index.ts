import { configureStore } from "@reduxjs/toolkit";
import { patientApi } from "./patientApi";
import { queueAssignmentApi } from "./queueAssignmentApi";
import { patientConditionApi } from "./patientConditionApi";
import { patientEncounterApi } from "./patientEncounterApi";
import { scheduleApi } from "./scheduleApi";
import { employeeScheduleApi } from "./employeeScheduleApi";
import authReducer from "./authSlice";
import patientReducer from "./patientSlice";
import { departmentApi } from "./departmentApi";
import { roomApi } from "./roomsApi";
import userApi from "./userApi";
import { imagingModalityApi } from "./imagingModalityApi";
import { dicomStudyApi } from "./dicomStudyApi";
import { bodyPartApi } from "./bodyPartApi";
import { requestProcedureApi } from "./requestProcedureAPi";
import { imagingOrderApi } from "./imagingOrderApi";
import { modalityMachineApi } from "./modalityMachineApi";
<<<<<<< HEAD
import { imagingOrderFormApi } from "./imaging-order-formApi";
import { diagnosisApi } from "./diagnosisApi";
=======
import { imagingOrderFormApi } from "./imagingOrderFormApi";
>>>>>>> main

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patient: patientReducer,
    [patientApi.reducerPath]: patientApi.reducer,
    [patientEncounterApi.reducerPath]: patientEncounterApi.reducer,
    [queueAssignmentApi.reducerPath]: queueAssignmentApi.reducer,
    [patientConditionApi.reducerPath]: patientConditionApi.reducer,
    [scheduleApi.reducerPath]: scheduleApi.reducer,
    [departmentApi.reducerPath]: departmentApi.reducer,
    [roomApi.reducerPath]: roomApi.reducer,
    [employeeScheduleApi.reducerPath]: employeeScheduleApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [imagingModalityApi.reducerPath]: imagingModalityApi.reducer,
    [modalityMachineApi.reducerPath]: modalityMachineApi.reducer,
    [dicomStudyApi.reducerPath]: dicomStudyApi.reducer,
    [bodyPartApi.reducerPath]: bodyPartApi.reducer,
    [requestProcedureApi.reducerPath]: requestProcedureApi.reducer,
    [imagingOrderApi.reducerPath]: imagingOrderApi.reducer,
    [imagingOrderFormApi.reducerPath]: imagingOrderFormApi.reducer,
<<<<<<< HEAD
    [diagnosisApi.reducerPath]: diagnosisApi.reducer,
   
=======

>>>>>>> main
  },
  middleware: (getDefault) =>
    getDefault()
      .concat(patientApi.middleware)
      .concat(patientEncounterApi.middleware)
      .concat(queueAssignmentApi.middleware)
      .concat(patientConditionApi.middleware)
      .concat(scheduleApi.middleware)
      .concat(departmentApi.middleware)
      .concat(roomApi.middleware)
      .concat(employeeScheduleApi.middleware)
      .concat(userApi.middleware)
      .concat(imagingModalityApi.middleware)
      .concat(modalityMachineApi.middleware)
      .concat(dicomStudyApi.middleware)
      .concat(bodyPartApi.middleware)
      .concat(requestProcedureApi.middleware)
      .concat(imagingOrderApi.middleware)
<<<<<<< HEAD
      .concat(imagingOrderFormApi.middleware)
      .concat(diagnosisApi.middleware),
=======
      .concat(imagingOrderFormApi.middleware),
 
>>>>>>> main
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
