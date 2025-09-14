import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

export function PatientSearch() {
  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-foreground flex items-center">
          <Search className="w-5 h-5 mr-2" />
          Search Existing Patient
        </CardTitle>
        <CardDescription>
          Find patients by name, MRN, phone number, or other criteria
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search Filters */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Search by Name</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter patient name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Medical Record Number</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter MRN"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Phone Number</label>
            <input 
              type="tel" 
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter phone number"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Date of Birth</label>
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button variant="outline" className="border-border">
            Clear
          </Button>
          <Button variant="outline" className="border-border">
            Advanced Search
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}