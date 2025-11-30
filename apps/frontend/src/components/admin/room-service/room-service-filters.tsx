"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";
import { Room } from "@/interfaces/user/room.interface";
import { Services } from "@/interfaces/user/service.interface";

interface RoomServiceFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  roomFilter: string;
  onRoomChange: (value: string) => void;
  serviceFilter: string;
  onServiceChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  rooms?: Room[];
  services?: Services[];
  onSearch?: () => void;
  onReset?: () => void;
  isSearching?: boolean;
  className?: string;
}

export function RoomServiceFilters({
  searchTerm,
  onSearchChange,
  roomFilter,
  onRoomChange,
  serviceFilter,
  onServiceChange,
  statusFilter,
  onStatusChange,
  rooms = [],
  services = [],
  onSearch,
  onReset,
  isSearching = false,
  className = "",
}: RoomServiceFiltersProps) {
  const hasActiveFilters = searchTerm || roomFilter !== 'all' || serviceFilter !== 'all' || statusFilter !== 'all';

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  return (
    <div className={`border-border mb-6 ${className}`}>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground h-4 w-4" />
            <Input
              placeholder="Search by room code, service name..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          {onSearch && (
            <Button 
              onClick={onSearch} 
              disabled={isSearching}
              className="h-9 px-4"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Select value={roomFilter} onValueChange={onRoomChange}>
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder="Room" />
            </SelectTrigger>
            <SelectContent className="border-border">
              <SelectItem value="all">All Rooms</SelectItem>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.roomCode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={serviceFilter} onValueChange={onServiceChange}>
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder="Service" />
            </SelectTrigger>
            <SelectContent className="border-border">
              <SelectItem value="all">All Services</SelectItem>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.serviceName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="border-border">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {onReset && (
            <Button variant="outline" onClick={onReset} className="whitespace-nowrap h-9 px-4">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

