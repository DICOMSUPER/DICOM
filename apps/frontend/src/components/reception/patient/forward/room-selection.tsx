import { CheckCircle, AlertCircle } from "lucide-react";
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
  // Sort rooms by current queue length (shortest wait first)
  const sortedRooms = [...(rooms || [])].sort((a, b) => {
    const queueA = a.roomStats?.currentInProgress ?? 0;
    const queueB = b.roomStats?.currentInProgress ?? 0;
    return queueA - queueB;
  });

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
          <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2">
            {sortedRooms.map((room) => {
              // Pending patients = total (maxWaiting) - processed (currentInProgress)
              const currentWaiting =
                (room?.roomStats?.maxWaiting ?? 0) -
                (room.roomStats?.currentInProgress ?? 0);
              const currentInProgress = room.roomStats?.currentInProgress ?? 0;
              const maxQueue = room.roomStats?.maxWaiting ?? 0;
              const isNotConfigured = maxQueue === 0;
              const isSelected = selectedRoom?.id === room.id;

              // Calculate queue percentage
              const queuePercent =
                isNotConfigured || maxQueue === 0
                  ? 0
                  : Math.min((currentInProgress / maxQueue) * 100, 100);

              // Determine wait status and bar color based on queue percentage
              const getStatusInfo = (
                percent: number,
                waiting: number,
                notConfigured: boolean
              ) => {
                if (notConfigured) {
                  return { label: "N/A", barColor: "bg-gray-300" };
                }
                if (waiting === 0) {
                  return { label: "Available", barColor: "bg-green-500" };
                }
                if (waiting < 5) {
                  return { label: "Short wait", barColor: "bg-green-500" };
                }
                if (waiting < 10) {
                  return { label: "Moderate wait", barColor: "bg-yellow-500" };
                }
                if (waiting < 15) {
                  return { label: "Long wait", barColor: "bg-orange-500" };
                }
                return { label: "Very long wait", barColor: "bg-red-500" };
              };

              const statusInfo = getStatusInfo(
                queuePercent,
                currentWaiting,
                isNotConfigured
              );
              const isAtCapacity =
                !isNotConfigured && currentWaiting >= maxQueue;

              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  type="button"
                  aria-pressed={isSelected}
                  className={`p-4 border rounded-lg text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 hover:shadow-sm ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                      : isAtCapacity
                      ? "border-red-300 bg-red-50/50 opacity-60 cursor-not-allowed"
                      : "border-border bg-background hover:border-primary/20 hover:bg-muted/50"
                  }`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-semibold text-foreground">
                      {room.roomCode}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          isNotConfigured
                            ? "text-gray-500"
                            : currentWaiting === 0
                            ? "text-green-600"
                            : queuePercent < 40
                            ? "text-green-600"
                            : queuePercent < 70
                            ? "text-yellow-600"
                            : queuePercent < 90
                            ? "text-orange-600"
                            : "text-red-600"
                        }`}
                      >
                        {statusInfo.label}
                      </span>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </div>

                  {/* Queue info */}
                  <div className="mb-2">
                    <span className="text-sm font-medium text-foreground">
                      {currentWaiting}{" "}
                      {currentWaiting === 1 ? "patient" : "patients"} waiting
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>Current queue</span>
                      <span>
                        {isNotConfigured
                          ? "N/A"
                          : `${currentInProgress}/${maxQueue}`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-300 ${statusInfo.barColor}`}
                        style={{
                          width: `${isNotConfigured ? 0 : queuePercent}%`,
                        }}
                      />
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
