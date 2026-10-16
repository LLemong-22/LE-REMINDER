import { cn } from "@LE-REMINDER/ui/lib/utils";
import { Star } from "lucide-react";
import { motion } from "motion/react";
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
		<motion.div
			layout="position"
			transition={{ type: "spring", stiffness: 450, damping: 32 }}
			className={cn(
				"group flex items-center gap-4 border-white/[0.05] border-b p-3 px-5 transition-all duration-150 last:border-0 hover:bg-white/[0.03]",
				isCompleted && "opacity-55 hover:opacity-85",
				isDue && "border-l-2 border-l-[#EDEDEF] bg-white/[0.025]",
			)}
		>
			<div className="relative flex w-3 shrink-0 items-center justify-center transition-transform duration-150 group-hover:scale-110">
				{isDue && (
					<span
						aria-hidden="true"
						className="absolute -inset-1 animate-ping rounded-full bg-white/25"
						style={{ animationDuration: "2.4s" }}
					/>
				)}
				<StatusShape status={routine.status} size={10} />
			</div>

			<div className="flex min-w-40 flex-1 items-center gap-1.5 transition-transform duration-150 group-hover:translate-x-0.5">
				{routine.isImportant && (
					<Star className="size-3.5 shrink-0 fill-amber-400/80 text-amber-400/80" />
				)}
				<div
					className={cn(
						"font-medium text-xs transition-colors duration-150",
						isCompleted
							? "text-[#52525B] line-through"
							: "text-[#EDEDEF] group-hover:text-white",
					)}
				>
					{routine.name}
				</div>
			</div>

			<div className="w-[75px] shrink-0">
				<span className="inline-block rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9.5px] text-zinc-400 uppercase tracking-wider">
					{routine.isTask ? "Task" : "Routine"}
				</span>
			</div>

			<div className="w-[95px] shrink-0">
				{routine.category && (
					<span className="inline-block rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9.5px] text-zinc-400 uppercase tracking-wider">
						{routine.category}
					</span>
				)}
			</div>

			<div className="w-[180px] shrink-0 font-mono text-xs text-zinc-400 tabular-nums">
				{describeTaskType(routine.taskType, routine.status)}
			</div>

			<div className="w-[100px] shrink-0 font-mono text-xs text-zinc-500 tabular-nums">
				{formatLastCompleted(routine.lastCompletedAt)}
			</div>
		</motion.div>
	);
}
