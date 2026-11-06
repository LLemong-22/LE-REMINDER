import type { RoutineView } from "@LE-REMINDER/core/application/routine-view";
import type { Category } from "@LE-REMINDER/core/domain/category";
import type { CompletionEvent } from "@LE-REMINDER/core/domain/completion-event";
import { computeRoutineStatus } from "@LE-REMINDER/core/domain/compute-routine-status";
import { startOfDay } from "@LE-REMINDER/core/domain/fixed-calendar-slot";
import type {
	CompletionEventId,
	RoutineId,
} from "@LE-REMINDER/core/domain/identity";
import type { TaskType } from "@LE-REMINDER/core/domain/task-type";

// Pure cache transforms for optimistic updates on the routine.list query.
// Each mirrors what the server will eventually compute — using the real
// computeRoutineStatus (not a client-side guess), so there's no risk of
// the optimistic state disagreeing with what the refetch confirms.
function stubCompletion(
	routineId: RoutineId,
	completedAt: Date,
): CompletionEvent {
	return {
		id: "optimistic" as CompletionEventId,
		routineId,
		completedAt: startOfDay(completedAt),
	};
}

export function withCompleted(
	views: readonly RoutineView[],
	routineId: RoutineId,
	now: Date,
): RoutineView[] {
	const completedAt = new Date(now.toISOString());
	return views.map((view) => {
		if (view.routine.id !== routineId) return view;
		const status =
			view.routine.taskType.kind === "OneOff" ? "Finished" : "Done";
		return {
			...view,
			status,
			lastCompletedAt: completedAt,
		};
	});
}

export function withPaused(
	views: readonly RoutineView[],
	routineId: RoutineId,
	isPaused: boolean,
	now: Date,
): RoutineView[] {
	return views.map((view) => {
		if (view.routine.id !== routineId) return view;
		const routine = { ...view.routine, isPaused };
		const latestCompletion = view.lastCompletedAt
			? stubCompletion(routineId, view.lastCompletedAt)
			: null;
		return {
			...view,
			routine,
			status: computeRoutineStatus(
				routine.taskType,
				isPaused,
				latestCompletion,
				now,
				routine.createdAt,
			),
		};
	});
}

export function withRemoved(
	views: readonly RoutineView[],
	routineId: RoutineId,
): RoutineView[] {
	return views.filter((view) => view.routine.id !== routineId);
}

type TaskTypeInput =
	| Extract<TaskType, { kind: "Recurring" }>
	| { readonly kind: "OneOff"; readonly dueDate?: unknown };

function toDomainTaskType(taskType: TaskTypeInput): TaskType {
	if (taskType.kind === "Recurring") return taskType;
	const raw = taskType.dueDate;
	const dueDate =
		raw instanceof Date
			? raw
			: typeof raw === "string" || typeof raw === "number"
				? new Date(raw)
				: null;
	return { kind: "OneOff", dueDate };
}

export function withCreated(
	views: readonly RoutineView[],
	input: {
		id: RoutineId;
		name: string;
		category?: Category | null;
		taskType: TaskTypeInput;
		isTask?: boolean;
		isImportant?: boolean;
	},
	now: Date,
): RoutineView[] {
	const domainTaskType = toDomainTaskType(input.taskType);
	const routine = {
		id: input.id,
		name: input.name,
		category: input.category ?? null,
		taskType: domainTaskType,
		isPaused: false,
		isTask: input.isTask ?? false,
		isImportant: input.isImportant ?? false,
		createdAt: now,
	};
	return [
		...views,
		{
			routine,
			status: computeRoutineStatus(routine.taskType, false, null, now, now),
			lastCompletedAt: null,
		},
	];
}

export function withEdited(
	views: readonly RoutineView[],
	input: {
		routineId: RoutineId;
		name?: string;
		category?: Category | null;
		taskType?: TaskTypeInput;
		isTask?: boolean;
		isImportant?: boolean;
	},
	now: Date,
): RoutineView[] {
	return views.map((view) => {
		if (view.routine.id !== input.routineId) return view;
		const routine = {
			...view.routine,
			name: input.name ?? view.routine.name,
			category:
				input.category !== undefined ? input.category : view.routine.category,
			taskType:
				input.taskType !== undefined
					? toDomainTaskType(input.taskType)
					: view.routine.taskType,
			isTask: input.isTask ?? view.routine.isTask,
			isImportant: input.isImportant ?? view.routine.isImportant,
		};
		const latestCompletion = view.lastCompletedAt
			? stubCompletion(routine.id, view.lastCompletedAt)
			: null;
		return {
			...view,
			routine,
			status: computeRoutineStatus(
				routine.taskType,
				routine.isPaused,
				latestCompletion,
				now,
				routine.createdAt,
			),
		};
	});
}
