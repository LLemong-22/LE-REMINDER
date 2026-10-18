"use client";

import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { useRef } from "react";
import { cryoSound } from "@/lib/cryo-sound";

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
	const rafRef = useRef<number | null>(null);

	function handleMouseEnter() {
		cryoSound.playTick();
		const el = divRef.current;
		if (el) {
			el.style.setProperty("--card-scale", "1.015");
		}
	}

	function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
		const el = divRef.current;
		if (!el) return;
		const rect = el.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		if (rafRef.current !== null) {
			cancelAnimationFrame(rafRef.current);
		}
		rafRef.current = requestAnimationFrame(() => {
			if (!el) return;
			el.style.setProperty("--mouse-x", `${x}px`);
			el.style.setProperty("--mouse-y", `${y}px`);

			// 3D Magnetic Perspective Tilt (capped at ±3.5deg)
			const centerX = rect.width / 2;
			const centerY = rect.height / 2;
			const dx = (x - centerX) / (rect.width / 2);
			const dy = (y - centerY) / (rect.height / 2);
			const maxTilt = 3.5;
			const rx = Math.max(-maxTilt, Math.min(maxTilt, -dy * maxTilt));
			const ry = Math.max(-maxTilt, Math.min(maxTilt, dx * maxTilt));

			el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
			el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
		});
	}

	function handleMouseLeave() {
		if (rafRef.current !== null) {
			cancelAnimationFrame(rafRef.current);
			rafRef.current = null;
		}
		const el = divRef.current;
		if (el) {
			el.style.setProperty("--rx", "0deg");
			el.style.setProperty("--ry", "0deg");
			el.style.setProperty("--card-scale", "1");
		}
	}

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: decorative mouse-tracked 3D tilt & glow; children stay independently interactive
		<div
			ref={divRef}
			onMouseEnter={handleMouseEnter}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			className={`group relative flex flex-col transition-transform duration-200 ease-out ${className}`}
			style={
				{
					perspective: "1000px",
					transform:
						"perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) scale3d(var(--card-scale, 1), var(--card-scale, 1), var(--card-scale, 1))",
					transformStyle: "preserve-3d",
					willChange: "transform",
				} as CSSProperties
			}
		>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
			>
				{/* Specular Ice Glare Spotlight */}
				<div
					className="absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
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
