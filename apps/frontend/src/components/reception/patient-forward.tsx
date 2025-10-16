import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EncounterType } from "@/enums/patient-workflow.enum";
import { QueuePriorityLevel } from "@/enums/patient.enum";
import {
  useCreatePatientEncounterMutation,
  useDeletePatientEncounterMutation,
} from "@/store/patientEncounterApi";
import {
  useCreateQueueAssignmentMutation,
  useDeleteQueueAssignmentMutation,
} from "@/store/queueAssignmentApi";
import { Stethoscope, CheckCircle } from "lucide-react";
import { useState, type ChangeEvent } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Cookies from "js-cookie";
// const departments = [
//   "Cardiology",
//   "Neurology",
//   "Orthopedics",
//   "Emergency",
//   "General Medicine",
// ];

type Doctor = {
  id: string;
  name: string;
  roomId: string;
  roomNumber: string;
  currentQueueNumber: number;
  maxQueueNumber: number;
};

const doctors: Doctor[] = [
  {
    id: "7b45486b-98e6-41ad-b6df-e044481baf01",
    name: "Dr. Smith (Cardiology)",
    roomId: "a796b684-bdfa-4c32-a123-ab5b5b2ed99c",
    roomNumber: "101",
    currentQueueNumber: 4,
    maxQueueNumber: 20,
  },
  {
    id: "e3ca2304-9fdb-46fe-a467-329ede72b27c",
    name: "Dr. Johnson (Neurology)",
    roomId: "122da68d-5879-463a-88de-62908ee78274",
    roomNumber: "202",
    currentQueueNumber: 2,
    maxQueueNumber: 15,
  },
  {
    id: "a7bbf0be-d824-405c-a183-22ddfc6113f1",
    name: "Dr. Brown (Orthopedics)",
    roomId: "0b27c6eb-f829-46d3-80e4-0d65b7f43e9c",
    roomNumber: "303",
    currentQueueNumber: 7,
    maxQueueNumber: 25,
  },
  {
    id: "693503cf-256e-4423-81af-4f3d0bcb6c61",
    name: "Dr. Wilson (Emergency)",
    roomId: "cf6cff21-63c9-4be1-bf35-9e3ea034deae",
    roomNumber: "ER-1",
    currentQueueNumber: 1,
    maxQueueNumber: 10,
  },
  {
    id: "fc6dd564-eaa0-4075-87b6-24cc3e44ed26",
    name: "Dr. Davis (General Medicine)",
    roomId: "94bd3a86-ca08-4ea0-aa25-451dfa6bc0c9",
    roomNumber: "404",
    currentQueueNumber: 5,
    maxQueueNumber: 30,
  },
];

