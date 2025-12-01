import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PatientEncounter } from "@/interfaces/patient/patient-workflow.interface";
import { UserStar, Clock, User, FileText } from "lucide-react";
import { format } from "date-fns";
import { useGetUserByIdQuery } from "@/store/userApi";

interface TransferDetailModalProps {
  encounter: PatientEncounter;
  onClose: () => void;
}

const TransferDetailModal: React.FC<TransferDetailModalProps> = ({
  encounter,
  onClose,
}) => {
  const { data, isLoading } = useGetUserByIdQuery(
    encounter.transferredBy || "",
    { skip: !encounter.transferredBy }
  );
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserStar className="h-5 w-5 text-indigo-600" />
            Transfer Information
          </DialogTitle>
          <DialogDescription>
            Details about the physician transfer for this encounter
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Transfer Notes Section */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-start gap-2 mb-2">
              <FileText className="h-4 w-4 text-slate-600 mt-0.5" />
              <span className="font-semibold text-slate-900 text-sm">
                Transfer Notes
              </span>
            </div>
            <p className="text-slate-700 text-sm ml-6 leading-relaxed">
              {encounter.transferNotes || (
                <span className="text-slate-400 italic">No notes provided</span>
              )}
            </p>
          </div>

          {/* Transferred By Section */}
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
            <div className="flex items-start gap-2 mb-2">
              <User className="h-4 w-4 text-indigo-600 mt-0.5" />
              <span className="font-semibold text-slate-900 text-sm">
                Transferred By
              </span>
            </div>
            <p className="text-slate-700 text-sm ml-6">
              {/* loading */}
              {isLoading ? (
                <span className="text-slate-400 italic">Loading...</span>
              ) : (
                data?.data.firstName + " " + data?.data.lastName || (
                  <span className="text-slate-400 italic">Unknown</span>
                )
              )}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransferDetailModal;
