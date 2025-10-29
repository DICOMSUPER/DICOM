import {
  useGetPatientsQuery,
  useGetPatientsPaginatedQuery,
  useGetPatientByIdQuery,
  useGetPatientByCodeQuery,
  useGetPatientOverviewQuery,
  useSearchPatientsByNameQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
  useRestorePatientMutation,
  useGetPatientStatsQuery,
} from "@/store/patientApi"; 

export const usePatientService = () => {
  // Query hooks
  const getPatients = useGetPatientsQuery;
  const getPatientsPaginated = useGetPatientsPaginatedQuery;
  const getPatientById = useGetPatientByIdQuery;
  const getPatientByCode = useGetPatientByCodeQuery;
  const getPatientOverview = useGetPatientOverviewQuery;
  const searchPatientsByName = useSearchPatientsByNameQuery;
  const getPatientStats = useGetPatientStatsQuery;

  // Mutation hooks
  const [createPatient, createPatientState] = useCreatePatientMutation();
  const [updatePatient, updatePatientState] = useUpdatePatientMutation();
  const [deletePatient, deletePatientState] = useDeletePatientMutation();
  const [restorePatient, restorePatientState] = useRestorePatientMutation();

  return {
    // Query
    getPatients,
    getPatientsPaginated,
    getPatientById,
    getPatientByCode,
    getPatientOverview,
    searchPatientsByName,
    getPatientStats,

    // Mutation
    createPatient,
    updatePatient,
    deletePatient,
    restorePatient,

    // Mutation states (optional)
    createPatientState,
    updatePatientState,
    deletePatientState,
    restorePatientState,
  };
};
