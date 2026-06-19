"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type DirectoryCheckboxProps = {
  checked: boolean | "indeterminate";
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  "aria-label"?: string;
};

export function DirectoryCheckbox({
  checked,
  onCheckedChange,
  className,
  "aria-label": ariaLabel,
}: DirectoryCheckboxProps) {
  return (
    <Checkbox
      checked={checked === "indeterminate" ? false : checked}
      indeterminate={checked === "indeterminate"}
      onCheckedChange={(value) => onCheckedChange(value === true)}
      className={cn("size-3.5", className)}
      aria-label={ariaLabel}
      onClick={(event) => event.stopPropagation()}
    />
  );
}
