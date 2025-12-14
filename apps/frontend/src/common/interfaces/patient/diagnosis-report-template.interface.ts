export interface ReportTemplate {
    id: string;
    templateName: string;
    templateType: string;
    ownerUserId: string;
    modalityId?: string;
    bodyPartId?: string;
    isPublic: boolean;
    descriptionTemplate?: string;
    technicalTemplate?: string;
    findingsTemplate?: string;
    conclusionTemplate?: string;
    recommendationTemplate?: string;
    createdAt: string;
    updatedAt: string;
}
export interface CreateReportTemplateDto {
    templateName: string;
    templateType: string;
    ownerUserId: string;
    modalityId?: string;
    bodyPartId?: string;
    isPublic?: boolean;
    descriptionTemplate?: string;
    technicalTemplate?: string;
    findingsTemplate?: string;
    conclusionTemplate?: string;
    recommendationTemplate?: string;
}
export interface UpdateReportTemplateDto {
    templateName?: string;
    templateType?: string;
    modalityId?: string;
    bodyPartId?: string;
    isPublic?: boolean;
    descriptionTemplate?: string;
    technicalTemplate?: string;
    findingsTemplate?: string;
    conclusionTemplate?: string;
    recommendationTemplate?: string;
}

export interface ReportTemplateSearchFilters {
    templateName?: string;
    templateType?: string;
    modalityId?: string;
    bodyPartId?: string;
    isPublic?: boolean;
    page?: number;
    limit?: number;
}

