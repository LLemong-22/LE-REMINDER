"use client";

import type { AppRouter } from "@LE-REMINDER/api/routers/index";
import { Checkbox } from "@LE-REMINDER/ui/components/checkbox";
import { cn } from "@LE-REMINDER/ui/lib/utils";
import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import { GripVertical, Inbox, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { triggerCyberExplosion } from "@/lib/cyber-explosion";
import { queryClient, trpc } from "@/utils/trpc";

type Todo = inferRouterOutputs<AppRouter>["todo"]["list"][number];

function TodoRowContent({
	todo,
	editMode,
	grip,
	onToggle,
	onDelete,
}: {
	todo: Todo;
	editMode: boolean;
	grip: React.ReactNode;
	onToggle?: (target?: HTMLElement) => void;
	onDelete?: () => void;
}) {
	return (
		<div
			className={cn(
				"-mx-1.5 flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors duration-150 hover:bg-white/[0.04] light:hover:bg-stone-200/50",
				todo.done && "opacity-65",
			)}
		>
			{grip}
			<Checkbox
				checked={todo.done}
				onCheckedChange={() => onToggle?.()}
				onClick={(e) => {
					onToggle?.(e.currentTarget);
				}}
				className="size-3.5 cursor-pointer rounded-sm border-white/20 light:border-stone-400/60 bg-zinc-950/60 light:bg-stone-100 transition-all duration-150 active:scale-90 group-hover/todo:border-white/40 data-checked:border-[#EDEDEF] light:data-checked:border-stone-900 data-checked:bg-[#EDEDEF] light:data-checked:bg-stone-900 data-checked:text-zinc-950 light:data-checked:text-stone-50"
			/>
			<button
				type="button"
				onClick={(e) => {
					onToggle?.(e.currentTarget);
				}}
				className={cn(
					"flex-1 cursor-pointer bg-transparent text-left text-xs transition-colors duration-150 active:scale-[0.99]",
					todo.done
						? "light:text-stone-400 text-zinc-400 line-through decoration-zinc-500/60 light:decoration-stone-400/60"
						: "light:text-[#1C1917] text-[#F4F4F6] hover:text-white light:hover:text-black",
				)}
			>
				{todo.text}
			</button>
			{editMode && (
				<button
					type="button"
					onClick={onDelete}
					aria-label={`Remove ${todo.text}`}
					className="cursor-pointer bg-transparent px-1 text-sm text-zinc-500 transition-all hover:scale-110 hover:text-rose-400 active:scale-90"
				>
					×
				</button>
			)}
		</div>
	);
}

function GripHandle({
	label,
	...props
}: { label: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			type="button"
			aria-label={`Reorder ${label}`}
			className="cursor-grab touch-none bg-transparent text-zinc-600 transition-colors hover:text-zinc-300 active:cursor-grabbing"
			{...props}
		>
			<GripVertical className="size-3.5" />
		</button>
	);
}

function SortableTodoRow({
	todo,
	editMode,
	indicator,
	onToggle,
	onDelete,
}: {
	todo: Todo;
	editMode: boolean;
	indicator: "above" | "below" | null;
	onToggle: (target?: HTMLElement) => void;
	onDelete: () => void;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: todo.id });

	return (
		<motion.div
			ref={setNodeRef}
			layout={!isDragging ? "position" : false}
			initial={{ opacity: 0, y: -16, scale: 0.95 }}
			animate={{ opacity: isDragging ? 0.3 : 1, y: 0, scale: 1 }}
			exit={{
				opacity: 0,
				scale: 0.8,
				height: 0,
				overflow: "hidden",
				transition: { duration: 0.2 },
			}}
			whileTap={{ scale: 0.98 }}
			transition={{
				layout: { duration: 0.28, ease: [0.25, 1, 0.5, 1] },
				duration: 0.2,
			}}
			style={{
				transform: CSS.Transform.toString(transform),
				transition: transition || "transform 250ms cubic-bezier(0.2, 0, 0, 1)",
				position: "relative",
			}}
		>
			{indicator && (
				<span
					aria-hidden="true"
					className={cn(
						"absolute inset-x-0 h-[2px] rounded-full bg-[#EDEDEF] shadow-[0_0_8px_rgba(255,255,255,0.6)]",
						indicator === "above" ? "-top-[5px]" : "-bottom-[5px]",
					)}
				/>
			)}
			<TodoRowContent
				todo={todo}
				editMode={editMode}
				grip={<GripHandle label={todo.text} {...attributes} {...listeners} />}
				onToggle={onToggle}
				onDelete={onDelete}
			/>
		</motion.div>
	);
}

