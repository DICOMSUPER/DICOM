import React from 'react';
import { Monitor, Shield, Activity } from 'lucide-react';

export function Header() {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-blue-600 p-4 rounded-full">
          <Monitor size={40} className="text-white" />
        </div>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        DICOM Imaging System
      </h1>
      
      <p className="text-gray-600 mb-6">
        Secure access to medical imaging and diagnostic tools
      </p>
      
      <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <Shield size={16} className="text-blue-500" />
          <span>HIPAA Compliant</span>
        </div>
        <div className="flex items-center space-x-2">
          <Activity size={16} className="text-green-500" />
          <span>24/7 Available</span>
        </div>
      </div>
    </div>
  );
}