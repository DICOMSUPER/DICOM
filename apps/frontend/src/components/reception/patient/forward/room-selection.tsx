import { CheckCircle, AlertCircle, Users } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import React from "react";
import { Services } from "@/common/interfaces/user/service.interface";
import { Room } from "@/common/interfaces/user/room.interface";

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
    <div className="flex flex-col gap-2">
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
          <div className="grid grid-cols-1 gap-3 max-h-[20vh] overflow-y-auto">
            {rooms.map((room) => {
              const maxQueue = room.roomStats?.maxWaiting ?? 1;
              const currentInProgress = room.roomStats?.currentInProgress ?? 0;

              // Fixed calculation: if current is 0 and max is 0, show 100%
              const busyPercent =
                maxQueue === 0
                  ? 0
                  : Math.max(
                      Math.min((currentInProgress / maxQueue) * 100, 100),
                      0
                    );

              const getAvailabilityColor = (percent: number) => {
                if (percent >= 70) return "bg-green-500";
                if (percent >= 40) return "bg-yellow-500";
                if (percent >= 20) return "bg-orange-500";
                return "bg-red-500";
              };

              const getAvailabilityText = (percent: number) => {
                if (percent >= 70) return "Available";
                if (percent >= 40) return "Moderate wait";
                if (percent >= 20) return "Busy";
                return "Very busy";
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
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-foreground">
                        {room.roomCode}
                      </h3>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-foreground">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">
                        {currentInProgress}/{maxQueue} waiting
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-3">
                    <p className="text-xs text-gray-600">Room availability</p>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getAvailabilityColor(
                          busyPercent
                        )}`}
                        style={{ width: `${busyPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-foreground font-medium">
                        {busyPercent.toFixed(0)}% completed
                      </span>
                      <span
                        className={`font-medium ${
                          busyPercent >= 70
                            ? "text-green-600"
                            : busyPercent >= 40
                            ? "text-yellow-600"
                            : busyPercent >= 20
                            ? "text-orange-600"
                            : "text-red-600"
                        }`}
                      >
                        {getAvailabilityText(busyPercent)}
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
