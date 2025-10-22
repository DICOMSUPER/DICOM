import React from "react";
import FilterBar from "../filter-bar";
import DataTable from "../data-table";

export default function BaseTab() {
  return (
    <div className="flex-1 flex flex-col h-full">
      <FilterBar />
      <DataTable />
    </div>
  );
}
