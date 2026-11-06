/// <reference types="bun" />

import type { RoutineView } from "@LE-REMINDER/core/application/routine-view";
import type { RoutineId } from "@LE-REMINDER/core/domain/identity";
import { describe, expect, test } from "bun:test";
import {
	withCompleted,
	withCreated,
	withEdited,
	withPaused,
	withRemoved,
} from "../src/lib/optimistic-routines";

const NOW = new Date("2026-11-06T12:00:00.000Z");

function makeRecurringView(id: string): RoutineView {
	return {
		routine: {
			id: id as RoutineId,
			name: "Daily Backup",
			category: "Tech",
			isPaused: false,
			isTask: false,
			isImportant: true,
			createdAt: new Date("2026-10-01T00:00:00.000Z"),
			taskType: {
				kind: "Recurring",
				schedule: {
					type: "FixedCalendar",
					recurrence: { kind: "Daily" },
					isMandatory: true,
				},
			},
		},
		status: "Due",
		lastCompletedAt: null,
	};
}

function makeOneOffView(id: string): RoutineView {
	return {
		routine: {
			id: id as RoutineId,
			name: "Submit Tax Form",
			category: "Finance",
			isPaused: false,
			isTask: true,
			isImportant: false,
			createdAt: new Date("2026-10-01T00:00:00.000Z"),
			taskType: {
				kind: "OneOff",
				dueDate: null,
			},
		},
		status: "Due",
		lastCompletedAt: null,
	};
}

describe("optimistic-routines", () => {
	test("withCompleted immediately transitions Recurring routine to Done and updates lastCompletedAt", () => {
		const initial = [makeRecurringView("r-1"), makeOneOffView("r-2")];
		const updated = withCompleted(initial, "r-1" as RoutineId, NOW);

		expect(updated[0]?.status).toBe("Done");
		expect(updated[0]?.lastCompletedAt?.toISOString()).toBe(NOW.toISOString());
		expect(updated[1]?.status).toBe("Due");
	});

	test("withCompleted immediately transitions OneOff routine to Finished", () => {
		const initial = [makeRecurringView("r-1"), makeOneOffView("r-2")];
		const updated = withCompleted(initial, "r-2" as RoutineId, NOW);

		expect(updated[1]?.status).toBe("Finished");
		expect(updated[1]?.lastCompletedAt?.toISOString()).toBe(NOW.toISOString());
	});

	test("withPaused toggles pause state and recomputes status instantaneously", () => {
		const initial = [makeRecurringView("r-1")];
		const paused = withPaused(initial, "r-1" as RoutineId, true, NOW);
		expect(paused[0]?.routine.isPaused).toBe(true);
		expect(paused[0]?.status).toBe("Paused");

		const resumed = withPaused(paused, "r-1" as RoutineId, false, NOW);
		expect(resumed[0]?.routine.isPaused).toBe(false);
		expect(resumed[0]?.status).toBe("Overdue");
	});

	test("withRemoved filters deleted routine immediately", () => {
		const initial = [makeRecurringView("r-1"), makeOneOffView("r-2")];
		const updated = withRemoved(initial, "r-1" as RoutineId);
		expect(updated.map((v) => v.routine.id)).toEqual(["r-2" as RoutineId]);
	});

	test("withCreated and withEdited reflect instant cache mutations", () => {
		const dailyTaskType = {
			kind: "Recurring" as const,
			schedule: {
				type: "FixedCalendar" as const,
				recurrence: { kind: "Daily" as const },
				isMandatory: false,
			},
		};
		const created = withCreated(
			[],
			{
				id: "optimistic-1" as RoutineId,
				name: "Hydrate",
				category: "Health",
				isTask: false,
				isImportant: true,
				taskType: dailyTaskType,
			},
			NOW,
		);
		expect(created).toHaveLength(1);
		expect(created[0]?.status).toBe("Due");
		expect(created[0]?.routine.name).toBe("Hydrate");

		const edited = withEdited(
			created,
			{
				routineId: "optimistic-1" as RoutineId,
				name: "Hydrate 3L",
				category: "Wellness",
				isTask: false,
				isImportant: false,
				taskType: dailyTaskType,
			},
			NOW,
		);
		expect(edited[0]?.routine.name).toBe("Hydrate 3L");
		expect(edited[0]?.routine.category).toBe("Wellness");
		expect(edited[0]?.routine.isImportant).toBe(false);
	});
});
