"use client";

import { useState, useCallback } from 'react';
import { Brain, Loader2, Trash2 } from 'lucide-react';
import { useViewer } from '@/contexts/ViewerContext';

interface AIDiagnosisButtonProps {
  disabled?: boolean;
}

export const AIDiagnosisButton = ({ disabled }: AIDiagnosisButtonProps) => {
  const { state, diagnosisViewport, clearAIAnnotations } = useViewer();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDiagnose = useCallback(async () => {
    setIsProcessing(true);
    
    try {
      await diagnosisViewport(state.activeViewport);
      
      // Auto reset after 3 seconds
      setTimeout(() => setIsProcessing(false), 3000);
    } catch (error) {
      console.error('AI diagnosis error:', error);
      setIsProcessing(false);
    }
  }, [diagnosisViewport, state.activeViewport]);

  const handleClearAI = useCallback(() => {
    clearAIAnnotations(state.activeViewport);
  }, [clearAIAnnotations, state.activeViewport]);

  return (
    <div className="flex items-center gap-2">
      {/* AI Diagnosis Button */}
      <button
        onClick={handleDiagnose}
        disabled={disabled || isProcessing}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg
          transition-all duration-200 font-medium
          ${isProcessing 
            ? 'bg-blue-600 cursor-wait' 
            : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
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
          flex items-center gap-2 px-3 py-2 rounded-lg
          transition-all duration-200
          bg-slate-700 hover:bg-slate-600
          ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          text-slate-300 hover:text-white
          border border-slate-600
        `}
        title="Clear AI annotations from current viewport"
      >
        <Trash2 className="w-4 h-4" />
        <span className="text-sm">Clear AI</span>
      </button>
    </div>
  );
};

export default AIDiagnosisButton;
