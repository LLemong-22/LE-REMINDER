"use client";

import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { useEffect, useRef } from "react";

export function SpotlightCard({
	children,
	className = "",
	spotlightColor = "rgba(186, 230, 253, 0.12)",
}: {
	children: ReactNode;
	className?: string;
	spotlightColor?: string;
}) {
	const divRef = useRef<HTMLDivElement>(null);
	const rectRef = useRef<DOMRect | null>(null);
	const rafRef = useRef<number | null>(null);

	useEffect(() => {
		return () => {
			if (rafRef.current !== null) {
				cancelAnimationFrame(rafRef.current);
			}
		};
	}, []);

	function handlePointerEnter(e: PointerEvent<HTMLDivElement>) {
		if (
			e.pointerType !== "mouse" ||
			document.documentElement.dataset.scrolling === "true"
		) {
			return;
		}
		if (divRef.current) {
			rectRef.current = divRef.current.getBoundingClientRect();
		}
	}

	function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
		if (
			e.pointerType !== "mouse" ||
			document.documentElement.dataset.scrolling === "true"
		) {
			return;
		}
		const el = divRef.current;
		if (!el) return;
		const rect = rectRef.current ?? el.getBoundingClientRect();
		rectRef.current = rect;
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		if (rafRef.current !== null) return;
		rafRef.current = requestAnimationFrame(() => {
			rafRef.current = null;
			if (!divRef.current) return;
			divRef.current.style.setProperty("--mouse-x", `${x}px`);
			divRef.current.style.setProperty("--mouse-y", `${y}px`);
		});
	}

	function handlePointerLeave() {
		rectRef.current = null;
	}

	return (
		<div
			ref={divRef}
			onPointerEnter={handlePointerEnter}
			onPointerMove={handlePointerMove}
			onPointerLeave={handlePointerLeave}
			className={`group relative flex flex-col ${className}`}
		>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
			>
				{/* 2D Specular Ice Glare Spotlight */}
				<div
					className="spotlight-glare absolute -inset-px opacity-0 transition-opacity duration-200 group-hover:opacity-100"
					style={
						{
							background: `radial-gradient(280px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${spotlightColor}, transparent 80%)`,
							zIndex: 10,
						} as CSSProperties
					}
				/>
			</div>
			{children}
		</div>
	);
}
