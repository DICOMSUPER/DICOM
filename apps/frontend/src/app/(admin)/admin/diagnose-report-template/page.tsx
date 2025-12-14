"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/common/hooks/use-toast";
import { useGetReportTemplatesQuery } from "@/store/diagnosisReportTemplateApi";
import ReportTemplateTable from "@/components/admin/diagnose-report-template/diagnose-report-template-table";
import ReportTemplateFormModal from "@/components/admin/diagnose-report-template/diagnose-report-template-form-modal";
import ReportTemplateViewModal from "@/components/admin/diagnose-report-template/diagnose-report-template-view";
import ReportTemplateDeleteModal from "@/components/admin/diagnose-report-template/diagnose-report-template-delete";
import ReportTemplateFilters from "@/components/admin/diagnose-report-template/diagnose-report-template-filters";
import ReportTemplateStatsCards from "@/components/admin/diagnose-report-template/diagnose-report-template-stats-cards";
import { ReportTemplate } from "@/common/interfaces/patient/diagnosis-report-template.interface";

export default function DiagnosisReportTemplatesPage() {
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "standard" | "custom">("all");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  const [filters, setFilters] = useState({
    modalityId: "",
    bodyPartId: "",
    isPublic: undefined as boolean | undefined,
    templateType: activeTab === "all" ? undefined : activeTab,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      templateType: activeTab === "all" ? undefined : activeTab,
    }));
    setCurrentPage(1);
  }, [activeTab]);

  const {
    data: templatesData,
    isLoading,
    isFetching,
    refetch,
  } = useGetReportTemplatesQuery({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch,
    ...filters,
  });

  const handleCreate = () => {
    setFormMode("create");
    setSelectedTemplate(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (template: ReportTemplate) => {
    setFormMode("edit");
    setSelectedTemplate(template);
    setIsFormModalOpen(true);
  };

  const handleView = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setIsViewModalOpen(true);
  };

  const handleDelete = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteModalOpen(true);
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "Report templates data has been refreshed",
    });
  };

  const handleApplyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({
      modalityId: "",
      bodyPartId: "",
      isPublic: undefined,
      templateType: activeTab === "all" ? undefined : activeTab,
    });
    setSearchQuery("");
    setCurrentPage(1);
  };

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== "" && value !== undefined
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <FileText className="h-7 w-7 text-white" />
              </div>
              Report Templates
            </h1>
            <p className="text-slate-600 mt-1">
              Manage diagnostic report templates
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isFetching}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        </div>

        <ReportTemplateStatsCards
          totalTemplates={templatesData?.total || 0}
          standardTemplates={templatesData?.data?.filter(t => t.templateType === "standard").length || 0}
          customTemplates={templatesData?.data?.filter(t => t.templateType === "custom").length || 0}
          publicTemplates={templatesData?.data?.filter(t => t.isPublic).length || 0}
        />

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" onClick={handleClearFilters}>
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {showFilters && (
              <ReportTemplateFilters
                filters={filters}
                onApply={handleApplyFilters}
                onClose={() => setShowFilters(false)}
              />
            )}

            <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
              <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="standard">Standard</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                <ReportTemplateTable
                  data={templatesData?.data || []}
                  isLoading={isLoading}
                  currentPage={currentPage}
                  pageSize={pageSize}
                  total={templatesData?.total || 0}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </div>

      <ReportTemplateFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        mode={formMode}
        template={selectedTemplate}
        onSuccess={() => {
          refetch();
          setIsFormModalOpen(false);
        }}
      />

      <ReportTemplateViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        template={selectedTemplate}
        onEdit={() => {
          setIsViewModalOpen(false);
          handleEdit(selectedTemplate!);
        }}
      />

      <ReportTemplateDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        template={selectedTemplate}
        onSuccess={() => {
          refetch();
          setIsDeleteModalOpen(false);
        }}
      />
    </div>
  );
}