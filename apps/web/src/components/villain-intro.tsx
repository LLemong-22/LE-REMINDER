"use client";

import { motion } from "motion/react";
import { useEffect } from "react";
import { cryoSound } from "@/lib/cryo-sound";

interface VillainIntroProps {
	onComplete: () => void;
}

/** Total choreography length (ms). Component unmounts right after → 0 idle cost. */
const DURATION_MS = 1350;
const D = DURATION_MS / 1000;
const SLASH_EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Jagged wide-winged "V" rift silhouette (1000×1000 viewBox).
 * Outer edge: top-left wing → bottom apex → top-right wing; inner edge returns via notch.
 */
export const RIFT_PATH =
	"M20 70 L95 150 L80 190 L150 250 L140 300 L215 360 L205 410 L290 480 L280 520 L360 590 L350 640 L420 700 L415 760 L470 820 L465 880 L505 945 L540 875 L535 820 L590 760 L585 700 L655 640 L645 590 L725 520 L715 480 L800 410 L790 360 L865 300 L855 250 L925 190 L910 150 L985 70 L900 135 L870 200 L820 225 L790 290 L730 330 L700 400 L640 440 L610 520 L560 560 L515 665 L470 560 L420 520 L390 440 L330 400 L300 330 L240 290 L210 225 L160 200 L110 135 Z";

// Background claw/blade marks (matching dark scratches of the reference)
const SLASHES = [
	{ x1: 200, y1: 215, x2: 470, y2: 140, w: 5, delay: 0 },
	{ x1: 360, y1: 230, x2: 720, y2: 60, w: 4, delay: 0.03 },
	{ x1: 650, y1: 165, x2: 810, y2: 230, w: 4, delay: 0.06 },
	{ x1: 510, y1: 430, x2: 790, y2: 315, w: 5, delay: 0.09 },
	{ x1: 260, y1: 660, x2: 345, y2: 1000, w: 6, delay: 0.05 },
	{ x1: 10, y1: 820, x2: 350, y2: 705, w: 4, delay: 0.11 },
	{ x1: 670, y1: 710, x2: 1000, y2: 970, w: 4, delay: 0.13 },
];

const T = (s: number) => s / D; // seconds → keyframe fraction

