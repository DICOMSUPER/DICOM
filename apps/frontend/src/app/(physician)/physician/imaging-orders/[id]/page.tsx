"use client";
import ImagingOrderFormDetail from "@/components/physician/imaging-detail/imaing-order-form-detail";
import { IImagingOrderForm } from "@/common/interfaces/image-dicom/imaging-order-form.interface";
import { useGetImagingOrderFormByIdQuery } from "@/store/imagingOrderFormApi";
import React, { use } from "react";

interface ImagingOrderFormDetailProps {
  params: Promise<{
    id: string;
  }>;
}

const page = ({ params }: ImagingOrderFormDetailProps) => {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
   

  const { data: imagingOrderFormDetail , isLoading } = useGetImagingOrderFormByIdQuery(id);


  return <div>
    <ImagingOrderFormDetail
      imagingOrderForm={imagingOrderFormDetail?.data! as IImagingOrderForm}
      isLoadingOrderForm={isLoading}

    />
  </div>;
};

export default page;
