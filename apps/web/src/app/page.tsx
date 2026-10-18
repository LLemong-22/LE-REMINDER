"use client";

import type { RoutineView } from "@LE-REMINDER/core/application/routine-view";
import type { RoutineId } from "@LE-REMINDER/core/domain/identity";
import { cn } from "@LE-REMINDER/ui/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import {
	BarChart2,
	Github,
	Inbox,
	Search,
	Sparkles,
	Volume2,
	VolumeX,
	X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HeroPanel } from "@/components/routine/hero-panel";
import { RoutineFormDialog } from "@/components/routine/routine-form-dialog";
import { RoutineList } from "@/components/routine/routine-list";
import { RoutineListRow } from "@/components/routine/routine-list-row";
import { ScheduleView } from "@/components/schedule-view";
import { TodoSidebar } from "@/components/todo-sidebar";
import { DecryptedText } from "@/components/ui/decrypted-text";
import { VillainIntro } from "@/components/villain-intro";
import { buildCategorySuggestions } from "@/lib/category-suggestions";
import { cryoSound } from "@/lib/cryo-sound";
import type { DashboardRoutine } from "@/lib/dashboard-routine";
import {
	withCompleted,
	withPaused,
	withRemoved,
} from "@/lib/optimistic-routines";
import { sortByStatus } from "@/lib/sort-routines";
import { toDashboardRoutine } from "@/lib/to-dashboard-routine";
import { queryClient, trpc } from "@/utils/trpc";

type Tab = "home" | "schedule" | "all" | "analytics";

function TabButton({
	active,
	onClick,
	children,
}: {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"relative cursor-pointer whitespace-nowrap rounded-sm px-1 py-1.5 font-semibold text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]/40",
				active ? "text-[#F0F9FF]" : "text-[#93C5FD] hover:text-[#F0F9FF]",
			)}
		>
			{children}
			{active && (
				<motion.div
					layoutId="activeTabUnderline"
					transition={{ type: "spring", stiffness: 450, damping: 35 }}
					className="absolute inset-x-0 -bottom-[17px] h-[2px] rounded-full bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]"
				/>
			)}
		</button>
	);
}

function TacticalClock() {
	const [timeStr, setTimeStr] = useState<string | null>(null);

	useEffect(() => {
		function updateClock() {
			const now = new Date();
			const h = String(now.getHours()).padStart(2, "0");
			const m = String(now.getMinutes()).padStart(2, "0");
			const s = String(now.getSeconds()).padStart(2, "0");
			setTimeStr(`${h}:${m}:${s}`);
		}
		updateClock();
		const timer = setInterval(updateClock, 1000);
		return () => clearInterval(timer);
	}, []);

	if (!timeStr) {
		return (
			<div
				className="hidden items-center gap-0.5 rounded-lg border border-[#7DD3FC]/20 bg-[#102136]/50 px-2.5 py-1 font-medium font-mono text-[#93C5FD]/60 text-[11px] md:flex"
				aria-hidden="true"
			>
				<span>00:00:00</span>
			</div>
		);
	}

	const [hh, mm, ss] = timeStr.split(":");

	return (
		<div
			title="Tactical System Time (Local)"
			className="hidden items-center gap-0.5 rounded-lg border border-[#7DD3FC]/25 bg-[#091524]/85 px-2.5 py-1 font-mono font-semibold text-[#BAE6FD] text-[11px] tabular-nums shadow-[0_0_8px_rgba(56,189,248,0.15)] md:flex"
		>
			<span>{hh}</span>
			<span className="animate-pulse text-[#7DD3FC]">:</span>
			<span>{mm}</span>
			<span className="animate-pulse text-[#7DD3FC]">:</span>
			<span>{ss}</span>
		</div>
	);
}

