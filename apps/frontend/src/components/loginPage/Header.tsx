import React from 'react';
import { Monitor } from 'lucide-react';

export function Header() {
  return (
    <div className="text-center mb-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
          <div className="relative bg-blue-600 p-4 rounded-2xl transform hover:scale-105 transition-transform duration-300 shadow-lg">
            <Monitor size={40} className="text-white" />
          </div>
        </div>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        Sign In
      </h1>
      
      <p className="text-gray-600 text-lg mb-2">
        Access your medical imaging workspace
      </p>
    </div>
  );
}