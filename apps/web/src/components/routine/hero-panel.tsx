"use client";

import type { RoutineStatus } from "@LE-REMINDER/core/domain/routine-status";
import { Checkbox } from "@LE-REMINDER/ui/components/checkbox";
import { cn } from "@LE-REMINDER/ui/lib/utils";
import { NexusAnimation } from "@/components/nexus-animation";
import { CountUp } from "@/components/ui/count-up";
import { DecryptedText } from "@/components/ui/decrypted-text";
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

const STATUS_GRADIENT: Record<RoutineStatus, string> = {
	Overdue: "linear-gradient(90deg, #F43F5E, #FB7185)",
	Due: "linear-gradient(90deg, #0284C7, #38BDF8)",
	Done: "linear-gradient(90deg, #0EA5E9, #BAE6FD)",
	Paused: "linear-gradient(90deg, #7C3AED, #C084FC)",
	Finished: "linear-gradient(90deg, #334155, #64748B)",
};

function isDailyRoutine(routine: DashboardRoutine): boolean {
	return (
		routine.taskType.kind === "Recurring" &&
		routine.taskType.schedule.type === "FixedCalendar" &&
		routine.taskType.schedule.recurrence.kind === "Daily"
	);
}

function CircularProgressIndicator({ progressPct }: { progressPct: number }) {
	const radius = 52;
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
				<defs>
					<linearGradient
						id="heroProgressCryoGradient"
						x1="0%"
						y1="0%"
						x2="100%"
						y2="100%"
					>
						<stop offset="0%" stopColor="#38BDF8" />
						<stop offset="60%" stopColor="#7DD3FC" />
						<stop offset="100%" stopColor="#BAE6FD" />
					</linearGradient>
				</defs>
				{/* Crystalline dial outer calibration ticks */}
				<circle
					cx="64"
					cy="64"
					r={58}
					fill="none"
					stroke="rgba(186, 230, 253, 0.16)"
					strokeWidth="1"
					strokeDasharray="2 6"
				/>
				{/* Background circular track */}
				<circle
					cx="64"
					cy="64"
					r={radius}
					fill="none"
					stroke="rgba(186, 230, 253, 0.08)"
					strokeWidth="5"
				/>
				{/* Luminous Icy Frost data ring */}
				<circle
					cx="64"
					cy="64"
					r={radius}
					fill="none"
					stroke="url(#heroProgressCryoGradient)"
					strokeWidth="5"
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={strokeDashoffset}
					className="drop-shadow-[0_0_12px_rgba(56,189,248,0.55)] transition-all duration-1000 ease-out"
				/>
			</svg>
			<div className="relative flex items-center justify-center">
				<NexusAnimation />
			</div>
		</div>
	);
}

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
		<div className="frost-panel relative flex flex-col divide-y divide-[#BAE6FD]/10 overflow-hidden rounded-xl md:flex-row md:divide-x md:divide-y-0">
			{/* Static hardware-accelerated ambient glacial haze */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute -inset-10 -z-10 bg-[radial-gradient(ellipse_at_30%_50%,rgba(56,189,248,0.08),transparent_60%)]"
			/>

			{/* Column 1: Daily Task Checklist */}
			<div className="flex min-w-[170px] flex-1 flex-col gap-3 p-5">
				<div className="flex items-center justify-between">
					<div className="font-extrabold text-[#F0F9FF] text-[15px] tracking-tight">
						Daily Task
					</div>
					<span className="font-mono text-[#93C5FD] text-[11px]">
						{
							dailyItems.filter(
								(i) => i.status === "Done" || i.status === "Finished",
							).length
						}
						/{dailyItems.length} Done
					</span>
				</div>

				{dailyItems.length === 0 && (
					<div className="font-mono text-[#94A3B8] text-xs italic">
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
									"group/item -mx-1.5 flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors duration-150 hover:bg-[#BAE6FD]/[0.06]",
									done && "opacity-55 hover:opacity-90",
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
									className="size-4 cursor-pointer rounded border-[#BAE6FD]/30 transition-all duration-150 active:scale-90 group-hover/item:border-[#38BDF8] data-checked:border-[#38BDF8] data-checked:bg-[#38BDF8] data-checked:text-[#070B12]"
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
										"flex-1 cursor-pointer bg-transparent text-left font-medium text-[13.5px] transition-colors duration-150 active:scale-[0.99]",
										done
											? "text-[#64748B] line-through"
											: "text-[#F0F9FF] hover:text-[#38BDF8]",
									)}
								>
									{routine.name}
								</button>
							</div>
						);
					})}
				</div>
			</div>

			{/* Column 2: Gyroscope Circular Dial */}
			<div className="flex min-w-[170px] flex-none items-center justify-center p-5">
				<CircularProgressIndicator progressPct={progressPct} />
			</div>

			{/* Column 3: Overall Progress Metrics */}
			<div className="flex min-w-[190px] flex-[1.2] flex-col justify-center gap-3 p-5">
				<div className="flex items-center justify-between">
					<div className="font-mono text-[#93C5FD] text-[11px] uppercase tracking-[0.12em]">
						<DecryptedText
							text="OVERALL PROGRESS"
							speed={30}
							maxIterations={8}
							encryptedClassName="text-[#38BDF8]"
						/>
					</div>
					<span className="font-mono text-[#64748B] text-[10.5px]">
						CYTO-CORE STATUS
					</span>
				</div>

				<div className="font-extrabold text-[#F0F9FF] text-[34px] tracking-tight">
					<CountUp to={progressPct} duration={1.1} />
				</div>

				{/* Segmented Cryo Progress Bar */}
				<div className="relative">
					<div className="relative flex h-2 overflow-hidden rounded-full border border-[#BAE6FD]/15 bg-[#070B12]/80 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
						{STATUS_ORDER.map((status) => (
							<div
								key={status}
								className="h-full transition-all duration-500 ease-out"
								style={{
									background: STATUS_GRADIENT[status] ?? STATUS_FILL[status],
									width: `${(counts[status] / total) * 100}%`,
								}}
							/>
						))}
						{routines.length > 0 && (
							<div
								aria-hidden="true"
								className="pointer-events-none absolute inset-y-0 w-24 animate-shimmer bg-gradient-to-r from-transparent via-[#BAE6FD]/40 to-transparent"
							/>
						)}
					</div>
				</div>

				{/* Status Breakdown Legend */}
				<div className="flex flex-wrap gap-3 font-mono text-[#94A3B8] text-[11px]">
					{STATUS_ORDER.map((status) => (
						<div key={status} className="flex items-center gap-1.5">
							<span
								className="inline-block size-1.5 rounded-full shadow-[0_0_6px_currentColor]"
								style={{ background: STATUS_FILL[status] }}
							/>
							<span>{counts[status]}</span>
							<span className="text-[#64748B]">{status}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
