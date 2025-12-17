import React from "react";

export default function AnotherHeaderPDF() {
  return (
    <div className="border-b-2 border-black pb-4 mb-6 font-sans text-xs">
      <div className="flex justify-between items-start gap-4">
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <img
            src="/assets/logo_nobg.png"
            alt="FPT University Clinic Logo"
            className="w-24 h-24 object-contain"
          />
        </div>

        {/* Center: Hospital Info */}
        <div className="flex-1 text-center">
          <div className="text-lg font-bold uppercase">
            FPT University Clinic
          </div>
          <div className="text-sm font-medium mt-1">
            Medical Imaging & Radiology Department
          </div>
          <div className="mt-2 leading-relaxed text-gray-700">
            7 Đ. D1, Long Thạnh Mỹ, Thủ Đức, Thành phố Hồ Chí Minh 700000
          </div>
        </div>

        {/* Right: Contact Info */}
        <div className="flex-shrink-0 text-right leading-relaxed text-gray-700">
          <div>Phone: 028 7300 5588</div>
          <div>Website: hcmuni.fpt.edu.vn</div>
          <div>Hours: Opens at 8:00 AM</div>
          <div>Province: Ho Chi Minh City</div>
        </div>
      </div>
    </div>
  );
}
