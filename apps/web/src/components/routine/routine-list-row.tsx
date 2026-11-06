"use client";

import { Badge } from "@LE-REMINDER/ui/components/badge";
import { cn } from "@LE-REMINDER/ui/lib/utils";
import { Check, Pause, Play, Settings2, Star } from "lucide-react";
import { triggerCyberExplosion } from "@/lib/cyber-explosion";
import type { DashboardRoutine } from "@/lib/dashboard-routine";
import { describeTaskType } from "@/lib/describe-task-type";
import { formatLastCompleted } from "@/lib/format-last-completed";
import { isStrictlyDueToday } from "@/lib/is-due-today";
import { StatusShape } from "./status-shape";

export function RoutineListRow({
	routine,
	isOverdrive = false,
	onComplete,
	onTogglePause,
	onEdit,
}: {
	routine: DashboardRoutine;
	isOverdrive?: boolean;
	onComplete?: (routine: DashboardRoutine) => void;
	onTogglePause?: (routine: DashboardRoutine) => void;
	onEdit?: (routine: DashboardRoutine) => void;
}) {
	const isFinished = routine.status === "Finished";
	const isCompleted = routine.status === "Done" || isFinished;
	const isPaused = routine.status === "Paused";
	const isOverdue = routine.status === "Overdue";
	const isDue = isStrictlyDueToday(routine.taskType, routine.status);
	const showComplete = isOverdue || routine.status === "Due";
	const showPauseResume = !isFinished;
	const hasActions = Boolean(onComplete || onTogglePause || onEdit);

	return (
		<div
			className={cn(
				"group relative flex items-center gap-4 border-b p-3.5 px-5 transition-colors duration-150 last:border-0 hover:bg-[#BAE6FD]/[0.04]",
				isOverdrive ? "border-[#7DD3FC]/25" : "border-[#BAE6FD]/10",
				isCompleted
					? isOverdrive
						? "bg-[#0C1E36]/35 opacity-100 shadow-[inset_0_0_12px_rgba(56,189,248,0.1)]"
						: "opacity-55 hover:opacity-90"
					: "opacity-100",
				isDue &&
					"border-[#BAE6FD]/25 bg-[#BAE6FD]/[0.06] shadow-[inset_0_0_16px_rgba(186,230,253,0.06)]",
			)}
		>
			<div className="relative flex w-3 shrink-0 items-center justify-center transition-transform duration-150 group-hover:scale-110">
				{isDue && (
					<span
						aria-hidden="true"
						className="absolute -inset-1 animate-ping rounded-full bg-[#38BDF8]/40"
						style={{ animationDuration: "2.5s" }}
					/>
				)}
				<StatusShape status={routine.status} size={11} />
			</div>
			<div className="flex min-w-40 flex-1 items-center gap-1.5 transition-transform duration-150 group-hover:translate-x-0.5">
				{routine.isImportant && (
					<Star className="size-3.5 shrink-0 fill-[#F59E0B] text-[#F59E0B] drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
				)}
				<div
					className={cn(
						"font-semibold text-sm transition-colors duration-150",
						isCompleted
							? isOverdrive
								? "text-[#E0F2FE] line-through decoration-[#38BDF8]/40 drop-shadow-[0_0_6px_rgba(186,230,253,0.3)]"
								: "text-[#64748B] line-through"
							: "text-[#F0F9FF] group-hover:text-[#BAE6FD]",
					)}
				>
					{routine.name}
				</div>
			</div>
			<div className="hidden w-[80px] shrink-0 sm:block">
				<Badge
					variant="outline"
					className={cn(
						"rounded-full px-2 py-0.5 font-bold font-mono text-[9px] uppercase tracking-[0.06em] transition-opacity",
						routine.isTask
							? "border-[#38BDF8]/40 bg-[#091528]/90 text-[#7DD3FC] shadow-[0_0_10px_-2px_rgba(56,189,248,0.3)]"
							: "border-[#BAE6FD]/30 bg-[#07111E]/90 text-[#93C5FD]",
					)}
				>
					{routine.isTask ? "Task" : "Routine"}
				</Badge>
			</div>
			<div className="hidden w-[100px] shrink-0 md:block">
				<Badge
					variant="secondary"
					className="rounded-full border border-[#BAE6FD]/20 bg-[#091526]/85 px-2.5 py-0.5 font-mono font-semibold text-[#BAE6FD] text-[9.5px] tracking-wider"
				>
					{routine.category}
				</Badge>
			</div>
			<div className="hidden w-[180px] shrink-0 truncate font-mono text-[#93C5FD] text-[11.5px] lg:block">
				{describeTaskType(routine.taskType, routine.status)}
			</div>
			<div
				className={cn(
					"w-[100px] shrink-0 text-right font-mono text-[#64748B] text-[11px] transition-opacity duration-100",
					hasActions && "group-focus-within:opacity-0 group-hover:opacity-0",
				)}
			>
				{formatLastCompleted(routine.lastCompletedAt)}
			</div>

			{hasActions && (
				<div className="pointer-events-none absolute inset-y-0 right-4 z-20 flex items-center gap-1.5 opacity-0 transition-opacity duration-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100">
					{showComplete && onComplete && (
						<button
							type="button"
							onClick={(e) => {
								triggerCyberExplosion(e.currentTarget);
								onComplete(routine);
							}}
							aria-label={`Complete ${routine.name}`}
							title="Complete routine"
							className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#38BDF8]/60 bg-[#0D1E33] px-2.5 py-1 font-semibold text-[#BAE6FD] text-xs shadow-[0_0_10px_rgba(56,189,248,0.2)] transition-all hover:border-[#38BDF8] hover:bg-[#38BDF8] hover:text-[#06101E] active:scale-95"
						>
							<Check className="size-3 stroke-[2.5]" />
							<span>Done</span>
						</button>
					)}
					{showPauseResume && onTogglePause && (
						<button
							type="button"
							onClick={() => onTogglePause(routine)}
							aria-label={
								isPaused ? `Resume ${routine.name}` : `Pause ${routine.name}`
							}
							title={isPaused ? "Resume routine" : "Pause routine"}
							className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md border border-white/15 bg-[#102136]/95 text-[#93C5FD] transition-all hover:border-white/30 hover:bg-[#1A385C] hover:text-white active:scale-95"
						>
							{isPaused ? (
								<Play className="size-3 text-[#38BDF8]" />
							) : (
								<Pause className="size-3" />
							)}
						</button>
					)}
					{onEdit && (
						<button
							type="button"
							onClick={() => onEdit(routine)}
							aria-label={`Edit ${routine.name}`}
							title="Edit routine"
							className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md border border-white/15 bg-[#102136]/95 text-[#93C5FD] transition-all hover:border-white/30 hover:bg-[#1A385C] hover:text-white active:scale-95"
						>
							<Settings2 className="size-3.5" />
						</button>
					)}
				</div>
			)}
		</div>
	);
}
