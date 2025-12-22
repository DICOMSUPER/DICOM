"use client";
import React from "react";
import {
  Layers,
  Home,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Roles } from "@/common/enums/user.enum";

interface ViewerHeaderProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const ViewerHeader = React.memo(({
  isCollapsed = false,
  onToggleCollapse,
}: ViewerHeaderProps) => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleGoHome = () => {
    if (!user?.role) {
      router.push('/');
      return;
    }

    // Navigate to role-specific dashboard (matching login redirect routes)
    switch (user.role) {
      case Roles.SYSTEM_ADMIN:
        router.push('/admin/dashboard');
        break;
      case Roles.IMAGING_TECHNICIAN:
        router.push('/imaging-technician/dashboard');
        break;
      case Roles.RADIOLOGIST:
        router.push('/radiologist/work-tree');
        break;
      case Roles.RECEPTION_STAFF:
        router.push('/reception/dashboard');
        break;
      case Roles.PHYSICIAN:
        router.push('/physician/dashboard');
        break;
      default:
        router.push('/');
    }
  };

  return (
    <TooltipProvider>
      <div className={`bg-linear-to-r from-slate-900 via-slate-850 to-slate-900 border-b-2 border-teal-900/40 flex justify-between items-center px-5 py-1 gap-4 overflow-hidden transition-all duration-300 shadow-xl ${isCollapsed ? 'h-0 border-0' : 'h-[5vh]'
        }`}>
        {/* Medical Branding */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-linear-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg border border-teal-400/30 relative">
            <Layers className="h-4 w-4 text-white" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
          </div>
          <div>
            <span className="text-teal-100 font-bold text-lg tracking-wide">DICOM Viewer</span>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Home Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoHome}
                className="h-10 w-10 p-0 text-slate-400 hover:bg-teal-900/30 hover:text-teal-300 transition-all rounded-lg border border-transparent hover:border-teal-700/30"
              >
                <Home className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-800 border-teal-700">Go to Home</TooltipContent>
          </Tooltip>

          {/* Elegant Divider */}
          <div className="h-10 w-px bg-linear-to-b from-transparent via-teal-700/50 to-transparent" />

          {/* Toggle Header Button with Medical Style */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="h-10 w-10 p-0 text-slate-400 hover:bg-teal-900/30 hover:text-teal-300 transition-all rounded-lg border border-transparent hover:border-teal-700/30"
              >
                {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-800 border-teal-700">{isCollapsed ? 'Show header' : 'Hide header'}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
});

export default ViewerHeader;