export function PatientForward({ patientId }: { patientId: string }) {
  const [encounterInfo, setEncounterInfo] = useState({
    patientId: patientId,
    encounterDate: "",
    encounterType: EncounterType.INPATIENT,
    assignedPhysicianId: "",
    notes: "",
  });

  const [queueInfo, setQueueInfo] = useState({
    encounterId: "",
    priority: QueuePriorityLevel.ROUTINE,
    roomId: "",
    priorityReason: "",
    createdBy: "",
  });

  const onChangeEncounterInfo = (
    field:
      | "patientId"
      | "encounterDate "
      | "assignedPhysicianId"
      | "notes"
      | "encounterType",
    value: string
  ) => {
    setEncounterInfo({ ...encounterInfo, [field]: value });
  };

  const onChangeQueueInfo = (
    field:
      | "encounterId"
      | "priority"
      | "roomId"
      | "priorityReason"
      | "createdBy",
    value: string | QueuePriorityLevel
  ) => {
    setQueueInfo({ ...queueInfo, [field]: value });
  };
  const [createEncounter] = useCreatePatientEncounterMutation();
  const [createQueueAssignment] = useCreateQueueAssignmentMutation();
  const [deleteEncounter] = useDeletePatientEncounterMutation();
  const [deleteQueueAssignment] = useDeleteQueueAssignmentMutation();
  const onSubmit = async () => {
    let encounter;
    let queue;
    try {
      const encounterData = {
        ...encounterInfo,
        encounterDate: new Date().toISOString(),
      };
      encounter = await createEncounter(encounterData).unwrap();

      if (encounter) {
        const userRaw = Cookies.get("user");
        const user = userRaw ? JSON.parse(userRaw) : null;
        if (!user) throw new Error("User session not found");

        const queueData = {
          ...queueInfo,
          encounterId: encounter?.id,
          createdBy: user.id,
        };

        queue = await createQueueAssignment(queueData).unwrap();
      }
    } catch (err: any) {
      if (encounter && encounter.id) await deleteEncounter(encounter.id);
      if (queue && queue.id) await deleteQueueAssignment(queue.id);
      window.alert("Internal server error");
    }
  };
  const PriorityLevelArray = [...Object.values(QueuePriorityLevel)];
  const EncounterTypeArray = [...Object.values(EncounterType)];
  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-foreground flex items-center">
          <Stethoscope className="w-5 h-5 mr-2" />
          Forward Patient
        </CardTitle>
        <CardDescription>
          Quick selection of specialty or physician
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Select Department</label>
            <select className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
              {departments.map(dept => (
                <option key={dept}>{dept}</option>
              ))}
            </select>
          </div> */}

          <div className="space-y-2 h-[50vh] overflow-y-auto">
            <label className="text-sm font-medium text-foreground">
              Select Physician:
            </label>
            <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
              {doctors.map((doctor) => {
                const isSelected =
                  encounterInfo.assignedPhysicianId === doctor.id;
                const queuePercentage =
                  (doctor.currentQueueNumber / doctor.maxQueueNumber) * 100;

                return (
                  <button
                    key={doctor.id}
                    onClick={() => {
                      setEncounterInfo({
                        ...encounterInfo,
                        assignedPhysicianId: doctor.id,
                      });
                      setQueueInfo({
                        ...queueInfo,
                        roomId: doctor.roomId,
                      });
                    }}
                    type="button"
                    aria-pressed={isSelected}
                    className={`p-4 border rounded-lg text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 hover:shadow-sm ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                        : "border-border bg-background hover:border-muted"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {doctor.name}
                      </h3>
                      <span className="text-xs md:text-sm font-medium px-2 py-1 rounded-md border bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-400/20">
                        Room {doctor.roomNumber}
                      </span>
                    </div>
                    <div className="flex justify-between items-end text-sm">
                      <div>
                        <span className="text-muted-foreground">Current: </span>
                        <span className="font-semibold text-foreground">
                          {doctor.currentQueueNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Max: </span>
                        <span className="font-semibold text-foreground">
                          {doctor.maxQueueNumber}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-muted/60 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          queuePercentage > 80
                            ? "bg-red-500"
                            : queuePercentage > 50
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${queuePercentage}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Encounter Type
            </label>
            <div className="flex items-center space-x-2 max-w-[30vw] overflow-x-auto whitespace-nowrap snap-x snap-mandatory pb-1">
              {EncounterTypeArray &&
                EncounterTypeArray.map((type) => (
                  <Button
                    key={type}
                    type="button"
                    aria-pressed={encounterInfo.encounterType === type}
                    size="sm"
                    className={`shrink-0 snap-start ${
                      encounterInfo.encounterType === type
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    }`}
                    variant={
                      encounterInfo.encounterType === type
                        ? "default"
                        : "outline"
                    }
                    onClick={() => {
                      onChangeEncounterInfo("encounterType", type);
                    }}
                  >
                    {type}
                  </Button>
                ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Priority Level
            </label>
            <div className="flex items-center space-x-2 max-w-[30vw] overflow-x-auto whitespace-nowrap snap-x snap-mandatory pb-1">
              {PriorityLevelArray &&
                PriorityLevelArray.map((level) => (
                  <Button
                    key={level}
                    type="button"
                    aria-pressed={queueInfo.priority === level}
                    size="sm"
                    className={`shrink-0 snap-start ${
                      queueInfo.priority === level
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    }`}
                    variant={
                      queueInfo.priority === level ? "default" : "outline"
                    }
                    onClick={() => {
                      onChangeQueueInfo("priority", level);
                    }}
                  >
                    {level}
                  </Button>
                ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Notes (Optional)
            </label>
            <textarea
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                onChangeEncounterInfo("notes", e.target.value);
              }}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Add any symptoms or intake notes..."
            />
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={onSubmit}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Forward Patient
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