function AudioToggle() {
	const [muted, setMuted] = useState(false);

	useEffect(() => {
		setMuted(cryoSound.isMuted());
		return cryoSound.subscribe((next) => setMuted(next));
	}, []);

	return (
		<button
			type="button"
			onClick={() => {
				cryoSound.toggleMute();
			}}
			title={
				muted
					? "Unmute Cryo-HUD Audio (SFX Off)"
					: "Mute Cryo-HUD Audio (SFX On)"
			}
			aria-label={muted ? "Unmute Audio" : "Mute Audio"}
			className="flex size-7.5 cursor-pointer items-center justify-center rounded-lg border border-[#7DD3FC]/20 bg-[#102136]/60 text-[#BAE6FD] shadow-[0_0_8px_rgba(56,189,248,0.12)] transition-all hover:scale-105 hover:border-[#7DD3FC]/45 hover:bg-[#102136] hover:text-[#F8FAFC] active:scale-95"
		>
			{muted ? (
				<VolumeX className="size-3.5 text-[#64748B]" />
			) : (
				<Volume2 className="size-3.5 text-[#38BDF8]" />
			)}
		</button>
	);
}

function RoutinesLoadingState() {
	return (
		<div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
			{Array.from({ length: 6 }).map((_, i) => (
				<div
					key={i}
					className="frost-panel flex flex-col gap-3 rounded-[12px] p-[16px]"
				>
					<div className="flex items-center justify-between">
						<div className="size-3 animate-pulse rounded-full bg-[#BAE6FD]/30" />
						<div className="h-4 w-16 animate-pulse rounded-full bg-[#BAE6FD]/20" />
					</div>
					<div className="h-5 w-3/4 animate-pulse rounded bg-[#BAE6FD]/25" />
					<div className="h-3.5 w-1/2 animate-pulse rounded bg-[#BAE6FD]/15" />
					<div className="h-3 w-1/3 animate-pulse rounded bg-[#BAE6FD]/10" />
				</div>
			))}
		</div>
	);
}

function RoutinesErrorState({ onRetry }: { onRetry: () => void }) {
	return (
		<div className="frost-panel flex flex-col items-center gap-3 rounded-xl p-16 text-center">
			<div className="text-[#93C5FD] text-sm">
				Couldn't load routines from the database.
			</div>
			<button
				type="button"
				onClick={onRetry}
				className="frost-pill-btn rounded-lg px-3.5 py-1.5 font-semibold text-xs active:scale-95"
			>
				Retry
			</button>
		</div>
	);
}

