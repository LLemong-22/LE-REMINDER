"use client";

import { cn } from "@LE-REMINDER/ui/lib/utils";
import {
	BookOpen,
	Calendar,
	Clock,
	Dumbbell,
	Moon,
	Radio,
	Utensils,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MASTER_SCHEDULE, type ScheduleEventType } from "@/lib/schedule-data";

const TYPE_CONFIG: Record<
	ScheduleEventType,
	{
		label: string;
		nodeColor: string;
		dotColor: string;
		icon: React.ComponentType<{ className?: string }>;
	}
> = {
	study: {
		label: "Study & Work",
		nodeColor: "bg-[#EDEDEF]",
		dotColor: "bg-[#EDEDEF]",
		icon: BookOpen,
	},
	physical: {
		label: "Physical & Gym",
		nodeColor: "bg-zinc-400",
		dotColor: "bg-zinc-400",
		icon: Dumbbell,
	},
	meal: {
		label: "Nutrition & Fuel",
		nodeColor: "bg-zinc-400",
		dotColor: "bg-zinc-400",
		icon: Utensils,
	},
	rest: {
		label: "Rest & Recovery",
		nodeColor: "bg-zinc-500",
		dotColor: "bg-zinc-500",
		icon: Moon,
	},
};

/**
 * Parses time strings like "08:00 - 09:00", "06:30", "17:00 - dst", "18:30 ke atas"
 * into start and end Date objects on the given referenceDate (today).
 */
function parseEventTimeRange(
	timeStr: string,
	nextTimeStr: string | undefined,
	referenceDate: Date,
): { start: Date; end: Date } | null {
	const matches = Array.from(timeStr.matchAll(/(\d{1,2})[:.](\d{2})/g));
	if (matches.length === 0) return null;

	const startH = Number.parseInt(matches[0][1], 10);
	const startM = Number.parseInt(matches[0][2], 10);

	const start = new Date(referenceDate);
	start.setHours(startH, startM, 0, 0);

	const lower = timeStr.toLowerCase();
	const isUntilEndOfDay = lower.includes("dst") || lower.includes("ke atas");

	if (matches.length >= 2) {
		const endH = Number.parseInt(matches[1][1], 10);
		const endM = Number.parseInt(matches[1][2], 10);
		const end = new Date(referenceDate);
		end.setHours(endH, endM, 0, 0);
		return { start, end };
	}

	if (isUntilEndOfDay) {
		const end = new Date(referenceDate);
		end.setHours(23, 59, 59, 999);
		return { start, end };
	}

	if (nextTimeStr) {
		const nextMatches = Array.from(
			nextTimeStr.matchAll(/(\d{1,2})[:.](\d{2})/g),
		);
		if (nextMatches.length > 0) {
			const nextH = Number.parseInt(nextMatches[0][1], 10);
			const nextM = Number.parseInt(nextMatches[0][2], 10);
			const end = new Date(referenceDate);
			end.setHours(nextH, nextM, 0, 0);
			if (end.getTime() > start.getTime()) {
				return { start, end };
			}
		}
	}

	// Fallback for standalone point in time: 45-minute active window
	const end = new Date(start.getTime() + 45 * 60 * 1000);
	const endOfDay = new Date(referenceDate);
	endOfDay.setHours(23, 59, 59, 999);
	return { start, end: end.getTime() > endOfDay.getTime() ? endOfDay : end };
}

