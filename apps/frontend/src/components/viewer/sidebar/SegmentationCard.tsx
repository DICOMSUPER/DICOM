import React from "react";
import {
    Database,
    Edit3,
    Eye,
    EyeOff,
    Info,
    Layers,
    Save,
    Trash2,
    Calendar,
    Image as ImageIcon,
    MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SegmentationLayerData } from "@/common/contexts/ViewerContext";
import { AnnotationStatus } from "@/common/enums/image-dicom.enum";
import { AnnotationColorPicker } from "./AnnotationColorPicker";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CheckCircle2, FileCheck, Lock, ShieldCheck } from "lucide-react";
import { Roles } from "@/common/enums/user.enum";
import { formatDate } from "@/common/utils/annotationUtils";

interface SegmentationCardProps {
    layer: SegmentationLayerData;
    isSelected: boolean;
    isVisible: boolean;
    status: AnnotationStatus;
    color: string;
    isLocked: boolean;
    colorPickerOpen: boolean;
    tempColor: string;
    onSelect: (layerId: string) => void;
    onEdit: (layer: SegmentationLayerData) => void;
    onToggleVisibility: (layerId: string) => void;
    onSave: (layerId: string) => void;
    onInfo: (layer: SegmentationLayerData) => void;
    onDelete: (layer: SegmentationLayerData) => void;
    onColorPickerOpen: (id: string, color: string) => void;
    onColorPickerClose: () => void;
    onColorChange: (id: string) => void;
    onTempColorChange: (color: string) => void;
    onLockToggle: (id: string, locked: boolean) => void;
    onStatusChange: (layerId: string, status: AnnotationStatus) => void;
    userRole?: string;
}

const getStatusColorClasses = (status: AnnotationStatus | undefined, isHighlight: boolean) => {
    if (!status) {
        return {
            dot: isHighlight ? "bg-blue-400" : "bg-slate-400",
            text: "text-slate-400",
            label: "Local",
            border: "border-slate-500",
            bg: "bg-slate-500/10"
        };
    }
    if (status === AnnotationStatus.FINAL) {
        return {
            dot: "bg-emerald-400",
            text: "text-emerald-400",
            label: "Final",
            border: "border-emerald-500/50",
            bg: "bg-emerald-500/10"
        };
    }
    if (status === AnnotationStatus.DRAFT) {
        return {
            dot: "bg-amber-400",
            text: "text-amber-400",
            label: "Draft",
            border: "border-amber-500/50",
            bg: "bg-amber-500/10"
        };
    }
    if (status === AnnotationStatus.REVIEWED) {
        return {
            dot: "bg-blue-400",
            text: "text-blue-400",
            label: "Reviewed",
            border: "border-blue-500/50",
            bg: "bg-blue-500/10"
        };
    }
    return {
        dot: isHighlight ? "bg-blue-400" : "bg-slate-400",
        text: isHighlight ? "text-blue-400" : "text-slate-400",
        label: "Local",
        border: "border-slate-500",
        bg: "bg-slate-500/10"
    };
};

