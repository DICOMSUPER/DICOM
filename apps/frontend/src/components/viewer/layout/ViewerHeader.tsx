"use client";
import {
  Layers,
  User,
  ChevronUp,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useRouter } from "next/navigation";

interface ViewerHeaderProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  loading?: boolean;
  onRefresh?: () => void;
}

export default function ViewerHeader({
  isCollapsed = false,
  onToggleCollapse,
  loading = false,
  onRefresh,
}: ViewerHeaderProps) {
  const router = useRouter();

  const handleUserProfile = () => {
    router.push('/profile');
  };

  return (
    <TooltipProvider>
      <div className={`bg-linear-to-r from-slate-900 via-slate-850 to-slate-900 border-b-2 border-teal-900/40 flex justify-between items-center px-5 py-1 gap-4 overflow-hidden transition-all duration-300 shadow-xl ${
        isCollapsed ? 'h-0 border-0' : 'h-[5vh]'
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

          {onRefresh && (
            <RefreshButton
              onRefresh={onRefresh}
              loading={loading}
              showText={true}
              variant="ghost"
              size="sm"
              className="bg-teal-900/30 hover:bg-teal-800/50 text-teal-300 h-10 border border-teal-700/30 hover:border-teal-600/50 transition-all"
            />
          )}

          {/* User - Medical Profile */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleUserProfile}
                className="h-10 w-10 p-0 text-slate-400 hover:bg-teal-900/30 hover:text-teal-300 transition-all rounded-lg border border-transparent hover:border-teal-700/30"
              >
                <User className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-800 border-teal-700">Hồ sơ người dùng</TooltipContent>
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
            <TooltipContent className="bg-slate-800 border-teal-700">{isCollapsed ? 'Hiện header' : 'Ẩn header'}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}

