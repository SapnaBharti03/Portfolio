import { useEffect, useMemo, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatMonthYear, toMonthInputValue } from "@/lib/dates";

interface MonthPickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const MONTHS = Array.from({ length: 12 }, (_, index) => {
  const month = String(index + 1).padStart(2, "0");
  const label = new Date(2000, index, 1).toLocaleDateString(undefined, { month: "long" });
  return { value: month, label };
});

const FROM_YEAR = 1960;

function yearOptions(toYear: number) {
  return Array.from({ length: toYear - FROM_YEAR + 1 }, (_, index) => String(toYear - index));
}

export function MonthPicker({
  value,
  onChange,
  disabled,
  placeholder = "Pick a date",
  className,
}: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const currentYear = new Date().getFullYear();
  const years = useMemo(() => yearOptions(currentYear + 1), [currentYear]);

  useEffect(() => {
    if (!open) return;
    const parsed = toMonthValueParts(value);
    setMonth(parsed.month);
    setYear(parsed.year);
  }, [open, value]);

  const apply = (nextMonth: string, nextYear: string) => {
    setMonth(nextMonth);
    setYear(nextYear);
    if (nextMonth && nextYear) {
      onChange(`${nextYear}-${nextMonth}`);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-70" />
          {value ? formatMonthYear(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[240px] border-border bg-surface p-3 shadow-lg"
        align="start"
        sideOffset={6}
      >
        <p className="mb-2 text-xs font-medium text-muted-foreground">Select month & year</p>
        <div className="grid grid-cols-2 gap-2">
          <Select
            value={month || undefined}
            onValueChange={(nextMonth) => apply(nextMonth, year || String(currentYear))}
          >
            <SelectTrigger className="h-9 bg-background text-sm">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="z-[100] max-h-52 bg-popover">
              {MONTHS.map(({ value: monthValue, label }) => (
                <SelectItem key={monthValue} value={monthValue}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={year || undefined}
            onValueChange={(nextYear) => apply(month || "01", nextYear)}
          >
            <SelectTrigger className="h-9 bg-background text-sm">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="z-[100] max-h-52 bg-popover">
              {years.map((yearValue) => (
                <SelectItem key={yearValue} value={yearValue}>
                  {yearValue}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function toMonthValueParts(value: string) {
  const parsed = toMonthInputValue(value);
  if (!parsed) return { month: "", year: "" };
  const [year, month] = parsed.split("-");
  return { month, year };
}
