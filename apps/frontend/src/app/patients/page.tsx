import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { PatientList } from "@/components/patients/patient-list";
import { PatientFilters } from "@/components/patients/patient-filters";

export default function PatientsPage() {
  return (
    <DashboardLayout
      title="Patients"
      subtitle="Manage and view patient information"
      userRole="Doctor"
      headerActions={
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search patients..."
              className="pl-10 w-[300px]"
            />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        <PatientFilters />
        <PatientList />
      </div>
    </DashboardLayout>
  );
}
