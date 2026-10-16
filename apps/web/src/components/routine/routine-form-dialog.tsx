"use client";

import type { DayOfWeek } from "@LE-REMINDER/core/domain/schedule";
import type { TaskType } from "@LE-REMINDER/core/domain/task-type";
import { Button } from "@LE-REMINDER/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@LE-REMINDER/ui/components/dialog";
import { Input } from "@LE-REMINDER/ui/components/input";
import { Label } from "@LE-REMINDER/ui/components/label";
import { Switch } from "@LE-REMINDER/ui/components/switch";
import { cn } from "@LE-REMINDER/ui/lib/utils";
import { useEffect, useState } from "react";
import type { DashboardRoutine } from "@/lib/dashboard-routine";

const ALL_DAYS: DayOfWeek[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface FormState {
	name: string;
	category: string;
	kind: "OneOff" | "Recurring";
	dueDate: string;
	scheduleType: "FixedCalendar" | "RollingInterval";
	recurrenceKind: "Daily" | "Weekly" | "Monthly";
	daysOfWeek: DayOfWeek[];
	dayOfMonth: number;
	isMandatory: boolean;
	intervalValue: number;
	intervalUnit: "days" | "weeks" | "months";
	isTask: boolean;
	isImportant: boolean;
}

function toFormState(routine: DashboardRoutine | null): FormState {
	const base: FormState = {
		name: routine?.name ?? "",
		category: routine?.category ?? "",
		kind: "Recurring",
		dueDate: "",
		scheduleType: "FixedCalendar",
		recurrenceKind: "Daily",
		daysOfWeek: ["Mon"],
		dayOfMonth: 1,
		isMandatory: true,
		intervalValue: 7,
		intervalUnit: "days",
		isTask: routine?.isTask ?? false,
		isImportant: routine?.isImportant ?? false,
	};

	if (!routine) return base;

	if (routine.taskType.kind === "OneOff") {
		return {
			...base,
			kind: "OneOff",
			dueDate: routine.taskType.dueDate
				? routine.taskType.dueDate.toISOString().slice(0, 10)
				: "",
		};
	}

	const schedule = routine.taskType.schedule;
	if (schedule.type === "RollingInterval") {
		return {
			...base,
			kind: "Recurring",
			scheduleType: "RollingInterval",
			intervalValue: schedule.interval.value,
			intervalUnit: schedule.interval.unit,
		};
	}

	return {
		...base,
		kind: "Recurring",
		scheduleType: "FixedCalendar",
		recurrenceKind: schedule.recurrence.kind,
		daysOfWeek:
			schedule.recurrence.kind === "Weekly"
				? [...schedule.recurrence.daysOfWeek]
				: ["Mon"],
		dayOfMonth:
			schedule.recurrence.kind === "Monthly"
				? schedule.recurrence.dayOfMonth
				: 1,
		isMandatory: schedule.isMandatory,
	};
}

function toTaskType(state: FormState): TaskType {
	if (state.kind === "OneOff") {
		return {
			kind: "OneOff",
			dueDate: state.dueDate ? new Date(`${state.dueDate}T23:59:59.999`) : null,
		};
	}

	if (state.scheduleType === "RollingInterval") {
		return {
			kind: "Recurring",
			schedule: {
				type: "RollingInterval",
				interval: { value: state.intervalValue, unit: state.intervalUnit },
			},
		};
	}

	const recurrence =
		state.recurrenceKind === "Daily"
			? ({ kind: "Daily" } as const)
			: state.recurrenceKind === "Weekly"
				? ({ kind: "Weekly", daysOfWeek: state.daysOfWeek } as const)
				: ({ kind: "Monthly", dayOfMonth: state.dayOfMonth } as const);

	return {
		kind: "Recurring",
		schedule: {
			type: "FixedCalendar",
			recurrence,
			isMandatory: state.isMandatory,
		},
	};
}

function TaskTypeCard({
	selected,
	glyph,
	label,
	description,
	onClick,
}: {
	selected: boolean;
	glyph: React.ReactNode;
	label: string;
	description: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"relative flex min-w-[130px] flex-1 cursor-pointer select-none flex-col gap-2 rounded-xl border p-3.5 text-left transition-all duration-150",
				selected
					? "border-white/30 light:border-stone-400 bg-white/[0.08] light:bg-stone-200 light:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18)]"
					: "border-white/[0.06] light:border-stone-300/80 bg-zinc-950/50 light:bg-stone-100 hover:border-white/[0.14] light:hover:border-stone-400 hover:bg-white/[0.03]",
			)}
		>
			<div className="flex items-center justify-between">
				{glyph}
				{selected && (
					<span className="size-1.5 rounded-full bg-zinc-200 light:bg-stone-800" />
				)}
			</div>
			<div className="font-medium light:text-stone-900 text-xs text-zinc-100">
				{label}
			</div>
			<div className="light:text-stone-600 text-[11px] text-zinc-400 leading-normal">
				{description}
			</div>
		</button>
	);
}

