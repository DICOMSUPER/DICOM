"use client";
import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

import { useGetAllImagingModalityQuery } from "@/store/imagingModalityApi";
import { useGetBodyPartsPaginatedQuery } from "@/store/bodyPartApi";
import { useGetTemplatesByModalityBodyPartMutation } from "@/store/diagnosisReportTeamplateApi";

interface SelectTemplateDialogProps {
    open: boolean;
    onClose: () => void;
    onSelect: (template: any) => void;
}

const SelectTemplateDialog: React.FC<SelectTemplateDialogProps> = ({
    open,
    onClose,
    onSelect,
}) => {
    const [modalityId, setModalityId] = useState<string | null>(null);
    const [bodyPartId, setBodyPartId] = useState<string | null>(null);
    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedPreviewId, setSelectedPreviewId] = useState<string | null>(null);

    // mutation
    const [fetchTemplates, { data, isLoading }] = useGetTemplatesByModalityBodyPartMutation();

    const { data: modalitiesData } = useGetAllImagingModalityQuery();
    const modalities = modalitiesData?.data ?? [];

    const { data: bodyPartsData } = useGetBodyPartsPaginatedQuery();
    const bodyParts = bodyPartsData?.data ?? [];

    useEffect(() => {
        if (modalityId && bodyPartId) fetchTemplates({ modalityId, bodyPartId });
    }, [modalityId, bodyPartId, fetchTemplates]);

    useEffect(() => {
        setTemplates(data?.data ?? []);
    }, [data]);


    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Chọn Template</DialogTitle>
                </DialogHeader>

                {/* Select Modality */}
                <div className="mb-3">
                    <label className="text-sm font-medium">Modality</label>
                    <Select onValueChange={(value) => setModalityId(value)}>
                        <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Chọn modality" />
                        </SelectTrigger>
                        <SelectContent>
                            {modalities.map((m: any) => (
                                <SelectItem key={m.id} value={m.id}>
                                    {m.modalityName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Select Body Part */}
                <div className="mb-3">
                    <label className="text-sm font-medium">Body Part</label>
                    <Select onValueChange={(value) => setBodyPartId(value)}>
                        <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Chọn bộ phận" />
                        </SelectTrigger>
                        <SelectContent>
                            {bodyParts.map((bp: any) => (
                                <SelectItem key={bp.id} value={bp.id}>
                                    {bp.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Template List */}
                {isLoading ? (
                    <p className="text-center py-4 text-gray-500">Đang tải template...</p>
                ) : (
                    <ScrollArea className="max-h-[420px] px-2">
                        <div className="space-y-3">
                            {templates.length === 0 && modalityId && bodyPartId && (
                                <p className="text-gray-500 text-center">
                                    Không tìm thấy template phù hợp
                                </p>
                            )}

                            {templates.map((temp: any) => {
                                const isOpen = selectedPreviewId === temp.id;

                                return (
                                    <div
                                        key={temp.id}
                                        className="border rounded-lg p-2 transition-all"
                                    >
                                        {/* Nút mở preview */}
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between text-left"
                                            onClick={() =>
                                                setSelectedPreviewId(isOpen ? null : temp.id)
                                            }
                                        >
                                            {temp.templateName}
                                            <span>{isOpen ? "▲" : "▼"}</span>
                                        </Button>

                                        {/* Preview mô tả */}
                                        {isOpen && (
                                            <div className="mt-3 space-y-3 p-3 border-t bg-gray-50 rounded-md animate-in fade-in">
                                                {/* description hỗ trợ dạng html / hình ảnh / form */}
                                                <div
                                                    className="prose max-w-none whitespace-pre-line"
                                                    dangerouslySetInnerHTML={{
                                                        __html: (temp.descriptionTemplate || "").replace(/\n/g, "<br/>"),
                                                    }}
                                                />

                                                <Button
                                                    className="w-full"
                                                    onClick={() => {
                                                        onSelect(temp);
                                                        onClose();
                                                    }}
                                                >
                                                    Dùng template này
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default SelectTemplateDialog;
