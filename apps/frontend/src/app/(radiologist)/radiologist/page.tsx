"use client";

import { useState } from "react";
import Sidebar from "@/components/radiologist/side-bar";
import FilterBar from "@/components/radiologist/filter-bar";
import DataTable from "@/components/radiologist/data-table";

export default function Home() {
  return (
    <div className="flex h-screen max-w-[100%] bg-gray-100">
      <div className="flex-1 min-w-0  max -flex flex-col">
        <FilterBar />
        <DataTable />
      </div>
    </div>
  );
}
