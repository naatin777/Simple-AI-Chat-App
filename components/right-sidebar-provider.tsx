"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ResizableSidebarHandle } from "@/components/resizable-sidebar-handle";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSidebarLayoutStore } from "@/stores/sidebar-layout-store";

const RIGHT_SIDEBAR_COOKIE_NAME = "right_sidebar_state";
const RIGHT_SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const RIGHT_SIDEBAR_WIDTH_MOBILE = "18rem";

type RightSidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const RightSidebarContext =
  React.createContext<RightSidebarContextProps | null>(null);

export function useRightSidebar() {
  const context = React.useContext(RightSidebarContext);
  if (!context) {
    throw new Error(
      "useRightSidebar must be used within a RightSidebarProvider.",
    );
  }

  return context;
}

export function RightSidebarProvider({
  defaultOpen = true,
  children,
}: {
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [open, setOpenState] = React.useState(defaultOpen);

  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      setOpenState(openState);
      document.cookie = `${RIGHT_SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${RIGHT_SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [open],
  );

  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((current) => !current) : setOpen((current) => !current);
  }, [isMobile, setOpen]);

  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<RightSidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, toggleSidebar],
  );

  return (
    <RightSidebarContext.Provider value={contextValue}>
      {children}
    </RightSidebarContext.Provider>
  );
}

export function RightSidebar({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { isMobile, state, openMobile, setOpenMobile } = useRightSidebar();
  const rightWidthPx = useSidebarLayoutStore((state) => state.rightWidthPx);
  const setRightWidth = useSidebarLayoutStore((state) => state.setRightWidth);

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-slot="right-sidebar"
          className="w-(--right-sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
          style={
            {
              "--right-sidebar-width": RIGHT_SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side="right"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Directory sidebar</SheetTitle>
            <SheetDescription>
              Displays the directory sidebar.
            </SheetDescription>
          </SheetHeader>
          <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
            {children}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="group/right-sidebar peer/right-sidebar hidden text-sidebar-foreground md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? "offcanvas" : ""}
      data-side="right"
      data-slot="right-sidebar"
      style={
        {
          "--right-sidebar-width": isMobile
            ? RIGHT_SIDEBAR_WIDTH_MOBILE
            : `${rightWidthPx}px`,
        } as React.CSSProperties
      }
    >
      <div
        data-slot="right-sidebar-gap"
        className={cn(
          "relative w-(--right-sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[state=collapsed]/right-sidebar:w-0",
        )}
      />
      <div
        data-slot="right-sidebar-container"
        className={cn(
          "fixed inset-y-0 right-0 z-10 hidden h-svh w-(--right-sidebar-width) border-l border-sidebar-border transition-[right,width] duration-200 ease-linear md:flex relative",
          "group-data-[state=collapsed]/right-sidebar:right-[calc(var(--right-sidebar-width)*-1)]",
          className,
        )}
        {...props}
      >
        <div
          data-slot="right-sidebar-inner"
          className="flex size-full min-h-0 flex-col overflow-hidden bg-sidebar"
        >
          {children}
        </div>
        <ResizableSidebarHandle
          side="right"
          onResize={setRightWidth}
        />
      </div>
    </div>
  );
}
