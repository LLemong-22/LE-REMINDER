"use client";

import { Inbox } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import type { DashboardRoutine } from "@/lib/dashboard-routine";
import { sortByStatus } from "@/lib/sort-routines";
import { RoutineCard } from "./routine-card";

export function RoutineList({
	routines,
	onComplete,
	onEdit,
	onTogglePause,
}: {
	routines: DashboardRoutine[];
	onComplete: (routine: DashboardRoutine) => void;
	onEdit: (routine: DashboardRoutine) => void;
	onTogglePause: (routine: DashboardRoutine) => void;
}) {
	const sorted = sortByStatus(routines);

	if (sorted.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-white/[0.08] border-dashed bg-zinc-950/40 px-6 py-14 text-center">
				<div className="flex size-10 items-center justify-center rounded-full border border-white/[0.08] bg-zinc-900/60 text-zinc-500">
					<Inbox className="size-4 stroke-[1.5]" />
				</div>
				<p className="font-mono text-xs text-zinc-500">
					No routines configured yet.
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
			<AnimatePresence mode="popLayout" initial={false}>
				{sorted.map((routine) => (
					<motion.div
						key={routine.id}
						layout
						initial={{ opacity: 0, y: -16, scale: 0.96 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{
							opacity: 0,
							scale: 0.85,
							transition: { duration: 0.2, ease: "easeOut" },
						}}
						transition={{
							layout: { duration: 0.32, ease: [0.25, 1, 0.5, 1] },
							opacity: { duration: 0.2 },
							scale: { duration: 0.2 },
						}}
						className="h-full"
					>
						<SpotlightCard
							className="h-full rounded-xl"
							spotlightColor="rgba(255, 255, 255, 0.08)"
						>
							<RoutineCard
								routine={routine}
								onComplete={() => onComplete(routine)}
								onEdit={() => onEdit(routine)}
								onTogglePause={() => onTogglePause(routine)}
							/>
						</SpotlightCard>
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
}
