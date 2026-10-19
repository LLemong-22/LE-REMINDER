"use client";

import { Badge } from "@LE-REMINDER/ui/components/badge";
import { cn } from "@LE-REMINDER/ui/lib/utils";
import { Check, Pause, Play, Settings2, Star } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cryoSound } from "@/lib/cryo-sound";
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
	isOverdrive = false,
}: {
	routine: DashboardRoutine;
	onComplete: () => void;
	onEdit: () => void;
	onTogglePause: () => void;
	isOverdrive?: boolean;
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
		cryoSound.playShatterComplete();
		if (typeof window !== "undefined") {
			window.dispatchEvent(new CustomEvent("core-overdrive"));
		}
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
			style={{ willChange: "transform", transform: "translateZ(0)" }}
			className={cn(
				"group relative flex h-full min-h-[165px] flex-col justify-between overflow-hidden rounded-xl p-4 transition-all duration-300",
				// Due Cards: Authoritative smoked-glacier surface, platinum-ice border, razor-sharp top blade, icy left indicator
				isDue &&
					"border border-[#BAE6FD]/35 bg-[linear-gradient(180deg,rgba(20,34,54,0.92)_0%,rgba(12,21,36,0.96)_100%)] shadow-[inset_0_1px_0_0_rgba(224,242,254,0.65),0_12px_32px_-12px_rgba(0,0,0,0.7)] before:absolute before:top-4 before:bottom-4 before:left-0 before:w-[2px] before:rounded-r-sm before:bg-[#BAE6FD] before:shadow-[0_0_8px_rgba(186,230,253,0.5)] hover:border-[#BAE6FD]/60",
				// Overdue Cards: Deep smoked-glacier with crimson left blade & top specular rim
				isOverdue &&
					"border border-rose-400/30 bg-[linear-gradient(180deg,rgba(34,18,26,0.92)_0%,rgba(20,12,18,0.96)_100%)] shadow-[inset_0_1px_0_0_rgba(251,113,133,0.5),0_12px_32px_-12px_rgba(0,0,0,0.7)] before:absolute before:top-4 before:bottom-4 before:left-0 before:w-[2px] before:rounded-r-sm before:bg-[#F43F5E] before:shadow-[0_0_8px_rgba(244,63,94,0.6)] hover:border-rose-400/50",
				// Done Cards: Recessed obsidian in normal mode, dignified platinum-cyan in Overdrive
				isCompleted &&
					(isOverdrive
						? "border border-[#93C5FD]/40 bg-[#0F1D30]/90 opacity-100 shadow-[inset_0_1px_0_0_rgba(224,242,254,0.35),0_12px_32px_-12px_rgba(0,0,0,0.7)]"
						: "border border-white/[0.05] bg-[#070C15]/80 opacity-55 shadow-none hover:border-white/10 hover:opacity-85"),
				// Default / Paused / Inactive Cards
				!isDue &&
					!isOverdue &&
					!isCompleted &&
					(isOverdrive
						? "border border-[#7DD3FC]/35 bg-[linear-gradient(180deg,rgba(22,40,64,0.92)_0%,rgba(14,24,40,0.96)_100%)] shadow-[inset_0_1px_0_0_rgba(224,242,254,0.4),0_12px_28px_-8px_rgba(0,0,0,0.6)]"
						: "border border-white/[0.08] bg-[linear-gradient(180deg,rgba(16,28,46,0.85)_0%,rgba(10,18,30,0.92)_100%)] shadow-[inset_0_1px_0_0_rgba(224,242,254,0.2),0_12px_28px_-8px_rgba(0,0,0,0.55)] hover:border-[#BAE6FD]/25"),
			)}
		>
			{/* Diagonal Crystalline Laser Sheen in Overdrive */}
			{isOverdrive && (
				<div aria-hidden="true" className="animate-overdrive-sheen" />
			)}

			{/* Subtle Animated Cryo Scanline for Active Due Cards */}
			{isDue && (
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
				>
					<div className="absolute inset-x-0 -top-12 h-10 animate-[cryo-scanline_4s_linear_infinite] bg-gradient-to-b from-transparent via-[#BAE6FD]/10 to-transparent" />
				</div>
			)}

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
							"rounded px-2 py-0.5 font-mono font-semibold text-[10px] uppercase tracking-[0.12em]",
							isOverdue
								? "border border-rose-500/30 bg-rose-500/10 text-rose-300"
								: isDue
									? "border border-[#BAE6FD]/40 bg-[#BAE6FD]/10 text-[#BAE6FD] shadow-[0_0_8px_rgba(186,230,253,0.15)]"
									: isDone
										? isOverdrive
											? "border border-cyan-400/40 bg-cyan-500/15 text-[#7DD3FC]"
											: "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400/80"
										: isFinished
											? "border border-white/10 bg-white/5 text-[#94A3B8]"
											: "border border-white/10 bg-white/5 text-[#94A3B8]",
						)}
					>
						{routine.status}
					</div>
				</div>

				<div className="flex items-center gap-1.5">
					<Badge
						variant="outline"
						className={cn(
							"rounded border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 font-mono text-[#94A3B8] text-[9px] uppercase tracking-[0.12em] transition-all",
							isCompleted && "opacity-60",
						)}
					>
						{routine.isTask ? "Task" : "Routine"}
					</Badge>
					<Badge
						variant="secondary"
						className={cn(
							"rounded border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 font-mono text-[#94A3B8] text-[9px] uppercase tracking-[0.12em]",
							isCompleted && "opacity-60",
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
								? isOverdrive
									? "text-[#E0F2FE] line-through decoration-[#38BDF8]/40 drop-shadow-[0_0_8px_rgba(186,230,253,0.3)]"
									: "text-[#64748B] line-through decoration-[#38BDF8]/25 group-hover:text-[#93C5FD]/80"
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

			{/* Bottom Row: Last Done + Action Buttons */}
			<div className="relative mt-2 flex min-h-[30px] items-center justify-between border-white/[0.08] border-t pt-2">
				<div
					className={cn(
						"shrink-0 whitespace-nowrap font-medium font-mono text-[11px] transition-opacity duration-150",
						isCompleted ? "text-[#64748B]" : "text-[#93C5FD]",
						"group-focus-within:opacity-0 group-hover:opacity-0",
						revealed && "opacity-0",
					)}
				>
					Last · {formatLastCompleted(routine.lastCompletedAt)}
				</div>

				{/* Rock-solid Action Buttons (Always clickable, relative z-30, no position shift on click) */}
				<div
					className={cn(
						"pointer-events-none absolute top-2 right-0 bottom-0 z-30 flex items-center gap-1.5 opacity-0 transition-opacity duration-150 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100",
						revealed && "pointer-events-auto opacity-100",
					)}
				>
					{showComplete && (
						<button
							type="button"
							onPointerDown={(e) => e.stopPropagation()}
							onClick={(e) => {
								e.stopPropagation();
								handleComplete(e.currentTarget);
							}}
							aria-label="Complete routine"
							title="Complete routine"
							className="relative z-30 inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#38BDF8]/60 bg-[#38BDF8]/25 px-3 py-1.5 font-semibold text-[#BAE6FD] text-xs shadow-[0_0_12px_rgba(56,189,248,0.25)] transition-all hover:border-[#38BDF8] hover:bg-[#38BDF8] hover:text-[#06101E] active:scale-95"
						>
							<Check className="size-3.5 stroke-[2.5]" />
							<span>Done</span>
						</button>
					)}
					{showPauseResume && (
						<button
							type="button"
							onPointerDown={(e) => e.stopPropagation()}
							onClick={(e) => {
								e.stopPropagation();
								onTogglePause();
							}}
							aria-label={isPaused ? "Resume routine" : "Pause routine"}
							title={isPaused ? "Resume routine" : "Pause routine"}
							className="relative z-30 inline-flex size-7 cursor-pointer items-center justify-center rounded-md border border-white/15 bg-[#102136]/90 text-[#93C5FD] transition-all hover:border-white/30 hover:bg-[#1A385C] hover:text-white active:scale-95"
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
						onPointerDown={(e) => e.stopPropagation()}
						onClick={(e) => {
							e.stopPropagation();
							onEdit();
						}}
						aria-label="Edit routine"
						title="Edit routine"
						className="relative z-30 inline-flex size-7 cursor-pointer items-center justify-center rounded-md border border-white/15 bg-[#102136]/90 text-[#93C5FD] transition-all hover:border-white/30 hover:bg-[#1A385C] hover:text-white active:scale-95"
					>
						<Settings2 className="size-3.5" />
					</button>
				</div>
			</div>
		</motion.div>
	);
}
