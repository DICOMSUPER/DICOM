import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Loader2, UserCheck, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useTransferPatientEncounterMutation, useUpdatePatientEncounterMutation } from "@/store/patientEncounterApi";
import { EmployeeRoomAssignment } from "@/common/interfaces/user/employee-room-assignment.interface";

interface ModalTransferPhysicianProps {
  open: boolean;
  onClose: () => void;
  encounterId: string;
  availablePhysicians?: EmployeeRoomAssignment[];
}

const ModalTransferPhysician = ({
  open,
  onClose,
  encounterId,
  availablePhysicians,
}: ModalTransferPhysicianProps) => {
  const [selectedPhysicianId, setSelectedPhysicianId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [updateEncounter, { isLoading: isTransferring }] =
    useTransferPatientEncounterMutation();

  const handleTransfer = async () => {
    if (!selectedPhysicianId) {
      toast.error("Please select a physician");
      return;
    }
    try {
      await updateEncounter({
        id: encounterId,
        data: {
          assignedPhysicianId: selectedPhysicianId,
          isTransferred: true,
          transferNotes: notes,
        },
      }).unwrap();
      toast.success("Patient transferred successfully");
      onClose();
      resetForm();
    } catch (error: any) {
      console.error("Transfer failed:", error);
      toast.error(error?.data?.message || "Failed to transfer patient");
    }
  };

  const resetForm = () => {
    setSelectedPhysicianId("");
    setNotes("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:max-w-[500px]"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              Transfer Patient
            </DialogTitle>
          </div>
          <DialogDescription>
            Transfer this patient encounter to another physician
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="physician" className="text-sm font-semibold">
              Transfer to Physician In Room *
            </Label>
            <Select
              value={selectedPhysicianId}
              onValueChange={setSelectedPhysicianId}
              disabled={isTransferring}
            >
              <SelectTrigger
                id="physician"
                className="w-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
              >
                <SelectValue placeholder="Select a physician" />
              </SelectTrigger>
              <SelectContent>
                {isTransferring ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span className="ml-2 text-sm text-slate-500">
                      Loading physicians...
                    </span>
                  </div>
                ) : availablePhysicians?.length === 0 ? (
                  <div className="py-4 text-center text-sm text-slate-500">
                    No available physicians
                  </div>
                ) : (
                  availablePhysicians?.map(
                    (employeeAssignInRoom: EmployeeRoomAssignment) => (
                      <SelectItem
                        key={employeeAssignInRoom.id}
                        value={employeeAssignInRoom.id}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {employeeAssignInRoom?.employee?.firstName}{" "}
                            {employeeAssignInRoom?.employee?.lastName}
                          </span>
                          {employeeAssignInRoom?.employee?.employeeId && (
                            <span className="text-xs text-slate-500">
                              ID: {employeeAssignInRoom?.employee.employeeId}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    )
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Transfer Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold">
              Transfer Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any notes or reasons for transfer..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              disabled={isTransferring}
              className="resize-none border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
            <p className="text-xs text-slate-500">
              {notes.length}/500 characters
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isTransferring}
            className="border-slate-300 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={isTransferring || !selectedPhysicianId}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isTransferring ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Transferring...
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Transfer Patient
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalTransferPhysician;
