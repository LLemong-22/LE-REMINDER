"use client";

import { useEffect, useRef, useState } from "react";

export function CountUp({
	to,
	from = 0,
	duration = 1.2,
	className = "",
}: {
	to: number;
	from?: number;
	duration?: number;
	className?: string;
}) {
	const [value, setValue] = useState(from);
	const currentValueRef = useRef(from);
	const startTimeRef = useRef<number | null>(null);
	const frameRef = useRef<number | null>(null);

	useEffect(() => {
		const startVal = currentValueRef.current;
		if (startVal === to) {
			setValue(to);
			return;
		}
		startTimeRef.current = null;
		const targetVal = to;
		const durationMs = duration * 1000;

		const easeOutExpo = (t: number): number => {
			return t === 1 ? 1 : 1 - 2 ** (-10 * t);
		};

		const step = (timestamp: number) => {
			if (!startTimeRef.current) startTimeRef.current = timestamp;
			const elapsed = timestamp - startTimeRef.current;
			const progress = Math.min(elapsed / durationMs, 1);
			const eased = easeOutExpo(progress);
			const current = Math.round(startVal + (targetVal - startVal) * eased);

			currentValueRef.current = current;
			startValueRef.current = current;
			setValue(current);

			if (progress < 1) {
				frameRef.current = requestAnimationFrame(step);
			} else {
				currentValueRef.current = targetVal;
				setValue(targetVal);
			}
		};

		frameRef.current = requestAnimationFrame(step);

		return () => {
			if (frameRef.current) cancelAnimationFrame(frameRef.current);
		};
	}, [to, duration]);

	return <span className={className}>{value}%</span>;
}
