"use client";

import { cn } from "@LE-REMINDER/ui/lib/utils";
import {
	BookOpen,
	Calendar,
	Check,
	Clock,
	Dumbbell,
	Moon,
	Radio,
	Utensils,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
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
		nodeColor: "bg-zinc-200 light:bg-stone-800",
		dotColor: "bg-zinc-200 light:bg-stone-800",
		icon: BookOpen,
	},
	physical: {
		label: "Physical & Gym",
		nodeColor: "bg-zinc-400 light:bg-stone-500",
		dotColor: "bg-zinc-400 light:bg-stone-500",
		icon: Dumbbell,
	},
	meal: {
		label: "Nutrition & Fuel",
		nodeColor: "bg-zinc-400 light:bg-stone-500",
		dotColor: "bg-zinc-400 light:bg-stone-500",
		icon: Utensils,
	},
	rest: {
		label: "Rest & Recovery",
		nodeColor: "bg-zinc-500 light:bg-stone-400",
		dotColor: "bg-zinc-500 light:bg-stone-400",
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

	const activeEventRef = useRef<HTMLDivElement | null>(null);

	// Low-overhead 30-second ticker for precise live countdown and progress
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTime(new Date());
		}, 30000);
		return () => clearInterval(interval);
	}, []);

	const todayDayOfWeek = currentTime.getDay();
	const isSelectedDayToday = selectedDay === todayDayOfWeek;

	const currentDaySchedule =
		MASTER_SCHEDULE.find((d) => d.dayOfWeek === selectedDay) ??
		MASTER_SCHEDULE[0];

	// Precompute event ranges and active / upcoming state
	const { eventStates, activeIndex, targetIndex } = useMemo(() => {
		const curMs = currentTime.getTime();
		let foundActive = -1;
		let foundNext = -1;

		const states = currentDaySchedule.events.map((event, index) => {
			if (!isSelectedDayToday) {
				return { isPast: false, isLive: false, isUpcoming: false, range: null };
			}

			const range = parseEventTimeRange(
				event.time,
				currentDaySchedule.events[index + 1]?.time,
				currentTime,
			);

			if (!range) {
				return { isPast: false, isLive: false, isUpcoming: false, range: null };
			}

			const isPast = curMs >= range.end.getTime();
			const isLive =
				curMs >= range.start.getTime() && curMs < range.end.getTime();
			const isUpcoming = curMs < range.start.getTime();

			if (isLive && foundActive === -1) {
				foundActive = index;
			}
			if (isUpcoming && foundNext === -1) {
				foundNext = index;
			}

			return { isPast, isLive, isUpcoming, range };
		});

		const target =
			foundActive !== -1
				? foundActive
				: foundNext !== -1
					? foundNext
					: states.length > 0
						? states.length - 1
						: -1;

		return {
			eventStates: states,
			activeIndex: foundActive,
			targetIndex: target,
		};
	}, [currentDaySchedule, currentTime, isSelectedDayToday]);

	// Auto-scroll to active or next upcoming event on mount or when switching to today
	useEffect(() => {
		if (isSelectedDayToday && activeEventRef.current) {
			const timer = setTimeout(() => {
				activeEventRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "center",
				});
			}, 120);
			return () => clearTimeout(timer);
		}
	}, [isSelectedDayToday]);

	function jumpToCurrent() {
		setSelectedDay(todayDayOfWeek);
		setTimeout(() => {
			activeEventRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		}, 120);
	}

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
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex items-center gap-2">
						<Calendar className="size-4 light:text-stone-500 text-zinc-400" />
						<h2 className="font-semibold light:text-stone-900 text-base text-zinc-100 tracking-tight">
							Master Schedule
						</h2>
					</div>

					<div className="flex items-center gap-2 font-mono text-xs">
						{/* Floating / Header "Live Now — Jump to Current" pill */}
						<button
							type="button"
							onClick={jumpToCurrent}
							className="flex cursor-pointer items-center gap-1.5 rounded-full border border-white/20 light:border-stone-400 bg-white/10 light:bg-stone-200 px-3 py-1 font-medium font-mono light:text-stone-900 text-[11px] text-zinc-100 shadow-sm transition-all hover:scale-105 hover:bg-white/20 light:hover:bg-stone-300 active:scale-95"
						>
							<span className="size-2 animate-pulse rounded-full bg-emerald-400 light:bg-emerald-600" />
							<span>Live Now — Jump to Current</span>
						</button>
					</div>
				</div>

				{/* Horizontal Day Picker */}
				<div className="-mx-2 flex items-center gap-2 overflow-x-auto scroll-smooth px-2 pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
					{MASTER_SCHEDULE.map((schedule) => {
						const isSelected = schedule.dayOfWeek === selectedDay;
						const isToday = schedule.dayOfWeek === todayDayOfWeek;

						return (
							<button
								key={schedule.dayOfWeek}
								type="button"
								onClick={() => setSelectedDay(schedule.dayOfWeek)}
								className={cn(
									"relative flex min-h-[44px] shrink-0 cursor-pointer select-none flex-col items-center justify-center rounded-xl px-4 py-2 text-xs transition-all duration-150 active:scale-95",
									isSelected
										? "border border-white/30 light:border-stone-400 bg-white/[0.1] light:bg-stone-200 light:text-stone-900 text-zinc-100 light:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
										: "border border-white/[0.06] light:border-stone-300/80 bg-zinc-900/50 light:bg-stone-100 light:text-stone-600 text-zinc-400 hover:border-white/[0.16] light:hover:border-stone-400 hover:text-zinc-100 light:hover:text-stone-900",
								)}
							>
								<div className="flex items-center gap-1.5 font-medium text-xs">
									<span>{schedule.dayName}</span>
									{isToday && (
										<span
											className={cn(
												"rounded-md px-1.5 py-0.2 font-mono text-[9px] uppercase tracking-wider",
												isSelected
													? "bg-white/20 light:bg-stone-900 light:text-stone-50 text-white"
													: "bg-white/[0.06] light:bg-stone-200 light:text-stone-600 text-zinc-400",
											)}
										>
											Today
										</span>
									)}
								</div>
								<span className="font-mono light:text-stone-500 text-[10px] text-zinc-400 tabular-nums">
									{schedule.events.length} events
								</span>
							</button>
						);
					})}
				</div>
			</div>

			{/* Day Theme Banner */}
			<div className="relative overflow-hidden rounded-2xl border border-white/[0.11] light:border-stone-300/80 bg-gradient-to-b from-zinc-800/65 light:from-[#F5F4F0] light:via-[#F5F4F0] via-zinc-900/75 light:to-[#EAE8E1] to-zinc-950/85 p-4 light:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_4px_20px_-2px_rgba(28,25,23,0.06)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.20),0_12px_32px_-8px_rgba(0,0,0,0.6)] backdrop-blur-md sm:p-5">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-2">
							<span className="font-mono light:text-stone-500 text-xs text-zinc-400 uppercase tracking-wider">
								{currentDaySchedule.dayName}
							</span>
							{isSelectedDayToday && (
								<span className="flex items-center gap-1 rounded-full border border-white/20 light:border-stone-400 bg-white/[0.08] light:bg-stone-200 px-2 py-0.5 font-mono light:text-stone-800 text-[10px] text-zinc-200">
									<Radio className="size-2.5 animate-pulse light:text-stone-800 text-zinc-200" />
									Active Day
								</span>
							)}
						</div>
						<h3 className="font-medium light:text-stone-900 text-sm text-zinc-100 tracking-tight sm:text-base">
							{currentDaySchedule.theme}
						</h3>
					</div>

					{/* Unified Activity Pills */}
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
									className="flex items-center gap-1.5 rounded-md border border-white/[0.08] light:border-stone-300/80 bg-white/[0.04] light:bg-stone-200/60 px-2.5 py-1 font-mono light:text-stone-700 text-[10.5px] text-zinc-300"
								>
									<span
										className={cn("size-1.5 rounded-full", config.dotColor)}
									/>
									<Icon className="size-3 light:text-stone-500 text-zinc-400" />
									<span className="tabular-nums">
										{count} {config.label.split(" ")[0]}
									</span>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{/* Vertical Timeline with Intelligent Illuminated Spine */}
			<div className="relative ml-3 space-y-4 pl-5 sm:ml-4 sm:pl-7">
				{currentDaySchedule.events.map((event, index) => {
					const config = TYPE_CONFIG[event.type];
					const Icon = config.icon;
					const state = eventStates[index];
					const isLive = state.isLive;
					const isPast = state.isPast;
					const isTarget = isSelectedDayToday && index === targetIndex;

					// Compute live progress and remaining minutes for active card
					let elapsedPct = 0;
					let minutesLeft = 0;
					if (isLive && state.range) {
						const curMs = currentTime.getTime();
						const startMs = state.range.start.getTime();
						const endMs = state.range.end.getTime();
						elapsedPct = Math.min(
							100,
							Math.max(0, ((curMs - startMs) / (endMs - startMs)) * 100),
						);
						minutesLeft = Math.max(1, Math.round((endMs - curMs) / 60000));
					}

					// Spine illumination: Bright silver up to the current active event
					const isSpineIlluminated =
						isSelectedDayToday &&
						(activeIndex !== -1 ? index < activeIndex : index < targetIndex);

					const isLastItem = index === currentDaySchedule.events.length - 1;

					return (
						<motion.div
							key={`${event.time}-${index}`}
							ref={isTarget ? activeEventRef : null}
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.25, delay: index * 0.03 }}
							className={cn(
								"group relative transition-all duration-200",
								isPast && "opacity-60 hover:opacity-85",
							)}
						>
							{/* Connecting Spine track to the next item */}
							{!isLastItem && (
								<div
									aria-hidden="true"
									className={cn(
										"pointer-events-none absolute top-5 -left-[22px] w-[2px] sm:-left-[30px]",
										"h-[calc(100%+16px)] transition-colors duration-300",
										isSpineIlluminated
											? "bg-zinc-200 light:bg-stone-800 light:shadow-none shadow-[0_0_8px_rgba(255,255,255,0.4)]"
											: "bg-white/10 light:bg-stone-300/80",
									)}
								/>
							)}

							{/* Timeline Node */}
							<div
								className={cn(
									"absolute top-4.5 rounded-full transition-all duration-300",
									isLive
										? "-left-[28px] size-3.5 animate-pulse bg-zinc-100 light:bg-stone-900 light:shadow-[0_0_10px_rgba(28,25,23,0.3)] shadow-[0_0_12px_rgba(255,255,255,0.8)] light:ring-stone-400/50 ring-4 ring-white/30 sm:-left-[36px]"
										: isPast
											? "-left-[25px] flex size-2.5 items-center justify-center bg-zinc-500 light:bg-stone-400 light:ring-[#EAE8E1] ring-4 ring-[#09090B] sm:-left-[33px]"
											: cn(
													"-left-[25px] size-2.5 light:ring-[#EAE8E1] ring-4 ring-[#09090B] sm:-left-[33px]",
													config.nodeColor,
												),
								)}
							>
								{isPast && (
									<Check className="size-1.5 stroke-[3] light:text-[#EAE8E1] text-[#09090B]" />
								)}
							</div>

							{/* Event Card */}
							<div
								className={cn(
									"relative overflow-hidden rounded-xl p-4 transition-all duration-200",
									isLive
										? "border border-white/40 light:border-stone-800 bg-gradient-to-r from-white/[0.11] light:from-stone-200/90 light:via-stone-100/90 via-white/[0.06] light:to-stone-200/60 to-white/[0.03] light:shadow-[0_8px_24px_rgba(28,25,23,0.08),inset_0_1px_0_0_rgba(255,255,255,0.9)] shadow-[0_12px_32px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.3)] backdrop-blur-md"
										: isPast
											? "border border-white/[0.04] light:border-stone-300/60 bg-zinc-950/40 light:bg-stone-200/40 backdrop-blur-md"
											: "border border-white/[0.08] light:border-stone-300/80 bg-zinc-900/55 light:bg-[#F5F4F0] light:shadow-[0_4px_20px_-2px_rgba(28,25,23,0.06),inset_0_1px_0_0_rgba(255,255,255,0.8)] shadow-[0_4px_20px_rgba(0,0,0,0.25),inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-md hover:-translate-y-0.5 hover:border-white/20 light:hover:border-stone-400",
								)}
							>
								{/* Live elapsed background fill gradient */}
								{isLive && (
									<div
										aria-hidden="true"
										className="pointer-events-none absolute inset-y-0 left-0 bg-white/[0.04] light:bg-stone-900/[0.03] transition-all duration-500"
										style={{ width: `${elapsedPct}%` }}
									/>
								)}

								<div className="relative z-10 flex flex-col gap-2">
									<div className="flex flex-wrap items-center justify-between gap-3">
										<div className="flex items-center gap-1.5 font-mono light:text-stone-600 text-xs text-zinc-300 tabular-nums">
											<Clock className="size-3 light:text-stone-500 text-zinc-400" />
											<span className="font-medium">{event.time}</span>
										</div>

										<div className="flex items-center gap-1.5">
											{/* Animated pulsing LIVE NOW badge with time remaining */}
											{isLive && (
												<span className="flex items-center gap-1.5 rounded-full border border-white/30 light:border-stone-800 bg-white/15 light:bg-stone-900 px-2.5 py-0.5 font-mono font-semibold light:text-stone-50 text-[9.5px] text-zinc-100 uppercase tracking-wider shadow-sm">
													<span className="size-1.5 animate-ping rounded-full bg-emerald-400 light:bg-emerald-300" />
													<span>ACTIVE NOW · {minutesLeft}m left</span>
												</span>
											)}

											<span className="flex items-center gap-1 rounded-md border border-white/[0.08] light:border-stone-300/80 bg-white/[0.04] light:bg-stone-200/70 px-1.5 py-0.5 font-mono light:text-stone-600 text-[9.5px] text-zinc-400 uppercase tracking-wider">
												<Icon className="size-2.5 light:text-stone-500 text-zinc-400" />
												<span>{config.label.split(" ")[0]}</span>
											</span>
										</div>
									</div>

									<div
										className={cn(
											"text-xs leading-relaxed sm:text-[13.5px]",
											isLive
												? "font-medium light:text-stone-900 text-zinc-100"
												: isPast
													? "light:text-stone-500 text-zinc-400"
													: "light:text-stone-800 text-zinc-200",
										)}
									>
										{event.activity}
									</div>
								</div>

								{/* Live 2px progress bar along the bottom edge */}
								{isLive && (
									<div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/10 light:bg-stone-300">
										<div
											className="h-full bg-zinc-100 light:bg-stone-900 light:shadow-none shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-500"
											style={{ width: `${elapsedPct}%` }}
										/>
									</div>
								)}
							</div>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
}
