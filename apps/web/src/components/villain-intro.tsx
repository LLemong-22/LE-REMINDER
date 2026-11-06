"use client";

import { motion } from "motion/react";
import { useEffect } from "react";
import { cryoSound } from "@/lib/cryo-sound";

interface VillainIntroProps {
	onComplete: () => void;
}

// Deterministic micro-frost motes that drift subtly along the V-crests during the hold
const FROST_MOTES = [
	{ x: 300, y: 280, r: 1.8, delay: 0.45 },
	{ x: 380, y: 460, r: 2.2, delay: 0.5 },
	{ x: 450, y: 640, r: 1.5, delay: 0.48 },
	{ x: 700, y: 280, r: 1.8, delay: 0.46 },
	{ x: 620, y: 460, r: 2.2, delay: 0.52 },
	{ x: 550, y: 640, r: 1.5, delay: 0.49 },
	{ x: 360, y: 310, r: 1.4, delay: 0.55 },
	{ x: 640, y: 310, r: 1.4, delay: 0.54 },
];

export function VillainIntro({ onComplete }: VillainIntroProps) {
	// Exact 1.25s (1250ms) cinematic villain crest lifecycle
	useEffect(() => {
		cryoSound.playReactorPulse();
		const timer = setTimeout(() => {
			onComplete();
		}, 1250);

		return () => clearTimeout(timer);
	}, [onComplete]);

	return (
		<motion.div
			key="pure-v-crest-overlay"
			initial={{ opacity: 1, scale: 1 }}
			animate={{
				opacity: [1, 1, 1, 0],
				scale: [1, 1, 1.01, 1.04],
			}}
			transition={{
				duration: 1.25,
				times: [0, 0.36, 0.72, 1],
				ease: [0.22, 1, 0.36, 1],
			}}
			className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-[#07111D]"
			style={{ willChange: "transform, opacity" }}
			role="presentation"
			aria-hidden="true"
		>
			{/* Deep, Menacing Arctic Gradient Backdrop */}
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(56,189,248,0.18),rgba(7,17,29,0.98)_75%)]" />

			{/* Soft Breathing Cryo-Cyan Core Ambience (Villain Hold 0.45s – 0.90s) */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{
					opacity: [0, 0.85, 0.95, 0],
					scale: [0.95, 1, 1.05, 1.1],
				}}
				transition={{
					duration: 1.25,
					times: [0, 0.36, 0.72, 1],
					ease: [0.22, 1, 0.36, 1],
				}}
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_52%,rgba(56,189,248,0.35),rgba(186,230,253,0.08)_45%,transparent_70%)]"
			/>

			{/* Pure Double-Layer "V" Crest SVG Viewport (No Explosions, No Diamond Rings) */}
			<svg
				viewBox="0 0 1000 1000"
				className="pointer-events-none absolute inset-0 size-full"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<title>Pure Cryo V Crest</title>
				<defs>
					<filter id="vCrestGlow" x="-40%" y="-40%" width="180%" height="180%">
						<feDropShadow
							dx="0"
							dy="0"
							stdDeviation="5"
							floodColor="#38BDF8"
							floodOpacity="0.9"
						/>
						<feDropShadow
							dx="0"
							dy="0"
							stdDeviation="14"
							floodColor="#BAE6FD"
							floodOpacity="0.65"
						/>
					</filter>
					<linearGradient id="vBladeLeft" x1="18%" y1="0%" x2="50%" y2="76%">
						<stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.1" />
						<stop offset="45%" stopColor="#BAE6FD" />
						<stop offset="100%" stopColor="#FFFFFF" />
					</linearGradient>
					<linearGradient id="vBladeRight" x1="82%" y1="0%" x2="50%" y2="76%">
						<stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.1" />
						<stop offset="45%" stopColor="#BAE6FD" />
						<stop offset="100%" stopColor="#FFFFFF" />
					</linearGradient>
					<linearGradient
						id="innerChevronBlade"
						x1="50%"
						y1="62%"
						x2="50%"
						y2="12%"
					>
						<stop offset="0%" stopColor="#FFFFFF" />
						<stop offset="60%" stopColor="#E0F2FE" />
						<stop offset="100%" stopColor="#38BDF8" stopOpacity="0.3" />
					</linearGradient>
				</defs>

				{/* 1. Outer Left Wing Beam: (180, 0) strictly terminating at sharp Apex (500, 760) */}
				<motion.line
					x1="180"
					y1="0"
					x2="500"
					y2="760"
					stroke="url(#vBladeLeft)"
					strokeWidth="4.5"
					strokeLinecap="round"
					filter="url(#vCrestGlow)"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{
						pathLength: [0, 1, 1, 1],
						opacity: [0, 1, 1, 0],
					}}
					transition={{
						duration: 1.25,
						times: [0, 0.36, 0.72, 1],
						ease: [0.22, 1, 0.36, 1],
					}}
				/>

				{/* 2. Outer Right Wing Beam: (820, 0) strictly terminating at sharp Apex (500, 760) */}
				<motion.line
					x1="820"
					y1="0"
					x2="500"
					y2="760"
					stroke="url(#vBladeRight)"
					strokeWidth="4.5"
					strokeLinecap="round"
					filter="url(#vCrestGlow)"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{
						pathLength: [0, 1, 1, 1],
						opacity: [0, 1, 1, 0],
					}}
					transition={{
						duration: 1.25,
						times: [0, 0.36, 0.72, 1],
						ease: [0.22, 1, 0.36, 1],
					}}
				/>

				{/* 3. Nested Inner Double-Chevron Echo: (26%, 12%) -> (50%, 62%) -> (74%, 12%) */}
				<motion.polyline
					points="260,120 500,620 740,120"
					stroke="url(#innerChevronBlade)"
					strokeWidth="2.8"
					strokeLinecap="round"
					strokeLinejoin="round"
					filter="url(#vCrestGlow)"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{
						pathLength: [0, 1, 1, 1],
						opacity: [0, 1, 1, 0],
					}}
					transition={{
						duration: 1.25,
						times: [0, 0.36, 0.72, 1],
						ease: [0.22, 1, 0.36, 1],
					}}
				/>

				{/* 4. Subtle Micro-Frost Motes Drifting along the Blades during Villain Hold (0.45s – 0.90s) */}
				{FROST_MOTES.map((mote, i) => (
					<motion.circle
						key={i}
						cx={mote.x}
						cy={mote.y}
						r={mote.r}
						fill="#E0F2FE"
						filter="url(#vCrestGlow)"
						initial={{ opacity: 0, y: 0 }}
						animate={{
							opacity: [0, 0.9, 0.9, 0],
							y: [0, -18, -32, -45],
							scale: [0.8, 1.2, 1, 0.6],
						}}
						transition={{
							delay: mote.delay,
							duration: 0.65,
							times: [0, 0.2, 0.75, 1],
							ease: "easeOut",
						}}
					/>
				))}
			</svg>
		</motion.div>
	);
}
