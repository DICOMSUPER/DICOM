import React from "react";
import { Card } from "@/components/ui/card";
import { FileText, Star, User, Globe } from "lucide-react";

interface ReportTemplateStatsCardsProps {
  totalTemplates: number;
  standardTemplates: number;
  customTemplates: number;
  publicTemplates: number;
}

const ReportTemplateStatsCards = ({
  totalTemplates,
  standardTemplates,
  customTemplates,
  publicTemplates,
}: ReportTemplateStatsCardsProps) => {
  const stats = [
    {
      label: "Total Templates",
      value: totalTemplates,
      icon: FileText,
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Standard Templates",
      value: standardTemplates,
      icon: Star,
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      label: "Custom Templates",
      value: customTemplates,
      icon: User,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
    },
    {
      label: "Public Templates",
      value: publicTemplates,
      icon: Globe,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
              <p className={`text-3xl font-bold mt-2 ${stat.textColor}`}>
                {stat.value}
              </p>
            </div>
            <div
              className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}
            >
              <stat.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ReportTemplateStatsCards;