"use client";
import DiagnosisInput from "@/components/common/DiagnosisInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Department } from "@/interfaces/user/department.interface";
import { Room } from "@/interfaces/user/room.interface";
import { calculateAge } from "@/lib/formatTimeDate";
import { useGetAllBodyPartsQuery } from "@/store/bodyPartApi";
import { useGetDepartmentsQuery } from "@/store/departmentApi";
import {
  useGetRoomByDepartmentIdV2Query,
  useGetRoomsByDepartmentIdQuery,
} from "@/store/roomsApi";
import {
  CalendarFold,
  ClipboardList,
  MapPinHouse,
  Mars,
  Plus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { ImagingOrder } from "@/components/pdf-generator/imaging-order";
import { ProcedureForm } from "@/components/physician/imaging/procedure-form";
import { ICreateImagingOrderForm } from "@/interfaces/image-dicom/imaging-order-form.interface";
import { CreateImagingOrderDto } from "@/interfaces/image-dicom/imaging-order.interface";
import { Patient } from "@/interfaces/patient/patient-workflow.interface";
import { useCreateImagingOrderFormMutation } from "@/store/imagingOrderFormApi";
import { useGetModalitiesInRoomQuery } from "@/store/modalityMachineApi";
import {
  useGetCurrentProfileQuery,
  useGetUserByIdQuery,
} from "@/store/userApi";
import { toast } from "sonner";

export interface ImagingProcedure {
  id: string;
  modality: string;
  bodyPart: string;
  bodyPartName?: string;
  clinicalIndication: string;
  procedureServiceId: string;
  procedureServiceName?: string;
  specialInstructions?: string;
}
export interface ImagingProcedurePDF {
  patientName: string;
  patientCode: string;
  address: string;
  gender: string;
  age: number;
  insuranceNumber?: string;
  diagnosis: string;
  departmentName: string;
  roomName: string;
  notes: string;
  orderingPhysicianName?: string;
  procedures: ImagingProcedure[];
}

interface CreateImagingOrderProps {
  patient: Patient;
  encounterId: string;
}

export default function CreateImagingOrder({
  patient,
  encounterId,
}: CreateImagingOrderProps) {
  const { data: profile } = useGetCurrentProfileQuery();
  console.log("Profile Data:", profile?.data);

  const [department, setDepartment] = useState("");
  const [roomName, setRoomName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [notes, setNotes] = useState("");
  const [procedures, setProcedures] = useState<ImagingProcedure[]>([
    {
      id: "1",
      modality: "",
      bodyPart: "",
      bodyPartName: "",
      clinicalIndication: "",
      procedureServiceId: "",
      specialInstructions: "",
      procedureServiceName: "",
    },
  ]);
  const [room, setRoom] = useState("");
  const [diagnosis, setDiagnosis] = useState("");

  const [createImagingOrderForm, { isLoading: isCreating }] =
    useCreateImagingOrderFormMutation();

  // const addProcedure = () => {
  //   const newProcedure: ImagingProcedure = {
  //     id: Date.now().toString(),
  //     modality: "",
  //     bodyPart: "",
  //     clinicalIndication: "",
  //     procedureServiceId: "",
  //     specialInstructions: "",
  //     procedureServiceName: "",
  //   };
  //   setProcedures([...procedures, newProcedure]);
  // };

  const removeProcedure = (id: string) => {
    if (procedures.length > 1) {
      setProcedures(procedures.filter((p) => p.id !== id));
    }
  };

  const updateProcedure = (
    id: string,
    field: keyof ImagingProcedure,
    value: string
  ) => {
    setProcedures((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        if (field === "bodyPart") {
          const bp = bodyPartsData?.data.find((b: any) => b.id === value);
          return {
            ...p,
            bodyPart: String(value),
            bodyPartName: bp?.name ?? "",
            procedureServiceId: "",
          };
        }
        return { ...p, [field]: value };
      })
    );
  };

  const isFormValid = () => {
    const basicInfoValid = diagnosis && department && room;
    const proceduresValid = procedures.every(
      (p) =>
        p.modality && p.bodyPart && p.clinicalIndication && p.procedureServiceId
    );
    return basicInfoValid && proceduresValid;
  };

const handleSave = async () => {
  if (!isFormValid()) {
    console.log("Form is invalid");
    toast.error("Please fill in all required fields");
    return;
  }

  try {
    const imagingOrders: CreateImagingOrderDto[] = procedures.map(
      (procedure) => ({
        request_procedure_id: procedure.procedureServiceId,
        clinicalIndication: procedure.clinicalIndication ?? "",
        contrastRequired: false,
        specialInstructions: procedure.specialInstructions ?? "",
      })
    );

    const payload: ICreateImagingOrderForm = {
      patientId: patient.id as string,
      encounterId: encounterId,
      roomId: room,
      notes,
      diagnosis,
      imagingOrders,
    };


    
    const result = await createImagingOrderForm(payload).unwrap();
    
    console.log("✅ API Response:", result);
    

    if (result?.success || result?.data) {
      toast.success("Imaging orders created successfully!");
      handleDownloadPDF();
      handleCancel();
    } else {
      throw new Error("Unexpected response format");
    }
  } catch (error: any) {
    console.error("❌ Error creating imaging orders:", error);
    const errorMessage =
      error?.data?.message || 
      error?.message || 
      "Failed to create imaging orders. Please try again.";
    
    toast.error(errorMessage);
  }
};
  const { data: departmentsData, isLoading: isDepartmentsLoading } =
    useGetDepartmentsQuery({
      limit: 100,
      isActive: true,
      departmentCode: ["KCDHA"],
    });

  const { data: roomsData, isError: isRoomsError } =
    useGetRoomByDepartmentIdV2Query(department, {
      skip: !department,
    });

  const { data: imagingModalitiesData } = useGetModalitiesInRoomQuery(room, {
    skip: !room,
  });
  console.log("Imaging Modalities Data:", imagingModalitiesData);
  const { data: bodyPartsData } = useGetAllBodyPartsQuery();

  const handleCancel = () => {
    setDepartment("");
    setDepartmentName("");
    setNotes("");
    setRoom("");
    setRoomName("");
    setDiagnosis("");
    setProcedures([
      {
        id: "1",
        modality: "",
        bodyPart: "",
        clinicalIndication: "",
        procedureServiceId: "",
        specialInstructions: "",
        procedureServiceName: "",
      },
    ]);
  };

  const handleDownloadPDF = () => {
    const imagingProcedurePDF: ImagingProcedurePDF = {
      patientCode: patient.patientCode || "",
      patientName: `${patient.firstName} ${patient.lastName}`,
      address: patient.address || "",
      gender: patient.gender || "",
      age: calculateAge(patient.dateOfBirth as Date),
      insuranceNumber: patient.insuranceNumber || "Nothing",
      diagnosis: diagnosis,
      procedures: procedures,
      departmentName: departmentName,
      roomName: roomName,
      notes: notes,
      orderingPhysicianName: `${profile?.data.firstName} ${profile?.data.lastName}`,
    };
    ImagingOrder({ imagingProcedurePDF });
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto border border-slate-200 rounded-lg   max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* <div className="mb-6">
            <div className="flex justify-center items-center gap-3 mb-2">
              <ClipboardList className="h-8 w-8 text-teal-600" />
              <h1 className="text-3xl font-bold text-slate-900">
                Create Imaging Order Form
              </h1>
            </div>
          </div> */}
          <div className="space-y-6 pb-6">
            <Card className="border-slate-200 py-0 pb-6">
              <CardHeader className="bg-emerald-200 border-b py-6 border-slate-200 ">
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-teal-50 text-teal-700 border-teal-200"
                  >
                    1
                  </Badge>
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <div>
                      {patient && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="flex items-start gap-3 p-3 rounded-lg  border ">
                            <div className="mt-0.5">
                              <Users className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-slate-500 mb-1">
                                Full Name
                              </p>
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {patient.firstName} {patient.lastName}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3 rounded-lg border ">
                            <div className="mt-0.5">
                              <Mars className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-slate-500 mb-1">
                                Gender
                              </p>
                              <p className="text-sm font-semibold text-slate-900">
                                {patient.gender}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3 rounded-lg  border">
                            <div className="mt-0.5">
                              <CalendarFold className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-slate-500 mb-1">
                                Age
                              </p>
                              <p className="text-sm font-semibold text-slate-900">
                                {calculateAge(patient.dateOfBirth as Date)}{" "}
                                years
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3 rounded-lg border">
                            <div className="mt-0.5">
                              <MapPinHouse className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-slate-500 mb-1">
                                Address
                              </p>
                              <p
                                className="text-sm font-semibold text-slate-900 truncate"
                                title={patient.address}
                              >
                                {patient.address}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3 rounded-lg  border ">
                            <div className="mt-0.5">
                              <ClipboardList className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-slate-500 mb-1">
                                Insurance Number
                              </p>
                              <p className="text-sm font-semibold text-slate-900">
                                {patient.insuranceNumber || "N/A"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3 rounded-lg  border ">
                            <div className="mt-0.5">
                              <CalendarFold className="w-5 h-5 " />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-slate-500 mb-1">
                                Phone
                              </p>
                              <p className="text-sm font-semibold text-slate-900">
                                {patient.phoneNumber}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 py-0 pb-6 shadow-sm">
              <CardHeader className="bg-emerald-200 py-6 border-b border-slate-200">
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-teal-50 text-teal-700 border-teal-200"
                  >
                    2
                  </Badge>
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-2 mb-6">
                  <Label
                    htmlFor="patientId"
                    className="text-slate-700 font-medium"
                  >
                    Provisional (initial) clinical diagnosis{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <DiagnosisInput
                    className={`${
                      !diagnosis ? "border-slate-300" : "border-teal-300"
                    } w-full p-2 border rounded-lg`}
                    state={diagnosis}
                    setState={setDiagnosis}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="department"
                      className="text-slate-700 font-medium"
                    >
                      Department <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={department}
                      onValueChange={(value) => {
                        setDepartment(value);
                        const selected = departmentsData?.data.find(
                          (dept: Department) => dept.id === value
                        );
                        setDepartmentName(selected?.departmentName || "");
                      }}
                    >
                      <SelectTrigger
                        className={`${
                          !department ? "border-slate-300" : "border-teal-300"
                        } w-full`}
                      >
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentsData?.data.map((dept: Department) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.departmentName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="room"
                      className="text-slate-700 font-medium"
                    >
                      Performing Location{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={room}
                      onValueChange={(value) => {
                        setRoom(value);
                        const selected = roomsData?.data.data.find(
                          (r: Room) => r.id === value
                        );
                        setRoomName(selected?.roomCode || "");
                      }}
                    >
                      <SelectTrigger
                        className={`${
                          !room ? "border-slate-300" : "border-teal-300"
                        } w-full`}
                      >
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                      <SelectContent>
                        {roomsData?.data.data.map((room: Room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.roomCode}- {room.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label
                      htmlFor="notes"
                      className="text-slate-700 font-medium"
                    >
                      Notes (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any additional notes or instructions..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[100px] border-slate-300"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 py-0 pb-6 shadow-sm">
              <CardHeader className="bg-emerald-200 py-6 border-b border-slate-200">
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-teal-50 text-teal-700 border-teal-200"
                  >
                    3
                  </Badge>
                  Select Procedures
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-6">
                  {procedures.map((procedure, index) => (
                    <ProcedureForm
                      key={procedure.id}
                      procedure={procedure}
                      index={index}
                      proceduresLength={procedures.length}
                      imagingModalitiesData={imagingModalitiesData?.data}
                      bodyPartsData={bodyPartsData?.data}
                      updateProcedure={updateProcedure}
                      removeProcedure={removeProcedure}
                       selectedProcedureIds={procedures.map(p => p.procedureServiceId).filter(Boolean)} 
                    />
                  ))}
                  {/* <Button
                    variant="outline"
                    onClick={addProcedure}
                    className="w-full border-dashed border-2 border-teal-300 text-teal-700 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-400"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Procedure
                  </Button> */}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="border-t border-slate-200 bg-white shadow-lg">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="px-6 border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isFormValid()}
              className="px-6 bg-teal-600 hover:bg-teal-700 text-white disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
            >
              {isCreating ? "Creating..." : "Save and Print Order"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
