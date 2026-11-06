"use client";

import { motion } from "motion/react";
import { useEffect } from "react";
import { cryoSound } from "@/lib/cryo-sound";

interface VillainIntroProps {
	onComplete: () => void;
}

/** Total lifecycle (ms). Component unmounts right after → 0 idle cost. */
const DURATION_MS = 1250;
const D = DURATION_MS / 1000;
const EASE = [0.22, 1, 0.36, 1] as const;
// 0.0–0.45s slice · 0.45–0.90s hold · 0.90–1.25s exit
const TIMES = [0, 0.45 / D, 0.9 / D, 1];

const BLADE_GLOW = { filter: "drop-shadow(0 0 16px #38BDF8)" };

interface BladeProps {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	stroke: string;
	width: number;
	delay: number;
}

function Blade({ x1, y1, x2, y2, stroke, width, delay }: BladeProps) {
	return (
		<motion.line
			x1={x1}
			y1={y1}
			x2={x2}
			y2={y2}
			stroke={stroke}
			strokeWidth={width}
			strokeLinecap="butt"
			vectorEffect="non-scaling-stroke"
			initial={{ pathLength: 0, opacity: 0 }}
			animate={{ pathLength: [0, 1, 1, 1], opacity: [0, 1, 1, 0] }}
			transition={{ duration: D - delay, times: TIMES, ease: EASE, delay }}
		/>
	);
}

export function VillainIntro({ onComplete }: VillainIntroProps) {
	useEffect(() => {
		cryoSound.playReactorPulse();
		const timer = setTimeout(onComplete, DURATION_MS);
		return () => clearTimeout(timer);
	}, [onComplete]);

	return (
		<motion.div
			key="double-chevron-v-overlay"
			initial={{ opacity: 1, scale: 1 }}
			animate={{ opacity: [1, 1, 1, 0], scale: [1, 1, 1, 1.04] }}
			transition={{ duration: D, times: TIMES, ease: EASE }}
			className="fixed inset-0 z-[99999] overflow-hidden bg-[#07111D]"
			style={{ willChange: "transform, opacity" }}
			role="presentation"
			aria-hidden="true"
		>
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(56,189,248,0.14),rgba(7,17,29,0.98)_72%)]" />

			<svg
				viewBox="0 0 100 100"
				preserveAspectRatio="none"
				className="pointer-events-none absolute inset-0 size-full"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<title>Double-Chevron V Crest</title>
				<defs>
					{/* Icy shimmer that sweeps along the blades during the hold */}
					<linearGradient id="vShimmer" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
						<stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.9" />
						<stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
					</linearGradient>
					<clipPath id="vShimmerBand">
						<motion.rect
							x="0"
							width="100"
							height="18"
							initial={{ y: -20 }}
							animate={{ y: [-20, -20, 80, 80] }}
							transition={{ duration: D, times: TIMES, ease: "easeInOut" }}
						/>
					</clipPath>
				</defs>

				<g style={BLADE_GLOW}>
					{/* Outer V blades → apex (50, 74) */}
					<Blade
						x1={22}
						y1={0}
						x2={50}
						y2={74}
						stroke="#E0F2FE"
						width={3}
						delay={0}
					/>
					<Blade
						x1={78}
						y1={0}
						x2={50}
						y2={74}
						stroke="#E0F2FE"
						width={3}
						delay={0}
					/>
					{/* Inner nested chevron, 80ms later → apex (50, 60) */}
					<Blade
						x1={30}
						y1={14}
						x2={50}
						y2={60}
						stroke="#BAE6FD"
						width={1.5}
						delay={0.08}
					/>
					<Blade
						x1={70}
						y1={14}
						x2={50}
						y2={60}
						stroke="#BAE6FD"
						width={1.5}
						delay={0.08}
					/>
				</g>

				{/* Shimmer overlay (only visible inside the moving band) */}
				<g
					clipPath="url(#vShimmerBand)"
					stroke="url(#vShimmer)"
					vectorEffect="non-scaling-stroke"
				>
					<polyline
						points="22,0 50,74 78,0"
						strokeWidth={3}
						vectorEffect="non-scaling-stroke"
					/>
					<polyline
						points="30,14 50,60 70,14"
						strokeWidth={1.5}
						vectorEffect="non-scaling-stroke"
					/>
				</g>
			</svg>
		</motion.div>
	);
}
