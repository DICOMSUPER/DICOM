import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  mrn: string;
  waitTime: string;
  isUrgent?: boolean;
  initials: string;
}

const patients: Patient[] = [
  {
    id: "1",
    name: "John Doe",
    mrn: "2024001",
    waitTime: "45 min wait",
    isUrgent: true,
    initials: "JD"
  },
  {
    id: "2",
    name: "Sarah Miller",
    mrn: "2024002",
    waitTime: "15 min wait",
    initials: "SM"
  },
  {
    id: "3",
    name: "Robert Johnson",
    mrn: "2024003",
    waitTime: "5 min wait",
    initials: "RJ"
  }
];

export function WaitingQueue() {
  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-foreground flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Waiting Queue
        </CardTitle>
        <CardDescription>
          Real-time patient status monitoring
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {patients.map(patient => (
            <div 
              key={patient.id}
              className={`flex items-center justify-between p-3 border rounded-lg ${
                patient.isUrgent 
                  ? "border-red-200 bg-red-50" 
                  : "border-border"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 min-w-8 rounded-full flex items-center justify-center shrink-0 ${
                  patient.isUrgent 
                    ? "bg-red-100" 
                    : patient.id === "2" 
                    ? "bg-primary/10" 
                    : "bg-secondary/10"
                }`}>
                  {patient.isUrgent ? (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  ) : (
                    <span className={`font-semibold text-sm ${
                      patient.id === "2" 
                        ? "text-primary" 
                        : "text-secondary"
                    }`}>
                      {patient.initials}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-medium text-foreground">{patient.name}</div>
                  <div className="text-sm text-foreground">MRN: {patient.mrn} | {patient.waitTime}</div>
                </div>
              </div>
              <div className="flex space-x-2">
                {patient.isUrgent ? (
                  <Badge className="bg-red-500 text-white">Urgent</Badge>
                ) : (
                  <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                    Regular
                  </Badge>
                )}
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Forward
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}