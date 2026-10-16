"use client";

import { Button } from "@LE-REMINDER/ui/components/button";
import { cn } from "@LE-REMINDER/ui/lib/utils";
import { Star } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { triggerCyberExplosion } from "@/lib/cyber-explosion";
import type { DashboardRoutine } from "@/lib/dashboard-routine";
import { describeTaskType } from "@/lib/describe-task-type";
import { formatLastCompleted } from "@/lib/format-last-completed";
import { isStrictlyDueToday } from "@/lib/is-due-today";
import { STATUS_TEXT } from "@/lib/status-visual";
import { StatusShape } from "./status-shape";

function isMandatory(routine: DashboardRoutine): boolean {
	return (
		routine.taskType.kind === "Recurring" &&
		routine.taskType.schedule.type === "FixedCalendar" &&
		routine.taskType.schedule.isMandatory
	);
}

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
	const [revealed, setRevealed] = useState(false);
	const cardRef = useRef<HTMLDivElement>(null);

	// On mobile, tap toggles action toolbar visibility; tap outside collapses it.
	useEffect(() => {
		if (!revealed) return;
		function handlePointerDown(event: PointerEvent) {
			if (!cardRef.current?.contains(event.target as Node)) {
				setRevealed(false);
			}
		}
		document.addEventListener("pointerdown", handlePointerDown);
		return () => document.removeEventListener("pointerdown", handlePointerDown);
	}, [revealed]);

	const isFinished = routine.status === "Finished";
	const isCompleted = routine.status === "Done" || isFinished;
	const isDue = isStrictlyDueToday(routine.taskType, routine.status);
	const isPaused = routine.status === "Paused";
	const showComplete = routine.status === "Overdue" || routine.status === "Due";
	const showPauseResume = !isFinished;
	const showMandatoryDot =
		routine.taskType.kind === "Recurring" &&
		routine.taskType.schedule.type === "FixedCalendar";

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
			onClick={() => setRevealed((v) => !v)}
			className={cn(
				"group relative flex select-none flex-col justify-between overflow-hidden rounded-xl p-4 transition-all duration-200",
				isDue
					? "border border-white/25 bg-zinc-900/70 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28),0_8px_32px_rgba(0,0,0,0.5)] hover:border-white/35"
					: isCompleted
						? "border border-white/[0.04] bg-zinc-950/40 opacity-55 hover:opacity-85"
						: "border border-white/[0.07] bg-zinc-900/55 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_32px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 hover:border-white/[0.18] hover:bg-zinc-850/60",
			)}
		>
			{flipping && (
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 origin-left animate-[sweep-flip_0.4s_ease_forwards] rounded-xl bg-white/[0.08]"
				/>
			)}

			<div className="flex flex-col gap-2.5">
				{/* Header Row: Status & Badges */}
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<div className="relative flex items-center justify-center">
							{isDue && (
								<span
									aria-hidden="true"
									className="absolute -inset-1 animate-ping rounded-full bg-white/30"
									style={{ animationDuration: "2.4s" }}
								/>
							)}
							<StatusShape status={routine.status} size={10} />
						</div>
						<span
							className={cn(
								"font-medium font-mono text-[10.5px] uppercase tracking-wider",
								isDue && "text-[#EDEDEF]",
							)}
							style={{ color: isDue ? undefined : STATUS_TEXT[routine.status] }}
						>
							{routine.status}
						</span>
					</div>

					<div className="flex items-center gap-1.5">
						<span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9.5px] text-zinc-400 uppercase tracking-wider">
							{routine.isTask ? "Task" : "Routine"}
						</span>
						{routine.category && (
							<span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9.5px] text-zinc-400 uppercase tracking-wider">
								{routine.category}
							</span>
						)}
					</div>
				</div>

				{/* Title & Importance */}
				<div className="flex items-center gap-1.5 pt-0.5">
					{routine.isImportant && (
						<Star className="size-3.5 shrink-0 fill-amber-400/80 text-amber-400/80" />
					)}
					<h3
						className={cn(
							"font-medium text-[14.5px] leading-snug tracking-tight transition-colors",
							isCompleted ? "text-[#52525B] line-through" : "text-[#EDEDEF]",
						)}
					>
						{routine.name}
					</h3>
				</div>

				{/* Schedule & Metadata */}
				<div className="flex flex-col gap-1 font-mono text-xs text-zinc-400 tabular-nums">
					<div className="flex items-center gap-1.5">
						{showMandatoryDot && (
							<span
								aria-hidden="true"
								className={cn(
									"size-1.5 shrink-0 rounded-full",
									isMandatory(routine)
										? "bg-[#EDEDEF]"
										: "border border-zinc-600 bg-transparent",
								)}
							/>
						)}
						<span className="text-zinc-300">
							{describeTaskType(routine.taskType, routine.status)}
						</span>
					</div>
					<div className="text-[11px] text-zinc-500">
						Last done · {formatLastCompleted(routine.lastCompletedAt)}
					</div>
				</div>
			</div>

			{/* Sliding Frosted Action Pill Toolbar */}
			<div
				className={cn(
					"pointer-events-none flex translate-y-1 items-center gap-1.5 pt-3 opacity-0 transition-all duration-150 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100",
					revealed && "pointer-events-auto translate-y-0 opacity-100",
				)}
			>
				{showComplete && (
					<Button
						size="xs"
						onClick={(e) => {
							e.stopPropagation();
							handleComplete(e.currentTarget);
						}}
						className="h-6.5 rounded-md border border-white/20 bg-white/10 px-2.5 font-medium text-[#EDEDEF] text-[11px] shadow-sm backdrop-blur-xs transition-all hover:bg-white/20 active:scale-95"
					>
						Complete
					</Button>
				)}
				{showPauseResume && (
					<Button
						size="xs"
						variant="outline"
						onClick={(e) => {
							e.stopPropagation();
							onTogglePause();
						}}
						className="h-6.5 rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 font-normal text-[11px] text-zinc-300 backdrop-blur-xs transition-all hover:bg-white/[0.1] hover:text-[#EDEDEF] active:scale-95"
					>
						{isPaused ? "Resume" : "Pause"}
					</Button>
				)}
				<Button
					size="xs"
					variant="outline"
					onClick={(e) => {
						e.stopPropagation();
						onEdit();
					}}
					className="h-6.5 rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 font-normal text-[11px] text-zinc-300 backdrop-blur-xs transition-all hover:bg-white/[0.1] hover:text-[#EDEDEF] active:scale-95"
				>
					Edit
				</Button>
			</div>
		</motion.div>
	);
}
