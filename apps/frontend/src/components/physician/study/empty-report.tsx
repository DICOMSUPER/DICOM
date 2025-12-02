import { ArrowLeft, FileText, RefreshCw } from "lucide-react";

interface EmptyReportStateProps {
  onBack: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const EmptyReportState = ({
  onBack,
  onRefresh,
  isLoading,
}: EmptyReportStateProps) => {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto py-6 px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h1 className="text-3xl font-bold text-slate-900">
              Diagnosis Report Detail
            </h1>
          </div>
        </div>

        {/* Empty State Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12">
          <div className="max-w-md mx-auto text-center space-y-6">
            {/* Icon */}
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-linear-to-br from-teal-100 to-blue-100 rounded-full blur-2xl opacity-50"></div>
              <div className="relative bg-linear-to-br from-teal-50 to-blue-50 rounded-full p-6 border-2 border-teal-200">
                <FileText className="w-16 h-16 text-teal-600" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">
                No Report Found
              </h2>
              <p className="text-slate-600 leading-relaxed">
                We couldn't find a diagnosis report for this study. This might
                happen if:
              </p>
            </div>

            {/* Reasons List */}
            <div className="bg-slate-50 rounded-xl p-6 text-left space-y-3 border border-slate-200">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2"></div>
                <p className="text-sm text-slate-700 flex-1">
                  The report hasn't been created yet
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2"></div>
                <p className="text-sm text-slate-700 flex-1">
                  The study is still being processed
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2"></div>
                <p className="text-sm text-slate-700 flex-1">
                  The report ID is invalid or has been removed
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-lg font-medium transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
                {isLoading ? "Refreshing..." : "Refresh"}
              </button>
              <button
                onClick={onBack}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-lg font-medium border border-slate-200 transition-all hover:shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
            </div>

            {/* Help Text */}
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                Need help? Contact your system administrator or try refreshing
                the page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



// export default function Demo() {
//   const handleBack = () => {
//     alert("Navigate back to previous page");
//   };

//   const handleRefresh = () => {
//     alert("Refresh the page");
//   };

//   return (
//     <EmptyReportState
//       onBack={handleBack}
//       onRefresh={handleRefresh}
//       isLoading={false}
//     />
//   );
// }
