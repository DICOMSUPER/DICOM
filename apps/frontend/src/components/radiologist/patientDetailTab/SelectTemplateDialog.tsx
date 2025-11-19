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

    // Hook mutation
    const [fetchTemplates, { data, isLoading }] = useGetTemplatesByModalityBodyPartMutation();

    // GET list modalities
    const { data: modalitiesData } = useGetAllImagingModalityQuery();
    const modalities = modalitiesData?.data ?? [];

    // GET list body parts
    const { data: bodyPartsData } = useGetBodyPartsPaginatedQuery();
    const bodyParts = bodyPartsData?.data ?? [];

    // Auto fetch templates khi modality + bodyPart thay đổi
    useEffect(() => {
        if (modalityId && bodyPartId) {
            fetchTemplates({ modalityId, bodyPartId });
        }
    }, [modalityId, bodyPartId, fetchTemplates]);

    // Update templates state khi có data
    useEffect(() => {
        if (data?.data) {
            setTemplates(data.data);
        } else {
            setTemplates([]);
        }
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

                {/* Template list */}
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

                            {templates.map((temp: any) => (
                                <Button
                                    key={temp.id}
                                    variant="outline"
                                    className="w-full justify-start text-left"
                                    onClick={() => {
                                        onSelect(temp);
                                        onClose();
                                    }}
                                >
                                    {temp.templateName}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default SelectTemplateDialog;
