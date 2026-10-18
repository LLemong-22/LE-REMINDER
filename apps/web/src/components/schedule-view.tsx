"use client";

import { cn } from "@LE-REMINDER/ui/lib/utils";
import {
	BookOpen,
	Calendar,
	Clock,
	Dumbbell,
	Moon,
	Radio,
	Target,
	Utensils,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MASTER_SCHEDULE, type ScheduleEventType } from "@/lib/schedule-data";
import { smoothScrollToElement } from "@/lib/smooth-scroll";

const TYPE_CONFIG: Record<
	ScheduleEventType,
	{
		label: string;
		nodeColor: string;
		badgeClass: string;
		icon: React.ComponentType<{ className?: string }>;
	}
> = {
	study: {
		label: "Study & Work",
		nodeColor: "bg-[#38BDF8] shadow-[0_0_8px_rgba(56,189,248,0.6)]",
		badgeClass: "border-[#38BDF8]/35 bg-[#38BDF8]/10 text-[#BAE6FD]",
		icon: BookOpen,
	},
	physical: {
		label: "Physical & Gym",
		nodeColor: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
		badgeClass: "border-emerald-500/35 bg-emerald-500/10 text-emerald-300",
		icon: Dumbbell,
	},
	meal: {
		label: "Nutrition & Fuel",
		nodeColor: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
		badgeClass: "border-amber-500/35 bg-amber-500/10 text-amber-300",
		icon: Utensils,
	},
	rest: {
		label: "Rest & Recovery",
		nodeColor: "bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]",
		badgeClass: "border-purple-500/35 bg-purple-500/10 text-purple-300",
		icon: Moon,
	},
};

