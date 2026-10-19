import type { RoutineStatus } from "@LE-REMINDER/core/domain/routine-status";

// High-Authority Executive Glacier status tokens:
// Overdue = Crimson (#F43F5E)
// Due = Bright Ice Platinum (#E0F2FE)
// Done = Glacial Cyan (#38BDF8)
// Paused = Muted Slate (#475569 - no purple!)
// Finished = Muted Slate (#475569)
export const STATUS_FILL: Record<RoutineStatus, string> = {
	Overdue: "#F43F5E",
	Due: "#E0F2FE",
	Done: "#38BDF8",
	Paused: "#475569",
	Finished: "#475569",
};

export const STATUS_TEXT: Record<RoutineStatus, string> = {
	Overdue: "#FDA4AF",
	Due: "#E0F2FE",
	Done: "#BAE6FD",
	Paused: "#94A3B8",
	Finished: "#94A3B8",
};
