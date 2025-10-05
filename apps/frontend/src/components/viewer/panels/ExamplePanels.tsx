"use client";
import React from 'react';

export function StudiesPanelTab() {
  return (
    <div className="p-4">
      <h3 className="text-white text-lg font-semibold mb-4">Studies</h3>
      <div className="space-y-2">
        <div className="bg-gray-800 p-3 rounded">
          <p className="text-white text-sm">Study 1</p>
          <p className="text-gray-400 text-xs">CT Chest - 2024-01-15</p>
        </div>
        <div className="bg-gray-800 p-3 rounded">
          <p className="text-white text-sm">Study 2</p>
          <p className="text-gray-400 text-xs">MRI Brain - 2024-01-10</p>
        </div>
      </div>
    </div>
  );
}

export function SeriesPanelTab() {
  return (
    <div className="p-4">
      <h3 className="text-white text-lg font-semibold mb-4">Series</h3>
      <div className="space-y-2">
        <div className="bg-gray-800 p-3 rounded">
          <p className="text-white text-sm">Series 1 - Axial</p>
          <p className="text-gray-400 text-xs">200 images</p>
        </div>
        <div className="bg-gray-800 p-3 rounded">
          <p className="text-white text-sm">Series 2 - Sagittal</p>
          <p className="text-gray-400 text-xs">150 images</p>
        </div>
      </div>
    </div>
  );
}

export function MeasurementsPanelTab() {
  return (
    <div className="p-4">
      <h3 className="text-white text-lg font-semibold mb-4">Measurements</h3>
      <div className="space-y-2">
        <div className="bg-gray-800 p-3 rounded">
          <p className="text-white text-sm">Length: 15.3 mm</p>
          <p className="text-gray-400 text-xs">Line annotation</p>
        </div>
        <div className="bg-gray-800 p-3 rounded">
          <p className="text-white text-sm">Area: 234.5 mm²</p>
          <p className="text-gray-400 text-xs">ROI annotation</p>
        </div>
      </div>
    </div>
  );
}

export function SettingsPanelTab() {
  return (
    <div className="p-4">
      <h3 className="text-white text-lg font-semibold mb-4">Settings</h3>
      <div className="space-y-4">
        <div>
          <label className="text-white text-sm">Window Level</label>
          <input 
            type="range" 
            className="w-full mt-2"
            min="0"
            max="100"
            defaultValue="50"
          />
        </div>
        <div>
          <label className="text-white text-sm">Brightness</label>
          <input 
            type="range" 
            className="w-full mt-2"
            min="0"
            max="100"
            defaultValue="50"
          />
        </div>
      </div>
    </div>
  );
}
