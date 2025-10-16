"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft, Search, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  const handleGoHome = () => {
    console.log("Not found");
    router.push("/login");
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="mx-auto w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle size={64} className="text-red-600" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. It might have
            been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={handleGoHome}
            className="w-full flex items-center justify-center space-x-2"
          >
            <Home size={20} />
            <span>Go to Login</span>
          </Button>

          <Button
            onClick={handleGoBack}
            variant="secondary"
            className="w-full flex items-center justify-center space-x-2"
          >
            <ArrowLeft size={20} />
            <span>Go Back</span>
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-sm text-gray-500">
          <p>If you believe this is an error, please contact support.</p>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center space-x-4">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-100"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
        </div>
      </div>
    </div>
  );
}
