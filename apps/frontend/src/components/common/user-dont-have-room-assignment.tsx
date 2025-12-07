import React from "react";
import { CalendarX, RefreshCw, HelpCircle } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Roles } from "@/enums/user.enum";
export default function UserDontHaveRoomAssignment() {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  const getRouterForRole = (role: string) => {
    switch (role) {
      case Roles.IMAGING_TECHNICIAN:
        return "/imaging-technician/dashboard";

      case Roles.PHYSICIAN:
        return "/physician";
        break;

      case Roles.RADIOLOGIST:
        return "/radiologist";
        break;
      default:
        break;
    }
  };

  //this is meant for roles that includes schedules, like physicians, imaging-technicians, radiologists
  const user = useSelector((state: RootState) => state.auth.user);
  const viewSchedule = () => {
    if (user?.role) {
      router.push(`${getRouterForRole(user.role)}/schedule`);
    }
  };

  return (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <CalendarX className="w-8 h-8 text-amber-600" />
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            No Room Assignment
          </h2>

          <p className="text-gray-600 mb-2">
            You don&apos;t have an active room assignment at this time.
          </p>

          <p className="text-sm text-gray-500 mb-6">
            Please check your schedule or contact your administrator to get
            assigned to a room.
          </p>

          <div className="w-full bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex items-start gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  What to do:
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Check your work schedule</li>
                  <li>• Verify your shift time</li>
                  <li>• Contact your supervisor</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={handleRefresh}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>

            <button
              onClick={() => viewSchedule()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              View Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
