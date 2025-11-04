import {
  useGetAllDicomStudiesQuery,
  useCreateDicomStudyMutation,
  useUpdateDicomStudyMutation,
  useDeleteDicomStudyMutation,
} from "@/store/dicomStudyApi";

export const useDicomStudy = () => {
  const { data, error, isLoading, refetch } = useGetAllDicomStudiesQuery();
  const [createStudy] = useCreateDicomStudyMutation();
  const [updateStudy] = useUpdateDicomStudyMutation();
  const [deleteStudy] = useDeleteDicomStudyMutation();


  return {
    studies: data?.data ?? [],
    error,
    isLoading,
    refetch,
    createStudy,
    updateStudy,
    deleteStudy,
  };
};
