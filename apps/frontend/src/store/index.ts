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
import { dicomInstanceApi } from "./dicomInstanceApi";
import { annotationApi } from "./annotationApi";
import { employeeRoomAssignmentApi } from "./employeeRoomAssignmentApi";
import { imagingApi } from "./imagingApi";
import { serviceApi } from "./serviceApi";
import { reportTemplateApi } from "./reportTemplateApi";
import serviceRoomApi from "./serviceRoomApi";

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
    [dicomInstanceApi.reducerPath]: dicomInstanceApi.reducer,
    [annotationApi.reducerPath]: annotationApi.reducer,
    [serviceApi.reducerPath]: serviceApi.reducer,
    [imagingApi.reducerPath]: imagingApi.reducer,
    [reportTemplateApi.reducerPath]: reportTemplateApi.reducer,
    [serviceRoomApi.reducerPath]: serviceRoomApi.reducer,
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
      .concat(employeeRoomAssignmentApi.middleware)
      .concat(dicomInstanceApi.middleware)
      .concat(annotationApi.middleware)
      .concat(imagingApi.middleware)
      .concat(serviceApi.middleware)
      .concat(reportTemplateApi.middleware)
      .concat(serviceRoomApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
