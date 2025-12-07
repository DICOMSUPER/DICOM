"use client";
import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserNotFoundInCookies() {
  const router = useRouter();
  
  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            User Not Found
          </h2>

          <p className="text-gray-600 mb-6">
            Your session information could not be found. Please log in again to
            continue.
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={handleRefresh}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>

            <button
              onClick={() => router.push("/login")}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
