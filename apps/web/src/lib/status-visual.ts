import type { RoutineStatus } from "@LE-REMINDER/core/domain/routine-status";

// Fill = the semantic tone used for status micro-glyphs/legend dots in the smoked-glass palette.
// Text = high-readability alabaster and pewter shades on Obsidian (#09090B) surfaces.
export const STATUS_FILL: Record<RoutineStatus, string> = {
	Overdue: "#F43F5E", // Muted crimson
	Due: "#EDEDEF", // Crisp alabaster
	Done: "#71717A", // Subtle pewter
	Paused: "#52525B", // Dim zinc
	Finished: "#3F3F46", // Darker zinc
};

export const STATUS_TEXT: Record<RoutineStatus, string> = {
	Overdue: "#FDA4AF", // Rose-300
	Due: "#EDEDEF", // Soft alabaster
	Done: "#71717A", // Pewter
	Paused: "#71717A", // Dim pewter
	Finished: "#52525B", // Muted zinc
};
