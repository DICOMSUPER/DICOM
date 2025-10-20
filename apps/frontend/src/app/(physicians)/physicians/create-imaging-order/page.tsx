"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, ClipboardList } from "lucide-react";
import {
  useGetPatientByCodeQuery,
  useGetPatientByIdQuery,
} from "@/store/patientApi";
import { calculateAge } from "@/lib/formatTimeDate";
import DiagnosisInput from "@/components/common/DiagnosisInput";
import { useGetDepartmentsQuery } from "@/store/departmentApi";
import { useGetRoomsQuery } from "@/store/roomsApi";

interface ImagingProcedure {
  id: string;
  modality: string;
  bodyPart: string;
  clinicalIndication: string;
}

export default function CreateImagingOrder() {
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [encounterId, setEncounterId] = useState("");
  const [physician, setPhysician] = useState("");
  const [department, setDepartment] = useState("");
  const [notes, setNotes] = useState("");
  const [procedures, setProcedures] = useState<ImagingProcedure[]>([
    { id: "1", modality: "", bodyPart: "", clinicalIndication: "" },
  ]);
  const [room, setRoom] = useState("");
  const [diagnosis, setDiagnosis] = useState("");

  const orderDate = new Date().toISOString().split("T")[0];

  const addProcedure = () => {
    const newProcedure: ImagingProcedure = {
      id: Date.now().toString(),
      modality: "",
      bodyPart: "",
      clinicalIndication: "",
    };
    setProcedures([...procedures, newProcedure]);
  };

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
    setProcedures(
      procedures.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const isFormValid = () => {
    const basicInfoValid =
      patientId &&
      patientName &&
      gender &&
      age &&
      encounterId &&
      physician &&
      department;
    const proceduresValid = procedures.every(
      (p) => p.modality && p.bodyPart && p.clinicalIndication
    );
    return basicInfoValid && proceduresValid;
  };

  const handleSave = () => {
    if (isFormValid()) {
      console.log("Saving order...", {
        patientId,
        patientName,
        gender,
        age,
        encounterId,
        physician,
        department,
        orderDate,
        notes,
        procedures,
        room,
        diagnosis,
      });
    }
  };

  const {
    data: patientData,
    isLoading: isPatientLoading,
    isError: isPatientError,
  } = useGetPatientByCodeQuery(patientId, {
    skip: !patientId,
  });

  const {
    data: roomsData,
    isLoading: isRoomsLoading,
    isError: isRoomsError,
  } = useGetRoomsQuery(
    {},
    {
      skip: !department,
    }
  );

  // get all departments
  const { data: departmentsData, isLoading: isDepartmentsLoading } =
    useGetDepartmentsQuery({});
  const handleCancel = () => {
    // Reset all form fields
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
                    {patientData && (
                      <div className="mt-2 p-2 bg-slate-50 rounded">
                        <div>
                          <b>Name:</b> {patientData.data?.firstName}{" "}
                          {patientData.data?.lastName}
                        </div>
                        <div>
                          <b>Gender:</b> {patientData.data?.gender}
                        </div>
                        <div>
                          <b>Address:</b> {patientData.data?.address}
                        </div>
                        <div>
                          <b>Age:</b>{" "}
                          {calculateAge(patientData.data?.dateOfBirth as Date)}{" "}
                          years
                        </div>

                        {/* Thêm các trường khác nếu cần */}
                      </div>
                    )}
                  </div>
                </div>
                {/* Sau khi nhập patient id sẽ hiển thị thông tin bệnh nhân benh duoi thay vi nhap tay */}
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
                    !patientId ? "border-slate-300" : "border-teal-300"
                  } w-full p-2 border-1 rounded-lg`}
                  state={diagnosis}
                  setState={setDiagnosis}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* <div className="space-y-2">
                  <Label htmlFor="physician" className="text-slate-700 font-medium">
                    Ordering Physician <span className="text-red-500">*</span>
                  </Label>
                  <Select value={physician} onValueChange={setPhysician}>
                    <SelectTrigger className={`${!physician ? 'border-slate-300' : 'border-teal-300'}`}>
                      <SelectValue placeholder="Select physician" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dr-smith">Dr. Sarah Smith</SelectItem>
                      <SelectItem value="dr-jones">Dr. Michael Jones</SelectItem>
                      <SelectItem value="dr-williams">Dr. Emily Williams</SelectItem>
                      <SelectItem value="dr-brown">Dr. James Brown</SelectItem>
                      <SelectItem value="dr-davis">Dr. Lisa Davis</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}
                {/* input diagnosis */}

                {/* select department */}
                <div className="space-y-2">
                  <Label
                    htmlFor="department"
                    className="text-slate-700 font-medium"
                  >
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger
                      className={`${
                        !department ? "border-slate-300" : "border-teal-300"
                      } w-full`}
                    >
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emergency">
                        Emergency Department
                      </SelectItem>
                      {departmentsData?.data.data.map((dept: any) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.departmentName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* select room */}
                <div className="space-y-2">
                  <Label htmlFor="room" className="text-slate-700 font-medium">
                    Performing Location <span className="text-red-500">*</span>
                  </Label>
                  <Select value={room} onValueChange={setRoom}>
                    <SelectTrigger
                      className={`${
                        !room ? "border-slate-300" : "border-teal-300"
                      } w-full`}
                    >
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="room-101">Room 101</SelectItem>
                      <SelectItem value="room-102">Room 102</SelectItem>
                      <SelectItem value="room-103">Room 103</SelectItem>
                      <SelectItem value="room-104">Room 104</SelectItem>
                      <SelectItem value="room-105">Room 105</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes" className="text-slate-700 font-medium">
                    Special Instructions (Optional)
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
                  <div key={procedure.id}>
                    {/* {index > 0 && <Separator className="my-6" />} */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-700">
                          Procedure {index + 1}
                        </h3>
                        {procedures.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProcedure(procedure.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-medium">
                            Modality <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={procedure.modality}
                            onValueChange={(value) =>
                              updateProcedure(procedure.id, "modality", value)
                            }
                          >
                            <SelectTrigger
                              className={`${
                                !procedure.modality
                                  ? "border-slate-300"
                                  : "border-teal-300"
                              } w-full`}
                            >
                              <SelectValue placeholder="Select modality" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="xray">X-Ray</SelectItem>
                              <SelectItem value="ct">CT Scan</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-700 font-medium">
                            Body Part <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={procedure.bodyPart}
                            onValueChange={(value) =>
                              updateProcedure(procedure.id, "bodyPart", value)
                            }
                          >
                            <SelectTrigger
                              className={`${
                                !procedure.bodyPart
                                  ? "border-slate-300"
                                  : "border-teal-300"
                              } w-full`}
                            >
                              <SelectValue placeholder="Select body part" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="head">Head</SelectItem>
                              <SelectItem value="chest">Chest</SelectItem>
                              <SelectItem value="abdomen">Abdomen</SelectItem>
                              <SelectItem value="pelvis">Pelvis</SelectItem>
                              <SelectItem value="cervical-spine">
                                Cervical Spine
                              </SelectItem>
                              <SelectItem value="thoracic-spine">
                                Thoracic Spine
                              </SelectItem>
                              <SelectItem value="lumbar-spine">
                                Lumbar Spine
                              </SelectItem>
                              <SelectItem value="shoulder">Shoulder</SelectItem>
                              <SelectItem value="elbow">Elbow</SelectItem>
                              <SelectItem value="wrist">Wrist</SelectItem>
                              <SelectItem value="hand">Hand</SelectItem>
                              <SelectItem value="hip">Hip</SelectItem>
                              <SelectItem value="knee">Knee</SelectItem>
                              <SelectItem value="ankle">Ankle</SelectItem>
                              <SelectItem value="foot">Foot</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/*  */}
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-medium">
                            Choose Procedure Service
                            <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={procedure.bodyPart}
                            onValueChange={(value) =>
                              updateProcedure(procedure.id, "bodyPart", value)
                            }
                          >
                            <SelectTrigger
                              className={`${
                                !procedure.bodyPart
                                  ? "border-slate-300"
                                  : "border-teal-300"
                              } w-full`}
                            >
                              <SelectValue placeholder="Select body part" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="head">Head</SelectItem>
                              <SelectItem value="chest">Chest</SelectItem>
                              <SelectItem value="abdomen">Abdomen</SelectItem>
                              <SelectItem value="pelvis">Pelvis</SelectItem>
                              <SelectItem value="cervical-spine">
                                Cervical Spine
                              </SelectItem>
                              <SelectItem value="thoracic-spine">
                                Thoracic Spine
                              </SelectItem>
                              <SelectItem value="lumbar-spine">
                                Lumbar Spine
                              </SelectItem>
                              <SelectItem value="shoulder">Shoulder</SelectItem>
                              <SelectItem value="elbow">Elbow</SelectItem>
                              <SelectItem value="wrist">Wrist</SelectItem>
                              <SelectItem value="hand">Hand</SelectItem>
                              <SelectItem value="hip">Hip</SelectItem>
                              <SelectItem value="knee">Knee</SelectItem>
                              <SelectItem value="ankle">Ankle</SelectItem>
                              <SelectItem value="foot">Foot</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2 md:col-span-3">
                          <Label className="text-slate-700 font-medium">
                            Clinical Indication{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            placeholder="Enter clinical reason for this imaging procedure..."
                            value={procedure.clinicalIndication}
                            onChange={(e) =>
                              updateProcedure(
                                procedure.id,
                                "clinicalIndication",
                                e.target.value
                              )
                            }
                            className={`min-h-[80px] ${
                              !procedure.clinicalIndication
                                ? "border-slate-300"
                                : "border-teal-300"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
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
                Save Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
