import React from "react";
import { RefreshCw, AlertTriangle, Layers, FileEdit, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccordionLoadingProps {
    message?: string;
    className?: string;
}

export const AccordionLoading = ({
    message = "Loading...",
    className
}: AccordionLoadingProps) => {
    return (
        <div className={`flex flex-col items-center justify-center text-center py-8 text-slate-500 text-xs ${className || ""}`}>
            <RefreshCw className="h-8 w-8 mb-2 animate-spin text-teal-400" />
            <div>{message}</div>
        </div>
    );
};

interface AccordionErrorProps {
    message?: string;
    error?: string | null;
    onRetry?: () => void;
    isRetrying?: boolean;
}

export const AccordionError = ({
    message = "Error Loading Data",
    error,
    onRetry,
    isRetrying = false
}: AccordionErrorProps) => {
    return (
        <div className="flex flex-col items-center justify-center text-center py-8 px-4">
            <AlertTriangle className="h-10 w-10 mb-3 text-red-400" />
            <div className="text-red-400 text-sm mb-2">{message}</div>
            {error && <div className="text-slate-500 text-xs mb-4">{error}</div>}
            {onRetry && (
                <Button
                    size="sm"
                    onClick={onRetry}
                    disabled={isRetrying}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                    <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRetrying ? 'animate-spin' : ''}`} />
                    Retry
                </Button>
            )}
        </div>
    );
};

interface AccordionEmptyProps {
    icon?: React.ElementType;
    title: string;
    description: string;
    action?: React.ReactNode;
}

export const AccordionEmpty = ({
    icon: Icon = Layers,
    title,
    description,
    action
}: AccordionEmptyProps) => {
    return (
        <div className="flex flex-col items-center justify-center text-center py-8 px-4">
            <Icon className="h-10 w-10 mb-3 text-slate-600" />
            <div className="text-slate-400 text-sm mb-1">{title}</div>
            <div className="text-slate-500 text-xs mb-4">{description}</div>
            {action}
        </div>
    );
};
