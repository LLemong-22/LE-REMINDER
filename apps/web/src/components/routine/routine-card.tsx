"use client";

import { cn } from "@LE-REMINDER/ui/lib/utils";
import { Check, Pause, Pencil, Play, Star } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { triggerCyberExplosion } from "@/lib/cyber-explosion";
import type { DashboardRoutine } from "@/lib/dashboard-routine";
import { describeTaskType } from "@/lib/describe-task-type";
import { formatLastCompleted } from "@/lib/format-last-completed";
import { isStrictlyDueToday } from "@/lib/is-due-today";
import { StatusShape } from "./status-shape";

function isMandatory(routine: DashboardRoutine): boolean {
	return (
		routine.taskType.kind === "Recurring" &&
		routine.taskType.schedule.type === "FixedCalendar" &&
		routine.taskType.schedule.isMandatory
	);
}

const STATUS_BADGE_STYLE: Record<string, string> = {
	Overdue:
		"bg-rose-500/15 text-rose-300 border-rose-500/30 light:bg-rose-100 light:text-rose-700 light:border-rose-300",
	Due: "bg-white/12 text-zinc-100 border-white/25 light:bg-stone-200 light:text-stone-900 light:border-stone-400",
	Done: "bg-zinc-800/40 text-zinc-300 border-zinc-700/40 light:bg-stone-200/60 light:text-stone-600 light:border-stone-300",
	Paused:
		"bg-zinc-800/40 text-zinc-400 border-zinc-700/30 light:bg-stone-200/50 light:text-stone-500 light:border-stone-300",
	Finished:
		"bg-zinc-800/30 text-zinc-400 border-zinc-800/50 light:bg-stone-200/40 light:text-stone-500 light:border-stone-300",
};

