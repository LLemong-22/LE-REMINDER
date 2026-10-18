"use client";

import { Badge } from "@LE-REMINDER/ui/components/badge";
import { cn } from "@LE-REMINDER/ui/lib/utils";
import { Check, Pause, Play, Settings2, Star } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
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

	// Touch device tap-to-reveal handling
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
	const isDone = routine.status === "Done";
	const isCompleted = isDone || isFinished;
	const isDue = isStrictlyDueToday(routine.taskType, routine.status);
	const isOverdue = routine.status === "Overdue";
	const isPaused = routine.status === "Paused";

	const showComplete = isOverdue || routine.status === "Due";
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
			whileHover={{ scale: 1.015, y: -2 }}
			whileTap={{ scale: 0.985 }}
			transition={{ type: "spring", stiffness: 450, damping: 28 }}
			onClick={() => setRevealed((v) => !v)}
			className={cn(
				"group relative flex h-full min-h-[178px] flex-col justify-between rounded-[12px] p-[16px] backdrop-blur-md transition-all duration-200",
				// Due Cards: Crisp icy border with subtle top-edge frost highlight
				isDue &&
					"border border-[#BAE6FD]/35 bg-[rgba(13,22,36,0.78)] shadow-[inset_0_1px_0_0_rgba(186,230,253,0.35),0_10px_30px_-10px_rgba(2,6,23,0.8)] hover:border-[#BAE6FD]/55",
				// Overdue Cards: Subtle rose border with clean rose status pill
				isOverdue &&
					"border border-rose-500/35 bg-[rgba(24,13,20,0.72)] shadow-[inset_0_1px_0_0_rgba(244,63,94,0.22),0_10px_30px_-10px_rgba(2,6,23,0.8)] hover:border-rose-500/55",
				// Done Cards: Recessed
				isCompleted &&
					"border border-white/[0.05] bg-[#070B12]/60 opacity-60 shadow-none hover:border-white/10 hover:opacity-95",
				// Default
				!isDue &&
					!isOverdue &&
					!isCompleted &&
					"frost-panel hover:border-[#BAE6FD]/30",
			)}
		>
			{flipping && (
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 origin-left animate-[sweep-flip_0.4s_ease_forwards] rounded-[11px] bg-[#38BDF8]/15"
				/>
			)}

			{/* Top Row: Status + Category Badges */}
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<div className="relative flex items-center justify-center">
						{isDue && (
							<span
								aria-hidden="true"
								className="absolute -inset-1 animate-ping rounded-full bg-[#38BDF8]/40"
								style={{ animationDuration: "2.5s" }}
							/>
						)}
						<StatusShape status={routine.status} />
					</div>
					<div
						className={cn(
							"rounded-full px-2 py-0.5 font-mono font-semibold text-[10px] tracking-wide",
							isOverdue
								? "border border-rose-500/25 bg-rose-500/10 text-rose-300"
								: isDue
									? "border border-[#BAE6FD]/30 bg-[#BAE6FD]/10 text-[#BAE6FD]"
									: isDone
										? "border border-[#38BDF8]/25 bg-[#38BDF8]/10 text-[#7DD3FC]"
										: "text-[#94A3B8]",
						)}
					>
						{routine.status}
					</div>
				</div>

				<div className="flex items-center gap-1.5">
					<Badge
						variant="outline"
						className={cn(
							"rounded-full px-2 py-0.5 font-bold font-mono text-[9px] uppercase tracking-[0.06em] transition-all",
							routine.isTask
								? "border-[#38BDF8]/40 bg-[#091528]/90 text-[#7DD3FC] shadow-[0_0_10px_-2px_rgba(56,189,248,0.3)]"
								: "border-[#BAE6FD]/30 bg-[#07111E]/90 text-[#93C5FD]",
						)}
					>
						{routine.isTask ? "Task" : "Routine"}
					</Badge>
					<Badge
						variant="secondary"
						className="rounded-full border border-[#BAE6FD]/20 bg-[#091526]/85 px-2.5 py-0.5 font-mono font-semibold text-[#BAE6FD] text-[9.5px] tracking-wider"
					>
						{routine.category}
					</Badge>
				</div>
			</div>

			{/* Middle Row: Title + Schedule Rule */}
			<div className="flex flex-col gap-1.5 py-1">
				<div className="flex items-center gap-1.5">
					{routine.isImportant && (
						<Star className="size-4 shrink-0 fill-[#F59E0B] text-[#F59E0B] drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
					)}
					<div
						className={cn(
							"line-clamp-2 font-bold text-[15px] tracking-tight transition-colors",
							isCompleted ? "text-[#64748B] line-through" : "text-[#F0F9FF]",
						)}
					>
						{routine.name}
					</div>
				</div>

				<div className="flex items-center gap-1.5 font-mono text-[#93C5FD] text-[11.5px]">
					{showMandatoryDot && (
						<span
							aria-hidden="true"
							className={cn(
								"size-1.5 shrink-0 rounded-full",
								isMandatory(routine)
									? "bg-[#F0F9FF] shadow-[0_0_6px_rgba(240,249,255,0.7)]"
									: "border border-[#64748B] bg-transparent",
							)}
						/>
					)}
					<span className="truncate">
						{describeTaskType(routine.taskType, routine.status)}
					</span>
				</div>
			</div>

			{/* Bottom Row: Last Done + Hover Action Buttons */}
			<div className="relative mt-2 flex min-h-[30px] items-center justify-between border-white/[0.06] border-t pt-2">
				<div className="truncate pr-2 font-mono text-[#64748B] text-[10.5px]">
					Last · {formatLastCompleted(routine.lastCompletedAt)}
				</div>

				{/* Sleek Frosted Ghost Action Buttons */}
				<div
					className={cn(
						"flex items-center gap-1 opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100",
						revealed && "opacity-100",
					)}
				>
					{showComplete && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								handleComplete(e.currentTarget);
							}}
							aria-label="Complete routine"
							className="inline-flex h-6.5 cursor-pointer items-center gap-1 rounded-md border border-[#38BDF8]/40 bg-[#38BDF8]/15 px-2 font-medium text-[#BAE6FD] text-[11px] shadow-[0_0_12px_rgba(56,189,248,0.25)] backdrop-blur-xs transition-all hover:border-[#38BDF8]/70 hover:bg-[#38BDF8]/25 active:scale-95"
						>
							<Check className="size-3" />
							<span>Complete</span>
						</button>
					)}
					{showPauseResume && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onTogglePause();
							}}
							aria-label={isPaused ? "Resume routine" : "Pause routine"}
							className="inline-flex h-6.5 cursor-pointer items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 font-medium text-[#93C5FD] text-[11px] backdrop-blur-xs transition-all hover:border-white/25 hover:bg-white/10 hover:text-white active:scale-95"
						>
							{isPaused ? (
								<Play className="size-3" />
							) : (
								<Pause className="size-3" />
							)}
							<span>{isPaused ? "Resume" : "Pause"}</span>
						</button>
					)}
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onEdit();
						}}
						aria-label="Edit routine"
						className="inline-flex h-6.5 cursor-pointer items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 font-medium text-[#93C5FD] text-[11px] backdrop-blur-xs transition-all hover:border-white/25 hover:bg-white/10 hover:text-white active:scale-95"
					>
						<Settings2 className="size-3" />
						<span>Edit</span>
					</button>
				</div>
			</div>
		</motion.div>
	);
}
