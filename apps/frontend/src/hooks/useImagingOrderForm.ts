import {
  useGetImagingOrderFormsByPatientIdQuery,
  useGetImagingOrderFormByIdQuery,
  // useCreateImagingOrderFormMutation,
  // useUpdateImagingOrderFormMutation,
  useDeleteImagingOrderFormMutation,
} from "@/store/imaging-order-formApi";

/**
 * Hook tổng hợp các hàm truy vấn & thao tác ImagingOrderForm
 */
export const useImagingOrderFormService = () => {
  // ======================
  // Query hooks
  // ======================
  const getImagingOrderFormsByPatientId = useGetImagingOrderFormsByPatientIdQuery;
  const getImagingOrderFormById = useGetImagingOrderFormByIdQuery;

  // ======================
  // Mutation hooks
  // ======================
  // const [createImagingOrderForm, createState] = useCreateImagingOrderFormMutation();
  // const [updateImagingOrderForm, updateState] = useUpdateImagingOrderFormMutation();
  const [deleteImagingOrderForm, deleteState] = useDeleteImagingOrderFormMutation();

  return {
    // Query
    getImagingOrderFormsByPatientId,
    getImagingOrderFormById,

    // Mutation
    // createImagingOrderForm,
    // updateImagingOrderForm,
    deleteImagingOrderForm,

    // Mutation states (optional)
    // createState,
    // updateState,
    deleteState,
  };
};
