import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  Patient,
  PatientEncounter,
  DiagnosisReport,
  PatientSearchFilters,
  PatientListState,
  PatientDetailState,
  PatientFormState,
  PatientViewMode,
  PatientSortBy,
  PatientWorkflowStep
} from '@/common/interfaces/patient/patient-workflow.interface';

interface PatientState {
  list: PatientListState;
  detail: PatientDetailState;
  form: PatientFormState;
  ui: {
    sidebarOpen: boolean;
    selectedPatientId: string | null;
    showPatientForm: boolean;
    showEncounterForm: boolean;
    showDiagnosisForm: boolean;
    showVitalSignsForm: boolean;
  };
}

const initialState: PatientState = {
  list: {
    patients: [],
    loading: false,
    error: null,
    pagination: { page: 1, limit: 10 },
    total: 0,
    filters: {},
    sortBy: 'NAME',
    sortOrder: 'asc',
    viewMode: 'LIST',
    selectedPatients: [],
  },
  detail: {
    patient: null,
    encounters: [],
    diagnoses: [],
    loading: false,
    error: null,
    activeTab: 'overview',
  },
  form: {
    patient: {},
    encounter: {},
    diagnosis: {},
    vitalSigns: {},
    currentStep: 'REGISTRATION',
    isSubmitting: false,
    errors: {},
  },
  ui: {
    sidebarOpen: false,
    selectedPatientId: null,
    showPatientForm: false,
    showEncounterForm: false,
    showDiagnosisForm: false,
    showVitalSignsForm: false,
  },
};

const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    // List actions
    setPatients: (state, action: PayloadAction<Patient[]>) => {
      state.list.patients = action.payload;
    },
    setPatientsLoading: (state, action: PayloadAction<boolean>) => {
      state.list.loading = action.payload;
    },
    setPatientsError: (state, action: PayloadAction<string | null>) => {
      state.list.error = action.payload;
    },
    setPagination: (state, action: PayloadAction<{ page: number; limit: number }>) => {
      state.list.pagination = action.payload;
    },
    setTotal: (state, action: PayloadAction<number>) => {
      state.list.total = action.payload;
    },
    setFilters: (state, action: PayloadAction<PatientSearchFilters>) => {
      state.list.filters = action.payload;
    },
    setSortBy: (state, action: PayloadAction<PatientSortBy>) => {
      state.list.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.list.sortOrder = action.payload;
    },
    setViewMode: (state, action: PayloadAction<PatientViewMode>) => {
      state.list.viewMode = action.payload;
    },
    setSelectedPatients: (state, action: PayloadAction<string[]>) => {
      state.list.selectedPatients = action.payload;
    },
    togglePatientSelection: (state, action: PayloadAction<string>) => {
      const patientId = action.payload;
      const selectedPatients = state.list.selectedPatients;
      const index = selectedPatients.indexOf(patientId);
      
      if (index > -1) {
        selectedPatients.splice(index, 1);
      } else {
        selectedPatients.push(patientId);
      }
    },
    clearSelectedPatients: (state) => {
      state.list.selectedPatients = [];
    },

    // Detail actions
    setPatient: (state, action: PayloadAction<Patient | null>) => {
      state.detail.patient = action.payload;
    },
    setEncounters: (state, action: PayloadAction<PatientEncounter[]>) => {
      state.detail.encounters = action.payload;
    },
    setDiagnoses: (state, action: PayloadAction<DiagnosisReport[]>) => {
      state.detail.diagnoses = action.payload;
    },
    setDetailLoading: (state, action: PayloadAction<boolean>) => {
      state.detail.loading = action.payload;
    },
    setDetailError: (state, action: PayloadAction<string | null>) => {
      state.detail.error = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<'overview' | 'encounters' | 'diagnoses' | 'vital-signs'>) => {
      state.detail.activeTab = action.payload;
    },

    // Form actions
    setPatientForm: (state, action: PayloadAction<Partial<Patient>>) => {
      state.form.patient = { ...state.form.patient, ...action.payload };
    },
    setEncounterForm: (state, action: PayloadAction<Partial<PatientEncounter>>) => {
      state.form.encounter = { ...state.form.encounter, ...action.payload };
    },
    setDiagnosisForm: (state, action: PayloadAction<Partial<DiagnosisReport>>) => {
      state.form.diagnosis = { ...state.form.diagnosis, ...action.payload };
    },
    setVitalSigns: (state, action: PayloadAction<Record<string, any>>) => {
      state.form.vitalSigns = action.payload;
    },
    setCurrentStep: (state, action: PayloadAction<PatientWorkflowStep>) => {
      state.form.currentStep = action.payload;
    },
    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.form.isSubmitting = action.payload;
    },
    setFormErrors: (state, action: PayloadAction<Record<string, string>>) => {
      state.form.errors = action.payload;
    },
    clearForm: (state) => {
      state.form = {
        patient: {},
        encounter: {},
        diagnosis: {},
        vitalSigns: {},
        currentStep: 'REGISTRATION',
        isSubmitting: false,
        errors: {},
      };
    },

    // UI actions
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.sidebarOpen = action.payload;
    },
    setSelectedPatientId: (state, action: PayloadAction<string | null>) => {
      state.ui.selectedPatientId = action.payload;
    },
    setShowPatientForm: (state, action: PayloadAction<boolean>) => {
      state.ui.showPatientForm = action.payload;
    },
    setShowEncounterForm: (state, action: PayloadAction<boolean>) => {
      state.ui.showEncounterForm = action.payload;
    },
    setShowDiagnosisForm: (state, action: PayloadAction<boolean>) => {
      state.ui.showDiagnosisForm = action.payload;
    },
    setShowVitalSignsForm: (state, action: PayloadAction<boolean>) => {
      state.ui.showVitalSignsForm = action.payload;
    },

    // Reset actions
    resetList: (state) => {
      state.list = initialState.list;
    },
    resetDetail: (state) => {
      state.detail = initialState.detail;
    },
    resetForm: (state) => {
      state.form = initialState.form;
    },
    resetUI: (state) => {
      state.ui = initialState.ui;
    },
    resetAll: (state) => {
      return initialState;
    },
  },
});

export const {
  // List actions
  setPatients,
  setPatientsLoading,
  setPatientsError,
  setPagination,
  setTotal,
  setFilters,
  setSortBy,
  setSortOrder,
  setViewMode,
  setSelectedPatients,
  togglePatientSelection,
  clearSelectedPatients,

  // Detail actions
  setPatient,
  setEncounters,
  setDiagnoses,
  setDetailLoading,
  setDetailError,
  setActiveTab,

  // Form actions
  setPatientForm,
  setEncounterForm,
  setDiagnosisForm,
  setVitalSigns,
  setCurrentStep,
  setSubmitting,
  setFormErrors,
  clearForm,

  // UI actions
  setSidebarOpen,
  setSelectedPatientId,
  setShowPatientForm,
  setShowEncounterForm,
  setShowDiagnosisForm,
  setShowVitalSignsForm,

  // Reset actions
  resetList,
  resetDetail,
  resetForm,
  resetUI,
  resetAll,
} = patientSlice.actions;

export default patientSlice.reducer;
