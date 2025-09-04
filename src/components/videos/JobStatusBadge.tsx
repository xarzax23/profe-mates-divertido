import { cn } from "@/lib/utils";
import { VideoJobStatus } from "@/types";

export function JobStatusBadge({ status }: { status: VideoJobStatus }) {
  const color = {
    queued: "bg-muted",
    processing: "bg-accent",
    done: "bg-primary text-primary-foreground",
    error: "bg-destructive text-destructive-foreground",
  }[status];
  const label = {
    queued: "En cola",
    processing: "Procesando",
    done: "Listo",
    error: "Error",
  }[status];
  return <span className={cn("inline-flex items-center px-2 py-1 rounded text-xs", color)}>{label}</span>;
}
