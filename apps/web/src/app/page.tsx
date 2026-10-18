"use client";

import type { RoutineView } from "@LE-REMINDER/core/application/routine-view";
import type { RoutineId } from "@LE-REMINDER/core/domain/identity";
import { cn } from "@LE-REMINDER/ui/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { BarChart2, Github, Inbox, Search, Sparkles, X } from "lucide-react";
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
	const [showVillainIntro, setShowVillainIntro] = useState(false);
	const [searchInput, setSearchInput] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	useEffect(() => {
		if (typeof window !== "undefined") {
			const hasSeenIntro = sessionStorage.getItem("le_reminder_v_intro");
			if (!hasSeenIntro) {
				setShowVillainIntro(true);
			}
		}
	}, []);

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

	return (
		<div className="min-h-screen text-[#F0F9FF]">
			<AnimatePresence>
				{showVillainIntro && (
					<VillainIntro onComplete={() => setShowVillainIntro(false)} />
				)}
			</AnimatePresence>

			<div className="sticky top-0 z-20 flex items-center justify-between border-[#BAE6FD]/10 border-b bg-[#070B12]/85 px-4 py-3.5 backdrop-blur-md sm:px-10">
				<div className="flex items-center gap-2.5 sm:w-[220px]">
					<button
						type="button"
						onClick={() => setShowVillainIntro(true)}
						title="Replay Cryo-Boot Sequence"
						className="group flex size-7 shrink-0 items-center justify-center rounded border border-[#BAE6FD]/25 bg-[#0D1624]/80 font-bold font-mono text-[#BAE6FD] text-[12px] shadow-[0_0_10px_rgba(56,189,248,0.2)] transition-all hover:scale-105 hover:border-[#38BDF8] hover:bg-[#38BDF8]/15 hover:shadow-[0_0_15px_rgba(56,189,248,0.4)] active:scale-95"
					>
						<span className="transition-transform group-hover:scale-110">
							V
						</span>
					</button>
					<div className="shrink-0 font-extrabold text-[#F0F9FF] text-[17px] tracking-tight drop-shadow-[0_0_12px_rgba(56,189,248,0.3)] sm:text-[19px]">
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
				<div className="flex w-auto shrink-0 justify-end sm:w-[220px]">
					<a
						href="https://github.com/Lemong-22/LE-REMINDER.git"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1.5 rounded-lg border border-[#BAE6FD]/10 bg-[#0D1624]/40 px-2.5 py-1.5 font-semibold text-[#93C5FD] text-xs transition-colors hover:border-[#BAE6FD]/30 hover:bg-[#0D1624]/80 hover:text-[#F0F9FF]"
					>
						<Github className="size-4" />
						<span className="hidden sm:inline">Lemong-22</span>
					</a>
				</div>
			</div>

			<div className="flex flex-col gap-6 px-4 pt-[26px] pb-14 sm:px-10">
				{activeTab === "home" && (
					<HeroPanel routines={routines} onComplete={handleComplete} />
				)}

				<div className="flex flex-col items-start gap-[22px] lg:flex-row">
					<div className="flex min-w-0 flex-1 flex-col gap-6">
						{activeTab === "home" && (
							<>
								<div className="flex flex-col gap-2.5">
									<div className="flex items-center justify-between gap-4">
										<div className="flex flex-1 items-center gap-4">
											<div className="shrink-0 font-extrabold text-[#F0F9FF] text-[18px] tracking-tight">
												Routines
											</div>
											<div className="relative flex w-full max-w-xs items-center">
												<Search className="pointer-events-none absolute left-3 size-3.5 text-[#64748B]" />
												<input
													type="text"
													placeholder="Search tasks & routines..."
													value={searchInput}
													onChange={(e) => setSearchInput(e.target.value)}
													className="w-full rounded-lg border border-[#BAE6FD]/15 bg-[#0D1624]/80 py-1.5 pr-8 pl-8.5 font-sans text-[#F0F9FF] text-[12.5px] placeholder-[#64748B] outline-none transition-all duration-200 focus:border-[#38BDF8] focus:ring-2 focus:ring-[#38BDF8]/20"
												/>
												{searchInput && (
													<button
														type="button"
														onClick={() => setSearchInput("")}
														className="absolute right-2.5 cursor-pointer text-[#64748B] transition-colors hover:text-[#F0F9FF]"
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
											className="frost-pill-btn shrink-0 cursor-pointer whitespace-nowrap rounded-lg px-4 py-2 font-semibold text-[13px] active:scale-95"
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
														? "border-[#38BDF8]/50 bg-[#0E1A2D] font-semibold text-[#BAE6FD] shadow-[0_0_10px_-2px_rgba(56,189,248,0.35)]"
														: "border-[#BAE6FD]/15 bg-[#0D1624]/60 text-[#93C5FD] hover:border-[#BAE6FD]/30 hover:text-[#F0F9FF]",
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
															? "border-[#38BDF8]/50 bg-[#0E1A2D] font-semibold text-[#BAE6FD] shadow-[0_0_10px_-2px_rgba(56,189,248,0.35)]"
															: "border-[#BAE6FD]/15 bg-[#0D1624]/60 text-[#93C5FD] hover:border-[#BAE6FD]/30 hover:text-[#F0F9FF]",
													)}
												>
													{cat}
												</button>
											))}
											{(searchInput || selectedCategory) && (
												<span className="ml-2 font-mono text-[#64748B] text-[11px]">
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
											<div className="shrink-0 font-extrabold text-[#F0F9FF] text-[18px] tracking-tight">
												All Tasks
											</div>
											<div className="relative flex w-full max-w-xs items-center">
												<Search className="pointer-events-none absolute left-3 size-3.5 text-[#64748B]" />
												<input
													type="text"
													placeholder="Search tasks & routines..."
													value={searchInput}
													onChange={(e) => setSearchInput(e.target.value)}
													className="w-full rounded-lg border border-[#BAE6FD]/15 bg-[#0D1624]/80 py-1.5 pr-8 pl-8.5 font-sans text-[#F0F9FF] text-[12.5px] placeholder-[#64748B] outline-none transition-all duration-200 focus:border-[#38BDF8] focus:ring-2 focus:ring-[#38BDF8]/20"
												/>
												{searchInput && (
													<button
														type="button"
														onClick={() => setSearchInput("")}
														className="absolute right-2.5 cursor-pointer text-[#64748B] transition-colors hover:text-[#F0F9FF]"
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
														? "border-[#38BDF8]/50 bg-[#0E1A2D] font-semibold text-[#BAE6FD] shadow-[0_0_10px_-2px_rgba(56,189,248,0.35)]"
														: "border-[#BAE6FD]/15 bg-[#0D1624]/60 text-[#93C5FD] hover:border-[#BAE6FD]/30 hover:text-[#F0F9FF]",
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
															? "border-[#38BDF8]/50 bg-[#0E1A2D] font-semibold text-[#BAE6FD] shadow-[0_0_10px_-2px_rgba(56,189,248,0.35)]"
															: "border-[#BAE6FD]/15 bg-[#0D1624]/60 text-[#93C5FD] hover:border-[#BAE6FD]/30 hover:text-[#F0F9FF]",
													)}
												>
													{cat}
												</button>
											))}
											{(searchInput || selectedCategory) && (
												<span className="ml-2 font-mono text-[#64748B] text-[11px]">
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