export const SegmentationCard = React.memo(({
    layer,
    isSelected,
    isVisible,
    status,
    color,
    isLocked,
    colorPickerOpen,
    tempColor,
    onSelect,
    onEdit,
    onToggleVisibility,
    onSave,
    onInfo,
    onDelete,
    onColorPickerOpen,
    onColorPickerClose,
    onColorChange,
    onTempColorChange,
    onLockToggle,
    onStatusChange,
    userRole,
}: SegmentationCardProps) => {
    const layerId = layer.metadata.id;
    const isFromDatabase = layer.metadata.origin === "database";
    const statusColors = getStatusColorClasses(status, isSelected);

    // Permission Logic
    const isPhysician = userRole === Roles.PHYSICIAN;
    const canMarkAsFinal = !isFromDatabase || status === AnnotationStatus.DRAFT;
    const canMarkAsReviewed = isPhysician && status === AnnotationStatus.FINAL;
    const canChangeToDraft = false; // FINAL items can never be changed back to draft

    const isReadOnly = status === AnnotationStatus.REVIEWED;
    const isEditDeleteDisabled = isReadOnly || status === AnnotationStatus.FINAL;

    return (
        <div
            onClick={() => onSelect(layerId)}
            className={`rounded-lg border-l-4 p-3 transition-all cursor-pointer relative group ${isSelected
                ? "bg-blue-900/40 border-blue-400 shadow-lg ring-1 ring-blue-500/30"
                : "bg-slate-900/50 hover:bg-slate-900/80 border-slate-700"
                }`}
            style={{
                borderLeftColor: isSelected ? "#3b82f6" : "#64748b",
                borderLeftWidth: isSelected ? "6px" : "4px",
            }}
        >
            {/* Header: Name and Status */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div
                        className="h-3 w-3 rounded-full shrink-0 border border-slate-600 shadow-sm"
                        style={{ backgroundColor: isSelected ? "#3b82f6" : color }}
                    />
                    <span className="text-sm font-semibold text-slate-100 truncate">
                        {layer.metadata.name || `Layer ${layerId.slice(0, 8)}`}
                    </span>
                    {isFromDatabase && (
                        <div className="bg-emerald-900/30 p-0.5 rounded">
                            <Database className="h-3 w-3 text-emerald-400" />
                        </div>
                    )}
                </div>

                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusColors.bg} ${statusColors.border} ${statusColors.text}`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${statusColors.dot}`} />
                    {statusColors.label}
                </div>
            </div>

            {/* Body: Metadata (Notes, Date, Snapshots) */}
            <div className="space-y-1.5 mb-3 pl-5">
                {layer.metadata.notes && (
                    <p className="text-xs text-slate-400 line-clamp-2 italic">
                        {layer.metadata.notes}
                    </p>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                    {/* Instance Info */}
                    {layer.metadata.instanceId && (
                        <div className="flex items-center gap-1.5">
                            <ImageIcon className="h-3 w-3" />
                            <span>
                                {layer.metadata.instanceId.slice(0, 8)}...
                            </span>
                        </div>
                    )}

                    {/* Date */}
                    {layer.metadata.createdAt && (
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(new Date(layer.metadata.createdAt).toISOString())}</span>
                        </div>
                    )}

                    {/* Snapshots */}
                    <div className="flex items-center gap-1.5">
                        <Layers className="h-3 w-3" />
                        <span>{layer.snapshots?.length || 0} snapshots</span>
                    </div>
                </div>
            </div>

            {/* Footer: Action Icons Row */}
            <div className="flex items-center justify-between border-t border-slate-800/50 pt-2 mt-1">
                {/* Left Group: Visibility & Lock */}
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-slate-800 text-slate-400 hover:text-white"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleVisibility(layerId);
                        }}
                        title={isVisible ? "Hide layer" : "Show layer"}
                    >
                        {isVisible ? (
                            <Eye className="h-3.5 w-3.5 text-blue-400" />
                        ) : (
                            <EyeOff className="h-3.5 w-3.5" />
                        )}
                    </Button>

                    {!isEditDeleteDisabled && !isFromDatabase && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-slate-800 text-slate-400 hover:text-white"
                            onClick={(e) => {
                                e.stopPropagation();
                                onLockToggle(layerId, !isLocked);
                            }}
                            title={isLocked ? "Unlock layer" : "Lock layer"}
                        >
                            <Lock className={`h-3.5 w-3.5 ${isLocked ? "text-red-400" : ""}`} />
                        </Button>
                    )}

                    {(isReadOnly || status === AnnotationStatus.FINAL) && (
                        <div className="h-7 w-7 flex items-center justify-center cursor-help" title={isReadOnly ? "Read-only (Reviewed)" : "Protected (Final)"}>
                            <Lock className={`h-3.5 w-3.5 ${isReadOnly ? "text-emerald-500" : "text-blue-500"}`} />
                        </div>
                    )}
                </div>

                {/* Right Group: Actions */}
                <div className="flex items-center gap-1">
                    {!isEditDeleteDisabled && (
                        <AnnotationColorPicker
                            annotationId={layerId}
                            currentColor={color}
                            isOpen={colorPickerOpen}
                            tempColor={tempColor}
                            onOpen={onColorPickerOpen}
                            onClose={onColorPickerClose}
                            onColorChange={onColorChange}
                            onTempColorChange={onTempColorChange}
                        />
                    )}

                    {!isEditDeleteDisabled && isFromDatabase && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-slate-800 text-slate-400 hover:text-white"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(layer);
                            }}
                            title="Edit metadata"
                        >
                            <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                    )}

                    {!isFromDatabase && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-slate-800 text-teal-500 hover:text-teal-400"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSave(layerId);
                            }}
                            title="Save to database"
                        >
                            <Save className="h-3.5 w-3.5" />
                        </Button>
                    )}

                    {isFromDatabase && (canMarkAsFinal || canMarkAsReviewed || canChangeToDraft) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 hover:bg-slate-800 text-slate-400 hover:text-white"
                                    onClick={(e) => e.stopPropagation()}
                                    title="Change Status"
                                >
                                    <FileCheck className="h-3.5 w-3.5 text-emerald-500" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-slate-900 border-slate-700 text-slate-200" align="end">
                                {canMarkAsFinal && (
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onStatusChange(layerId, AnnotationStatus.FINAL);
                                        }}
                                        className="text-slate-200 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white cursor-pointer transition-colors gap-2"
                                    >
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                        Mark as Final
                                    </DropdownMenuItem>
                                )}
                                {canMarkAsReviewed && (
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onStatusChange(layerId, AnnotationStatus.REVIEWED);
                                        }}
                                        className="text-slate-200 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white cursor-pointer transition-colors gap-2"
                                    >
                                        <ShieldCheck className="h-4 w-4 text-blue-400" />
                                        Mark as Reviewed
                                    </DropdownMenuItem>
                                )}
                                {canChangeToDraft && (
                                    <>
                                        <DropdownMenuSeparator className="bg-slate-700" />
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onStatusChange(layerId, AnnotationStatus.DRAFT);
                                            }}
                                            className="text-slate-200 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white cursor-pointer transition-colors gap-2"
                                        >
                                            <FileCheck className="h-4 w-4 text-amber-400" />
                                            Change to Draft
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-slate-800 text-slate-400 hover:text-white"
                        onClick={(e) => {
                            e.stopPropagation();
                            onInfo(layer);
                        }}
                        title="Info"
                    >
                        <Info className="h-3.5 w-3.5" />
                    </Button>

                    {!isEditDeleteDisabled && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-slate-800 text-slate-400 hover:text-red-400"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(layer);
                            }}
                            title="Delete"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
});