/**
 * Parses time strings into start and end Date objects for today
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

	// Default fallback: 45-minute duration
	const end = new Date(start.getTime() + 45 * 60 * 1000);
	const endOfDay = new Date(referenceDate);
	endOfDay.setHours(23, 59, 59, 999);
	return { start, end: end.getTime() > endOfDay.getTime() ? endOfDay : end };
}

export function ScheduleView() {
	// Auto-select today's day of week (0 = Minggu, 1 = Senin, ... 6 = Sabtu)
	const [selectedDay, setSelectedDay] = useState<number>(() =>
		new Date().getDay(),
	);
	const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

	const activeCardRef = useRef<HTMLDivElement | null>(null);
	const hasAutoScrolledRef = useRef(false);
	const [highlightPulse, setHighlightPulse] = useState(false);

	const triggerArrivalPulse = useCallback(() => {
		setHighlightPulse(true);
		setTimeout(() => setHighlightPulse(false), 1500);
	}, []);

	// Low-overhead 30s ticker for accurate time block updates with 0% battery drain
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

	// Compute time ranges and status for all events on the active day
	const eventMetrics = useMemo(() => {
		const curMs = currentTime.getTime();
		let foundLiveIndex = -1;
		let upcomingIndex = -1;

		const ranges = currentDaySchedule.events.map((event, index) => {
			if (!isSelectedDayToday) {
				return {
					range: null,
					isPast: false,
					isLive: false,
					minutesRemaining: 0,
					progressPct: 0,
				};
			}

			const range = parseEventTimeRange(
				event.time,
				currentDaySchedule.events[index + 1]?.time,
				currentTime,
			);

			if (!range) {
				return {
					range: null,
					isPast: false,
					isLive: false,
					minutesRemaining: 0,
					progressPct: 0,
				};
			}

			const isPast = curMs >= range.end.getTime();
			const isLive =
				curMs >= range.start.getTime() && curMs < range.end.getTime();

			if (isLive && foundLiveIndex === -1) {
				foundLiveIndex = index;
			}
			if (upcomingIndex === -1 && curMs < range.start.getTime()) {
				upcomingIndex = index;
			}

			const totalMs = range.end.getTime() - range.start.getTime();
			const elapsedMs = curMs - range.start.getTime();
			const progressPct = isLive
				? Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)))
				: isPast
					? 100
					: 0;
			const minutesRemaining = isLive
				? Math.max(1, Math.round((range.end.getTime() - curMs) / 60000))
				: 0;

			return { range, isPast, isLive, minutesRemaining, progressPct };
		});

		// Priority for active target: live event, or next upcoming block
		const activeTargetIndex =
			foundLiveIndex !== -1 ? foundLiveIndex : upcomingIndex;

		return { ranges, activeTargetIndex, hasLiveEvent: foundLiveIndex !== -1 };
	}, [currentDaySchedule, isSelectedDayToday, currentTime]);

	// Butter-smooth auto-scroll on mount or when switching to today
	useEffect(() => {
		if (
			isSelectedDayToday &&
			activeCardRef.current &&
			!hasAutoScrolledRef.current
		) {
			hasAutoScrolledRef.current = true;
			const timer = setTimeout(() => {
				if (activeCardRef.current) {
					smoothScrollToElement(
						activeCardRef.current,
						650,
						triggerArrivalPulse,
					);
				}
			}, 180);
			return () => clearTimeout(timer);
		}
	}, [isSelectedDayToday, triggerArrivalPulse]);

	// Jump to Now button handler: glides with easeOutQuint and triggers arrival pulse
	function handleJumpToNow() {
		setSelectedDay(todayDayOfWeek);
		hasAutoScrolledRef.current = false;
		setTimeout(() => {
			if (activeCardRef.current) {
				smoothScrollToElement(activeCardRef.current, 650, triggerArrivalPulse);
			}
		}, 60);
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
			{/* Day Selector & Jump-to-Now Header */}
			<div className="flex flex-col gap-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Calendar className="size-5 text-[#38BDF8]" />
						<h2 className="font-extrabold text-[#F0F9FF] text-[18px] tracking-tight">
							Master Schedule
						</h2>
					</div>
					<div className="flex items-center gap-2.5">
						<button
							type="button"
							onClick={handleJumpToNow}
							className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#BAE6FD]/30 bg-[#BAE6FD]/10 px-3 py-1 font-mono font-semibold text-[#BAE6FD] text-[11px] shadow-[0_0_12px_rgba(56,189,248,0.2)] transition-all hover:border-[#BAE6FD]/60 hover:bg-[#BAE6FD]/20 active:scale-95"
						>
							<Target className="size-3 text-[#38BDF8]" />
							<span>Jump to Now</span>
						</button>
						{isSelectedDayToday && (
							<span className="flex items-center gap-1.5 rounded-full border border-[#38BDF8]/40 bg-[#38BDF8]/10 px-2.5 py-0.5 font-mono text-[#BAE6FD] text-[10.5px]">
								<span className="size-1.5 animate-pulse rounded-full bg-[#38BDF8]" />
								LIVE TODAY
							</span>
						)}
					</div>
				</div>

				{/* Horizontal Scrollable Day Picker */}
				<div className="-mx-2 flex items-center gap-2 overflow-x-auto scroll-smooth px-2 pb-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
									"relative flex min-h-[44px] shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl px-4 py-2 text-xs transition-all duration-150 active:scale-95",
									isSelected
										? "border border-[#BAE6FD]/45 bg-[rgba(13,22,36,0.85)] text-[#F0F9FF] shadow-[0_0_16px_-2px_rgba(56,189,248,0.35),inset_0_1px_0_0_rgba(224,242,254,0.3)]"
										: "frost-panel text-[#93C5FD] hover:border-[#BAE6FD]/30 hover:text-[#F0F9FF]",
								)}
							>
								<div className="flex items-center gap-1.5 font-semibold text-[13px]">
									<span>{schedule.dayName}</span>
									{isToday && (
										<span
											className={cn(
												"rounded-full px-1.5 py-0.2 font-mono text-[9px] uppercase tracking-wider",
												isSelected
													? "bg-[#38BDF8]/25 text-[#BAE6FD]"
													: "bg-white/10 text-[#93C5FD]",
											)}
										>
											Today
										</span>
									)}
								</div>
								<span className="font-mono text-[#64748B] text-[10px]">
									{schedule.events.length} blocks
								</span>
							</button>
						);
					})}
				</div>
			</div>

			{/* Day Theme Banner */}
			<div className="frost-panel relative overflow-hidden rounded-xl p-4 sm:p-5">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-2">
							<span className="font-mono text-[#38BDF8] text-xs uppercase tracking-wider">
								{currentDaySchedule.dayName}
							</span>
							{isSelectedDayToday && (
								<span className="flex items-center gap-1 rounded-full border border-[#38BDF8]/40 bg-[#38BDF8]/10 px-2 py-0.5 font-mono text-[#BAE6FD] text-[10px] shadow-[0_0_8px_rgba(56,189,248,0.25)]">
									<Radio className="size-2.5 animate-pulse text-[#38BDF8]" />
									Active Day
								</span>
							)}
						</div>
						<h3 className="font-bold text-[#F0F9FF] text-base sm:text-lg">
							{currentDaySchedule.theme}
						</h3>
					</div>

					{/* Quick stats pills */}
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
									className={cn(
										"flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10.5px]",
										config.badgeClass,
									)}
								>
									<Icon className="size-3" />
									<span>
										{count} {config.label.split(" ")[0]}
									</span>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{/* Vertical Timeline */}
			<div className="relative ml-3 space-y-4 border-[#BAE6FD]/15 border-l pl-5 sm:ml-4 sm:pl-7">
				{currentDaySchedule.events.map((event, index) => {
					const config = TYPE_CONFIG[event.type];
					const Icon = config.icon;
					const metrics = eventMetrics.ranges[index];
					const isLive = metrics?.isLive ?? false;
					const isPast = metrics?.isPast ?? false;
					const minutesRemaining = metrics?.minutesRemaining ?? 0;
					const progressPct = metrics?.progressPct ?? 0;
					const isTarget =
						isSelectedDayToday && index === eventMetrics.activeTargetIndex;

					return (
						<div
							key={`${event.time}-${index}`}
							ref={isTarget ? activeCardRef : null}
							className={cn(
								"group relative transition-all duration-200",
								isPast && "opacity-45 hover:opacity-80",
							)}
						>
							{/* Node on the timeline track */}
							<div
								className={cn(
									"absolute top-4.5 -left-[25px] size-2.5 rounded-full ring-4 ring-[#0D1B2A] transition-all duration-300 sm:-left-[33px]",
									isLive
										? "animate-pulse bg-[#BAE6FD] shadow-[0_0_12px_rgba(56,189,248,0.9)] ring-[#38BDF8]/40"
										: isPast
											? "bg-[#334155] ring-[#0D1B2A]"
											: config.nodeColor,
								)}
							/>

							{/* Active Event Hero Card with glowing icy border, LIVE NOW badge & progress bar */}
							{isLive ? (
								<div
									className={cn(
										"frost-panel relative rounded-xl border border-[#BAE6FD]/50 p-4 shadow-[0_0_24px_rgba(56,189,248,0.3),inset_0_1px_0_0_rgba(224,242,254,0.35)] sm:p-5",
										highlightPulse && "arrival-glow-pulse",
									)}
								>
									<div className="flex flex-col gap-2.5">
										<div className="flex items-center justify-between gap-3">
											<div className="flex items-center gap-2 font-mono font-semibold text-[#BAE6FD] text-xs sm:text-[13px]">
												<Clock className="size-3.5 animate-pulse text-[#38BDF8]" />
												<span>{event.time}</span>
											</div>
											<div className="flex items-center gap-2">
												{/* ● LIVE NOW · [X]m remaining badge */}
												<span className="flex items-center gap-1.5 rounded-full border border-[#BAE6FD]/40 bg-[#38BDF8]/15 px-2.5 py-0.5 font-bold font-mono text-[#BAE6FD] text-[10px] shadow-[0_0_10px_rgba(56,189,248,0.35)]">
													<span className="size-1.5 animate-ping rounded-full bg-[#38BDF8]" />
													LIVE NOW · {minutesRemaining}m remaining
												</span>
												<span
													className={cn(
														"flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
														config.badgeClass,
													)}
												>
													<Icon className="size-2.5" />
													<span>{config.label.split(" ")[0]}</span>
												</span>
											</div>
										</div>

										<div className="font-bold text-[#F0F9FF] text-[15px] leading-relaxed sm:text-[16px]">
											{event.activity}
										</div>

										{/* Sleek Bottom Progress Bar */}
										<div className="mt-1 flex flex-col gap-1">
											<div className="relative h-1.5 w-full overflow-hidden rounded-full border border-[#BAE6FD]/20 bg-[#0D1B2A]/80">
												<div
													className="h-full bg-gradient-to-r from-[#38BDF8] to-[#BAE6FD] shadow-[0_0_8px_#38BDF8] transition-all duration-500 ease-out"
													style={{ width: `${progressPct}%` }}
												/>
											</div>
											<div className="flex justify-between font-mono text-[#64748B] text-[9.5px]">
												<span>{progressPct}% elapsed</span>
												<span>{minutesRemaining}m left</span>
											</div>
										</div>
									</div>
								</div>
							) : (
								/* Standard Card for Normal / Upcoming / Past Events */
								<div className="frost-panel flex flex-col gap-2 rounded-xl p-3.5 transition-all duration-150 hover:border-[#BAE6FD]/30 sm:p-4">
									<div className="flex items-center justify-between gap-3">
										<div className="flex items-center gap-2 font-mono text-[#93C5FD] text-xs sm:text-[13px]">
											<Clock className="size-3.5 text-[#93C5FD]/70" />
											<span>{event.time}</span>
										</div>
										<span
											className={cn(
												"flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
												config.badgeClass,
											)}
										>
											<Icon className="size-2.5" />
											<span>{config.label.split(" ")[0]}</span>
										</span>
									</div>

									<div className="font-medium text-[#F0F9FF] text-[13.5px] leading-relaxed sm:text-[14.5px]">
										{event.activity}
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
