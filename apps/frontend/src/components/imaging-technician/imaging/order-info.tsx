import React from "react";
import PatientInfo from "./patient-info";
import PhysicianInfo from "./physician-info";
import ProcedureInfo from "./procedure-info";
import { Patient } from "@/interfaces/patient/patient-workflow.interface";
import { User } from "@/interfaces/user/user.interface";
import { RequestProcedure } from "@/interfaces/image-dicom/request-procedure.interface";
import { ImagingOrder } from "@/interfaces/image-dicom/imaging-order.interface";
import ClinicalIndication from "./clinical-indication";
import OrderName from "./order-name";
import SpecialInstructions from "./special-instruction";

export default function OrderInfo({
  order,
  patient,
  physician,
  procedure,
}: {
  order: ImagingOrder;
  patient?: Patient;
  physician?: User;
  procedure?: RequestProcedure;
}) {
  if (!order) {
    return <div>No order information available</div>;
  }

  return (
    <div className="bg-white border-gray-100 rounded-md shadow-sm p-6 border border-gray-200">
      <div>{order && <OrderName order={order} />}</div>
      <div className="grid grid-cols-3 md:grid-cols-3 gap-4 text-sm my-5">
        {patient && <PatientInfo patient={patient} />}

        {procedure && <ProcedureInfo procedure={procedure} />}

        <ClinicalIndication
          indication={order.clinicalIndication || "NA"}
          contrastRequired={order.contrastRequired || false}
        />
      </div>
      <div className="grid grid-cols-2 gap-6 mb-8 my-5">
        {physician && <PhysicianInfo physician={physician} />}
        {order && (
          <SpecialInstructions
            instructions={order.specialInstructions || "NA"}
            note={order.imagingOrderForm?.notes || "NA"}
          />
        )}
      </div>
    </div>
  );
}
