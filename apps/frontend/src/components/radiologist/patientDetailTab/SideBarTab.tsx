"use client"

import React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

export interface SidebarTabProps {
  setSelectedExam: (exam: string) => void
  examHistory: string[]
}

/**
 * Ghi chú: export default là component memo hoá.
 * React.memo<SidebarTabProps>(Component) để TypeScript biết kiểu props.
 */
const SidebarTab: React.FC<SidebarTabProps> = ({ setSelectedExam, examHistory }) => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200">
      <div className="p-4 border-b">
        <h3 className="font-medium text-sm mb-2">Thông tin ca</h3>
        <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
          <span className="text-xs">◀</span> Back
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* --- Thông tin bệnh nhân --- */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-2">THÔNG TIN BỆNH NHÂN</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">PID:</span>
              <span className="font-medium">2108009129</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Họ và tên:</span>
              <span className="font-medium">PHẠM THỊ MƠ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Năm sinh:</span>
              <span>1968, nữ, hơn thủy</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Điện thoại:</span>
              <span>0982381966</span>
            </div>
            <div className="text-xs text-gray-600 mt-2">
              <div>Địa chỉ: Quảng Ninh, Cẩm Tây, Thành phố Cẩm Phả, Quảng Ninh, Việt Nam</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* --- Lịch sử khám --- */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-2">LỊCH SỬ KHÁM</h4>
          <ScrollArea className="h-48">
            <div className="space-y-1">
              {examHistory.map((exam, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedExam(exam)}
                  className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded"
                >
                  {exam}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </aside>
  )
}

SidebarTab.displayName = "SidebarTab"

export default React.memo<SidebarTabProps>(SidebarTab)
