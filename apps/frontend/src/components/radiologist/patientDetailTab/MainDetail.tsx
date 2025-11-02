"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Lock, Eye, Settings, Video, FileText, Image, MessageSquare, Mail } from "lucide-react"

const MedicalRecordMain = ({ selectedStudyId, diagnosisData, isDiagnosisLoading }: any) => {
    if (!selectedStudyId) {
        return (
            <main className="flex-1 flex items-center justify-center">
                <div className="text-gray-500">Chưa có Study — hãy tạo mới chẩn đoán.</div>
            </main>
        )
    }

    if (isDiagnosisLoading) {
        return (
            <main className="flex-1 flex items-center justify-center">
                <div>Đang tải thông tin chẩn đoán...</div>
            </main>
        )
    }

    const hasDiagnosis = diagnosisData?.data && diagnosisData?.data.length > 0
    const diagnosis = diagnosisData?.data?.[0]

    return (
        <main className="flex-1 flex flex-col">
            {/* Thanh Tabs */}
            <div className="bg-white border-b border-gray-200 px-6 py-3">
                <Tabs defaultValue="info" className="w-full">
                    <TabsList className="bg-transparent border-b border-gray-200 rounded-none h-auto p-0">
                        {[
                            { value: "info", label: "Nhận ca", icon: <Lock className="w-4 h-4 mr-2" /> },
                            { value: "view", label: "Xem hình", icon: <Eye className="w-4 h-4 mr-2" /> },
                            { value: "advanced", label: "Advanced Tools", icon: <Settings className="w-4 h-4 mr-2" /> },
                            { value: "video", label: "Xem - Tải Video", icon: <Video className="w-4 h-4 mr-2" /> },
                            { value: "files", label: "Tài liệu đính kèm", icon: <FileText className="w-4 h-4 mr-2" /> },
                            { value: "ikq", label: "In IKQ", icon: <Image className="w-4 h-4 mr-2" /> },
                            { value: "receive", label: "In nhận", icon: <MessageSquare className="w-4 h-4 mr-2" /> },
                            { value: "portal", label: "In tra cứu Portal", icon: <Mail className="w-4 h-4 mr-2" /> },
                        ].map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 px-4 py-2"
                            >
                                {tab.icon}
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* Nội dung chính */}
            <ScrollArea className="flex-1 p-6">
                <Card className="p-6 mx-auto">
                    {!hasDiagnosis ? (
                        // 🩺 Nếu chưa có chẩn đoán → form nhập mới
                        <div className=" bg-white shadow-sm min-h-[80vh] p-10 ">
                            <h1 className="text-lg font-semibold mb-6 text-center">CHẨN ĐOÁN MỚI</h1>

                            <Textarea
                                placeholder="Nhập nội dung chẩn đoán ở đây..."
                                className="w-full min-h-[50vh] border-none focus-visible:ring-0 focus-visible:outline-none text-[15px] leading-relaxed"
                            />

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

                            <div className="flex justify-end mt-6">
                                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                                    💾 Lưu chẩn đoán
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <p className="whitespace-pre-line">{diagnosis?.description}</p>

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
                                    Chẩn đoán hành chính Online
                                </Badge>
                            </div>
                        </div>
                    )}
                </Card>
            </ScrollArea>
        </main>
    )
}

export default MedicalRecordMain
