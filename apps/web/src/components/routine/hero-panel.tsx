"use client";

import type { RoutineStatus } from "@LE-REMINDER/core/domain/routine-status";
import { Checkbox } from "@LE-REMINDER/ui/components/checkbox";
import { cn } from "@LE-REMINDER/ui/lib/utils";
import { AuroraGlow } from "@/components/aurora-glow";
import { NexusAnimation } from "@/components/nexus-animation";
import { CountUp } from "@/components/ui/count-up";
import { triggerCyberExplosion } from "@/lib/cyber-explosion";
import type { DashboardRoutine } from "@/lib/dashboard-routine";
import { sortByStatus } from "@/lib/sort-routines";
import { STATUS_FILL } from "@/lib/status-visual";

const STATUS_ORDER: RoutineStatus[] = [
	"Overdue",
	"Due",
	"Done",
	"Paused",
	"Finished",
];

const SEGMENT_COLORS: Record<RoutineStatus, string> = {
	Overdue: "#F43F5E",
	Due: "#EDEDEF",
	Done: "#71717A",
	Paused: "#52525B",
	Finished: "#3F3F46",
};

function isDailyRoutine(routine: DashboardRoutine): boolean {
	return (
		routine.taskType.kind === "Recurring" &&
		routine.taskType.schedule.type === "FixedCalendar" &&
		routine.taskType.schedule.recurrence.kind === "Daily"
	);
}

function CircularProgressIndicator({ progressPct }: { progressPct: number }) {
	const radius = 50;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset =
		circumference * (1 - Math.min(100, Math.max(0, progressPct)) / 100);

	return (
		<div className="relative flex size-36 items-center justify-center">
			<svg
				className="absolute inset-0 size-full -rotate-90 transform"
				viewBox="0 0 128 128"
				aria-hidden="true"
			>
				{/* Dial outer calibration ticks */}
				<circle
					cx="64"
					cy="64"
					r={56}
					fill="none"
					stroke="rgba(255, 255, 255, 0.08)"
					strokeWidth="1"
					strokeDasharray="2 6"
				/>
				{/* Background circular track */}
				<circle
					cx="64"
					cy="64"
					r={radius}
					fill="none"
					stroke="rgba(255, 255, 255, 0.06)"
					strokeWidth="4"
				/>
				{/* Crisp Alabaster progress arc with specular sheen */}
				<circle
					cx="64"
					cy="64"
					r={radius}
					fill="none"
					stroke="#EDEDEF"
					strokeWidth="4.5"
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={strokeDashoffset}
					className="drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] transition-all duration-1000 ease-out"
				/>
			</svg>
			<div className="relative flex items-center justify-center">
				<NexusAnimation />
			</div>
		</div>
	);
}

