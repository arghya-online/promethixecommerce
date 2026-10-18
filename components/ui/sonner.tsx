"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheck,
  Info,
  TriangleAlert,
  OctagonX,
  Loader2,
} from "lucide-react";

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheck className="size-4 text-emerald-600" />,
        info: <Info className="size-4 text-primary" />,
        warning: <TriangleAlert className="size-4 text-amber-500" />,
        error: <OctagonX className="size-4 text-destructive" />,
        loading: <Loader2 className="size-4 animate-spin text-primary" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast font-sans text-xs shadow-md border border-border bg-surface text-foreground",
          description: "text-foreground-muted text-[11px]",
          actionButton: "bg-primary text-white text-xs",
          cancelButton: "bg-secondary text-foreground text-xs",
        },
      }}
      {...props}
    />
  );
}
