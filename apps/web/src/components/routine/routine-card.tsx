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
			onClick={() => setRevealed((v) => !v)}
			className={cn(
				"group relative flex h-full min-h-[165px] flex-col justify-between overflow-hidden rounded-[12px] p-4 backdrop-blur-md transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.99]",
				// Due Cards: Bright crystalline border with top frost glow
				isDue &&
					"border border-[#7DD3FC]/75 bg-[linear-gradient(135deg,rgba(35,68,110,0.85)_0%,rgba(18,38,64,0.92)_100%)] shadow-[0_0_25px_-5px_rgba(56,189,248,0.32),inset_0_1px_0_0_rgba(255,255,255,0.7)] hover:border-[#7DD3FC]",
				// Overdue Cards: Subtle rose border with clean rose status pill
				isOverdue &&
					"border border-rose-500/60 bg-[linear-gradient(135deg,rgba(48,18,28,0.85)_0%,rgba(28,14,22,0.92)_100%)] shadow-[inset_0_1px_0_0_rgba(244,63,94,0.4),0_10px_30px_-10px_rgba(2,6,23,0.8)] hover:border-rose-500/80",
				// Done Cards: Clearly darker, settled, recessed, easily distinguishable from active tasks!
				isCompleted &&
					"border border-white/[0.06] bg-[#050C16]/90 opacity-60 shadow-none hover:border-[#7DD3FC]/20 hover:opacity-90",
				// Default
				!isDue &&
					!isOverdue &&
					!isCompleted &&
					"frost-panel hover:border-[#7DD3FC]/40",
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
								? "border border-rose-500/30 bg-rose-500/15 text-rose-300"
								: isDue
									? "border border-[#7DD3FC]/60 bg-[#7DD3FC]/20 text-[#BAE6FD] shadow-[0_0_8px_rgba(56,189,248,0.25)]"
									: isDone
										? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400/80"
										: isFinished
											? "border border-white/10 bg-white/5 text-[#64748B]"
											: "text-[#93C5FD]",
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
							isCompleted
								? "border-white/[0.08] bg-white/[0.04] text-[#64748B]"
								: routine.isTask
									? "border-[#38BDF8]/40 bg-[#091528]/90 text-[#7DD3FC] shadow-[0_0_10px_-2px_rgba(56,189,248,0.3)]"
									: "border-[#BAE6FD]/30 bg-[#07111E]/90 text-[#93C5FD]",
						)}
					>
						{routine.isTask ? "Task" : "Routine"}
					</Badge>
					<Badge
						variant="secondary"
						className={cn(
							"rounded-full px-2.5 py-0.5 font-mono font-semibold text-[9.5px] tracking-wider",
							isCompleted
								? "border border-white/[0.06] bg-white/[0.03] text-[#64748B]"
								: "border border-[#7DD3FC]/25 bg-[#17304F] text-[#BAE6FD]",
						)}
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
							"line-clamp-2 font-semibold text-[15px] tracking-tight transition-colors",
							isCompleted
								? "text-[#64748B] line-through decoration-[#38BDF8]/25 group-hover:text-[#93C5FD]/80"
								: "text-[#F8FAFC]",
						)}
					>
						{routine.name}
					</div>
				</div>

				<div
					className={cn(
						"flex items-center gap-1.5 font-mono text-xs",
						isCompleted ? "text-[#64748B]/80" : "text-[#BAE6FD]",
					)}
				>
					{showMandatoryDot && (
						<span
							aria-hidden="true"
							className={cn(
								"size-1.5 shrink-0 rounded-full",
								isMandatory(routine)
									? "bg-[#F8FAFC] shadow-[0_0_6px_rgba(240,249,255,0.7)]"
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
			<div className="relative mt-2 flex min-h-[30px] items-center justify-between gap-2 border-white/[0.08] border-t pt-2">
				<div
					className={cn(
						"truncate font-medium font-mono text-xs",
						isCompleted ? "text-[#64748B]" : "text-[#93C5FD]",
					)}
				>
					Last · {formatLastCompleted(routine.lastCompletedAt)}
				</div>

				{/* Sleek Frosted Ghost Action Buttons - Compact pills that never overflow the card boundaries */}
				<div
					className={cn(
						"flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100",
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
							title="Complete routine"
							className="inline-flex h-6.5 cursor-pointer items-center gap-1 rounded-md border border-[#38BDF8]/50 bg-[#38BDF8]/20 px-2 font-medium text-[#BAE6FD] text-[11px] shadow-[0_0_10px_rgba(56,189,248,0.2)] backdrop-blur-xs transition-all hover:border-[#38BDF8] hover:bg-[#38BDF8] hover:text-[#06101E] active:scale-95"
						>
							<Check className="size-3 stroke-[2.5]" />
							<span>Done</span>
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
							title={isPaused ? "Resume routine" : "Pause routine"}
							className="inline-flex size-6.5 cursor-pointer items-center justify-center rounded-md border border-white/10 bg-white/5 text-[#93C5FD] backdrop-blur-xs transition-all hover:border-white/25 hover:bg-white/10 hover:text-white active:scale-95"
						>
							{isPaused ? (
								<Play className="size-3 text-[#38BDF8]" />
							) : (
								<Pause className="size-3" />
							)}
						</button>
					)}
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onEdit();
						}}
						aria-label="Edit routine"
						title="Edit routine"
						className="inline-flex size-6.5 cursor-pointer items-center justify-center rounded-md border border-white/10 bg-white/5 text-[#93C5FD] backdrop-blur-xs transition-all hover:border-white/25 hover:bg-white/10 hover:text-white active:scale-95"
					>
						<Settings2 className="size-3" />
					</button>
				</div>
			</div>
		</motion.div>
	);
}
