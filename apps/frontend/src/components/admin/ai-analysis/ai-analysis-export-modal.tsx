"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, FileSpreadsheet, Calendar, Filter } from "lucide-react"
import { AnalysisStatus } from "@/common/enums/image-dicom.enum"


interface AiAnalysisExportModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (filters: ExportFilters) => Promise<void>
  isExporting?: boolean
}

export interface ExportFilters {
  fromDate?: string
  toDate?: string
  status?: AnalysisStatus
  isHelpful?: boolean
}

export function AiAnalysisExportModal({ isOpen, onClose, onExport, isExporting = false }: AiAnalysisExportModalProps) {
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [status, setStatus] = useState<AnalysisStatus | "ALL">("ALL")
  const [feedbackFilter, setFeedbackFilter] = useState<"ALL" | "HELPFUL" | "NOT_HELPFUL">("ALL")
  const [dateError, setDateError] = useState("")

  const validateDates = (from: string, to: string) => {
    if (from && to) {
      const fromDateTime = new Date(from).getTime()
      const toDateTime = new Date(to).getTime()
      
      if (fromDateTime > toDateTime) {
        setDateError("From date cannot be after To date")
        return false
      }
    }
    setDateError("")
    return true
  }

  const handleFromDateChange = (value: string) => {
    setFromDate(value)
    validateDates(value, toDate)
  }

  const handleToDateChange = (value: string) => {
    setToDate(value)
    validateDates(fromDate, value)
  }

  const handleExport = async () => {
    if (!validateDates(fromDate, toDate)) {
      return
    }

    const filters: ExportFilters = {}

    if (fromDate) filters.fromDate = fromDate
    if (toDate) filters.toDate = toDate
    if (status !== "ALL") filters.status = status as AnalysisStatus
    if (feedbackFilter !== "ALL") {
      filters.isHelpful = feedbackFilter === "HELPFUL"
    }

    await onExport(filters)
  }

  const handleReset = () => {
    setFromDate("")
    setToDate("")
    setStatus("ALL")
    setFeedbackFilter("ALL")
    setDateError("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[540px] gap-0 p-0 overflow-hidden">
        <div className="relative bg-linear-to-br from-primary/5 via-primary/3 to-background border-b px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
            </div>
            <DialogHeader className="space-y-1 text-left p-0">
              <DialogTitle className="text-xl font-semibold tracking-tight">Export AI Analyses</DialogTitle>
              <DialogDescription className="text-sm">
                Configure filters and export analysis data to Excel
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Date Range Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              <span>Date Range</span>
            </div>
            <div className="grid grid-cols-2 gap-4 pl-6">
              <div className="space-y-2">
                <Label htmlFor="fromDate" className="text-xs font-medium  uppercase tracking-wide">
                  From
                </Label>
                <Input
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => handleFromDateChange(e.target.value)}
                  max={toDate || undefined}
                  className={`h-9 ${dateError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="toDate" className="text-xs font-medium uppercase tracking-wide">
                  To
                </Label>
                <Input
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => handleToDateChange(e.target.value)}
                  min={fromDate || undefined}
                  className={`h-9 ${dateError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
              </div>
            </div>
            {dateError && (
              <p className="text-xs text-destructive pl-6 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <span className="inline-block h-1 w-1 rounded-full bg-destructive"></span>
                {dateError}
              </p>
            )}
          </div>

          {/* Filters Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pl-6">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-xs font-medium uppercase tracking-wide">
                  Analysis Status
                </Label>
                <Select value={status} onValueChange={(value) => setStatus(value as AnalysisStatus | "ALL")}>
                  <SelectTrigger id="status" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value={AnalysisStatus.COMPLETED}>Completed</SelectItem>
                    <SelectItem value={AnalysisStatus.FAILED}>Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Feedback Filter */}
              <div className="space-y-2">
                <Label htmlFor="feedback" className="text-xs font-medium uppercase tracking-wide">
                  User Feedback
                </Label>
                <Select value={feedbackFilter} onValueChange={(value) => setFeedbackFilter(value as "ALL" | "HELPFUL" | "NOT_HELPFUL")}>
                  <SelectTrigger id="feedback" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Feedback</SelectItem>
                    <SelectItem value="HELPFUL">Helpful</SelectItem>
                    <SelectItem value="NOT_HELPFUL">Not Helpful</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t bg-muted/30 px-6 py-4">
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="ghost" onClick={handleReset} disabled={isExporting} className="h-9">
              Reset Filters
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isExporting}
                className="h-9 bg-transparent"
              >
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={isExporting || !!dateError} className="h-9 min-w-[100px]">
                {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isExporting ? "Exporting..." : "Export"}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
