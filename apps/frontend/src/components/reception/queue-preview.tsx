"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight } from "lucide-react";
import { PriorityLevel } from "@/enums/priority.enum";

interface QueuePatient {
  id: string;
  name: string;
  time: string;
  priority: PriorityLevel;
}

interface QueuePreviewProps {
  patients: QueuePatient[];
  onViewAll: () => void;
}

export function QueuePreview({ patients, onViewAll }: QueuePreviewProps) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Current Queue
        </CardTitle>
        <CardDescription>
          Next patients in line
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {patients.slice(0, 4).map((patient, index) => (
            <div key={patient.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{patient.name}</p>
                  <p className="text-sm text-foreground">Arrived: {patient.time}</p>
                </div>
              </div>
              <Badge 
                variant="secondary" 
                className={
                  patient.priority === PriorityLevel.HIGH ? 'bg-red-100 text-red-800' :
                  patient.priority === PriorityLevel.NORMAL ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }
              >
                {patient.priority}
              </Badge>
            </div>
          ))}
          <div className="pt-2">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={onViewAll}
            >
              View All Patients
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