// 3-Column Bento Smoked-Glass Container
export function HeroPanel({
	routines,
	onComplete,
}: {
	routines: DashboardRoutine[];
	onComplete: (routine: DashboardRoutine) => void;
}) {
	const dailyItems = sortByStatus(routines.filter(isDailyRoutine));

	const counts: Record<RoutineStatus, number> = {
		Overdue: 0,
		Due: 0,
		Done: 0,
		Paused: 0,
		Finished: 0,
	};
	for (const r of routines) counts[r.status]++;
	const total = routines.length || 1;
	const progressPct = Math.round(
		((counts.Done + counts.Finished) / total) * 100,
	);

	return (
		<div className="relative flex flex-col divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/55 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md lg:flex-row lg:divide-x lg:divide-y-0">
			<AuroraGlow />

			{/* Column 1: Daily Task Checklist */}
			<div className="flex min-w-[200px] flex-1 flex-col gap-3 p-5 sm:p-6">
				<div className="flex items-center justify-between">
					<div className="font-semibold text-[#EDEDEF] text-sm tracking-tight">
						Daily Task
					</div>
					<span className="font-mono text-xs text-zinc-500 tabular-nums">
						{
							dailyItems.filter(
								(r) => r.status === "Done" || r.status === "Finished",
							).length
						}{" "}
						/ {dailyItems.length}
					</span>
				</div>

				{dailyItems.length === 0 && (
					<div className="py-4 text-center font-mono text-xs text-zinc-500">
						No daily routines configured.
					</div>
				)}

				<div className="flex flex-col gap-1">
					{dailyItems.map((routine) => {
						const done =
							routine.status === "Done" || routine.status === "Finished";
						return (
							<div
								key={routine.id}
								className={cn(
									"group/item -mx-2 flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors duration-150 hover:bg-white/[0.03]",
									done && "opacity-55 hover:opacity-80",
								)}
							>
								<Checkbox
									checked={done}
									onCheckedChange={() => {
										if (!done) onComplete(routine);
									}}
									onClick={(e) => {
										if (!done) {
											triggerCyberExplosion(e.currentTarget);
										}
									}}
									className="size-4 cursor-pointer rounded-sm border-white/20 bg-zinc-950/60 transition-all duration-150 active:scale-90 group-hover/item:border-white/40 data-checked:border-[#EDEDEF] data-checked:bg-[#EDEDEF] data-checked:text-zinc-950"
								/>
								<button
									type="button"
									onClick={(e) => {
										if (!done) {
											triggerCyberExplosion(e.currentTarget);
											onComplete(routine);
										}
									}}
									className={cn(
										"flex-1 cursor-pointer bg-transparent text-left text-xs transition-colors duration-150 active:scale-[0.99]",
										done
											? "text-zinc-500 line-through"
											: "text-[#EDEDEF] hover:text-white",
									)}
								>
									{routine.name}
								</button>
							</div>
						);
					})}
				</div>
			</div>

			{/* Column 2: Precision Dial & Gyroscope */}
			<div className="flex min-w-[180px] flex-none items-center justify-center p-5 sm:p-6">
				<CircularProgressIndicator progressPct={progressPct} />
			</div>

			{/* Column 3: Overall Progress & Telemetry */}
			<div className="flex min-w-[200px] flex-[1.2] flex-col justify-center gap-3.5 p-5 sm:p-6">
				<div className="flex items-center justify-between">
					<div className="font-mono text-[11px] text-zinc-400 uppercase tracking-widest">
						OVERALL PROGRESS
					</div>
					<span className="font-mono text-xs text-zinc-500 tabular-nums">
						{counts.Done + counts.Finished} of {total} Complete
					</span>
				</div>

				<div className="flex items-baseline gap-1">
					<CountUp
						to={progressPct}
						duration={1.2}
						className="font-semibold text-4xl text-[#EDEDEF] tabular-nums tracking-tight"
					/>
					<span className="font-mono text-lg text-zinc-500">%</span>
				</div>

				{/* Segmented Monochrome-to-Silver Progress Bar */}
				<div className="relative">
					<div className="relative flex h-2 overflow-hidden rounded-full border border-white/[0.06] bg-zinc-950/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
						{STATUS_ORDER.map((status) => (
							<div
								key={status}
								className="h-full transition-all duration-500 ease-out"
								style={{
									background: SEGMENT_COLORS[status],
									width: `${(counts[status] / total) * 100}%`,
								}}
							/>
						))}
						{routines.length > 0 && (
							<div
								aria-hidden="true"
								className="pointer-events-none absolute inset-y-0 w-24 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"
							/>
						)}
					</div>
				</div>

				{/* Micro-dot legend */}
				<div className="flex flex-wrap gap-3 font-mono text-xs text-zinc-400 tabular-nums">
					{STATUS_ORDER.map((status) => (
						<div key={status} className="flex items-center gap-1.5">
							<span
								className="inline-block size-1.5 rounded-full"
								style={{ background: STATUS_FILL[status] }}
							/>
							<span className="text-zinc-500">{counts[status]}</span>
							<span>{status}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
