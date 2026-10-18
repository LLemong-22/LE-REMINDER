import type { RoutineStatus } from "@LE-REMINDER/core/domain/routine-status";

// Cryo-Vault & Icy Frost status tokens:
// Overdue = Villain Crimson (#F43F5E)
// Due = Icy Frost Blue (#BAE6FD) & Cryo Cyan (#38BDF8)
// Done = Glacial Cyan (#38BDF8)
// Paused = Cryo Violet (#A855F7)
// Finished = Cryo Slate (#64748B)
export const STATUS_FILL: Record<RoutineStatus, string> = {
	Overdue: "#F43F5E",
	Due: "#38BDF8",
	Done: "#7DD3FC",
	Paused: "#A855F7",
	Finished: "#64748B",
};

export const STATUS_TEXT: Record<RoutineStatus, string> = {
	Overdue: "#FDA4AF",
	Due: "#BAE6FD",
	Done: "#BAE6FD",
	Paused: "#E9D5FF",
	Finished: "#94A3B8",
};
