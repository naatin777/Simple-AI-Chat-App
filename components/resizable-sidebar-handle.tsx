"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type ResizableSidebarHandleProps = {
  side: "left" | "right";
  onResize: (width: number) => void;
  className?: string;
};

export function ResizableSidebarHandle({
  side,
  onResize,
  className,
}: ResizableSidebarHandleProps) {
  const draggingRef = useRef(false);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      if (!draggingRef.current) {
        return;
      }

      const width =
        side === "left" ? event.clientX : window.innerWidth - event.clientX;

      onResize(width);
    }

    function handlePointerUp() {
      draggingRef.current = false;
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [onResize, side]);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={side === "left" ? "Resize left sidebar" : "Resize right sidebar"}
      className={cn(
        "absolute top-0 z-20 h-full w-2 cursor-col-resize touch-none hover:bg-sidebar-border",
        side === "left" ? "right-0 translate-x-full" : "left-0 -translate-x-full",
        className,
      )}
      onPointerDown={(event) => {
        draggingRef.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
    />
  );
}
