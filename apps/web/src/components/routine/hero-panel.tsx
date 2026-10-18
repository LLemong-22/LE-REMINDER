"use client";

import type { RoutineStatus } from "@LE-REMINDER/core/domain/routine-status";
import { Checkbox } from "@LE-REMINDER/ui/components/checkbox";
import { cn } from "@LE-REMINDER/ui/lib/utils";
import { NexusAnimation } from "@/components/nexus-animation";
import { CountUp } from "@/components/ui/count-up";
import { DecryptedText } from "@/components/ui/decrypted-text";
import { cryoSound } from "@/lib/cryo-sound";
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

function CircularProgressIndicator({
	progressPct,
	isOverdrive = false,
	onToggleOverdrive,
}: {
	progressPct: number;
	isOverdrive?: boolean;
	onToggleOverdrive?: () => void;
}) {
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
				<defs>
					<linearGradient
						id="heroProgressCryoGradient"
						x1="0%"
						y1="0%"
						x2="100%"
						y2="100%"
					>
						<stop offset="0%" stopColor="#0284C7" />
						<stop offset="40%" stopColor="#38BDF8" />
						<stop offset="100%" stopColor="#BAE6FD" />
					</linearGradient>
				</defs>
				{/* Crystalline dial outer calibration ticks */}
				<circle
					cx="64"
					cy="64"
					r={58}
					fill="none"
					stroke="rgba(186, 230, 253, 0.22)"
					strokeWidth="1"
					strokeDasharray="2 6"
				/>
				{/* Background circular track */}
				<circle
					cx="64"
					cy="64"
					r={radius}
					fill="none"
					stroke="rgba(186, 230, 253, 0.12)"
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
					className={cn(
						"transition-all duration-1000 ease-out",
						isOverdrive
							? "drop-shadow-[0_0_20px_#38BDF8]"
							: "drop-shadow-[0_0_14px_rgba(56,189,248,0.65)]",
					)}
				/>
			</svg>
			<div className="relative flex items-center justify-center">
				<NexusAnimation
					progressPct={progressPct}
					isOverdrive={isOverdrive}
					onToggleOverdrive={onToggleOverdrive}
				/>
			</div>
		</div>
	);
}

