"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TimePickerProps {
  value?: string; // Format: "HH:MM"
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
}

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

export function TimePicker({
  value,
  onChange,
  placeholder = "HH:MM",
  disabled = false,
  className,
  error = false,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  
  const [hour = "", minute = ""] = value ? value.split(":") : [];

  const handleHourChange = (h: string) => {
    onChange?.(`${h}:${minute || "00"}`);
    if (minute) setTimeout(() => setOpen(false), 150);
  };

  const handleMinuteChange = (m: string) => {
    onChange?.(`${hour || "00"}:${m}`);
    if (hour) setTimeout(() => setOpen(false), 150);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  // Scroll to selected values when popover opens
  React.useEffect(() => {
    if (!open || !value) return;
    
    const [h, m] = value.split(":");
    const timer = setTimeout(() => {
      h && document.querySelector(`[data-hour="${h}"]`)?.scrollIntoView({ block: "center" });
      m && document.querySelector(`[data-minute="${m}"]`)?.scrollIntoView({ block: "center" });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [open, value]);

  const displayValue = value || "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-foreground",
            error && "border-red-500",
            className
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayValue || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-50 overflow-hidden" align="start" sideOffset={4}>
        <div className="flex border-b border-border bg-background">
          {/* Hour selector */}
          <div className="flex flex-col border-r border-border flex-1 w-16">
            <div className="p-2 text-center text-xs font-medium text-foreground bg-muted/30 border-b border-border">
              Hour
            </div>
            <ScrollArea className="h-[200px] pr-1 w-full text-center">
              <div className="p-1">
                {hours.map((h) => (
                  <button
                    key={h}
                    type="button"
                    data-hour={h}
                    onClick={() => handleHourChange(h)}
                    className={cn(
                      "w-full px-2 py-1.5 text-sm rounded-md text-center transition-colors font-normal",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2",
                      hour === h && "bg-primary text-primary-foreground font-medium"
                    )}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Minute selector */}
          <div className="flex flex-col flex-1 w-16">
            <div className="p-2 text-center text-xs font-medium text-foreground bg-muted/30 border-b border-border">
              Minute
            </div>
            <ScrollArea className="h-[200px] pr-1 w-full text-center">
              <div className="p-1">
                {minutes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    data-minute={m}
                    onClick={() => handleMinuteChange(m)}
                    className={cn(
                      "w-full px-2 py-1.5 text-sm rounded-md text-center transition-colors font-normal",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2",
                      minute === m && "bg-primary text-primary-foreground font-medium"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Manual input */}
        <div className="p-3 border-t border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <Input
              type="time"
              value={displayValue}
              onChange={handleInputChange}
              placeholder={placeholder}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="shrink-0"
            >
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

