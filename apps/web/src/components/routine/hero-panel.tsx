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
					stroke="currentColor"
					strokeWidth="1"
					strokeDasharray="2 6"
					className="light:text-stone-300/60 text-white/[0.08]"
				/>
				{/* Background circular track */}
				<circle
					cx="64"
					cy="64"
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth="4"
					className="light:text-stone-300/40 text-white/[0.06]"
				/>
				{/* Crisp Alabaster progress arc with specular sheen */}
				<circle
					cx="64"
					cy="64"
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth="4.5"
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={strokeDashoffset}
					className="light:text-stone-800 text-[#F4F4F6] drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] light:drop-shadow-none transition-all duration-1000 ease-out"
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
		<div className="relative flex flex-col divide-y divide-white/[0.07] light:divide-stone-300/80 overflow-hidden rounded-2xl border border-white/[0.11] light:border-stone-300/80 bg-gradient-to-b from-zinc-800/65 light:from-[#F5F4F0] light:via-[#F5F4F0] via-zinc-900/75 light:to-[#EAE8E1] to-zinc-950/85 light:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_4px_20px_-2px_rgba(28,25,23,0.06)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.20),0_12px_32px_-8px_rgba(0,0,0,0.6)] backdrop-blur-md lg:flex-row lg:divide-x lg:divide-y-0">
			<AuroraGlow />

			{/* Column 1: Daily Task Checklist */}
			<div className="flex min-w-[200px] flex-1 flex-col gap-3 p-5 sm:p-6">
				<div className="flex items-center justify-between">
					<div className="font-semibold light:text-[#1C1917] text-[#F4F4F6] text-sm tracking-tight">
						Daily Task
					</div>
					<span className="font-mono light:text-stone-500 text-xs text-zinc-400 tabular-nums">
						{
							dailyItems.filter(
								(r) => r.status === "Done" || r.status === "Finished",
							).length
						}{" "}
						/ {dailyItems.length}
					</span>
				</div>

				{dailyItems.length === 0 && (
					<div className="py-4 text-center font-mono light:text-stone-500 text-xs text-zinc-400">
						No daily routines configured.
					</div>
				)}

				<div className="flex flex-col gap-1.5">
					{dailyItems.map((routine) => {
						const done =
							routine.status === "Done" || routine.status === "Finished";
						return (
							<div
								key={routine.id}
								className={cn(
									"group/item flex items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 transition-all hover:border-white/[0.08] light:hover:border-stone-300/80 hover:bg-white/[0.04] light:hover:bg-stone-200/50",
									done && "opacity-75",
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
									className="size-4 cursor-pointer rounded-sm border-white/20 light:border-stone-400/60 bg-zinc-950/60 light:bg-stone-100 transition-all duration-150 active:scale-90 group-hover/item:border-white/40 light:group-hover/item:border-stone-600 data-checked:border-[#EDEDEF] light:data-checked:border-stone-900 data-checked:bg-[#EDEDEF] light:data-checked:bg-stone-900 data-checked:text-zinc-950 light:data-checked:text-stone-50"
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
											? "light:text-stone-400 text-zinc-400 line-through decoration-zinc-500/60 light:decoration-stone-400/60"
											: "font-medium light:text-[#1C1917] text-[#F4F4F6] hover:text-white light:hover:text-black",
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
					<div className="font-mono light:text-stone-500 text-[11px] text-zinc-400 uppercase tracking-widest">
						OVERALL PROGRESS
					</div>
					<span className="font-mono light:text-stone-500 text-xs text-zinc-400 tabular-nums">
						{counts.Done + counts.Finished} of {total} Complete
					</span>
				</div>

				<div className="flex items-baseline gap-1">
					<CountUp
						to={progressPct}
						duration={1.2}
						className="font-semibold light:text-[#1C1917] text-4xl text-[#F4F4F6] tabular-nums tracking-tight"
					/>
					<span className="ml-0.5 font-normal light:text-stone-500 text-xl text-zinc-400">
						%
					</span>
				</div>

				{/* Segmented Monochrome-to-Silver Progress Bar */}
				<div className="relative">
					<div className="relative flex h-2 overflow-hidden rounded-full border border-white/[0.08] light:border-stone-300/80 bg-zinc-950/80 light:bg-stone-200/80 light:shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
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

				{/* Structured Mini-Pills Legend */}
				<div className="flex flex-wrap gap-2 pt-1 font-mono text-xs tabular-nums">
					{STATUS_ORDER.map((status) => (
						<div
							key={status}
							className="flex items-center gap-1.5 rounded-md border border-white/[0.07] light:border-stone-300/80 bg-white/[0.04] light:bg-stone-200/60 px-2.5 py-1 light:text-stone-700 text-xs text-zinc-300"
						>
							<span
								className="inline-block size-1.5 rounded-full"
								style={{ background: STATUS_FILL[status] }}
							/>
							<span className="font-semibold light:text-stone-900 text-zinc-100">
								{counts[status]}
							</span>
							<span className="light:text-stone-600 text-zinc-400">
								{status}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