// Step 14: real tRPC + Turso backend. Routines and Today's To-Do are both
// server state now (useQuery + mutations, invalidated on writes) — see
// todo-sidebar.tsx. The hero's Daily Task checklist is still a local-only
// scratchpad by design — see hero-panel.tsx.
export default function Home() {
	const router = useRouter();
	// Always trigger the 0.65s razor slash-shatter reveal on every reload
	const [showVillainIntro, setShowVillainIntro] = useState(true);
	const [searchInput, setSearchInput] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchInput);
		}, 300);
		return () => clearTimeout(timer);
	}, [searchInput]);

	const listQueryOptions = trpc.routine.list.queryOptions({
		searchQuery: debouncedSearch || undefined,
	});
	const routinesQuery = useQuery(listQueryOptions);
	const routines: DashboardRoutine[] = (routinesQuery.data ?? []).map(
		toDashboardRoutine,
	);

	// proxy.ts only checks that a session cookie is present, not that it's
	// still valid — an expired/revoked session reaches this page and the
	// first protectedProcedure call throws UNAUTHORIZED. Without this, that
	// showed as "Couldn't load routines from the database" with a Retry
	// button that would fail forever, instead of sending the user back to
	// where they can actually fix it.
	useEffect(() => {
		const error = routinesQuery.error;
		if (
			error instanceof TRPCClientError &&
			error.data?.code === "UNAUTHORIZED"
		) {
			router.replace("/login");
		}
	}, [routinesQuery.error, router]);

	const [activeTab, setActiveTab] = useState<Tab>("home");
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingRoutine, setEditingRoutine] = useState<DashboardRoutine | null>(
		null,
	);

	function invalidateRoutines() {
		queryClient.invalidateQueries(trpc.routine.pathFilter());
	}

	// Shared onMutate/onError plumbing for the three highest-frequency
	// actions (complete/pause/delete are single taps on the main grid —
	// waiting on a Turso round-trip before anything visibly happens reads
	// as broken). create/edit stay invalidate-only: they're dialog-based,
	// lower-frequency, and a temp-id insert isn't worth the complexity.
	async function cancelAndSnapshot() {
		await queryClient.cancelQueries(listQueryOptions);
		return queryClient.getQueryData(listQueryOptions.queryKey);
	}

	function rollback(previous: RoutineView[] | undefined) {
		if (previous) {
			queryClient.setQueryData(listQueryOptions.queryKey, previous);
		}
	}

	const createMutation = useMutation(
		trpc.routine.create.mutationOptions({ onSuccess: invalidateRoutines }),
	);
	const editMutation = useMutation(
		trpc.routine.edit.mutationOptions({ onSuccess: invalidateRoutines }),
	);

	const deleteMutation = useMutation(
		trpc.routine.delete.mutationOptions({
			onMutate: async ({ routineId }) => {
				const previous = await cancelAndSnapshot();
				queryClient.setQueryData(listQueryOptions.queryKey, (old) =>
					old ? withRemoved(old, routineId as RoutineId) : old,
				);
				return { previous };
			},
			onError: (_error, _vars, context) => rollback(context?.previous),
			onSettled: invalidateRoutines,
		}),
	);

	const setPausedMutation = useMutation(
		trpc.routine.setPaused.mutationOptions({
			onMutate: async ({ routineId, isPaused }) => {
				const previous = await cancelAndSnapshot();
				queryClient.setQueryData(listQueryOptions.queryKey, (old) =>
					old
						? withPaused(old, routineId as RoutineId, isPaused, new Date())
						: old,
				);
				return { previous };
			},
			onError: (_error, _vars, context) => rollback(context?.previous),
			onSettled: invalidateRoutines,
		}),
	);

	const completeMutation = useMutation(
		trpc.routine.complete.mutationOptions({
			onMutate: async ({ routineId }) => {
				const previous = await cancelAndSnapshot();
				queryClient.setQueryData(listQueryOptions.queryKey, (old) =>
					old ? withCompleted(old, routineId as RoutineId, new Date()) : old,
				);
				return { previous };
			},
			onError: (_error, _vars, context) => rollback(context?.previous),
			onSettled: invalidateRoutines,
		}),
	);

	function handleComplete(routine: DashboardRoutine) {
		cryoSound.playShatterComplete();
		if (typeof window !== "undefined") {
			window.dispatchEvent(new CustomEvent("core-overdrive"));
		}
		completeMutation.mutate({ routineId: routine.id });
	}

	function handleTogglePause(routine: DashboardRoutine) {
		setPausedMutation.mutate({
			routineId: routine.id,
			isPaused: routine.status !== "Paused",
		});
	}

	function handleOpenCreate() {
		setEditingRoutine(null);
		setDialogOpen(true);
	}

	function handleOpenEdit(routine: DashboardRoutine) {
		setEditingRoutine(routine);
		setDialogOpen(true);
	}

	function handleDelete(routine: DashboardRoutine) {
		deleteMutation.mutate({ routineId: routine.id });
	}

	function handleSubmit(
		values: Pick<
			DashboardRoutine,
			"name" | "category" | "taskType" | "isTask" | "isImportant"
		>,
	) {
		if (editingRoutine) {
			editMutation.mutate({ routineId: editingRoutine.id, ...values });
			return;
		}
		createMutation.mutate(values);
	}

	const allCategories = Array.from(
		new Set(routines.map((r) => r.category).filter(Boolean)),
	);

	const filteredRoutines = selectedCategory
		? routines.filter((r) => r.category === selectedCategory)
		: routines;

	const sortedRoutines = sortByStatus(filteredRoutines);

	const [manualOverdrive, setManualOverdrive] = useState<boolean | null>(null);

	const dailyRoutines = routines.filter(
		(r) =>
			r.taskType.kind === "Recurring" &&
			r.taskType.schedule.type === "FixedCalendar" &&
			r.taskType.schedule.recurrence.kind === "Daily",
	);
	const completedDailyCount = dailyRoutines.filter(
		(r) => r.status === "Done" || r.status === "Finished",
	).length;
	const isDailyAllDone =
		dailyRoutines.length > 0 && completedDailyCount === dailyRoutines.length;
	const completedTotal = routines.filter(
		(r) => r.status === "Done" || r.status === "Finished",
	).length;
	const isTotalAllDone =
		routines.length > 0 && completedTotal === routines.length;
	const autoOverdrive = isDailyAllDone || isTotalAllDone;
	const isOverdrive =
		manualOverdrive !== null ? manualOverdrive : autoOverdrive;

	function handleToggleOverdrive() {
		setManualOverdrive((prev) => (prev !== null ? !prev : !autoOverdrive));
	}

	return (
		<div className="cryo-canvas frost-fracture-bg relative min-h-screen overflow-x-hidden text-[#F8FAFC]">
			{/* Top Ambient Crown Light in Overdrive Mode */}
			<div
				aria-hidden="true"
				className={cn(
					"pointer-events-none fixed inset-x-0 top-0 -z-10 h-96 transition-opacity duration-1000",
					isOverdrive
						? "bg-[radial-gradient(ellipse_at_50%_0%,rgba(56,189,248,0.35)_0%,rgba(14,165,233,0.15)_40%,transparent_75%)] opacity-100"
						: "bg-[radial-gradient(ellipse_at_50%_0%,rgba(56,189,248,0.12)_0%,transparent_60%)] opacity-40",
				)}
			/>

			<AnimatePresence>
				{showVillainIntro && (
					<VillainIntro onComplete={() => setShowVillainIntro(false)} />
				)}
			</AnimatePresence>

			<div className="sticky top-0 z-20 border-[#BAE6FD]/15 border-b bg-[#0D1B2A]/90 backdrop-blur-md">
				<div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6">
					<div className="flex items-center gap-2.5 sm:w-[220px]">
						<button
							type="button"
							onClick={() => {
								cryoSound.playReactorPulse();
								setShowVillainIntro(true);
							}}
							title="Replay Cryo-Boot Sequence"
							className={cn(
								"group flex size-7 shrink-0 items-center justify-center rounded border font-bold font-mono text-[12px] transition-all hover:scale-105 active:scale-95",
								isOverdrive
									? "animate-pulse border-[#38BDF8] bg-[#38BDF8]/25 text-[#E0F2FE] shadow-[0_0_18px_rgba(56,189,248,0.85)]"
									: "border-[#7DD3FC]/35 bg-[#102136] text-[#7DD3FC] shadow-[0_0_10px_rgba(56,189,248,0.25)] hover:border-[#38BDF8] hover:bg-[#38BDF8]/20 hover:shadow-[0_0_15px_rgba(56,189,248,0.5)]",
							)}
						>
							<span className="transition-transform group-hover:scale-110">
								V
							</span>
						</button>
						<div className="shrink-0 font-extrabold text-[#F8FAFC] text-[17px] tracking-tight drop-shadow-[0_0_12px_rgba(56,189,248,0.35)] sm:text-[19px]">
							<DecryptedText
								text="LE-REMINDER"
								speed={35}
								maxIterations={10}
								encryptedClassName="text-[#38BDF8]"
							/>
						</div>
					</div>
					<div className="flex items-center gap-5 overflow-x-auto [scrollbar-width:none] sm:gap-8">
						<TabButton
							active={activeTab === "home"}
							onClick={() => setActiveTab("home")}
						>
							Home
						</TabButton>
						<TabButton
							active={activeTab === "schedule"}
							onClick={() => setActiveTab("schedule")}
						>
							Schedule
						</TabButton>
						<TabButton
							active={activeTab === "all"}
							onClick={() => setActiveTab("all")}
						>
							All Tasks
						</TabButton>
						<TabButton
							active={activeTab === "analytics"}
							onClick={() => setActiveTab("analytics")}
						>
							Analytics
						</TabButton>
					</div>
					<div className="flex w-auto shrink-0 items-center justify-end gap-2 sm:w-[320px]">
						<TacticalClock />
						<AudioToggle />
						<a
							href="https://github.com/Lemong-22/LE-REMINDER.git"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-1.5 rounded-lg border border-[#7DD3FC]/20 bg-[#102136]/60 px-2.5 py-1.5 font-semibold text-[#BAE6FD] text-xs transition-colors hover:border-[#7DD3FC]/45 hover:bg-[#102136] hover:text-[#F8FAFC]"
						>
							<Github className="size-4" />
							<span className="hidden sm:inline">Lemong-22</span>
						</a>
					</div>
				</div>
			</div>

			<div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-4 pt-5 pb-14 sm:px-6">
				{activeTab === "home" && (
					<HeroPanel
						routines={routines}
						onComplete={handleComplete}
						isOverdrive={isOverdrive}
						onToggleOverdrive={handleToggleOverdrive}
					/>
				)}

				<div className="flex flex-col items-start gap-[22px] lg:flex-row">
					<div className="flex min-w-0 flex-1 flex-col gap-6">
						{activeTab === "home" && (
							<>
								<div className="flex flex-col gap-2.5">
									<div className="flex items-center justify-between gap-4">
										<div className="flex flex-1 items-center gap-4">
											<div className="shrink-0 font-extrabold text-[#F8FAFC] text-[18px] tracking-tight">
												Routines
											</div>
											<div className="relative flex w-full max-w-xs items-center">
												<Search className="pointer-events-none absolute left-3 size-3.5 text-[#64748B]" />
												<input
													type="text"
													placeholder="Search tasks & routines..."
													value={searchInput}
													onChange={(e) => setSearchInput(e.target.value)}
													className="w-full rounded-lg border border-[#93C5FD]/35 bg-[#091524] py-1.5 pr-8 pl-8.5 font-medium font-sans text-[#F8FAFC] text-[13px] placeholder-[#64748B] outline-none transition-all duration-200 focus:border-[#38BDF8] focus:ring-2 focus:ring-[#38BDF8]/25"
												/>
												{searchInput && (
													<button
														type="button"
														onClick={() => setSearchInput("")}
														className="absolute right-2.5 cursor-pointer text-[#64748B] transition-colors hover:text-[#F8FAFC]"
														aria-label="Clear search"
													>
														<X className="size-3.5" />
													</button>
												)}
											</div>
										</div>
										<button
											type="button"
											onClick={handleOpenCreate}
											className="frost-pill-btn shrink-0 cursor-pointer whitespace-nowrap rounded-lg px-4 py-2 font-bold text-[13px] active:scale-95"
										>
											+ New Routine
										</button>
									</div>

									{allCategories.length > 0 && (
										<div className="flex flex-wrap items-center gap-1.5 pt-0.5">
											<button
												type="button"
												onClick={() => setSelectedCategory(null)}
												className={cn(
													"cursor-pointer rounded-full border px-2.5 py-0.5 font-mono text-[11px] transition-all duration-150 active:scale-95",
													selectedCategory === null
														? "border-[#7DD3FC] bg-[#1A385C] font-semibold text-[#F8FAFC] shadow-[0_0_12px_rgba(56,189,248,0.35)]"
														: "border-[#7DD3FC]/25 bg-[#102136] text-[#BAE6FD] hover:border-[#7DD3FC]/50 hover:text-[#F8FAFC]",
												)}
											>
												All
											</button>
											{allCategories.map((cat) => (
												<button
													key={cat}
													type="button"
													onClick={() =>
														setSelectedCategory(
															selectedCategory === cat ? null : cat,
														)
													}
													className={cn(
														"cursor-pointer rounded-full border px-2.5 py-0.5 font-mono text-[11px] transition-all duration-150 active:scale-95",
														selectedCategory === cat
															? "border-[#7DD3FC] bg-[#1A385C] font-semibold text-[#F8FAFC] shadow-[0_0_12px_rgba(56,189,248,0.35)]"
															: "border-[#7DD3FC]/25 bg-[#102136] text-[#BAE6FD] hover:border-[#7DD3FC]/50 hover:text-[#F8FAFC]",
													)}
												>
													{cat}
												</button>
											))}
											{(searchInput || selectedCategory) && (
												<span className="ml-2 font-mono text-[#93C5FD] text-[11px]">
													Showing {sortedRoutines.length} of {routines.length}
												</span>
											)}
										</div>
									)}
								</div>

								{routinesQuery.isLoading ? (
									<RoutinesLoadingState />
								) : routinesQuery.isError ? (
									<RoutinesErrorState onRetry={() => routinesQuery.refetch()} />
								) : sortedRoutines.length === 0 ? (
									<div className="frost-panel flex flex-col items-center justify-center gap-3 rounded-xl border border-[#BAE6FD]/20 border-dashed bg-[#0D1624]/40 px-6 py-12 text-center">
										<div className="flex size-11 items-center justify-center rounded-full border border-[#BAE6FD]/20 bg-[#070B12]/80 text-[#93C5FD] shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]">
											<Inbox className="size-5 stroke-[1.5]" />
										</div>
										<p className="font-serif text-[#93C5FD] text-sm italic">
											{selectedCategory
												? `No tasks for "${selectedCategory}".`
												: searchInput
													? `No tasks matching "${searchInput}".`
													: "No tasks for this category."}
										</p>
										<button
											type="button"
											onClick={() => {
												setSearchInput("");
												setSelectedCategory(null);
											}}
											className="cursor-pointer font-medium text-[#38BDF8] text-xs underline underline-offset-4 transition-colors hover:text-[#BAE6FD] active:scale-95"
										>
											View all tasks
										</button>
									</div>
								) : (
									<RoutineList
										routines={sortedRoutines}
										onComplete={handleComplete}
										onEdit={handleOpenEdit}
										onTogglePause={handleTogglePause}
									/>
								)}
							</>
						)}

						{activeTab === "schedule" && <ScheduleView />}

						{activeTab === "all" && (
							<div className="flex flex-col gap-4">
								<div className="flex flex-col gap-2.5">
									<div className="flex items-center justify-between gap-4">
										<div className="flex flex-1 items-center gap-4">
											<div className="shrink-0 font-extrabold text-[#F8FAFC] text-[18px] tracking-tight">
												All Tasks
											</div>
											<div className="relative flex w-full max-w-xs items-center">
												<Search className="pointer-events-none absolute left-3 size-3.5 text-[#64748B]" />
												<input
													type="text"
													placeholder="Search tasks & routines..."
													value={searchInput}
													onChange={(e) => setSearchInput(e.target.value)}
													className="w-full rounded-lg border border-[#93C5FD]/35 bg-[#091524] py-1.5 pr-8 pl-8.5 font-medium font-sans text-[#F8FAFC] text-[13px] placeholder-[#64748B] outline-none transition-all duration-200 focus:border-[#38BDF8] focus:ring-2 focus:ring-[#38BDF8]/25"
												/>
												{searchInput && (
													<button
														type="button"
														onClick={() => setSearchInput("")}
														className="absolute right-2.5 cursor-pointer text-[#64748B] transition-colors hover:text-[#F8FAFC]"
														aria-label="Clear search"
													>
														<X className="size-3.5" />
													</button>
												)}
											</div>
										</div>
									</div>

									{allCategories.length > 0 && (
										<div className="flex flex-wrap items-center gap-1.5 pt-0.5">
											<button
												type="button"
												onClick={() => setSelectedCategory(null)}
												className={cn(
													"cursor-pointer rounded-full border px-2.5 py-0.5 font-mono text-[11px] transition-all duration-150 active:scale-95",
													selectedCategory === null
														? "border-[#7DD3FC] bg-[#1A385C] font-semibold text-[#F8FAFC] shadow-[0_0_12px_rgba(56,189,248,0.35)]"
														: "border-[#7DD3FC]/25 bg-[#102136] text-[#BAE6FD] hover:border-[#7DD3FC]/50 hover:text-[#F8FAFC]",
												)}
											>
												All
											</button>
											{allCategories.map((cat) => (
												<button
													key={cat}
													type="button"
													onClick={() =>
														setSelectedCategory(
															selectedCategory === cat ? null : cat,
														)
													}
													className={cn(
														"cursor-pointer rounded-full border px-2.5 py-0.5 font-mono text-[11px] transition-all duration-150 active:scale-95",
														selectedCategory === cat
															? "border-[#7DD3FC] bg-[#1A385C] font-semibold text-[#F8FAFC] shadow-[0_0_12px_rgba(56,189,248,0.35)]"
															: "border-[#7DD3FC]/25 bg-[#102136] text-[#BAE6FD] hover:border-[#7DD3FC]/50 hover:text-[#F8FAFC]",
													)}
												>
													{cat}
												</button>
											))}
											{(searchInput || selectedCategory) && (
												<span className="ml-2 font-mono text-[#93C5FD] text-[11px]">
													Showing {sortedRoutines.length} of {routines.length}
												</span>
											)}
										</div>
									)}
								</div>

								{sortedRoutines.length === 0 ? (
									<div className="frost-panel flex flex-col items-center justify-center gap-3 rounded-xl border border-[#BAE6FD]/20 border-dashed bg-[#0D1624]/40 px-6 py-12 text-center">
										<div className="flex size-11 items-center justify-center rounded-full border border-[#BAE6FD]/20 bg-[#070B12]/80 text-[#93C5FD] shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]">
											<Inbox className="size-5 stroke-[1.5]" />
										</div>
										<p className="font-serif text-[#93C5FD] text-sm italic">
											{selectedCategory
												? `No tasks for "${selectedCategory}".`
												: searchInput
													? `No tasks matching "${searchInput}".`
													: "No tasks for this category."}
										</p>
										<button
											type="button"
											onClick={() => {
												setSearchInput("");
												setSelectedCategory(null);
											}}
											className="cursor-pointer font-medium text-[#38BDF8] text-xs underline underline-offset-4 transition-colors hover:text-[#BAE6FD] active:scale-95"
										>
											View all tasks
										</button>
									</div>
								) : (
									<div className="frost-panel overflow-hidden rounded-xl">
										<AnimatePresence mode="popLayout" initial={false}>
											{sortedRoutines.map((routine) => (
												<motion.div
													key={routine.id}
													layout
													initial={{ opacity: 0, y: -10 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{
														opacity: 0,
														height: 0,
														overflow: "hidden",
														transition: { duration: 0.2 },
													}}
													transition={{
														layout: { duration: 0.28, ease: [0.25, 1, 0.5, 1] },
														duration: 0.2,
													}}
												>
													<RoutineListRow routine={routine} />
												</motion.div>
											))}
										</AnimatePresence>
									</div>
								)}
							</div>
						)}

						{activeTab === "analytics" && (
							<div className="flex flex-col gap-5">
								<div className="flex items-center gap-2">
									<BarChart2 className="size-5 text-[#38BDF8]" />
									<div className="font-extrabold text-[#F0F9FF] text-[18px] tracking-tight">
										System Analytics
									</div>
								</div>
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
									<div className="frost-panel flex flex-col gap-1 rounded-xl p-4">
										<div className="font-mono text-[#64748B] text-[11px] uppercase tracking-wider">
											Total Routines
										</div>
										<div className="font-extrabold text-2xl text-[#F0F9FF]">
											{routines.length}
										</div>
										<div className="text-[#93C5FD] text-[11.5px]">
											Configured in your dashboard
										</div>
									</div>
									<div className="frost-panel flex flex-col gap-1 rounded-xl p-4">
										<div className="font-mono text-[#64748B] text-[11px] uppercase tracking-wider">
											Cycle Completion
										</div>
										<div className="font-extrabold text-2xl text-[#F0F9FF]">
											{routines.length > 0
												? Math.round(
														(routines.filter(
															(r) =>
																r.status === "Done" || r.status === "Finished",
														).length /
															routines.length) *
															100,
													)
												: 0}
											%
										</div>
										<div className="text-[#93C5FD] text-[11.5px]">
											Current period completion
										</div>
									</div>
									<div className="frost-panel flex flex-col gap-1 rounded-xl p-4">
										<div className="font-mono text-[#64748B] text-[11px] uppercase tracking-wider">
											Active Categories
										</div>
										<div className="font-extrabold text-2xl text-[#F0F9FF]">
											{allCategories.length}
										</div>
										<div className="text-[#93C5FD] text-[11.5px]">
											Distinct routine categories
										</div>
									</div>
								</div>
								<div className="frost-panel flex items-start gap-3 rounded-xl p-4 text-[#93C5FD] text-[12.5px]">
									<Sparkles className="mt-0.5 size-4 shrink-0 text-[#38BDF8]" />
									<div className="leading-relaxed">
										<strong className="text-[#F0F9FF]">
											Phase 0 Architecture:
										</strong>{" "}
										LE-REMINDER records every{" "}
										<code className="font-mono text-[#BAE6FD]">
											CompletionEvent
										</code>{" "}
										directly in your database. Historical charts, consistency
										velocity, and habit streaks will activate in future roadmap
										phases.
									</div>
								</div>
							</div>
						)}
					</div>

					<TodoSidebar />
				</div>
			</div>

			<RoutineFormDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				routine={editingRoutine}
				categorySuggestions={buildCategorySuggestions(routines)}
				onSubmit={handleSubmit}
				onDelete={handleDelete}
			/>
		</div>
	);
}
