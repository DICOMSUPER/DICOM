"use client";
import { useState } from "react";
import { 
  Layers, 
  User,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { RefreshButton } from "@/components/ui/refresh-button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import UnifiedToolbar from "@/components/viewer/toolbar/UnifiedToolbar";

interface ViewerHeaderProps {
  selectedTool: string;
  onToolSelect: (toolId: string) => void;
  autoOpen: boolean;
  onAutoOpenChange: (checked: boolean) => void;
  onDeleteStudy?: () => void;
  layout?: string;
  onLayoutChange?: (layout: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  loading?: boolean;
  onRefresh?: () => void;
}

export default function ViewerHeader({
  selectedTool,
  onToolSelect,
  autoOpen,
  onAutoOpenChange,
  onDeleteStudy,
  layout = "1x1",
  onLayoutChange,
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
      <div className={`bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b-2 border-teal-900/40 flex items-center px-5 gap-4 overflow-hidden transition-all duration-300 shadow-xl ${
        isCollapsed ? 'h-0 border-0' : 'h-full'
      }`}>
        {/* Medical Branding */}
        <div className="flex items-center gap-3 mr-2">
          <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg border-2 border-teal-400/30 relative">
            <Layers className="h-6 w-6 text-white" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
          </div>
          <div>
            <span className="text-teal-100 font-bold text-lg tracking-wide">DICOM Viewer</span>
            <div className="text-teal-400/70 text-[10px] font-semibold tracking-wider">MEDICAL IMAGING</div>
          </div>
        </div>

        {/* Elegant Divider */}
        <div className="h-10 w-px bg-gradient-to-b from-transparent via-teal-700/50 to-transparent" />

        {/* Unified Toolbar */}
        <UnifiedToolbar
          selectedTool={selectedTool}
          onToolSelect={onToolSelect}
          layout={layout}
          onLayoutChange={onLayoutChange}
          onDeleteStudy={onDeleteStudy}
          onRefresh={onRefresh}
          loading={loading}
        />

        {/* Elegant Divider */}
        <div className="h-10 w-px bg-gradient-to-b from-transparent via-teal-700/50 to-transparent" />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">

          {/* Refresh Data - Medical Style */}
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

          {/* Delete Study - Medical Alert Style */}
          <Button
            onClick={onDeleteStudy}
            size="sm"
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white h-10 shadow-lg shadow-red-500/30 border border-red-400/30 transition-all"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa Study
          </Button>

          {/* Auto Open with Medical Theme */}
          <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-teal-700/30 transition-all cursor-pointer">
            <Checkbox
              id="autoOpen"
              checked={autoOpen}
              onCheckedChange={onAutoOpenChange}
              className="rounded border-teal-600 data-[state=checked]:bg-teal-600"
            />
            <Label htmlFor="autoOpen" className="text-teal-200 text-sm font-medium cursor-pointer">
              Tự động mở
            </Label>
          </div>

          {/* Elegant Divider */}
          <div className="h-10 w-px bg-gradient-to-b from-transparent via-teal-700/50 to-transparent" />

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
          <div className="h-10 w-px bg-gradient-to-b from-transparent via-teal-700/50 to-transparent" />

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