function Pill({
	selected,
	onClick,
	children,
}: {
	selected: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"cursor-pointer rounded-md border px-2.5 py-1 font-mono text-[11px] transition-all duration-150 active:scale-95",
				selected
					? "border-white/25 light:border-stone-400 bg-white/[0.1] light:bg-stone-200 font-semibold light:text-stone-900 text-zinc-100 light:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]"
					: "border-white/[0.06] light:border-stone-300/80 bg-zinc-950/60 light:bg-stone-100 light:text-stone-600 text-zinc-400 hover:border-white/[0.14] light:hover:border-stone-400 hover:text-zinc-100 light:hover:text-stone-900",
			)}
		>
			{children}
		</button>
	);
}

export function RoutineFormDialog({
	open,
	onOpenChange,
	routine,
	categorySuggestions,
	onSubmit,
	onDelete,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	routine: DashboardRoutine | null;
	categorySuggestions: string[];
	onSubmit: (values: {
		name: string;
		category: string;
		taskType: TaskType;
		isTask: boolean;
		isImportant: boolean;
	}) => void;
	onDelete?: (routine: DashboardRoutine) => void;
}) {
	const [state, setState] = useState<FormState>(() => toFormState(routine));

	useEffect(() => {
		if (open) setState(toFormState(routine));
	}, [open, routine]);

	function toggleDay(day: DayOfWeek) {
		setState((prev) => ({
			...prev,
			daysOfWeek: prev.daysOfWeek.includes(day)
				? prev.daysOfWeek.filter((d) => d !== day)
				: [...prev.daysOfWeek, day],
		}));
	}

	function handleSubmit() {
		if (!state.name.trim()) return;
		onSubmit({
			name: state.name.trim(),
			category: state.category.trim() || "General",
			taskType: toTaskType(state),
			isTask: state.isTask,
			isImportant: state.isImportant,
		});
		onOpenChange(false);
	}

	const saveEnabled = state.name.trim().length > 0;
	const hasDeadline = state.dueDate !== "";

	useEffect(() => {
		if (!open) return;
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") {
				e.preventDefault();
				onOpenChange(false);
			}
		}
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [open, onOpenChange]);

	function handleDelete() {
		if (!routine) return;
		onDelete?.(routine);
		onOpenChange(false);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="border border-white/[0.11] light:border-stone-300/80 bg-zinc-900/95 light:bg-[#F5F4F0] light:text-stone-900 text-zinc-100 light:shadow-[0_16px_48px_rgba(28,25,23,0.1)] shadow-[0_16px_48px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-md sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="font-semibold light:text-stone-900 text-base text-zinc-100 tracking-tight">
						{routine ? "Edit Routine" : "New Routine"}
					</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-4 pt-1">
					{/* Name field */}
					<div className="flex flex-col gap-1.5">
						<Label
							htmlFor="routine-name"
							className="font-mono light:text-stone-500 text-[11px] text-zinc-400 uppercase tracking-wider"
						>
							Name
						</Label>
						<Input
							id="routine-name"
							value={state.name}
							onChange={(e) =>
								setState((prev) => ({ ...prev, name: e.target.value }))
							}
							onKeyDown={(e) => {
								if (e.key === "Enter" && saveEnabled) {
									e.preventDefault();
									handleSubmit();
								}
							}}
							placeholder="e.g. Server Data Backup"
							className="h-9 rounded-lg border border-white/[0.08] light:border-stone-300 bg-zinc-950/70 light:bg-stone-100 light:text-stone-900 text-xs text-zinc-100 light:placeholder-stone-400 placeholder-zinc-500 transition-colors focus-visible:border-white/30 light:focus-visible:border-stone-500 focus-visible:ring-1 focus-visible:ring-white/20 light:focus-visible:ring-stone-400/40 focus-visible:ring-offset-0"
						/>
					</div>

					{/* Category field */}
					<div className="flex flex-col gap-1.5">
						<Label
							htmlFor="routine-category"
							className="font-mono light:text-stone-500 text-[11px] text-zinc-400 uppercase tracking-wider"
						>
							Category
						</Label>
						<Input
							id="routine-category"
							value={state.category}
							onChange={(e) =>
								setState((prev) => ({ ...prev, category: e.target.value }))
							}
							onKeyDown={(e) => {
								if (e.key === "Enter" && saveEnabled) {
									e.preventDefault();
									handleSubmit();
								}
							}}
							placeholder="e.g. Tech"
							className="h-9 rounded-lg border border-white/[0.08] light:border-stone-300 bg-zinc-950/70 light:bg-stone-100 light:text-stone-900 text-xs text-zinc-100 light:placeholder-stone-400 placeholder-zinc-500 transition-colors focus-visible:border-white/30 light:focus-visible:border-stone-500 focus-visible:ring-1 focus-visible:ring-white/20 light:focus-visible:ring-stone-400/40 focus-visible:ring-offset-0"
						/>
						{categorySuggestions.length > 0 && (
							<div className="flex flex-wrap gap-1.5 pt-0.5">
								{categorySuggestions.map((chip) => (
									<Pill
										key={chip}
										selected={state.category === chip}
										onClick={() =>
											setState((prev) => ({ ...prev, category: chip }))
										}
									>
										{chip}
									</Pill>
								))}
							</div>
						)}
					</div>

					{/* Metadata switches */}
					<div className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-zinc-950/50 p-3 sm:flex-row sm:items-center sm:gap-0 sm:divide-x sm:divide-white/[0.06]">
						<label
							htmlFor="is-task-switch"
							className="flex flex-1 cursor-pointer select-none items-center justify-between gap-3 pr-0 sm:pr-4"
						>
							<div className="flex flex-col gap-0.5">
								<span className="font-medium text-[#EDEDEF] text-xs">
									Is Task
								</span>
								<span className="text-[11px] text-zinc-500">
									Differentiate assignment from habit routine.
								</span>
							</div>
							<Switch
								id="is-task-switch"
								checked={state.isTask}
								onCheckedChange={(checked) =>
									setState((prev) => ({ ...prev, isTask: checked }))
								}
								className="shrink-0 data-checked:bg-[#EDEDEF]"
							/>
						</label>
						<label
							htmlFor="is-important-switch"
							className="flex flex-1 cursor-pointer select-none items-center justify-between gap-3 pt-2 sm:pt-0 sm:pl-4"
						>
							<div className="flex flex-col gap-0.5">
								<span className="font-medium text-[#EDEDEF] text-xs">
									Important
								</span>
								<span className="text-[11px] text-zinc-500">
									Flag as high priority for top ranking.
								</span>
							</div>
							<Switch
								id="is-important-switch"
								checked={state.isImportant}
								onCheckedChange={(checked) =>
									setState((prev) => ({ ...prev, isImportant: checked }))
								}
								className="shrink-0 data-checked:bg-[#EDEDEF]"
							/>
						</label>
					</div>

					{/* Task Type selector */}
					<div className="flex flex-col gap-2">
						<Label className="font-mono text-[11px] text-zinc-400 uppercase tracking-wider">
							Task Type
						</Label>
						<div className="flex flex-wrap gap-2">
							<TaskTypeCard
								selected={
									state.kind === "Recurring" &&
									state.scheduleType === "FixedCalendar"
								}
								glyph={<div className="size-3.5 rounded-[2px] bg-[#EDEDEF]" />}
								label="Fixed Calendar"
								description="Repeats on daily, weekly, or monthly schedule."
								onClick={() =>
									setState((prev) => ({
										...prev,
										kind: "Recurring",
										scheduleType: "FixedCalendar",
									}))
								}
							/>
							<TaskTypeCard
								selected={
									state.kind === "Recurring" &&
									state.scheduleType === "RollingInterval"
								}
								glyph={<div className="size-3.5 rounded-full bg-[#EDEDEF]" />}
								label="Rolling Interval"
								description="Due fixed days/weeks/months after last done."
								onClick={() =>
									setState((prev) => ({
										...prev,
										kind: "Recurring",
										scheduleType: "RollingInterval",
									}))
								}
							/>
							<TaskTypeCard
								selected={state.kind === "OneOff"}
								glyph={<div className="size-3 rotate-45 bg-[#EDEDEF]" />}
								label="One-off"
								description="Happens once, optional deadline."
								onClick={() =>
									setState((prev) => ({ ...prev, kind: "OneOff" }))
								}
							/>
						</div>
					</div>

					{/* Conditional Settings */}
					{state.kind === "Recurring" &&
						state.scheduleType === "FixedCalendar" && (
							<div className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-zinc-950/50 p-3.5">
								<div className="flex gap-1.5">
									<Pill
										selected={state.recurrenceKind === "Daily"}
										onClick={() =>
											setState((prev) => ({
												...prev,
												recurrenceKind: "Daily",
											}))
										}
									>
										Daily
									</Pill>
									<Pill
										selected={state.recurrenceKind === "Weekly"}
										onClick={() =>
											setState((prev) => ({
												...prev,
												recurrenceKind: "Weekly",
											}))
										}
									>
										Weekly
									</Pill>
									<Pill
										selected={state.recurrenceKind === "Monthly"}
										onClick={() =>
											setState((prev) => ({
												...prev,
												recurrenceKind: "Monthly",
											}))
										}
									>
										Monthly
									</Pill>
								</div>

								{state.recurrenceKind === "Weekly" && (
									<div className="flex flex-wrap gap-1 pt-1">
										{ALL_DAYS.map((day) => (
											<button
												key={day}
												type="button"
												onClick={() => toggleDay(day)}
												className={cn(
													"cursor-pointer rounded-md border px-2 py-1 font-mono text-[11px] transition-all duration-150 active:scale-95",
													state.daysOfWeek.includes(day)
														? "border-white/25 bg-white/[0.1] font-semibold text-[#EDEDEF]"
														: "border-white/[0.06] bg-zinc-900/60 text-zinc-400 hover:border-white/[0.12] hover:text-[#EDEDEF]",
												)}
											>
												{day}
											</button>
										))}
									</div>
								)}

								{state.recurrenceKind === "Monthly" && (
									<div className="flex items-center gap-2.5 pt-1">
										<span className="text-xs text-zinc-400">Day of month</span>
										<Input
											type="number"
											min={1}
											max={31}
											value={state.dayOfMonth}
											onChange={(e) =>
												setState((prev) => ({
													...prev,
													dayOfMonth: Number(e.target.value) || 1,
												}))
											}
											className="w-16 rounded-lg border-white/[0.08] bg-zinc-900/70 text-center font-mono text-[#EDEDEF] text-xs focus-visible:border-white/30 focus-visible:ring-1 focus-visible:ring-white/20"
										/>
									</div>
								)}

								<div className="flex select-none items-center justify-between border-white/[0.06] border-t pt-2.5">
									<div className="flex flex-col gap-0.5">
										<span className="font-medium text-[#EDEDEF] text-xs">
											Mandatory
										</span>
										<span className="text-[11px] text-zinc-500">
											Missed occurrences stay Overdue until completed.
										</span>
									</div>
									<Switch
										checked={state.isMandatory}
										onCheckedChange={(checked) =>
											setState((prev) => ({ ...prev, isMandatory: checked }))
										}
										className="data-checked:bg-[#EDEDEF]"
									/>
								</div>
							</div>
						)}

					{state.kind === "Recurring" &&
						state.scheduleType === "RollingInterval" && (
							<div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-zinc-950/50 p-3.5">
								<span className="text-xs text-zinc-400">Every</span>
								<Input
									type="number"
									min={1}
									value={state.intervalValue}
									onChange={(e) =>
										setState((prev) => ({
											...prev,
											intervalValue: Number(e.target.value) || 1,
										}))
									}
									className="w-16 rounded-lg border-white/[0.08] bg-zinc-900/70 text-center font-mono text-[#EDEDEF] text-xs focus-visible:border-white/30 focus-visible:ring-1 focus-visible:ring-white/20"
								/>
								<select
									value={state.intervalUnit}
									onChange={(e) =>
										setState((prev) => ({
											...prev,
											intervalUnit: e.target.value as FormState["intervalUnit"],
										}))
									}
									className="cursor-pointer rounded-lg border border-white/[0.08] bg-zinc-900/70 px-2.5 py-1.5 font-mono text-[#EDEDEF] text-xs outline-none transition-colors focus:border-white/30"
								>
									<option value="days">days</option>
									<option value="weeks">weeks</option>
									<option value="months">months</option>
								</select>
							</div>
						)}

					{state.kind === "OneOff" && (
						<div className="flex select-none flex-col gap-3 rounded-xl border border-white/[0.06] bg-zinc-950/50 p-3.5">
							<div className="flex items-center justify-between">
								<span className="text-xs text-zinc-400">Has a deadline</span>
								<Switch
									checked={hasDeadline}
									onCheckedChange={(checked) =>
										setState((prev) => ({
											...prev,
											dueDate: checked
												? prev.dueDate || new Date().toISOString().slice(0, 10)
												: "",
										}))
									}
									className="data-checked:bg-[#EDEDEF]"
								/>
							</div>
							{hasDeadline && (
								<Input
									type="date"
									value={state.dueDate}
									onChange={(e) =>
										setState((prev) => ({ ...prev, dueDate: e.target.value }))
									}
									className="w-fit rounded-lg border-white/[0.08] bg-zinc-900/70 px-2.5 py-1.5 font-mono text-[#EDEDEF] text-xs focus-visible:border-white/30 focus-visible:ring-1 focus-visible:ring-white/20"
								/>
							)}
						</div>
					)}
				</div>

				<DialogFooter className="pt-2 sm:justify-between">
					{routine ? (
						<Button
							variant="ghost"
							onClick={handleDelete}
							className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
						>
							Delete Routine
						</Button>
					) : (
						<div />
					)}
					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="border-white/[0.08] light:border-stone-300 bg-white/[0.04] light:bg-stone-200/60 light:text-stone-700 text-zinc-300 hover:bg-white/[0.08] light:hover:bg-stone-200 hover:text-zinc-100"
						>
							Cancel
						</Button>
						<Button
							onClick={handleSubmit}
							disabled={!saveEnabled}
							className="bg-[var(--cta-bg)] font-medium text-[var(--cta-text)] shadow-sm transition-transform hover:opacity-90 active:scale-95 disabled:opacity-50"
						>
							Save Routine
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
