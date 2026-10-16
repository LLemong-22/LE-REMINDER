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
				"group flex items-center gap-4 border-white/[0.06] light:border-stone-300/80 border-b p-3 px-5 transition-all duration-150 last:border-0 hover:bg-white/[0.04] light:hover:bg-stone-200/50",
				isCompleted && "opacity-65 hover:opacity-90",
				isDue &&
					"border-l-2 border-l-zinc-200 light:border-l-stone-900 bg-white/[0.03] light:bg-stone-200/40",
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
							? "light:text-stone-400 text-zinc-400 line-through decoration-zinc-500/60 light:decoration-stone-400/60"
							: "light:text-stone-900 text-zinc-100 group-hover:text-white light:group-hover:text-black",
					)}
				>
					{routine.name}
				</div>
			</div>

			<div className="w-[75px] shrink-0">
				<span className="inline-block rounded-md border border-white/[0.12] light:border-stone-300/80 bg-white/[0.06] light:bg-stone-200/70 px-1.5 py-0.5 font-mono light:text-stone-600 text-[9.5px] text-zinc-300 uppercase tracking-wider">
					{routine.isTask ? "Task" : "Routine"}
				</span>
			</div>

			<div className="w-[95px] shrink-0">
				{routine.category && (
					<span className="inline-block rounded-md border border-white/[0.12] light:border-stone-300/80 bg-white/[0.06] light:bg-stone-200/70 px-1.5 py-0.5 font-mono light:text-stone-600 text-[9.5px] text-zinc-300 uppercase tracking-wider">
						{routine.category}
					</span>
				)}
			</div>

			<div className="w-[180px] shrink-0 font-mono light:text-stone-600 text-xs text-zinc-300 tabular-nums">
				{describeTaskType(routine.taskType, routine.status)}
			</div>

			<div className="w-[100px] shrink-0 font-mono light:text-stone-500 text-xs text-zinc-400 tabular-nums">
				{formatLastCompleted(routine.lastCompletedAt)}
			</div>
		</motion.div>
	);
}
