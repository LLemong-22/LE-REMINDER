"use client";

import { cn } from "@LE-REMINDER/ui/lib/utils";
import { useRef, useState } from "react";
import { cryoSound } from "@/lib/cryo-sound";
import { triggerCyberExplosion } from "@/lib/cyber-explosion";

interface NexusAnimationProps {
	progressPct?: number;
	isOverdrive?: boolean;
	onToggleOverdrive?: () => void;
}

// Deterministic PRNG for crystalline polygon ice sparks
function mulberry32(seed: number): () => number {
	let a = seed;
	return () => {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const rand = mulberry32(20261018);
const CRYSTAL_PARTICLES = Array.from({ length: 12 }, (_, i) => ({
	x: 20 + rand() * 60,
	y: 20 + rand() * 60,
	size: 2 + rand() * 2.5,
	duration: 2.2 + rand() * 1.8,
	delay: rand() * 2.5,
	isCyan: i % 2 === 0,
}));

// Luxury chronograph degree ticks around 360 degrees
const BEZEL_TICKS = Array.from({ length: 60 }, (_, i) => {
	const deg = i * 6;
	const rad = (deg * Math.PI) / 180;
	const isMajor = i % 5 === 0;
	const r1 = isMajor ? 51 : 53.5;
	const r2 = 56;
	return {
		x1: 60 + r1 * Math.cos(rad),
		y1: 60 + r1 * Math.sin(rad),
		x2: 60 + r2 * Math.cos(rad),
		y2: 60 + r2 * Math.sin(rad),
		isMajor,
	};
});

export function NexusAnimation({
	progressPct = 0,
	isOverdrive: externalOverdrive,
	onToggleOverdrive,
}: NexusAnimationProps) {
	const [internalOverdrive, setInternalOverdrive] = useState(false);
	const buttonRef = useRef<HTMLButtonElement | null>(null);

	const isOverdrive = externalOverdrive ?? internalOverdrive;

	// Leading comet head angle calculation
	const clampedPct = Math.min(100, Math.max(0, progressPct));
	const angleRad = (clampedPct / 100) * 2 * Math.PI - Math.PI / 2;
	const cometRadius = 50;
	const cometX = 60 + cometRadius * Math.cos(angleRad);
	const cometY = 60 + cometRadius * Math.sin(angleRad);

	function handleClick() {
		cryoSound.playReactorPulse();
		if (buttonRef.current) {
			triggerCyberExplosion(buttonRef.current);
		}
		if (onToggleOverdrive) {
			onToggleOverdrive();
		} else {
			setInternalOverdrive((v) => !v);
		}
	}

	return (
		<button
			ref={buttonRef}
			type="button"
			onClick={handleClick}
			title={
				isOverdrive
					? "THE-CORE [OVERDRIVE ACTIVE] · Click to toggle"
					: "THE-CORE Cryo-Energy Reactor · Click to engage Overdrive"
			}
			className="group relative flex size-32 cursor-pointer select-none items-center justify-center border-0 bg-transparent p-0 transition-transform active:scale-95"
			style={{ perspective: "800px" }}
		>
			{/* Continuous Soft Radial Aurora Pulse behind reactor in Overdrive */}
			{isOverdrive && (
				<div
					aria-hidden="true"
					className="pointer-events-none absolute -inset-6 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.45)_0%,rgba(125,211,252,0.18)_50%,transparent_75%)]"
				/>
			)}

			{/* Drifting crystalline polygon ice sparks */}
			<div className="pointer-events-none absolute inset-0">
				{CRYSTAL_PARTICLES.map((c, idx) => (
					<div
						key={idx}
						className="nexus-star absolute rotate-45"
						style={
							{
								left: `${c.x}%`,
								top: `${c.y}%`,
								width: `${c.size}px`,
								height: `${c.size}px`,
								background: c.isCyan ? "#7DD3FC" : "#FFFFFF",
								boxShadow: c.isCyan
									? "0 0 6px 1px rgba(125,211,252,0.8)"
									: "0 0 4px 1px rgba(255,255,255,0.7)",
								"--star-duration": `${c.duration}s`,
								"--star-delay": `${c.delay}s`,
							} as React.CSSProperties
						}
					/>
				))}
			</div>

			{/* Soft Breathing Ambient Plasma Halo */}
			<div
				className="pointer-events-none absolute inset-3 rounded-full transition-all duration-500"
				style={{
					background: isOverdrive
						? "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(56,189,248,0.7) 40%, rgba(2,132,199,0.3) 70%, transparent 85%)"
						: "radial-gradient(circle, rgba(125,211,252,0.45) 0%, rgba(56,189,248,0.18) 45%, transparent 70%)",
					transform: isOverdrive ? "scale(1.25)" : "scale(1)",
					opacity: isOverdrive ? 1 : 0.6,
				}}
			/>

			{/* 3D Tilted Counter-Rotating Geometric Crystalline Rings (2.5x faster in Overdrive) */}
			<div className="pointer-events-none absolute inset-2 flex items-center justify-center [transform-style:preserve-3d]">
				{/* 3D Ring 1: Pitch X-tilted clockwise crystalline ring */}
				<div
					className={cn(
						"absolute size-24 rounded-full border border-white/20 shadow-[0_0_12px_rgba(224,242,254,0.15)]",
						isOverdrive && "border-[#FFFFFF]/80 shadow-[0_0_20px_#38BDF8]",
					)}
					style={{
						animation: `core-3d-orbit-1 ${isOverdrive ? "3.6s" : "9s"} linear infinite`,
					}}
				/>

				{/* 3D Ring 2: Yaw Y-tilted counter-clockwise ring */}
				<div
					className={cn(
						"absolute size-20 rounded-full border border-[#BAE6FD]/30 shadow-[0_0_10px_rgba(186,230,253,0.2)]",
						isOverdrive && "border-[#BAE6FD]/80 shadow-[0_0_16px_#BAE6FD]",
					)}
					style={{
						animation: `core-3d-orbit-2 ${isOverdrive ? "2.8s" : "7s"} linear infinite`,
					}}
				/>

				{/* 3D Ring 3: Diagonal 45-deg tilted inner diamond frame */}
				<div
					className={cn(
						"absolute size-16 border border-[#38BDF8]/40 shadow-[0_0_12px_rgba(56,189,248,0.3)]",
						isOverdrive && "border-[#FFFFFF]/90 shadow-[0_0_20px_#38BDF8]",
					)}
					style={{
						animation: `core-3d-orbit-3 ${isOverdrive ? "4.4s" : "11s"} linear infinite`,
					}}
				/>
			</div>

			{/* 2D High-Precision SVG Reticle Overlay */}
			<svg
				viewBox="0 0 120 120"
				className="pointer-events-none absolute inset-0 size-full"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				role="img"
				aria-label="THE-CORE Reactor"
			>
				<title>THE-CORE Reactor</title>
				<defs>
					<filter id="coreGlow" x="-50%" y="-50%" width="200%" height="200%">
						<feDropShadow
							dx="0"
							dy="0"
							stdDeviation={isOverdrive ? "8" : "4"}
							floodColor="#38BDF8"
							floodOpacity="0.95"
						/>
						<feDropShadow
							dx="0"
							dy="0"
							stdDeviation={isOverdrive ? "16" : "8"}
							floodColor={isOverdrive ? "#FFFFFF" : "#7DD3FC"}
							floodOpacity={isOverdrive ? "1" : "0.6"}
						/>
					</filter>
					<radialGradient id="plasmaOrbGrad" cx="50%" cy="50%" r="50%">
						<stop offset="0%" stopColor="#FFFFFF" />
						<stop
							offset="45%"
							stopColor={isOverdrive ? "#E0F2FE" : "#7DD3FC"}
						/>
						<stop
							offset="85%"
							stopColor={isOverdrive ? "#38BDF8" : "#0284C7"}
						/>
						<stop
							offset="100%"
							stopColor={isOverdrive ? "#0284C7" : "#082F49"}
						/>
					</radialGradient>
				</defs>

				{/* Luxury Chronograph Bezel Degree Ticks */}
				<g className="origin-center" opacity={isOverdrive ? 0.95 : 0.75}>
					<circle
						cx="60"
						cy="60"
						r="56"
						stroke="rgba(224, 242, 254, 0.28)"
						strokeWidth="1"
						fill="none"
					/>
					<circle
						cx="60"
						cy="60"
						r="50.5"
						stroke="rgba(224, 242, 254, 0.16)"
						strokeWidth="0.75"
						fill="none"
					/>
					{BEZEL_TICKS.map((t, idx) => (
						<line
							key={idx}
							x1={t.x1}
							y1={t.y1}
							x2={t.x2}
							y2={t.y2}
							stroke={
								t.isMajor
									? isOverdrive
										? "#E0F2FE"
										: "rgba(224, 242, 254, 0.45)"
									: "rgba(224, 242, 254, 0.2)"
							}
							strokeWidth={t.isMajor ? "1" : "0.5"}
						/>
					))}
				</g>

				{/* Hexagonal Inner Reticle Vertex Ring (2.5x faster in Overdrive) */}
				<g
					className="origin-center motion-reduce:animate-none"
					style={{
						animation: `reticle-spin ${isOverdrive ? "6.4s" : "16s"} linear infinite`,
					}}
				>
					<polygon
						points="60,34 82.5,47 82.5,73 60,86 37.5,73 37.5,47"
						stroke={isOverdrive ? "#FFFFFF" : "#BAE6FD"}
						strokeWidth={isOverdrive ? "1.2" : "1"}
						strokeOpacity="0.85"
						filter="url(#coreGlow)"
					/>
					<circle cx="60" cy="34" r="1.5" fill="#FFFFFF" />
					<circle
						cx="82.5"
						cy="47"
						r="1.5"
						fill={isOverdrive ? "#FFFFFF" : "#BAE6FD"}
					/>
					<circle
						cx="82.5"
						cy="73"
						r="1.5"
						fill={isOverdrive ? "#FFFFFF" : "#BAE6FD"}
					/>
					<circle cx="60" cy="86" r="1.5" fill="#FFFFFF" />
					<circle
						cx="37.5"
						cy="73"
						r="1.5"
						fill={isOverdrive ? "#FFFFFF" : "#BAE6FD"}
					/>
					<circle
						cx="37.5"
						cy="47"
						r="1.5"
						fill={isOverdrive ? "#FFFFFF" : "#BAE6FD"}
					/>
				</g>

				{/* Counter-rotating Micro Diamond Core */}
				<g
					className="origin-center motion-reduce:animate-none"
					style={{
						animation: `reticle-spin-reverse ${isOverdrive ? "3.6s" : "9s"} linear infinite`,
					}}
				>
					<polygon
						points="60,45 75,60 60,75 45,60"
						stroke={isOverdrive ? "#FFFFFF" : "#38BDF8"}
						strokeWidth={isOverdrive ? "1.2" : "1"}
						strokeOpacity="0.9"
					/>
				</g>

				{/* Glowing Leading Ice Comet Head on the Progress Perimeter */}
				{clampedPct > 0 && (
					<g filter="url(#coreGlow)">
						<circle
							cx={cometX}
							cy={cometY}
							r={isOverdrive ? "4.5" : "3.2"}
							fill="#FFFFFF"
							className="animate-pulse"
						/>
						<circle
							cx={cometX}
							cy={cometY}
							r={isOverdrive ? "8.5" : "6"}
							fill="#38BDF8"
							opacity={isOverdrive ? "0.8" : "0.4"}
						/>
					</g>
				)}

				{/* Breathing Center Plasma Orb */}
				<circle
					cx="60"
					cy="60"
					r={isOverdrive ? "10" : "7"}
					fill="url(#plasmaOrbGrad)"
					filter="url(#coreGlow)"
					className="transition-all duration-300"
				/>
				<circle
					cx="60"
					cy="60"
					r={isOverdrive ? "4.5" : "2.8"}
					fill="#FFFFFF"
				/>
			</svg>

			{/* Clean Authoritative THE-CORE Centered Readout Below */}
			<div className="pointer-events-none absolute -bottom-3 flex items-center justify-center">
				<span
					className={cn(
						"whitespace-nowrap font-bold font-mono transition-all duration-300",
						isOverdrive
							? "text-[#E0F2FE] text-[9.5px] tracking-[0.25em] drop-shadow-[0_0_12px_#38BDF8]"
							: "text-[#BAE6FD] text-[11px] tracking-[0.3em] drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]",
					)}
				>
					{isOverdrive ? "THE-CORE // OVERDRIVE" : "THE-CORE"}
				</span>
			</div>
		</button>
	);
}