export function HeroPanel({
	routines,
	onComplete,
	isOverdrive = false,
	onToggleOverdrive,
}: {
	routines: DashboardRoutine[];
	onComplete: (routine: DashboardRoutine) => void;
	isOverdrive?: boolean;
	onToggleOverdrive?: () => void;
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

	function handleCheck(routine: DashboardRoutine, target?: HTMLElement) {
		cryoSound.playShatterComplete();
		if (target) {
			triggerCyberExplosion(target);
		}
		onComplete(routine);
	}

	return (
		<div
			style={{ willChange: "transform", transform: "translateZ(0)" }}
			className={cn(
				"frost-panel relative flex flex-col divide-y divide-[#BAE6FD]/15 overflow-hidden rounded-xl transition-all duration-500 md:flex-row md:divide-x md:divide-y-0",
				isOverdrive &&
					"border-[#7DD3FC] shadow-[0_0_35px_-5px_rgba(56,189,248,0.4),inset_0_1px_0_0_rgba(255,255,255,0.7)]",
			)}
		>
			{/* Dual-Laser Border Beam in Overdrive Mode */}
			{isOverdrive && (
				<div
					aria-hidden="true"
					className="pointer-events-none absolute -inset-px z-20 overflow-hidden rounded-xl border border-[#38BDF8]/80 shadow-[0_0_24px_rgba(56,189,248,0.5),inset_0_0_15px_rgba(224,242,254,0.2)]"
				>
					<div
						className="absolute inset-[-100%] animate-[spin-cw_3.5s_linear_infinite]"
						style={{
							background:
								"conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(56,189,248,0.8) 45deg, #FFFFFF 90deg, rgba(125,211,252,0.8) 135deg, transparent 180deg, rgba(56,189,248,0.8) 225deg, #FFFFFF 270deg, transparent 360deg)",
							WebkitMask:
								"linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
							WebkitMaskComposite: "xor",
							maskComposite: "exclude",
							padding: "2px",
						}}
					/>
				</div>
			)}

			{/* Ambient glacial haze (intensified in Overdrive) */}
			<div
				aria-hidden="true"
				className={cn(
					"pointer-events-none absolute -inset-10 -z-10 transition-opacity duration-700",
					isOverdrive
						? "bg-[radial-gradient(ellipse_at_30%_50%,rgba(56,189,248,0.32),transparent_70%)] opacity-100"
						: "bg-[radial-gradient(ellipse_at_30%_50%,rgba(56,189,248,0.12),transparent_60%)] opacity-60",
				)}
			/>

			{/* Column 1: Daily Task Checklist */}
			<div className="flex min-w-[170px] flex-1 flex-col gap-2.5 p-4 lg:p-5">
				<div className="flex items-center justify-between">
					<div className="font-extrabold text-[#F8FAFC] text-[15px] tracking-tight">
						Daily Task
					</div>
					<span className="font-medium font-mono text-[#BAE6FD] text-[11.5px]">
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
									"group/item -mx-1 flex items-center gap-2.5 rounded-lg px-2 py-1 transition-colors duration-150 hover:bg-[#BAE6FD]/10",
									done ? "opacity-60 hover:opacity-90" : "opacity-100",
								)}
							>
								<Checkbox
									checked={done}
									onCheckedChange={() => {
										if (!done) handleCheck(routine);
									}}
									onClick={(e) => {
										if (!done) {
											handleCheck(routine, e.currentTarget);
										}
									}}
									className="size-4 cursor-pointer rounded border-[#7DD3FC]/50 transition-all duration-150 active:scale-90 group-hover/item:border-[#38BDF8] data-checked:border-[#7DD3FC] data-checked:bg-[#38BDF8] data-checked:text-[#06101E]"
								/>
								<button
									type="button"
									onClick={(e) => {
										if (!done) {
											handleCheck(routine, e.currentTarget);
										}
									}}
									className={cn(
										"flex-1 cursor-pointer bg-transparent text-left font-medium text-[13.5px] transition-colors duration-150 active:scale-[0.99]",
										done
											? "text-[#64748B] line-through decoration-[#38BDF8]/30 group-hover/item:text-[#93C5FD]"
											: "text-[#F8FAFC] hover:text-[#38BDF8]",
									)}
								>
									{routine.name}
								</button>
							</div>
						);
					})}
				</div>
			</div>

			{/* Column 2: THE-CORE Reactor */}
			<div className="flex min-w-[170px] flex-none items-center justify-center p-4 lg:p-5">
				<CircularProgressIndicator
					progressPct={progressPct}
					isOverdrive={isOverdrive}
					onToggleOverdrive={onToggleOverdrive}
				/>
			</div>

			{/* Column 3: Overall Progress Metrics */}
			<div className="flex min-w-[190px] flex-[1.2] flex-col justify-center gap-2.5 p-4 lg:p-5">
				<div className="flex items-center justify-between">
					<div className="font-mono text-[#93C5FD] text-[11px] uppercase tracking-[0.12em]">
						<DecryptedText
							text="OVERALL PROGRESS"
							speed={30}
							maxIterations={8}
							encryptedClassName="text-[#38BDF8]"
						/>
					</div>
					<span
						className={cn(
							"font-bold font-mono text-[11px] tracking-[0.25em] transition-all",
							isOverdrive
								? "text-[#E0F2FE] drop-shadow-[0_0_10px_#38BDF8]"
								: "text-[#7DD3FC] drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]",
						)}
					>
						{isOverdrive ? "THE-CORE // OVERDRIVE" : "THE-CORE"}
					</span>
				</div>

				<div className="font-extrabold text-[#F8FAFC] text-[32px] tracking-tight">
					<CountUp to={progressPct} duration={1.1} />
				</div>

				{/* Segmented Cryo Progress Bar with Overdrive Sheen */}
				<div className="relative">
					<div
						className={cn(
							"relative flex h-2.5 overflow-hidden rounded-full border border-[#BAE6FD]/20 bg-[#091524] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] transition-all",
							isOverdrive &&
								"border-[#7DD3FC]/70 shadow-[0_0_14px_rgba(56,189,248,0.45)]",
						)}
					>
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
								className={cn(
									"pointer-events-none absolute inset-y-0 w-24 animate-shimmer bg-gradient-to-r from-transparent via-[#BAE6FD]/40 to-transparent",
									isOverdrive && "w-36 via-[#FFFFFF]/70",
								)}
							/>
						)}
					</div>
				</div>

				{/* Status Breakdown Legend */}
				<div className="flex flex-wrap gap-3 font-mono text-[#BAE6FD] text-[11px]">
					{STATUS_ORDER.map((status) => (
						<div key={status} className="flex items-center gap-1.5">
							<span
								className="inline-block size-1.5 rounded-full shadow-[0_0_6px_currentColor]"
								style={{ background: STATUS_FILL[status] }}
							/>
							<span className="font-semibold text-[#F8FAFC]">
								{counts[status]}
							</span>
							<span className="text-[#93C5FD]">{status}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
