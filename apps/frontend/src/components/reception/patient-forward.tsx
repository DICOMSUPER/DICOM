import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PriorityLevel } from "@/enums/patient.enum";
import { Stethoscope, CheckCircle } from "lucide-react";
import { useState, type ChangeEvent } from "react";

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
    id: "doc-1",
    name: "Dr. Smith (Cardiology)",
    roomId: "room-101",
    roomNumber: "101",
    currentQueueNumber: 4,
    maxQueueNumber: 20,
  },
  {
    id: "doc-2",
    name: "Dr. Johnson (Neurology)",
    roomId: "room-202",
    roomNumber: "202",
    currentQueueNumber: 2,
    maxQueueNumber: 15,
  },
  {
    id: "doc-3",
    name: "Dr. Brown (Orthopedics)",
    roomId: "room-303",
    roomNumber: "303",
    currentQueueNumber: 7,
    maxQueueNumber: 25,
  },
  {
    id: "doc-4",
    name: "Dr. Wilson (Emergency)",
    roomId: "room-ER1",
    roomNumber: "ER-1",
    currentQueueNumber: 1,
    maxQueueNumber: 10,
  },
  {
    id: "doc-5",
    name: "Dr. Davis (General Medicine)",
    roomId: "room-404",
    roomNumber: "404",
    currentQueueNumber: 5,
    maxQueueNumber: 30,
  },
];

export function PatientForward({ patientId }: { patientId: string }) {
  const [encounterInfo, setEncounterInfo] = useState({
    patientId: patientId,
    encounterDate: "",
    assignedPhysicianId: "",
    notes: "",
  });

  const [queueInfo, setQueueInfo] = useState({
    encounterId: "",
    priority: PriorityLevel.ROUTINE,
    roomId: "",
    priorityReason: "",
    createdBy: "",
  });

  const onChaneEncounterInfo = (
    field: "patientId" | "encounterDate " | "assignedPhysicianId" | "notes",
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
    value: string | PriorityLevel
  ) => {
    setQueueInfo({ ...queueInfo, [field]: value });
  };

  const onSubmit = async () => {
    //create encounter
    //create queue assignment
  };
  const PriorityLevelArray = [...Object.values(PriorityLevel)];
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
                onChaneEncounterInfo("notes", e.target.value);
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
