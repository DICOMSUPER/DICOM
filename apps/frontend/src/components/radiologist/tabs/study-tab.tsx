"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Lock, Eye, Settings, Video, FileText, Image, MessageSquare, Mail } from "lucide-react"
import SidebarTab from "@/components/radiologist/patientDetailTab/SideBarTab"

export default function MedicalRecordPage() {
  const [selectedExam, setSelectedExam] = useState("CT - 11/08/2021")

  return (
    <div className="flex h-screen bg-gray-50">
        <SidebarTab setSelectedExam={setSelectedExam} /> 

      <main className="flex-1 flex flex-col">

        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="bg-transparent border-b border-gray-200 rounded-none h-auto p-0">
              <TabsTrigger
                value="info"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 px-4 py-2"
              >
                <Lock className="w-4 h-4 mr-2" />
                Nhận ca
              </TabsTrigger>
              <TabsTrigger
                value="view"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 px-4 py-2"
              >
                <Eye className="w-4 h-4 mr-2" />
                Xem hình
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 px-4 py-2"
              >
                <Settings className="w-4 h-4 mr-2" />
                Advanced Tools
              </TabsTrigger>
              <TabsTrigger
                value="video"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 px-4 py-2"
              >
                <Video className="w-4 h-4 mr-2" />
                Xem - Tải Video
              </TabsTrigger>
              <TabsTrigger
                value="files"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 px-4 py-2"
              >
                <FileText className="w-4 h-4 mr-2" />
                Tài liệu đính kèm
              </TabsTrigger>
              <TabsTrigger
                value="ikq"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 px-4 py-2"
              >
                <Image className="w-4 h-4 mr-2" />
                In IKQ
              </TabsTrigger>
              <TabsTrigger
                value="receive"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 px-4 py-2"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                In nhận
              </TabsTrigger>
              <TabsTrigger
                value="portal"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 px-4 py-2"
              >
                <Mail className="w-4 h-4 mr-2" />
                In tra cứu Portal
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1 p-6">
          <Card className="p-6  mx-auto">
            <div className="space-y-6">
              <div>
                <h1 className="text-lg font-semibold mb-4">
                  KỸ THUẬT: Chụp MSCT sọ não-mạch não trên máy OPTIMA 128 GE độ dày lớp cắt 0.625 mm. Tái tạo MPR theo
                  các mặt phẳng MIP, VRT trước và sau tiêm thuốc cản quang.
                </h1>
                <h2 className="text-base font-semibold mb-3">MÔ TẢ:</h2>
                <div className="space-y-2 text-sm leading-relaxed">
                  <p>-- Nhu mô não thùy trán phải có ổ giảm tỷ trọng kích thước 31x45mm có phần dịch hóa, ranh giới không rõ, gây hiệu ứng khối nhẹ.</p>
                  <p>-- Hệ thống não thất cản đối, không giãn, dịch não tuỷ động nhất.</p>
                  <p>-- Đường giữa cân đối.</p>
                  <p>-- Động mạch cảnh trong phải đoạn ngang mức dòng mạch mất có túi phình không lồ kích thước 20x15mm, đường kính có kích thước 4.9mm, bờ đều, không thấy máu tụ quanh túi phình.</p>
                  <p>-- Hệ thống động mạch cảnh trong trái, động mạch não trước - động mạch não giữa hai bên thành đều, không thấy phình mạch, hẹp. Không thấy di dạng mạch.</p>
                  <p>-- Hệ thống động mạch đốt sống – thân nền, động mạch não sau hai bên không thấy phình mạch não, không thấy di dạng mạch não.</p>
                  <p>-- Không thấy hình ảnh bất thường mạch não vùng đa giác Willis</p>
                  <p>-- Không thấy hình ảnh co thắt mạch não.</p>
                  <p>-- Đường mổ xương trán - thái dương phải.</p>
                </div>
              </div>

              <div>
                <h2 className="text-base font-semibold mb-3">KẾT LUẬN:</h2>
                <p className="text-sm leading-relaxed">
                  Hình ảnh túi phình không lồ động mạch cảnh trong phải đoạn cuối xoang hang (ngang mức xuất phát ĐM mắt). Ổ tồn thương
                  cũ thùy trán phải.
                </p>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-medium text-sm">Người ký (Alt + 1):</span>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                      <span className="text-xs">📋</span>
                    </Button>
                  </div>
                  <div className="border border-gray-300 rounded h-24 bg-gray-50"></div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-medium text-sm">Kỹ thuật viên (Alt + 2):</span>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                      <span className="text-xs">📋</span>
                    </Button>
                  </div>
                  <div className="border border-gray-300 rounded h-24 bg-gray-50"></div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Badge variant="outline" className="text-xs">
                  Chân đoán hành chính Online
                </Badge>
              </div>
            </div>
          </Card>
        </ScrollArea>
      </main>
    </div>
  )
}