export function ScheduleView() {
	const [selectedDay, setSelectedDay] = useState<number>(() =>
		new Date().getDay(),
	);
	const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

	const liveEventRef = useRef<HTMLDivElement | null>(null);
	const hasAutoScrolledRef = useRef(false);

	// Low-overhead 60-second ticker
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTime(new Date());
		}, 60000);
		return () => clearInterval(interval);
	}, []);

	const todayDayOfWeek = currentTime.getDay();
	const isSelectedDayToday = selectedDay === todayDayOfWeek;

	const currentDaySchedule =
		MASTER_SCHEDULE.find((d) => d.dayOfWeek === selectedDay) ??
		MASTER_SCHEDULE[0];

	// Auto-scroll to active live event on mount or when switching to today
	useEffect(() => {
		if (
			isSelectedDayToday &&
			liveEventRef.current &&
			!hasAutoScrolledRef.current
		) {
			hasAutoScrolledRef.current = true;
			const timer = setTimeout(() => {
				liveEventRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "center",
				});
			}, 150);
			return () => clearTimeout(timer);
		}
	}, [isSelectedDayToday]);

	const eventCountByType = currentDaySchedule.events.reduce(
		(acc, event) => {
			acc[event.type] = (acc[event.type] || 0) + 1;
			return acc;
		},
		{} as Record<ScheduleEventType, number>,
	);

	return (
		<div className="flex flex-col gap-6">
			{/* Day Selector Header */}
			<div className="flex flex-col gap-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Calendar className="size-4 text-zinc-400" />
						<h2 className="font-semibold text-[#EDEDEF] text-base tracking-tight">
							Master Schedule
						</h2>
					</div>
					<div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
						<span>Daily Rundown</span>
						{isSelectedDayToday && (
							<span className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2 py-0.5 font-mono text-[#EDEDEF] text-[10px]">
								<span className="size-1.5 animate-pulse rounded-full bg-[#EDEDEF]" />
								LIVE
							</span>
						)}
					</div>
				</div>

				{/* Horizontal Day Picker (Smoked-Glass Cards) */}
				<div className="-mx-2 flex items-center gap-2 overflow-x-auto scroll-smooth px-2 pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
					{MASTER_SCHEDULE.map((schedule) => {
						const isSelected = schedule.dayOfWeek === selectedDay;
						const isToday = schedule.dayOfWeek === todayDayOfWeek;

						return (
							<button
								key={schedule.dayOfWeek}
								type="button"
								onClick={() => {
									setSelectedDay(schedule.dayOfWeek);
									if (schedule.dayOfWeek !== todayDayOfWeek) {
										hasAutoScrolledRef.current = false;
									}
								}}
								className={cn(
									"relative flex min-h-[44px] shrink-0 cursor-pointer select-none flex-col items-center justify-center rounded-xl px-4 py-2 text-xs transition-all duration-150 active:scale-95",
									isSelected
										? "border border-white/30 bg-white/[0.08] text-[#EDEDEF] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18)]"
										: "border border-white/[0.06] bg-zinc-900/50 text-zinc-400 hover:border-white/[0.14] hover:text-[#EDEDEF]",
								)}
							>
								<div className="flex items-center gap-1.5 font-medium text-xs">
									<span>{schedule.dayName}</span>
									{isToday && (
										<span
											className={cn(
												"rounded-md px-1.5 py-0.2 font-mono text-[9px] uppercase tracking-wider",
												isSelected
													? "bg-white/15 text-white"
													: "bg-white/[0.06] text-zinc-400",
											)}
										>
											Today
										</span>
									)}
								</div>
								<span className="font-mono text-[10px] text-zinc-500 tabular-nums">
									{schedule.events.length} events
								</span>
							</button>
						);
					})}
				</div>
			</div>

			{/* Day Theme Banner */}
			<div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/55 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md sm:p-5">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-2">
							<span className="font-mono text-xs text-zinc-400 uppercase tracking-wider">
								{currentDaySchedule.dayName}
							</span>
							{isSelectedDayToday && (
								<span className="flex items-center gap-1 rounded-full border border-white/20 bg-white/[0.08] px-2 py-0.5 font-mono text-[#EDEDEF] text-[10px]">
									<Radio className="size-2.5 animate-pulse text-[#EDEDEF]" />
									Active Day
								</span>
							)}
						</div>
						<h3 className="font-medium text-[#EDEDEF] text-sm tracking-tight sm:text-base">
							{currentDaySchedule.theme}
						</h3>
					</div>

					{/* Unified Monochrome Activity Pills */}
					<div className="flex flex-wrap items-center gap-1.5 pt-1 sm:pt-0">
						{(
							Object.keys(eventCountByType) as readonly ScheduleEventType[]
						).map((type) => {
							const config = TYPE_CONFIG[type];
							const count = eventCountByType[type];
							const Icon = config.icon;
							return (
								<div
									key={type}
									className="flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 font-mono text-[10.5px] text-zinc-300"
								>
									<span
										className={cn("size-1.5 rounded-full", config.dotColor)}
									/>
									<Icon className="size-3 text-zinc-400" />
									<span className="tabular-nums">
										{count} {config.label.split(" ")[0]}
									</span>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{/* Vertical Timeline with Gradient Spine */}
			<div className="relative ml-3 space-y-4 border-gradient-to-b border-l from-white/20 via-white/10 to-transparent pl-5 sm:ml-4 sm:pl-7">
				{currentDaySchedule.events.map((event, index) => {
					const config = TYPE_CONFIG[event.type];
					const Icon = config.icon;

					let isPast = false;
					let isLive = false;

					if (isSelectedDayToday) {
						const range = parseEventTimeRange(
							event.time,
							currentDaySchedule.events[index + 1]?.time,
							currentTime,
						);
						if (range) {
							const curMs = currentTime.getTime();
							isPast = curMs >= range.end.getTime();
							isLive =
								curMs >= range.start.getTime() && curMs < range.end.getTime();
						}
					}

					return (
						<div
							key={`${event.time}-${index}`}
							ref={isLive ? liveEventRef : null}
							className={cn(
								"group relative transition-all duration-200",
								isPast && "opacity-45 hover:opacity-75",
							)}
						>
							{/* Node on the timeline track */}
							<div
								className={cn(
									"absolute top-4 -left-[25px] size-2 rounded-full ring-4 ring-[#09090B] transition-all duration-200 sm:-left-[33px]",
									isLive
										? "size-2.5 bg-[#EDEDEF] shadow-[0_0_10px_rgba(255,255,255,0.7)] ring-white/20"
										: isPast
											? "bg-zinc-600 ring-[#09090B]"
											: config.nodeColor,
								)}
							/>

							{/* Event Card */}
							<div
								className={cn(
									"flex flex-col gap-2 rounded-xl p-3.5 transition-all duration-150 sm:p-4",
									isLive
										? "border border-white/30 bg-zinc-850/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md"
										: "border border-white/[0.06] bg-zinc-900/50 shadow-[0_4px_20px_rgba(0,0,0,0.25)] backdrop-blur-md hover:border-white/[0.12]",
								)}
							>
								<div className="flex items-center justify-between gap-3">
									<div className="flex items-center gap-1.5 font-mono text-xs text-zinc-300 tabular-nums">
										<Clock className="size-3 text-zinc-400" />
										<span>{event.time}</span>
									</div>
									<div className="flex items-center gap-1.5">
										{isLive && (
											<span className="flex items-center gap-1 rounded-md border border-white/25 bg-white/10 px-1.5 py-0.5 font-mono text-[#EDEDEF] text-[9px] uppercase tracking-wider">
												<span className="size-1.5 animate-ping rounded-full bg-white" />
												LIVE NOW
											</span>
										)}
										<span className="flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9.5px] text-zinc-400 uppercase tracking-wider">
											<Icon className="size-2.5 text-zinc-400" />
											<span>{config.label.split(" ")[0]}</span>
										</span>
									</div>
								</div>

								<div className="font-normal text-[#EDEDEF] text-xs leading-relaxed sm:text-[13px]">
									{event.activity}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
