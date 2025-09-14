import { Button } from "@/components/ui/button";
import { Clock, Users, UserPlus } from "lucide-react";

export function QuickActionsBar() {
  return (
    <div className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
      <div className="flex items-center space-x-4">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <UserPlus className="w-4 h-4 mr-2" />
          Register New Patient
        </Button>
        <Button variant="outline" className="border-border">
          <Users className="w-4 h-4 mr-2" />
          Bulk Import
        </Button>
      </div>
      <div className="flex items-center space-x-2 text-sm text-foreground">
        <Clock className="w-4 h-4" />
        <span>Last updated: 2 minutes ago</span>
      </div>
    </div>
  );
}