"use client";

import { Button } from "@/components/ui/button";
import { 
  Search,
  UserPlus,
  Filter,
  CalendarDays,
  Download
} from "lucide-react";
import { useState } from "react";

export function PatientToolbar() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 gap-4">
      {/* Left - Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Search patients..."
          />
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearchQuery("")}
            >
              ✕
            </Button>
          )}
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" className="border-border">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
        <Button variant="outline" size="sm" className="border-border">
          <CalendarDays className="w-4 h-4 mr-2" />
          Schedule
        </Button>
        <Button variant="outline" size="sm" className="border-border">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <UserPlus className="w-4 h-4 mr-2" />
          New Patient
        </Button>
      </div>
    </div>
  );
}