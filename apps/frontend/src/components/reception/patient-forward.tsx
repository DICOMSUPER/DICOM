import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Stethoscope, CheckCircle } from "lucide-react";

const departments = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Emergency",
  "General Medicine",
];

const doctors = [
  "Dr. Smith (Cardiology)",
  "Dr. Johnson (Neurology)",
  "Dr. Brown (Orthopedics)",
  "Dr. Wilson (Emergency)",
  "Dr. Davis (General Medicine)",
];

export function PatientForward() {
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Select Physician
            </label>
            <select className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
              {doctors.map((doctor) => (
                <option key={doctor}>{doctor}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Priority Level
            </label>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="border-border">
                Low
              </Button>
              <Button variant="outline" size="sm" className="border-border">
                Medium
              </Button>
              <Button
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                High
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Notes (Optional)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Add any symptoms or intake notes..."
            />
          </div>

          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            <CheckCircle className="w-4 h-4 mr-2" />
            Forward Patient
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
