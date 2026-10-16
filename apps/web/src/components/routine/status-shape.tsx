import type { RoutineStatus } from "@LE-REMINDER/core/domain/routine-status";
import { STATUS_FILL } from "@/lib/status-visual";

// Status is never conveyed by color alone: each status also gets a distinct
// glyph shape (triangle/ring/filled/outlined) so it reads under color-blindness
// or monochrome screens.
export function StatusShape({
	status,
	size = 11,
}: {
	status: RoutineStatus;
	size?: number;
}) {
	const fill = STATUS_FILL[status];
	const style = { width: size, height: size };

	if (status === "Overdue") {
		return (
			<div
				aria-hidden
				className="shrink-0 [clip-path:polygon(50%_6%,95%_94%,5%_94%)]"
				style={{ ...style, background: fill }}
			/>
		);
	}

	if (status === "Due") {
		return (
			<div
				aria-hidden
				className="shrink-0 rounded-full"
				style={{
					...style,
					border: `1.5px solid ${fill}`,
					background: "rgba(237, 237, 239, 0.25)",
				}}
			/>
		);
	}

	if (status === "Finished") {
		return (
			<div
				aria-hidden
				className="shrink-0 rounded-full border border-white/10"
				style={{ ...style, background: "#27272A" }}
			/>
		);
	}

	// Done, Paused
	return (
		<div
			aria-hidden
			className="shrink-0 rounded-full"
			style={{ ...style, background: fill }}
		/>
	);
}
