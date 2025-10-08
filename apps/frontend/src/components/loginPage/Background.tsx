import React from 'react';

export function Background() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">

      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50"></div>
      
      {/* Medical grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      {/* Floating medical icons */}
      <div className="absolute top-20 left-10 w-8 h-8 bg-blue-100 rounded-full opacity-30 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-6 h-6 bg-green-100 rounded-full opacity-30 animate-pulse delay-1000"></div>
      <div className="absolute bottom-40 left-20 w-10 h-10 bg-blue-100 rounded-full opacity-30 animate-pulse delay-2000"></div>
      <div className="absolute bottom-20 right-10 w-7 h-7 bg-green-100 rounded-full opacity-30 animate-pulse delay-500"></div>
    </div>
  );
}