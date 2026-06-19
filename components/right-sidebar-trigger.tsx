"use client";

import { PanelRightIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRightSidebar } from "@/components/right-sidebar-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RightSidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useRightSidebar();
  const { t } = useTranslation();

  return (
    <Button
      data-slot="right-sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      className={cn(className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelRightIcon />
      <span className="sr-only">{t("sidebar.toggleRight")}</span>
    </Button>
  );
}