export function TodoSidebar() {
	const [editMode, setEditMode] = useState(false);
	const [newText, setNewText] = useState("");
	const [activeId, setActiveId] = useState<string | null>(null);
	const [overId, setOverId] = useState<string | null>(null);

	const todosQuery = useQuery(trpc.todo.list.queryOptions());
	const sortedTodos = todosQuery.data ?? [];

	function invalidateTodos() {
		queryClient.invalidateQueries(trpc.todo.pathFilter());
	}

	const addMutation = useMutation(
		trpc.todo.add.mutationOptions({
			onSuccess: () => {
				setNewText("");
				invalidateTodos();
			},
		}),
	);

	const toggleMutation = useMutation(
		trpc.todo.toggle.mutationOptions({
			onMutate: async ({ todoId }) => {
				await queryClient.cancelQueries(trpc.todo.list.queryOptions());
				const prev = queryClient.getQueryData(
					trpc.todo.list.queryOptions().queryKey,
				);
				queryClient.setQueryData(
					trpc.todo.list.queryOptions().queryKey,
					(old) =>
						old?.map((t) => (t.id === todoId ? { ...t, done: !t.done } : t)),
				);
				return { prev };
			},
			onError: (_err, _vars, ctx) => {
				if (ctx?.prev) {
					queryClient.setQueryData(
						trpc.todo.list.queryOptions().queryKey,
						ctx.prev,
					);
				}
			},
			onSettled: invalidateTodos,
		}),
	);

	const deleteMutation = useMutation(
		trpc.todo.delete.mutationOptions({
			onMutate: async ({ todoId }) => {
				await queryClient.cancelQueries(trpc.todo.list.queryOptions());
				const prev = queryClient.getQueryData(
					trpc.todo.list.queryOptions().queryKey,
				);
				queryClient.setQueryData(
					trpc.todo.list.queryOptions().queryKey,
					(old) => old?.filter((t) => t.id !== todoId),
				);
				return { prev };
			},
			onError: (_err, _vars, ctx) => {
				if (ctx?.prev) {
					queryClient.setQueryData(
						trpc.todo.list.queryOptions().queryKey,
						ctx.prev,
					);
				}
			},
			onSettled: invalidateTodos,
		}),
	);

	const reorderMutation = useMutation(
		trpc.todo.reorder.mutationOptions({
			onMutate: async ({ todoIds }) => {
				await queryClient.cancelQueries(trpc.todo.list.queryOptions());
				const prev = queryClient.getQueryData(
					trpc.todo.list.queryOptions().queryKey,
				);
				queryClient.setQueryData(
					trpc.todo.list.queryOptions().queryKey,
					(old) => {
						if (!old) return old;
						const map = new Map(old.map((t) => [t.id, t]));
						return todoIds
							.map((id, index) => {
								const t = map.get(id);
								return t ? { ...t, position: index } : null;
							})
							.filter((t): t is Todo => t !== null);
					},
				);
				return { prev };
			},
			onError: (_err, _vars, ctx) => {
				if (ctx?.prev) {
					queryClient.setQueryData(
						trpc.todo.list.queryOptions().queryKey,
						ctx.prev,
					);
				}
			},
			onSettled: invalidateTodos,
		}),
	);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	function addTodo() {
		const trimmed = newText.trim();
		if (!trimmed) return;
		addMutation.mutate({ text: trimmed });
	}

	function handleDragStart(event: DragStartEvent) {
		setActiveId(event.active.id as string);
		setOverId(null);
	}

	function handleDragOver(event: DragOverEvent) {
		setOverId((event.over?.id as string) ?? null);
	}

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		setActiveId(null);
		setOverId(null);

		if (!over || active.id === over.id) return;

		const oldIndex = sortedTodos.findIndex((todo) => todo.id === active.id);
		const newIndex = sortedTodos.findIndex((todo) => todo.id === over.id);
		if (oldIndex === -1 || newIndex === -1) return;

		const reordered = arrayMove(sortedTodos, oldIndex, newIndex);
		reorderMutation.mutate({ todoIds: reordered.map((todo) => todo.id) });
	}

	function handleDragCancel() {
		setActiveId(null);
		setOverId(null);
	}

	function indicatorFor(todoId: string): "above" | "below" | null {
		if (!activeId || !overId || overId === activeId || todoId !== overId) {
			return null;
		}
		const activeIndex = sortedTodos.findIndex((todo) => todo.id === activeId);
		const overIndex = sortedTodos.findIndex((todo) => todo.id === overId);
		return overIndex > activeIndex ? "below" : "above";
	}

	const activeTodo = sortedTodos.find((todo) => todo.id === activeId) ?? null;

	return (
		<div className="sticky top-20 flex max-h-[calc(100vh-96px)] w-[280px] shrink-0 select-none flex-col gap-3.5 overflow-y-auto rounded-2xl border border-white/[0.11] light:border-stone-300/80 bg-gradient-to-b from-zinc-800/65 light:from-[#F5F4F0] light:via-[#F5F4F0] via-zinc-900/75 light:to-[#EAE8E1] to-zinc-950/85 p-4 light:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_4px_20px_-2px_rgba(28,25,23,0.06)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.20),0_12px_32px_-8px_rgba(0,0,0,0.6)] backdrop-blur-md sm:p-5">
			<div className="flex items-center justify-between">
				<div className="font-semibold light:text-[#1C1917] text-[#F4F4F6] text-sm tracking-tight">
					Today's To-Do
				</div>
				<div className="flex items-center gap-2">
					{editMode && sortedTodos.some((t) => t.done) && (
						<button
							type="button"
							onClick={() => {
								for (const t of sortedTodos.filter((item) => item.done)) {
									deleteMutation.mutate({ todoId: t.id });
								}
							}}
							className="cursor-pointer font-mono light:text-stone-500 text-[11px] text-zinc-400 hover:text-[#F4F4F6] light:hover:text-[#1C1917] hover:underline active:scale-95"
						>
							Clear Done
						</button>
					)}
					<button
						type="button"
						onClick={() => setEditMode((v) => !v)}
						className="cursor-pointer font-mono light:text-stone-500 text-[11px] text-zinc-400 transition-colors hover:text-[#F4F4F6] light:hover:text-[#1C1917] active:scale-95"
					>
						{editMode ? "Done" : "Edit List"}
					</button>
				</div>
			</div>

			<div className="flex flex-col gap-2">
				{!todosQuery.isLoading && sortedTodos.length === 0 && (
					<div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/[0.08] light:border-stone-300 border-dashed bg-zinc-950/40 light:bg-stone-200/40 px-4 py-8 text-center">
						<div className="flex size-8 items-center justify-center rounded-full border border-white/[0.08] light:border-stone-300 bg-zinc-900/60 light:bg-stone-200 light:text-stone-600 text-zinc-400">
							<Inbox className="size-3.5 stroke-[1.5]" />
						</div>
						<span className="font-mono light:text-stone-500 text-xs text-zinc-400">
							Scratchpad is empty.
						</span>
					</div>
				)}

				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragStart={handleDragStart}
					onDragOver={handleDragOver}
					onDragEnd={handleDragEnd}
					onDragCancel={handleDragCancel}
				>
					<SortableContext
						items={sortedTodos.map((todo) => todo.id)}
						strategy={verticalListSortingStrategy}
					>
						<div className="flex flex-col gap-0.5">
							<AnimatePresence mode="popLayout" initial={false}>
								{!todosQuery.isLoading &&
									sortedTodos.map((todo) => (
										<SortableTodoRow
											key={todo.id}
											todo={todo}
											editMode={editMode}
											indicator={indicatorFor(todo.id)}
											onToggle={(target) => {
												if (!todo.done && target) {
													triggerCyberExplosion(target);
												}
												toggleMutation.mutate({ todoId: todo.id });
											}}
											onDelete={() =>
												deleteMutation.mutate({ todoId: todo.id })
											}
										/>
									))}
							</AnimatePresence>
						</div>
					</SortableContext>

					{typeof document !== "undefined" &&
						createPortal(
							<DragOverlay>
								{activeTodo && (
									<div className="w-[240px] scale-[1.02] rounded-lg border border-white/20 light:border-stone-400 bg-zinc-900/95 light:bg-stone-100 px-2 py-1.5 shadow-[0_16px_36px_rgba(0,0,0,0.6)] backdrop-blur-md">
										<TodoRowContent
											todo={activeTodo}
											editMode={editMode}
											grip={<GripHandle label={activeTodo.text} />}
										/>
									</div>
								)}
							</DragOverlay>,
							document.body,
						)}
				</DndContext>
			</div>

			{/* Inline Quick Add Input */}
			<div className="flex items-center gap-1.5 border-white/[0.07] light:border-stone-300/80 border-t pt-2">
				<input
					type="text"
					value={newText}
					onChange={(e) => setNewText(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") addTodo();
					}}
					placeholder="Add a task…"
					className="min-w-0 flex-1 rounded-lg border border-white/[0.08] light:border-stone-300 bg-zinc-950/70 light:bg-stone-100 px-2.5 py-1.5 font-sans light:text-stone-900 text-xs text-zinc-100 light:placeholder-stone-400 placeholder-zinc-500 outline-none transition-all duration-150 focus:border-white/30 light:focus:border-stone-500 focus:ring-1 focus:ring-white/20 light:focus:ring-stone-400/40"
				/>
				<button
					type="button"
					onClick={addTodo}
					aria-label="Add task"
					className="flex size-7 cursor-pointer items-center justify-center rounded-lg bg-[var(--cta-bg)] text-[var(--cta-text)] shadow-sm transition-all duration-150 hover:scale-105 hover:opacity-90 active:scale-95"
				>
					<Plus className="size-4 stroke-[2.5]" />
				</button>
			</div>
		</div>
	);
}
