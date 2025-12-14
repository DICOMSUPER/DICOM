"use client";

import { useState, useCallback, useEffect } from 'react';
import { Brain, Loader2, Trash2, ChevronDown, AlertTriangle } from 'lucide-react';
import { useViewer } from '@/common/contexts/ViewerContext';

// Types
interface RoboflowProject {
  id: string;
  name: string;
  type: string;
}

interface RoboflowVersion {
  id: string;
  name: string;
  created: number;
  modelId?: string;
  modelMap?: string;
}

interface AIDiagnosisButtonProps {
  disabled?: boolean;
}

export const AIDiagnosisButton = ({ disabled }: AIDiagnosisButtonProps) => {
  const { state, diagnosisViewport, clearAIAnnotations, getViewportSeries } = useViewer();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  
  const [projects, setProjects] = useState<RoboflowProject[]>([]);
  const [versions, setVersions] = useState<RoboflowVersion[]>([]);
  
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');


  useEffect(() => {
    fetchProjects();
  }, []);

 
  useEffect(() => {
    if (selectedProjectId) {
      fetchVersions(selectedProjectId);
      setSelectedVersionId(''); 
    } else {
      setVersions([]);
      setSelectedVersionId('');
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const response = await fetch(`https://api.roboflow.com/${process.env.NEXT_PUBLIC_WORKSPACE}?api_key=${process.env.NEXT_PUBLIC_ROBOFLOW_API_KEY}`);
      const data = await response.json();
      
      if (data.workspace?.projects) {
        setProjects(data.workspace.projects);
        console.log(' Loaded projects:', data.workspace.projects.length);
      }
    } catch (error) {
      console.error(' Failed to fetch projects:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Fetch versions for selected project
  const fetchVersions = async (projectId: string) => {
    setIsLoadingVersions(true);
    try {
      const projectName = projectId.split('/')[1];
      const response = await fetch(
        `https://api.roboflow.com/${process.env.NEXT_PUBLIC_WORKSPACE}/${projectName}?api_key=${process.env.NEXT_PUBLIC_ROBOFLOW_API_KEY}`
      );
      const data = await response.json();
      if (data.versions) {
        const trainedVersions = data.versions.filter((v: any) => v.model);       
        const versionList = trainedVersions.map((v: any) => ({
          id: v.id,
          modelId: v.model.id,
          name: v.name || `Version ${v.id}`,
          created: v.created,
          modelEndpoint: v.model?.endpoint,
          modelMap: v.model?.map,
        }));
        
        setVersions(versionList);
        console.log(` Loaded ${versionList.length} trained versions (filtered from ${data.versions.length} total)`);
        
        if (versionList.length === 0) {
          console.warn(' No trained versions found for this project');
        }
      }
    } catch (error) {
      console.error(' Failed to fetch versions:', error);
      setVersions([]);
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const handleDiagnose = useCallback(async () => {
    if (!selectedProjectId || !selectedVersionId) {
      alert('Please select both Model Name and Version');
      return;
    }

          const viewportId = state.viewportIds.get(state.activeViewport);
  if (!viewportId) {
    console.error("❌ No viewport ID found for active viewport");
    alert("Viewport not ready. Please wait for the image to load.");
    return;
  }
    setIsProcessing(true);
    
    try {
      await diagnosisViewport(state.activeViewport, {
          modelId: versions.find(v => v.id === selectedVersionId)?.modelId as string,
          modelName: projects.find(p => p.id === selectedProjectId)?.name as string,
          versionName: versions.find(v => v.id === selectedVersionId)?.name as string,

      });
      
      setTimeout(() => setIsProcessing(false), 3000);
    } catch (error) {
      console.error('AI diagnosis error:', error);
      setIsProcessing(false);
    }
  }, [
    diagnosisViewport,
    state.activeViewport,
    selectedProjectId,
    selectedVersionId,
    versions,
    projects,
  ]);

  const handleClearAI = useCallback(() => {
    clearAIAnnotations(state.activeViewport);
  }, [clearAIAnnotations, state.activeViewport]);

  const hasSeriesInViewport = !!getViewportSeries(state.activeViewport);

  return (
    <div className="flex flex-col gap-4">
      {/* Model Selection */}
      <div className="space-y-2 flex flex-col">
        <label className="text-sm text-slate-300 font-medium">
          Select Model Name
        </label>
        <div className="relative">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            disabled={disabled || isLoadingProjects || isProcessing}
            className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-2.5 pr-10 appearance-none cursor-pointer hover:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <option value="">
              {isLoadingProjects ? 'Loading models...' : 'Choose a model'}
            </option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Version Selection */}
      <div className="space-y-2 flex flex-col">
        <label className="text-sm text-slate-300 font-medium">
          Select Version
        </label>
        <div className="relative">
          <select
            value={selectedVersionId}
            onChange={(e) => setSelectedVersionId(e.target.value)}
            disabled={!selectedProjectId || disabled || isLoadingVersions || isProcessing}
            className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-2.5 pr-10 appearance-none cursor-pointer hover:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <option value="">
              {isLoadingVersions ? 'Loading versions...' : 'Choose a version'}
            </option>
            {versions.map((version) => (
              <option key={version.id} value={version.id}>
                {version.name} 
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>
        {!selectedProjectId && (
          <p className="text-xs text-slate-500">
            Select a model first to see available versions
          </p>
        )}
        {selectedProjectId && versions.length === 0 && !isLoadingVersions && (
          <p className="text-xs text-amber-500 flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            <span>No trained versions found. Please train a model first.</span>
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2">
        {/* AI Diagnosis Button */}
        <button
          onClick={handleDiagnose}
          disabled={
            disabled ||
            isProcessing ||
            !selectedProjectId ||
            !selectedVersionId ||
            !hasSeriesInViewport
          }
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
            transition-all duration-200 font-medium
            ${isProcessing 
              ? 'bg-blue-600 cursor-wait' 
              : 'bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
            }
            ${
              disabled ||
              !selectedProjectId ||
              !selectedVersionId ||
              !hasSeriesInViewport
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }
            text-white shadow-lg hover:shadow-xl
            border border-blue-400/30
          `}
          title="Run AI Diagnosis on current viewport"
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Brain className="w-5 h-5" />
          )}
          <span className="text-sm">
            {isProcessing ? 'Analyzing...' : 'AI Diagnosis'}
          </span>
        </button>

        {/* Clear AI Annotations Button */}
        <button
          onClick={handleClearAI}
          disabled={disabled || isProcessing}
          className={`
            flex items-center gap-2 px-3 py-2.5 rounded-lg
            transition-all duration-200
            bg-slate-700 hover:bg-slate-600
            ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
            text-slate-300 hover:text-white
            border border-slate-600
          `}
          title="Clear AI annotations from current viewport"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AIDiagnosisButton;