export function RoutineCard({
	routine,
	onComplete,
	onEdit,
	onTogglePause,
}: {
	routine: DashboardRoutine;
	onComplete: () => void;
	onEdit: () => void;
	onTogglePause: () => void;
}) {
	const [flipping, setFlipping] = useState(false);
	const cardRef = useRef<HTMLDivElement>(null);

	const isFinished = routine.status === "Finished";
	const isCompleted = routine.status === "Done" || isFinished;
	const isDue = isStrictlyDueToday(routine.taskType, routine.status);
	const isPaused = routine.status === "Paused";
	const showComplete = routine.status === "Overdue" || routine.status === "Due";
	const showPauseResume = !isFinished;
	const showMandatoryDot =
		routine.taskType.kind === "Recurring" &&
		routine.taskType.schedule.type === "FixedCalendar";

	function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
		const el = cardRef.current;
		if (!el) return;
		const rect = el.getBoundingClientRect();
		el.style.setProperty("--x", `${e.clientX - rect.left}px`);
		el.style.setProperty("--y", `${e.clientY - rect.top}px`);
	}

	function handleComplete(target?: HTMLElement) {
		if (target) {
			triggerCyberExplosion(target);
		}
		onComplete();
		setFlipping(true);
		setTimeout(() => setFlipping(false), 400);
	}

	return (
		<motion.div
			ref={cardRef}
			layout="position"
			transition={{ type: "spring", stiffness: 450, damping: 32 }}
			onMouseMove={handleMouseMove}
			className={cn(
				"group relative flex select-none flex-col justify-between overflow-hidden rounded-xl p-4.5 transition-all duration-200",
				isDue
					? "border border-white/25 light:border-stone-400 bg-gradient-to-b light:bg-gradient-to-b from-zinc-800/80 light:from-[#FBFBFA] via-zinc-900/85 light:to-[#F5F4F0] to-zinc-950/90 light:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_6px_24px_-2px_rgba(28,25,23,0.08)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28),0_12px_32px_-8px_rgba(0,0,0,0.6)] hover:border-white/40"
					: isCompleted
						? "border border-white/[0.05] light:border-stone-300/60 bg-zinc-950/40 light:bg-stone-200/40 opacity-65 hover:opacity-90"
						: "border border-white/[0.11] light:border-stone-300/80 bg-gradient-to-b light:bg-[#F5F4F0] from-zinc-800/65 via-zinc-900/75 to-zinc-950/85 light:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_4px_20px_-2px_rgba(28,25,23,0.06)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18),0_8px_24px_-6px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 hover:border-white/[0.22] light:hover:border-stone-400",
			)}
		>
			{/* Cursor-Tracking Radial Spotlight */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				style={{
					background:
						"radial-gradient(320px circle at var(--x, 50%) var(--y, 50%), rgba(var(--spotlight-rgb, 255, 255, 255), var(--spotlight-alpha, 0.07)), transparent 80%)",
				}}
			/>

			{flipping && (
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 origin-left animate-[sweep-flip_0.4s_ease_forwards] rounded-xl bg-white/[0.08] light:bg-stone-900/[0.06]"
				/>
			)}

			<div className="relative z-10 flex flex-col gap-3">
				{/* 1. Top Header Row */}
				<div className="flex items-center justify-between gap-2">
					<div
						className={cn(
							"flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-medium font-mono text-[10.5px] uppercase tracking-wider",
							STATUS_BADGE_STYLE[routine.status] ?? STATUS_BADGE_STYLE.Due,
						)}
					>
						<div className="relative flex items-center justify-center">
							{isDue && (
								<span
									aria-hidden="true"
									className="absolute -inset-1 animate-ping rounded-full bg-white/30"
									style={{ animationDuration: "2.4s" }}
								/>
							)}
							<StatusShape status={routine.status} size={9} />
						</div>
						<span>{routine.status}</span>
					</div>

					<div className="flex items-center gap-1.5">
						<span className="rounded-md border border-white/[0.12] light:border-stone-300/80 bg-white/[0.06] light:bg-stone-200/70 px-1.5 py-0.5 font-mono light:text-stone-600 text-[10px] text-zinc-300 uppercase tracking-wider">
							{routine.isTask ? "Task" : "Routine"}
						</span>
						{routine.category && (
							<span className="rounded-md border border-white/[0.12] light:border-stone-300/80 bg-white/[0.06] light:bg-stone-200/70 px-1.5 py-0.5 font-mono light:text-stone-600 text-[10px] text-zinc-300 uppercase tracking-wider">
								{routine.category}
							</span>
						)}
					</div>
				</div>

				{/* 2. Middle Body */}
				<div className="flex flex-col gap-1.5 pt-0.5">
					<div className="flex items-start gap-1.5">
						{routine.isImportant && (
							<Star className="mt-0.5 size-3.5 shrink-0 fill-amber-400/80 text-amber-400/80" />
						)}
						<h3
							className={cn(
								"font-semibold text-[17px] leading-snug tracking-tight transition-colors",
								isCompleted
									? "light:text-stone-400 text-zinc-400 line-through decoration-zinc-500/60 light:decoration-stone-400/60"
									: "light:text-stone-900 text-zinc-100",
							)}
						>
							{routine.name}
						</h3>
					</div>

					<div className="flex items-center gap-1.5 font-mono light:text-stone-600 text-xs text-zinc-300 tabular-nums">
						{showMandatoryDot && (
							<span
								aria-hidden="true"
								className={cn(
									"size-1.5 shrink-0 rounded-full",
									isMandatory(routine)
										? "bg-zinc-200 light:bg-stone-800"
										: "border border-zinc-600 light:border-stone-400 bg-transparent",
								)}
							/>
						)}
						<span className="font-medium">
							{describeTaskType(routine.taskType, routine.status)}
						</span>
					</div>
				</div>
			</div>

			{/* 3. Bottom Footer Strip */}
			<div className="relative z-10 mt-4 flex items-center justify-between border-white/[0.07] light:border-stone-300/80 border-t pt-3">
				<div className="font-mono light:text-stone-500 text-xs text-zinc-400 tabular-nums">
					Last done · {formatLastCompleted(routine.lastCompletedAt)}
				</div>

				{/* Always-accessible quick action buttons */}
				<div className="flex items-center gap-1.5">
					{showComplete && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								handleComplete(e.currentTarget);
							}}
							title="Mark complete"
							className="flex size-7 cursor-pointer items-center justify-center rounded-md border border-white/20 light:border-stone-400 bg-white/10 light:bg-stone-200 light:text-stone-900 text-zinc-100 shadow-sm transition-all hover:scale-105 hover:border-white/40 hover:bg-white/20 light:hover:bg-stone-300 hover:text-white active:scale-95"
						>
							<Check className="size-3.5 stroke-[2.5]" />
						</button>
					)}

					{showPauseResume && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onTogglePause();
							}}
							title={isPaused ? "Resume routine" : "Pause routine"}
							className="flex size-7 cursor-pointer items-center justify-center rounded-md border border-white/[0.08] light:border-stone-300 bg-white/[0.04] light:bg-stone-100 light:text-stone-600 text-zinc-400 transition-all hover:scale-105 hover:border-white/20 light:hover:border-stone-400 hover:bg-white/[0.08] hover:text-zinc-100 light:hover:text-stone-900 active:scale-95"
						>
							{isPaused ? (
								<Play className="size-3 fill-current" />
							) : (
								<Pause className="size-3 fill-current" />
							)}
						</button>
					)}

					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onEdit();
						}}
						title="Edit routine"
						className="flex size-7 cursor-pointer items-center justify-center rounded-md border border-white/[0.08] light:border-stone-300 bg-white/[0.04] light:bg-stone-100 light:text-stone-600 text-zinc-400 transition-all hover:scale-105 hover:border-white/20 light:hover:border-stone-400 hover:bg-white/[0.08] hover:text-zinc-100 light:hover:text-stone-900 active:scale-95"
					>
						<Pencil className="size-3" />
					</button>
				</div>
			</div>
		</motion.div>
	);
}
