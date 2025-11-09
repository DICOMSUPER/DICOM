import { configureStore } from "@reduxjs/toolkit";
import { patientApi } from "./patientApi";
import { queueAssignmentApi } from "./queueAssignmentApi";
import { patientConditionApi } from "./patientConditionApi";
import { patientEncounterApi } from "./patientEncounterApi";
import { scheduleApi } from "./scheduleApi";

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
import { imagingOrderFormApi } from "./imagingOrderFormApi";
import { diagnosisApi } from "./diagnosisApi";
import { dicomSeriesApi } from "./dicomSeriesApi";
import { RoomScheduleApi } from "./roomScheduleApi";
import { employeeRoomAssignmentApi } from "./employeeRoomAssignmentApi";

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
    [RoomScheduleApi.reducerPath]: RoomScheduleApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [imagingModalityApi.reducerPath]: imagingModalityApi.reducer,
    [modalityMachineApi.reducerPath]: modalityMachineApi.reducer,
    [dicomStudyApi.reducerPath]: dicomStudyApi.reducer,
    [bodyPartApi.reducerPath]: bodyPartApi.reducer,
    [requestProcedureApi.reducerPath]: requestProcedureApi.reducer,
    [imagingOrderApi.reducerPath]: imagingOrderApi.reducer,
    [imagingOrderFormApi.reducerPath]: imagingOrderFormApi.reducer,
    [diagnosisApi.reducerPath]: diagnosisApi.reducer,
    [dicomSeriesApi.reducerPath]: dicomSeriesApi.reducer,
    [employeeRoomAssignmentApi.reducerPath]: employeeRoomAssignmentApi.reducer,
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
      .concat(RoomScheduleApi.middleware)
      .concat(userApi.middleware)
      .concat(imagingModalityApi.middleware)
      .concat(modalityMachineApi.middleware)
      .concat(dicomStudyApi.middleware)
      .concat(bodyPartApi.middleware)
      .concat(requestProcedureApi.middleware)
      .concat(imagingOrderApi.middleware)
      .concat(diagnosisApi.middleware)
      .concat(imagingOrderFormApi.middleware)
      .concat(dicomSeriesApi.middleware)
      .concat(employeeRoomAssignmentApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
