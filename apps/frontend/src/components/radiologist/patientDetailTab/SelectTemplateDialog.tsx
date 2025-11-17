"use client";
import React, { useState } from "react";
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
import { useGetTemplatesByModalityBodyPartQuery } from "@/store/diagnosisReportTeamplateApi";

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

    // GET list modalities (độc lập)
    const { data: modalitiesData } = useGetAllImagingModalityQuery();
    const modalities = modalitiesData?.data ?? [];

    // GET list body parts (độc lập)
    const { data: bodyPartsData } = useGetBodyPartsPaginatedQuery();
    const bodyParts = bodyPartsData?.data ?? [];

    console.log("Selected Modality ID:", modalityId);
    console.log("Selected Body Part ID:", bodyPartId);

    // GET list templates dựa vào CẢ modalityId + bodyPartId
    const { data: templatesData, isLoading } = useGetTemplatesByModalityBodyPartQuery(
        { modalityId: modalityId ?? "", bodyPartId: bodyPartId ?? "" },
        { skip: !modalityId || !bodyPartId }

    );
    const templates = templatesData?.data ?? [];
    console.log("check teamplate ", templatesData)

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
