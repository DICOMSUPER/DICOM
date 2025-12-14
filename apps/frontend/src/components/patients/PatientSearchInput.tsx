"use client";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { useGetPatientsQuery } from "@/store/patientApi";
import useDebounce from "@/common/hooks/useDebounce";
import { Patient } from "@/common/interfaces/patient/patient-workflow.interface";
import { formatDate } from "date-fns";


type SearchResult = {
  label: string;
  value: string;
};

type PatientSearchInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (item: SearchResult) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  debounceTime?: number;
};

export default function PatientSearchInput({
  id,
  value,
  onChange,
  onSelect,
  placeholder = "Search patient...",
  className,
  style,
}: PatientSearchInputProps) {
  const debouncedValue = useDebounce(value, 300);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isFetching } = useGetPatientsQuery(
    { searchField: "patientCode", search: debouncedValue },
    { skip: !debouncedValue.trim() }
  );

  const suggestions: SearchResult[] =
    data?.data.map((p: Patient) => ({
      label: `${p.patientCode} - ${p.firstName} ${p.lastName} - ${(p.dateOfBirth) ? formatDate(new Date(p.dateOfBirth), "dd/MM/yyyy") : "N/A"} - ${p.gender}`,
      value: p.patientCode,
    })) || [];


  useEffect(() => {
    setHighlightIndex(-1);
  }, [suggestions.length]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev <= 0 ? suggestions.length - 1 : prev - 1
      );
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      const selected = suggestions[highlightIndex];
      onSelect?.(selected);
      onChange(selected.label);
      setShowDropdown(false);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative w-full">
      <Input
        id={id}
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        onKeyDown={handleKeyDown}
        className={className}
        style={style}
        placeholder={placeholder}
      />

      {/* Dropdown - chỉ hiện khi có search term */}
      {showDropdown && debouncedValue.trim() && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-y-auto z-50 w-full">
          {isFetching && (
            <div className="p-3 text-gray-500 text-center text-sm">
              Finding...
            </div>
          )}
          {!isFetching && suggestions.length === 0 && (
            <div className="p-3 text-gray-500 text-center text-sm">
              Patient not found
            </div>
          )}
          {!isFetching &&
            suggestions.map((item, idx) => (
              <div
                key={item.value}
                onMouseDown={() => {
                  onSelect?.(item);
                  onChange(item.label);
                  setShowDropdown(false);
                }}
                onMouseEnter={() => setHighlightIndex(idx)}
                className={`p-2 text-sm cursor-pointer transition-colors ${
                  idx === highlightIndex 
                    ? "bg-blue-50 text-blue-700" 
                    : "hover:bg-gray-50"
                }`}
              >
                {item.label}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}