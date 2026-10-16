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
	Moon,
	Search,
	Sparkles,
	Sun,
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
				"relative cursor-pointer select-none rounded-full px-3.5 py-1 font-medium text-xs transition-colors duration-150 focus-visible:outline-none",
				active
					? "light:text-stone-900 text-zinc-100"
					: "light:text-stone-600 text-zinc-400 hover:text-zinc-100 light:hover:text-stone-900",
			)}
		>
			{children}
			{active && (
				<motion.div
					layoutId="activeTab"
					transition={{ type: "spring", stiffness: 450, damping: 35 }}
					className="absolute inset-0 -z-10 rounded-full border border-white/[0.12] light:border-stone-400 bg-white/[0.1] light:bg-stone-200/80 light:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]"
				/>
			)}
		</button>
	);
}

function RoutinesLoadingState() {
	return (
		<div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
			{Array.from({ length: 6 }).map((_, i) => (
				<div
					key={i}
					className="flex flex-col gap-3 rounded-xl border border-white/[0.08] light:border-stone-300/80 bg-zinc-900/40 light:bg-stone-200/40 p-4"
				>
					<div className="flex items-center justify-between">
						<div className="size-2.5 animate-pulse rounded-full bg-white/10 light:bg-stone-400/40" />
						<div className="h-3.5 w-14 animate-pulse rounded-md bg-white/10 light:bg-stone-400/40" />
					</div>
					<div className="h-4 w-3/4 animate-pulse rounded bg-white/10 light:bg-stone-400/40" />
					<div className="h-3 w-1/2 animate-pulse rounded bg-white/5 light:bg-stone-400/20" />
					<div className="h-2.5 w-1/3 animate-pulse rounded bg-white/5 light:bg-stone-400/20" />
				</div>
			))}
		</div>
	);
}

function RoutinesErrorState({ onRetry }: { onRetry: () => void }) {
	return (
		<div className="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.11] light:border-stone-300/80 bg-zinc-900/65 light:bg-[#F5F4F0] p-12 text-center backdrop-blur-md">
			<div className="font-mono light:text-stone-500 text-xs text-zinc-400">
				Couldn't load routines from the database.
			</div>
			<button
				type="button"
				onClick={onRetry}
				className="cursor-pointer rounded-lg border border-white/20 light:border-stone-400 bg-white/10 light:bg-stone-200 px-3 py-1.5 font-medium light:text-stone-900 text-xs text-zinc-100 transition-all hover:bg-white/20 active:scale-95"
			>
				Retry
			</button>
		</div>
	);
}

