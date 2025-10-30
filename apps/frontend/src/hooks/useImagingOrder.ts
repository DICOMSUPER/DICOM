import {
  useGetAllImagingOrdersQuery,
  useGetImagingOrdersPaginatedQuery,
  useFindByReferenceIdQuery,
  useGetImagingOrderByIdQuery,
  useCreateImagingOrderMutation,
  useDeleteImagingOrderMutation,
  useGetImagingOrdersByPatientIdQuery, 
} from "@/store/imagingOrderApi";

/**
 * Hook tổng hợp các hàm truy vấn & thao tác ImagingOrder
 */
export const useImagingOrderService = () => {
  // ======================
  // Query hooks
  // ======================
  const getAllImagingOrders = useGetAllImagingOrdersQuery;
  const getImagingOrdersPaginated = useGetImagingOrdersPaginatedQuery;
  const findByReferenceId = useFindByReferenceIdQuery;
  const getImagingOrderById = useGetImagingOrderByIdQuery;
  const getImagingOrdersByPatientId = useGetImagingOrdersByPatientIdQuery; // 👈 thêm vào đây

  // ======================
  // Mutation hooks
  // ======================
  const [createImagingOrder, createState] = useCreateImagingOrderMutation();
  const [deleteImagingOrder, deleteState] = useDeleteImagingOrderMutation();

  return {
    // Queries
    getAllImagingOrders,
    getImagingOrdersPaginated,
    findByReferenceId,
    getImagingOrderById,
    getImagingOrdersByPatientId, // ✅ có thể dùng như service

    // Mutations
    createImagingOrder,
    deleteImagingOrder,

    // States (tùy chọn)
    createState,
    deleteState,
  };
};
