"use client";

import DiagnosisInput from "@/components/common/DiagnosisInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useGetAllImagingModalityQuery } from "@/store/imagingModalityApi";
import { useGetPatientByCodeQuery } from "@/store/patientApi";
import { useGetRoomsByDepartmentIdQuery } from "@/store/roomsApi";
import {
  CalendarFold,
  ClipboardList,
  MapPinHouse,
  Mars,
  Plus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { ProcedureForm } from "@/components/physicians/imaging/procedure-form";
import { CreateImagingOrderDto } from "@/interfaces/image-dicom/imaging-order.interface";
import { useCreateImagingOrderMutation } from "@/store/imagingOderApi";
import { toast } from "sonner";
import { ImagingOrder } from "@/components/pdf-generator/imaging-order";
import { useGetUserByIdQuery } from "@/store/userApi";

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

export default function CreateImagingOrder() {
  const [patientId, setPatientId] = useState("");
  // get pdfUrl
  // const [pdfUrl, setPdfURL] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
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

  const [createImagingOrder, { isLoading: isCreating }] =
    useCreateImagingOrderMutation();
  const addProcedure = () => {
    const newProcedure: ImagingProcedure = {
      id: Date.now().toString(),
      modality: "",
      bodyPart: "",
      clinicalIndication: "",
      procedureServiceId: "",
      specialInstructions: "",
      procedureServiceName: "",
    };
    setProcedures([...procedures, newProcedure]);
  };

  const removeProcedure = (id: string) => {
    if (procedures.length > 1) {
      setProcedures(procedures.filter((p) => p.id !== id));
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("user");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.id === "string") {
        setUserId(parsed.id);
      }
    } catch (err) {
      console.error("Invalid user in localStorage", err);
    }
  }, []);

  const { data: physicianData } = useGetUserByIdQuery(userId, {
    skip: !userId,
  });

  const updateProcedure = (
    id: string,
    field: keyof ImagingProcedure,
    value: string
  ) => {
    setProcedures((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        if (field === "bodyPart") {
          const bp = bodyPartsData?.find((b: any) => b.id === value);
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
    const basicInfoValid = patientId && diagnosis && department && room;
    const proceduresValid = procedures.every(
      (p) =>
        p.modality && p.bodyPart && p.clinicalIndication && p.procedureServiceId
    );
    return basicInfoValid && proceduresValid;
  };

  const handleSave = async () => {
    if (!isFormValid()) return;

    try {
      const orderPromises = procedures.map(async (procedure) => {
        const orderDto: CreateImagingOrderDto = {
          patientId: patientData?.id || patientId,
          orderingPhysicianId: userId,
          modalityId: procedure.modality,
          bodyPart: procedure.bodyPartName as string,
          request_procedure_id: procedure.procedureServiceId,
          clinicalIndication: procedure.clinicalIndication,
          specialInstructions: procedure.specialInstructions,
          roomId: room,
          notes: notes,
        };
        return await createImagingOrder(orderDto).unwrap();
      });
      const results = await Promise.all(orderPromises);
      if (results) {
        console.log("Created imaging orders:", results);
        handleDownloadPDF();
      }
      toast.success("Imaging orders created successfully!");
      handleCancel();
    } catch (error) {
      toast.error("Failed to create imaging orders. Please try again.");
    }
  };

  const {
    data: patientData,
    isLoading: isPatientLoading,
    isError: isPatientError,
  } = useGetPatientByCodeQuery(patientId, {
    skip: !patientId,
  });

  const { data: departmentsData, isLoading: isDepartmentsLoading } =
    useGetDepartmentsQuery({});

  const { data: roomsData, isError: isRoomsError } =
    useGetRoomsByDepartmentIdQuery(
      {
        id: department,
      },
      {
        skip: !department,
      }
    );

  const { data: imagingModalitiesData } = useGetAllImagingModalityQuery();
  const { data: bodyPartsData } = useGetAllBodyPartsQuery();

  const handleCancel = () => {
    // Reset all form fields
    setPatientId("");
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
      patientCode: patientData?.patientCode || "",
      patientName: `${patientData?.firstName} ${patientData?.lastName}`,
      address: patientData?.address || "",
      gender: patientData?.gender || "",
      age: calculateAge(patientData?.dateOfBirth as Date),
      insuranceNumber: patientData?.insuranceNumber || "Nothing",
      diagnosis: diagnosis,
      procedures: procedures,
      departmentName: departmentName,
      roomName: roomName,
      notes: notes,
      orderingPhysicianName: `${physicianData?.firstName} ${physicianData?.lastName}`,
    };
   ImagingOrder({ imagingProcedurePDF });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardList className="h-8 w-8 text-teal-600" />
            <h1 className="text-3xl font-bold text-slate-900">
              Create Request Procedures
            </h1>
          </div>
        </div>

        <div className="space-y-6 pb-24">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-200">
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
            <CardContent className="">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="patientId"
                    className="text-slate-700 font-medium"
                  >
                    Patient Code <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-4">
                    <Input
                      id="patientId"
                      placeholder="Enter patient ID"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      className={`${
                        !patientId ? "border-slate-300" : "border-teal-300"
                      }`}
                    />
                  </div>
                  <div>
                    {isPatientLoading && <div>Loading patient info...</div>}
                    {isPatientError && (
                      <div className="text-red-500">Patient not found</div>
                    )}
                    {patientData && !isPatientError && patientId !== "" && (
                      <div className="space-y-2 text-sm text-slate-700">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span className="font-medium w-20">Name:</span>
                          <span>
                            {patientData?.firstName} {patientData?.lastName}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Mars className="w-4 h-4 text-pink-500" />
                          <span className="font-medium w-20">Gender:</span>
                          <span>{patientData?.gender}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPinHouse className="w-4 h-4 text-emerald-500" />
                          <span className="font-medium w-20">Address:</span>
                          <span>{patientData?.address}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <CalendarFold className="w-4 h-4 text-amber-500" />
                          <span className="font-medium w-20">Age:</span>
                          <span>
                            {calculateAge(patientData?.dateOfBirth as Date)}{" "}
                            years
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-200">
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
            <CardContent className="">
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
                      const selected = departmentsData?.find(
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
                      {departmentsData?.map((dept: Department) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.departmentName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  {/* Hien thi room va tong so order in-process va pending trong ngay */}
                  <Label htmlFor="room" className="text-slate-700 font-medium">
                    Performing Location <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={room}
                    onValueChange={(value) => {
                      setRoom(value);
                      const selected = roomsData?.find(
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
                      {roomsData?.map((room: Room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.roomCode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes" className="text-slate-700 font-medium">
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

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-200">
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
            <CardContent className="">
              <div className="space-y-6">
                {procedures.map((procedure, index) => (
                  <ProcedureForm
                    key={procedure.id}
                    procedure={procedure}
                    index={index}
                    proceduresLength={procedures.length}
                    imagingModalitiesData={imagingModalitiesData}
                    bodyPartsData={bodyPartsData}
                    updateProcedure={updateProcedure}
                    removeProcedure={removeProcedure}
                  />
                ))}
                <Button
                  variant="outline"
                  onClick={addProcedure}
                  className="w-full border-dashed border-2 border-teal-300 text-teal-700 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-400"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Procedure
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
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
              {/* <Button
                variant="outline"
                onClick={handleDownloadPDF}
                className="px-6 border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Preview PDF
              </Button> */}
            </div>
          </div>
        </div>
      </div>

      {/* {pdfUrl && (
        <div className="mt-4">
          <iframe
            src={pdfUrl}
            width="100%"
            height="600px"
            title="Imaging Order PDF"
          />
        </div>
      )} */}
    </div>
  );
}