export function VillainIntro({ onComplete }: VillainIntroProps) {
	useEffect(() => {
		cryoSound.playReactorPulse();
		const timer = setTimeout(onComplete, DURATION_MS);
		return () => clearTimeout(timer);
	}, [onComplete]);

	return (
		<motion.div
			key="plasma-rift-v-overlay"
			initial={{ opacity: 1, scale: 1 }}
			animate={{ opacity: [1, 1, 1, 0], scale: [1, 1, 1, 1.12] }}
			transition={{
				duration: D,
				times: [0, T(0.65), T(1.0), 1],
				ease: "easeOut",
			}}
			className="fixed inset-0 z-[99999] overflow-hidden bg-[#050811]"
			style={{ willChange: "transform, opacity" }}
			role="presentation"
			aria-hidden="true"
		>
			{/* Procedural brushed-steel backdrop (works before image preload) */}
			<div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(97deg,rgba(148,163,184,0.05)_0px,rgba(148,163,184,0.05)_1px,transparent_1px,transparent_4px),radial-gradient(ellipse_at_50%_45%,#1E293B_0%,#0B1324_55%,#050811_100%)]" />

			<svg
				viewBox="0 0 1000 1000"
				preserveAspectRatio="xMidYMid meet"
				className="pointer-events-none absolute inset-0 size-full"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<title>Plasma-Rift V</title>
				<defs>
					<filter id="plasma-arc" x="-20%" y="-20%" width="140%" height="140%">
						<feTurbulence
							type="fractalNoise"
							baseFrequency="0.04"
							numOctaves="3"
							seed="3"
							result="noise"
						>
							<animate
								attributeName="baseFrequency"
								values="0.04;0.055;0.035;0.04"
								dur="0.24s"
								repeatCount="indefinite"
							/>
						</feTurbulence>
						<feDisplacementMap
							in="SourceGraphic"
							in2="noise"
							scale="22"
							xChannelSelector="R"
							yChannelSelector="G"
							result="arc"
						/>
						<feGaussianBlur in="arc" stdDeviation="6" result="glow" />
						<feFlood floodColor="#38BDF8" />
						<feComposite in2="glow" operator="in" result="blueGlow" />
						<feMerge>
							<feMergeNode in="blueGlow" />
							<feMergeNode in="blueGlow" />
							<feMergeNode in="arc" />
						</feMerge>
					</filter>

					<radialGradient id="rift-nebula" cx="50%" cy="45%" r="60%">
						<stop offset="0%" stopColor="#DB2777" />
						<stop offset="30%" stopColor="#9333EA" />
						<stop offset="60%" stopColor="#7E22CE" />
						<stop offset="85%" stopColor="#2563EB" />
						<stop offset="100%" stopColor="#1E3A8A" />
					</radialGradient>
					<linearGradient id="rift-edge" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stopColor="#FFFFFF" />
						<stop offset="55%" stopColor="#38BDF8" />
						<stop offset="100%" stopColor="#FFFFFF" />
					</linearGradient>

					<clipPath id="rift-shape">
						<path d={RIFT_PATH} />
					</clipPath>
					{/* Progressive top→apex tear reveal */}
					<clipPath id="rift-tear">
						<motion.rect
							x="0"
							y="0"
							width="1000"
							initial={{ height: 0 }}
							animate={{ height: [0, 0, 1000] }}
							transition={{
								duration: 0.65,
								times: [0, T(0.2) / T(0.65), 1],
								ease: SLASH_EASE,
							}}
						/>
					</clipPath>
				</defs>

				{/* Stage 1: claw slashes */}
				{SLASHES.map((s) => (
					<g key={`${s.x1}-${s.y1}`}>
						<motion.line
							x1={s.x1}
							y1={s.y1}
							x2={s.x2}
							y2={s.y2}
							stroke="#CBD5E1"
							strokeOpacity="0.35"
							strokeWidth={s.w + 2}
							strokeLinecap="round"
							initial={{ pathLength: 0 }}
							animate={{ pathLength: 1 }}
							transition={{ delay: s.delay, duration: 0.14, ease: SLASH_EASE }}
						/>
						<motion.line
							x1={s.x1}
							y1={s.y1}
							x2={s.x2}
							y2={s.y2}
							stroke="#020409"
							strokeWidth={s.w}
							strokeLinecap="round"
							initial={{ pathLength: 0 }}
							animate={{ pathLength: 1 }}
							transition={{ delay: s.delay, duration: 0.14, ease: SLASH_EASE }}
						/>
					</g>
				))}

				{/* Stage 2–3: rift body (nebula + crest texture), screen-blended */}
				<g clipPath="url(#rift-tear)" style={{ mixBlendMode: "screen" }}>
					<g clipPath="url(#rift-shape)">
						<motion.rect
							x="0"
							y="0"
							width="1000"
							height="1000"
							fill="url(#rift-nebula)"
							animate={{ opacity: [0.85, 0.85, 1, 0.8, 1] }}
							transition={{
								duration: D,
								times: [0, T(0.65), T(0.8), T(0.9), 1],
							}}
						/>
						<image
							href="/v-crest.jpg"
							x="0"
							y="0"
							width="1000"
							height="1000"
							preserveAspectRatio="xMidYMid slice"
							opacity="0.75"
						/>
					</g>
				</g>

				{/* Stage 2: crackling lightning perimeter */}
				<g style={{ filter: "drop-shadow(0 0 18px #38BDF8)" }}>
					<g filter="url(#plasma-arc)">
						<motion.path
							d={RIFT_PATH}
							stroke="url(#rift-edge)"
							strokeWidth="7"
							strokeLinejoin="round"
							initial={{ pathLength: 0, opacity: 0 }}
							animate={{
								pathLength: [0, 0, 1, 1],
								opacity: [0, 1, 1, 1],
								strokeWidth: [7, 7, 7, 14],
							}}
							transition={{
								duration: D,
								times: [0, T(0.2), T(0.65), T(1.05)],
								ease: SLASH_EASE,
							}}
						/>
					</g>
				</g>

				{/* Stage 3: apex ignition flare */}
				<motion.circle
					cx="505"
					cy="930"
					fill="#E0F2FE"
					style={{ mixBlendMode: "screen", filter: "blur(18px)" }}
					initial={{ r: 0, opacity: 0 }}
					animate={{ r: [0, 0, 120, 60], opacity: [0, 0, 1, 0] }}
					transition={{
						duration: D,
						times: [0, T(0.6), T(0.75), T(1.1)],
						ease: "easeOut",
					}}
				/>
			</svg>

			{/* Stage 4: edge flash */}
			<motion.div
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,rgba(224,242,254,0.55),transparent_65%)]"
				style={{ mixBlendMode: "screen" }}
				initial={{ opacity: 0 }}
				animate={{ opacity: [0, 0, 0.9, 0] }}
				transition={{ duration: D, times: [0, T(1.0), T(1.08), 1] }}
			/>
		</motion.div>
	);
}
