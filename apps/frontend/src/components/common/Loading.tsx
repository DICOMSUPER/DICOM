import { Activity } from "lucide-react";
import React from "react";

export default function Loading() {
  return (
    <div className="h-[100vh] flex justify-center items-center p-8 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg">
      <div className="relative mb-6">
        <div className="w-50 h-50 border-8 border-teal-100 rounded-full  shadow-lg">
          <div className="absolute inset-0 border-8 border-t-teal-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin  shadow-lg"></div>
          <div className="absolute inset-2 border-6 border-t-transparent border-r-cyan-500 border-b-transparent border-l-transparent rounded-full animate-spin animation-delay-150  shadow-lg"></div>
          <div className="absolute inset-4 border-4 border-t-transparent border-r-transparent border-b-teal-400 border-l-transparent rounded-full animate-spin animation-delay-300  shadow-lg"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Activity className="w-30 h-30 text-teal-600 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
