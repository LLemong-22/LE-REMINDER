import { Badge } from "@LE-REMINDER/ui/components/badge";
import { cn } from "@LE-REMINDER/ui/lib/utils";
import { Star } from "lucide-react";
import type { DashboardRoutine } from "@/lib/dashboard-routine";
import { describeTaskType } from "@/lib/describe-task-type";
import { formatLastCompleted } from "@/lib/format-last-completed";
import { isStrictlyDueToday } from "@/lib/is-due-today";
import { StatusShape } from "./status-shape";

export function RoutineListRow({ routine }: { routine: DashboardRoutine }) {
	const isFinished = routine.status === "Finished";
	const isCompleted = routine.status === "Done" || isFinished;
	const isDue = isStrictlyDueToday(routine.taskType, routine.status);

	return (
		<div
			className={cn(
				"group flex items-center gap-4 border-[#BAE6FD]/10 border-b p-3.5 px-5 transition-all duration-150 last:border-0 hover:bg-[#BAE6FD]/[0.04]",
				isCompleted && "opacity-55 hover:opacity-90",
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
							? "text-[#64748B] line-through"
							: "text-[#F0F9FF] group-hover:text-[#BAE6FD]",
					)}
				>
					{routine.name}
				</div>
			</div>
			<div className="w-[80px] shrink-0">
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
			</div>
			<div className="w-[100px] shrink-0">
				<Badge
					variant="secondary"
					className="rounded-full border border-[#BAE6FD]/20 bg-[#091526]/85 px-2.5 py-0.5 font-mono font-semibold text-[#BAE6FD] text-[9.5px] tracking-wider"
				>
					{routine.category}
				</Badge>
			</div>
			<div className="w-[180px] shrink-0 truncate font-mono text-[#93C5FD] text-[11.5px]">
				{describeTaskType(routine.taskType, routine.status)}
			</div>
			<div className="w-[100px] shrink-0 font-mono text-[#64748B] text-[11px]">
				{formatLastCompleted(routine.lastCompletedAt)}
			</div>
		</div>
	);
}
