import { CheckCircle, AlertCircle, Users } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import React from "react";
import { Services } from "@/interfaces/user/service.interface";
import { Room } from "@/interfaces/user/room.interface";

export default function RoomSelection({
  selectedService,
  isLoadingRoom,
  rooms,
  selectedRoom,
  setSelectedRoom,
}: {
  selectedService?: Services | null;
  isLoadingRoom: boolean;
  rooms: Room[];
  selectedRoom?: Room | null;
  setSelectedRoom: (room: Room | null) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
          3
        </span>
        Select Room
      </label>

      {!selectedService && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please select a service first</AlertDescription>
        </Alert>
      )}

      {isLoadingRoom && (
        <div className="flex items-center gap-2 text-foreground text-sm p-4 border border-border rounded-lg bg-muted/50">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span>Loading rooms...</span>
        </div>
      )}

      {!isLoadingRoom &&
        selectedService &&
        rooms &&
        Array.isArray(rooms) &&
        rooms?.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No rooms available for this service
            </AlertDescription>
          </Alert>
        )}

      {!isLoadingRoom &&
        selectedService &&
        rooms &&
        Array.isArray(rooms) &&
        rooms?.length > 0 && (
          <div className="grid grid-cols-1 gap-3 max-h-[20vh] overflow-y-auto pr-2">
            {rooms.map((room) => {
              const maxCapacity =
                room.roomStats?.maxWaiting || room.capacity || 1;
              const currentOccupancy = room.roomStats?.currentInProgress || 0;
              const utilizationPercent = Math.min(
                (currentOccupancy / maxCapacity) * 100,
                100
              );

              const getUtilizationColor = (percent: number) => {
                if (percent >= 90) return "bg-red-500";
                if (percent >= 70) return "bg-yellow-500";
                if (percent >= 40) return "bg-blue-500";
                return "bg-green-500";
              };

              const getStatusText = (percent: number) => {
                if (percent >= 90) return "Near capacity";
                if (percent >= 70) return "Busy";
                if (percent >= 40) return "Moderate";
                return "Available";
              };

              const isSelected = selectedRoom?.id === room.id;

              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  type="button"
                  className={`p-4 border rounded-lg text-left transition-all hover:shadow-sm ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                      : "border-border bg-background hover:border-primary/20 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-foreground">
                        {room.roomCode}
                      </h3>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">
                        {currentOccupancy}/{maxCapacity}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getUtilizationColor(
                          utilizationPercent
                        )}`}
                        style={{ width: `${utilizationPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">
                        {utilizationPercent.toFixed(0)}% utilized
                      </span>
                      <span
                        className={`font-medium ${
                          utilizationPercent >= 90
                            ? "text-red-500"
                            : utilizationPercent >= 70
                            ? "text-yellow-600"
                            : utilizationPercent >= 40
                            ? "text-blue-500"
                            : "text-green-500"
                        }`}
                      >
                        {getStatusText(utilizationPercent)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
    </div>
  );
}
