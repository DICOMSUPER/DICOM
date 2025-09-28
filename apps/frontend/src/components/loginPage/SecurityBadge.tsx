import React from 'react';
import { Shield, Lock, CheckCircle } from 'lucide-react';

export function SecurityBadge() {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
      <div className="flex items-center space-x-3 mb-3">
        <div className="bg-green-100 p-2 rounded-full">
          <Shield size={18} className="text-green-600" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800">Security Features</h3>
      </div>
      
      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex items-center space-x-2">
          <CheckCircle size={14} className="text-green-500" />
          <span>End-to-end encryption</span>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle size={14} className="text-green-500" />
          <span>Multi-factor authentication</span>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle size={14} className="text-green-500" />
          <span>Audit trail logging</span>
        </div>
        <div className="flex items-center space-x-2">
          <Lock size={14} className="text-blue-500" />
          <span>ISO 27001 certified infrastructure</span>
        </div>
      </div>
    </div>
  );
}