export default function Home() {
	const router = useRouter();
	const [searchInput, setSearchInput] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [theme, setTheme] = useState<"dark" | "light">("dark");

	// Synchronize theme state with DOM & localStorage on mount
	useEffect(() => {
		const isLight = document.documentElement.classList.contains("light");
		setTheme(isLight ? "light" : "dark");
	}, []);

	function toggleTheme() {
		const next = theme === "dark" ? "light" : "dark";
		setTheme(next);
		if (next === "light") {
			document.documentElement.classList.add("light");
			try {
				localStorage.setItem("le-reminder-theme", "light");
			} catch {}
		} else {
			document.documentElement.classList.remove("light");
			try {
				localStorage.setItem("le-reminder-theme", "dark");
			} catch {}
		}
	}

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
		<div
			className="min-h-screen text-[var(--text-primary,#F4F4F6)] transition-colors duration-200"
			style={{
				background: "var(--canvas-bg)",
				backgroundImage: "var(--canvas-glow)",
			}}
		>
			{/* Floating Smoked-Glass / Warm-Stone Navigation Bar */}
			<header className="sticky top-3 z-40 mx-auto flex w-[calc(100%-2rem)] max-w-5xl items-center justify-between rounded-full border border-[var(--header-border)] bg-[var(--header-bg)] px-5 py-2 shadow-[var(--header-shadow)] backdrop-blur-md">
				<div className="w-auto shrink-0 font-semibold light:text-stone-900 text-xs text-zinc-100 uppercase tracking-wider sm:w-[170px]">
					LE-REMINDER
				</div>

				<div className="flex items-center gap-1 sm:gap-2">
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

				<div className="flex w-auto shrink-0 items-center justify-end gap-2 sm:w-[170px]">
					{/* 1-Click Theme Toggle Button */}
					<button
						type="button"
						onClick={toggleTheme}
						title={`Switch to ${theme === "dark" ? "Warm Editorial Stone (Light)" : "Obsidian Titanium (Dark)"}`}
						aria-label="Toggle theme"
						className="flex size-7.5 cursor-pointer items-center justify-center rounded-full border border-white/10 light:border-stone-300 bg-white/[0.04] light:bg-stone-200/60 light:text-stone-700 text-zinc-300 transition-all hover:border-white/20 light:hover:border-stone-400 hover:bg-white/[0.08] hover:text-white light:hover:text-stone-900 active:scale-90"
					>
						{theme === "dark" ? (
							<Sun className="size-3.5 transition-transform duration-300 hover:rotate-45" />
						) : (
							<Moon className="size-3.5 transition-transform duration-300 hover:-rotate-12" />
						)}
					</button>

					<a
						href="https://github.com/LLemong-22/LE-REMINDER.git"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono light:text-stone-600 text-[11px] text-zinc-400 transition-colors hover:bg-white/[0.06] light:hover:bg-stone-200/60 hover:text-zinc-100 light:hover:text-stone-900"
					>
						<Github className="size-3.5" />
						<span className="hidden sm:inline">LLemong-22</span>
					</a>
				</div>
			</header>

			<main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-6 pb-16 sm:px-8">
				{activeTab === "home" && (
					<HeroPanel routines={routines} onComplete={handleComplete} />
				)}

				<div className="flex flex-col items-start gap-6 lg:flex-row">
					<div className="flex min-w-0 flex-1 flex-col gap-6">
						{activeTab === "home" && (
							<>
								<div className="flex flex-col gap-3">
									<div className="flex items-center justify-between gap-4">
										<div className="flex flex-1 items-center gap-3">
											<h2 className="shrink-0 font-semibold light:text-stone-900 text-base text-zinc-100 tracking-tight">
												Routines
											</h2>
											<div className="relative flex w-full max-w-xs items-center">
												<Search className="pointer-events-none absolute left-3 size-3.5 light:text-stone-500 text-zinc-400" />
												<input
													type="text"
													placeholder="Search tasks & routines..."
													value={searchInput}
													onChange={(e) => setSearchInput(e.target.value)}
													className="w-full rounded-lg border border-white/[0.08] light:border-stone-300 bg-zinc-950/70 light:bg-stone-100 py-1.5 pr-8 pl-8 font-sans light:text-stone-900 text-xs text-zinc-100 light:placeholder-stone-400 placeholder-zinc-500 outline-none transition-all duration-150 focus:border-white/30 light:focus:border-stone-500 focus:ring-1 focus:ring-white/20 light:focus:ring-stone-400/40"
												/>
												{searchInput && (
													<button
														type="button"
														onClick={() => setSearchInput("")}
														className="absolute right-2.5 cursor-pointer light:text-stone-500 text-zinc-400 transition-colors hover:text-zinc-100 light:hover:text-stone-900"
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
											className="shrink-0 cursor-pointer whitespace-nowrap rounded-lg bg-[var(--cta-bg)] px-3.5 py-1.5 font-medium text-[var(--cta-text)] text-xs shadow-sm transition-all duration-150 hover:scale-[1.02] hover:opacity-90 active:scale-95"
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
														? "border-white/25 light:border-stone-400 bg-white/[0.1] light:bg-stone-200 font-semibold light:text-stone-900 text-zinc-100 light:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]"
														: "border-white/[0.06] light:border-stone-300/80 bg-zinc-900/40 light:bg-stone-100 light:text-stone-600 text-zinc-400 hover:border-white/[0.14] light:hover:border-stone-400 hover:text-zinc-100 light:hover:text-stone-900",
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
															? "border-white/25 light:border-stone-400 bg-white/[0.1] light:bg-stone-200 font-semibold light:text-stone-900 text-zinc-100 light:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]"
															: "border-white/[0.06] light:border-stone-300/80 bg-zinc-900/40 light:bg-stone-100 light:text-stone-600 text-zinc-400 hover:border-white/[0.14] light:hover:border-stone-400 hover:text-zinc-100 light:hover:text-stone-900",
													)}
												>
													{cat}
												</button>
											))}
											{(searchInput || selectedCategory) && (
												<span className="ml-2 font-mono light:text-stone-500 text-xs text-zinc-400 tabular-nums">
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
									<div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/[0.08] light:border-stone-300 border-dashed bg-zinc-950/40 light:bg-stone-200/40 px-6 py-12 text-center">
										<div className="flex size-10 items-center justify-center rounded-full border border-white/[0.08] light:border-stone-300 bg-zinc-900/60 light:bg-stone-200 light:text-stone-600 text-zinc-400">
											<Inbox className="size-4 stroke-[1.5]" />
										</div>
										<p className="font-mono light:text-stone-500 text-xs text-zinc-400">
											{selectedCategory
												? `No tasks for "${selectedCategory}".`
												: searchInput
													? `No tasks matching "${searchInput}".`
													: "No tasks configured."}
										</p>
										<button
											type="button"
											onClick={() => {
												setSearchInput("");
												setSelectedCategory(null);
											}}
											className="cursor-pointer font-mono light:text-stone-600 text-[11px] text-zinc-400 underline underline-offset-4 transition-colors hover:text-zinc-100 light:hover:text-stone-900 active:scale-95"
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
								<div className="flex flex-col gap-3">
									<div className="flex items-center justify-between gap-4">
										<div className="flex flex-1 items-center gap-3">
											<h2 className="shrink-0 font-semibold light:text-stone-900 text-base text-zinc-100 tracking-tight">
												All Tasks
											</h2>
											<div className="relative flex w-full max-w-xs items-center">
												<Search className="pointer-events-none absolute left-3 size-3.5 light:text-stone-500 text-zinc-400" />
												<input
													type="text"
													placeholder="Search tasks & routines..."
													value={searchInput}
													onChange={(e) => setSearchInput(e.target.value)}
													className="w-full rounded-lg border border-white/[0.08] light:border-stone-300 bg-zinc-950/70 light:bg-stone-100 py-1.5 pr-8 pl-8 font-sans light:text-stone-900 text-xs text-zinc-100 light:placeholder-stone-400 placeholder-zinc-500 outline-none transition-all duration-150 focus:border-white/30 light:focus:border-stone-500 focus:ring-1 focus:ring-white/20 light:focus:ring-stone-400/40"
												/>
												{searchInput && (
													<button
														type="button"
														onClick={() => setSearchInput("")}
														className="absolute right-2.5 cursor-pointer light:text-stone-500 text-zinc-400 transition-colors hover:text-zinc-100 light:hover:text-stone-900"
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
														? "border-white/25 light:border-stone-400 bg-white/[0.1] light:bg-stone-200 font-semibold light:text-stone-900 text-zinc-100 light:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]"
														: "border-white/[0.06] light:border-stone-300/80 bg-zinc-900/40 light:bg-stone-100 light:text-stone-600 text-zinc-400 hover:border-white/[0.14] light:hover:border-stone-400 hover:text-zinc-100 light:hover:text-stone-900",
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
															? "border-white/25 light:border-stone-400 bg-white/[0.1] light:bg-stone-200 font-semibold light:text-stone-900 text-zinc-100 light:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]"
															: "border-white/[0.06] light:border-stone-300/80 bg-zinc-900/40 light:bg-stone-100 light:text-stone-600 text-zinc-400 hover:border-white/[0.14] light:hover:border-stone-400 hover:text-zinc-100 light:hover:text-stone-900",
													)}
												>
													{cat}
												</button>
											))}
											{(searchInput || selectedCategory) && (
												<span className="ml-2 font-mono light:text-stone-500 text-xs text-zinc-400 tabular-nums">
													Showing {sortedRoutines.length} of {routines.length}
												</span>
											)}
										</div>
									)}
								</div>

								{sortedRoutines.length === 0 ? (
									<div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/[0.08] light:border-stone-300 border-dashed bg-zinc-950/40 light:bg-stone-200/40 px-6 py-12 text-center">
										<div className="flex size-10 items-center justify-center rounded-full border border-white/[0.08] light:border-stone-300 bg-zinc-900/60 light:bg-stone-200 light:text-stone-600 text-zinc-400">
											<Inbox className="size-4 stroke-[1.5]" />
										</div>
										<p className="font-mono light:text-stone-500 text-xs text-zinc-400">
											{selectedCategory
												? `No tasks for "${selectedCategory}".`
												: searchInput
													? `No tasks matching "${searchInput}".`
													: "No tasks configured."}
										</p>
										<button
											type="button"
											onClick={() => {
												setSearchInput("");
												setSelectedCategory(null);
											}}
											className="cursor-pointer font-mono light:text-stone-600 text-[11px] text-zinc-400 underline underline-offset-4 transition-colors hover:text-zinc-100 light:hover:text-stone-900 active:scale-95"
										>
											View all tasks
										</button>
									</div>
								) : (
									<div className="overflow-hidden rounded-2xl border border-white/[0.11] light:border-stone-300/80 bg-gradient-to-b from-zinc-800/65 light:from-[#F5F4F0] light:via-[#F5F4F0] via-zinc-900/75 light:to-[#EAE8E1] to-zinc-950/85 light:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_4px_20px_-2px_rgba(28,25,23,0.06)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.20),0_12px_32px_-8px_rgba(0,0,0,0.6)] backdrop-blur-md">
										<AnimatePresence mode="popLayout" initial={false}>
											{sortedRoutines.map((routine) => (
												<motion.div
													key={routine.id}
													layout="position"
													initial={{ opacity: 0, y: -10 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{
														opacity: 0,
														height: 0,
														overflow: "hidden",
														transition: { duration: 0.2 },
													}}
													transition={{
														type: "spring",
														stiffness: 450,
														damping: 32,
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
									<BarChart2 className="size-4 light:text-stone-500 text-zinc-400" />
									<h2 className="font-semibold light:text-stone-900 text-base text-zinc-100 tracking-tight">
										System Analytics
									</h2>
								</div>
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
									<div className="flex flex-col gap-1 rounded-2xl border border-white/[0.11] light:border-stone-300/80 bg-gradient-to-b from-zinc-800/65 light:from-[#F5F4F0] light:via-[#F5F4F0] via-zinc-900/75 light:to-[#EAE8E1] to-zinc-950/85 p-5 light:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_4px_20px_-2px_rgba(28,25,23,0.06)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.20),0_12px_32px_-8px_rgba(0,0,0,0.6)] backdrop-blur-md">
										<div className="font-mono light:text-stone-500 text-[11px] text-zinc-400 uppercase tracking-widest">
											Total Routines
										</div>
										<div className="font-semibold light:text-stone-900 text-3xl text-zinc-100 tabular-nums">
											{routines.length}
										</div>
										<div className="light:text-stone-500 text-[11px] text-zinc-400">
											Configured in your dashboard
										</div>
									</div>
									<div className="flex flex-col gap-1 rounded-2xl border border-white/[0.11] light:border-stone-300/80 bg-gradient-to-b from-zinc-800/65 light:from-[#F5F4F0] light:via-[#F5F4F0] via-zinc-900/75 light:to-[#EAE8E1] to-zinc-950/85 p-5 light:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_4px_20px_-2px_rgba(28,25,23,0.06)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.20),0_12px_32px_-8px_rgba(0,0,0,0.6)] backdrop-blur-md">
										<div className="font-mono light:text-stone-500 text-[11px] text-zinc-400 uppercase tracking-widest">
											Cycle Completion
										</div>
										<div className="font-semibold light:text-stone-900 text-3xl text-zinc-100 tabular-nums">
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
										<div className="light:text-stone-500 text-[11px] text-zinc-400">
											Current period completion
										</div>
									</div>
									<div className="flex flex-col gap-1 rounded-2xl border border-white/[0.11] light:border-stone-300/80 bg-gradient-to-b from-zinc-800/65 light:from-[#F5F4F0] light:via-[#F5F4F0] via-zinc-900/75 light:to-[#EAE8E1] to-zinc-950/85 p-5 light:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_4px_20px_-2px_rgba(28,25,23,0.06)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.20),0_12px_32px_-8px_rgba(0,0,0,0.6)] backdrop-blur-md">
										<div className="font-mono light:text-stone-500 text-[11px] text-zinc-400 uppercase tracking-widest">
											Active Categories
										</div>
										<div className="font-semibold light:text-stone-900 text-3xl text-zinc-100 tabular-nums">
											{allCategories.length}
										</div>
										<div className="light:text-stone-500 text-[11px] text-zinc-400">
											Distinct routine categories
										</div>
									</div>
								</div>
								<div className="flex items-start gap-3 rounded-2xl border border-white/[0.08] light:border-stone-300/80 bg-zinc-900/40 light:bg-stone-200/50 p-4 light:text-stone-600 text-xs text-zinc-400">
									<Sparkles className="mt-0.5 size-4 shrink-0 light:text-stone-500 text-zinc-400" />
									<div className="leading-relaxed">
										<strong className="light:text-stone-900 text-zinc-100">
											Phase 0 Architecture:
										</strong>{" "}
										LE-REMINDER records every{" "}
										<code className="font-mono light:text-stone-900 text-zinc-100">
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
			</main>

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
