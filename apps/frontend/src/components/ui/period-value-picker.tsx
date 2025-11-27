"use client";

import * as React from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PeriodValuePickerProps {
  period?: 'week' | 'month' | 'year';
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 2019 }, (_, i) => (2020 + i).toString());
const months = Array.from({ length: 12 }, (_, i) => {
  const monthNum = i + 1;
  return {
    value: monthNum.toString().padStart(2, '0'),
    label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' })
  };
});
const weeks = Array.from({ length: 53 }, (_, i) => (i + 1).toString().padStart(2, '0'));

export function PeriodValuePicker({
  period,
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
  error = false,
}: PeriodValuePickerProps) {
  const [open, setOpen] = React.useState(false);
  
  const getWeekNumber = (date: Date): string => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  };

  const parseValue = () => {
    if (!value) return { year: '', week: '', month: '' };
    
    if (period === 'week') {
      const match = value.match(/(\d{4})-W(\d{2})/);
      return { year: match?.[1] || '', week: match?.[2] || '', month: '' };
    }
    
    if (period === 'month') {
      const match = value.match(/(\d{4})-(\d{2})/);
      return { year: match?.[1] || '', week: '', month: match?.[2] || '' };
    }
    
    if (period === 'year') {
      return { year: value || '', week: '', month: '' };
    }
    
    return { year: '', week: '', month: '' };
  };

  const { year, week, month } = parseValue();

  const handleYearChange = (y: string) => {
    if (period === 'week') {
      onChange?.(week ? `${y}-W${week}` : `${y}-W01`);
    } else if (period === 'month') {
      onChange?.(month ? `${y}-${month}` : `${y}-01`);
    } else if (period === 'year') {
      onChange?.(y);
      setTimeout(() => setOpen(false), 150);
    }
  };

  const handleWeekChange = (w: string) => {
    if (year) {
      onChange?.(`${year}-W${w}`);
      setTimeout(() => setOpen(false), 150);
    }
  };

  const handleMonthChange = (m: string) => {
    if (year) {
      onChange?.(`${year}-${m}`);
      setTimeout(() => setOpen(false), 150);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  React.useEffect(() => {
    if (!open || !value) return;
    
    const timer = setTimeout(() => {
      if (year) {
        document.querySelector(`[data-year="${year}"]`)?.scrollIntoView({ block: "center" });
      }
      if (period === 'week' && week) {
        document.querySelector(`[data-week="${week}"]`)?.scrollIntoView({ block: "center" });
      }
      if (period === 'month' && month) {
        document.querySelector(`[data-month="${month}"]`)?.scrollIntoView({ block: "center" });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [open, value, period, year, week, month]);

  const displayValue = value || "";
  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    if (period === 'week') return 'YYYY-WW';
    if (period === 'month') return 'YYYY-MM';
    if (period === 'year') return 'YYYY';
    return 'Select period value';
  };

  if (!period) {
    return (
      <Input
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        placeholder={getPlaceholder()}
        disabled={disabled}
        className={cn(
          "max-w-[200px]",
          error && "border-red-500",
          className
        )}
      />
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "max-w-[200px] justify-start text-left font-normal",
            !value && "text-foreground",
            error && "border-red-500",
            className
          )}
          disabled={disabled}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {displayValue || getPlaceholder()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-50 overflow-hidden" align="start" sideOffset={4}>
        {period === 'week' && (
          <div className="flex border-b border-border bg-background">
            <div className="flex flex-col border-r border-border flex-1 w-20">
              <div className="p-2 text-center text-xs font-medium text-foreground bg-muted/30 border-b border-border">
                Year
              </div>
              <ScrollArea className="h-[200px] pr-1 w-full text-center">
                <div className="p-1">
                  {years.map((y) => (
                    <button
                      key={y}
                      type="button"
                      data-year={y}
                      onClick={() => handleYearChange(y)}
                      className={cn(
                        "w-full px-2 py-1.5 text-sm rounded-md text-center transition-colors font-normal",
                        "hover:bg-accent hover:text-accent-foreground",
                        "focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2",
                        year === y && "bg-primary text-primary-foreground font-medium"
                      )}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="flex flex-col flex-1 w-16">
              <div className="p-2 text-center text-xs font-medium text-foreground bg-muted/30 border-b border-border">
                Week
              </div>
              <ScrollArea className="h-[200px] pr-1 w-full text-center">
                <div className="p-1">
                  {weeks.map((w) => (
                    <button
                      key={w}
                      type="button"
                      data-week={w}
                      onClick={() => handleWeekChange(w)}
                      className={cn(
                        "w-full px-2 py-1.5 text-sm rounded-md text-center transition-colors font-normal",
                        "hover:bg-accent hover:text-accent-foreground",
                        "focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2",
                        week === w && "bg-primary text-primary-foreground font-medium"
                      )}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}

        {period === 'month' && (
          <div className="flex border-b border-border bg-background">
            <div className="flex flex-col border-r border-border flex-1 w-20">
              <div className="p-2 text-center text-xs font-medium text-foreground bg-muted/30 border-b border-border">
                Year
              </div>
              <ScrollArea className="h-[200px] pr-1 w-full text-center">
                <div className="p-1">
                  {years.map((y) => (
                    <button
                      key={y}
                      type="button"
                      data-year={y}
                      onClick={() => handleYearChange(y)}
                      className={cn(
                        "w-full px-2 py-1.5 text-sm rounded-md text-center transition-colors font-normal",
                        "hover:bg-accent hover:text-accent-foreground",
                        "focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2",
                        year === y && "bg-primary text-primary-foreground font-medium"
                      )}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="flex flex-col flex-1 w-24">
              <div className="p-2 text-center text-xs font-medium text-foreground bg-muted/30 border-b border-border">
                Month
              </div>
              <ScrollArea className="h-[200px] pr-1 w-full text-center">
                <div className="p-1">
                  {months.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      data-month={m.value}
                      onClick={() => handleMonthChange(m.value)}
                      className={cn(
                        "w-full px-2 py-1.5 text-sm rounded-md text-center transition-colors font-normal",
                        "hover:bg-accent hover:text-accent-foreground",
                        "focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2",
                        month === m.value && "bg-primary text-primary-foreground font-medium"
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}

        {period === 'year' && (
          <div className="flex border-b border-border bg-background">
            <div className="flex flex-col flex-1 w-20">
              <div className="p-2 text-center text-xs font-medium text-foreground bg-muted/30 border-b border-border">
                Year
              </div>
              <ScrollArea className="h-[200px] pr-1 w-full text-center">
                <div className="p-1">
                  {years.map((y) => (
                    <button
                      key={y}
                      type="button"
                      data-year={y}
                      onClick={() => handleYearChange(y)}
                      className={cn(
                        "w-full px-2 py-1.5 text-sm rounded-md text-center transition-colors font-normal",
                        "hover:bg-accent hover:text-accent-foreground",
                        "focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2",
                        year === y && "bg-primary text-primary-foreground font-medium"
                      )}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}

        <div className="p-3 border-t border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <Input
              type={period === 'week' ? 'week' : period === 'month' ? 'month' : 'number'}
              value={displayValue}
              onChange={handleInputChange}
              placeholder={getPlaceholder()}
              className="flex-1"
              min={period === 'year' ? '2020' : undefined}
              max={period === 'year' ? currentYear.toString() : undefined}
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

