"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cryoSound } from "@/lib/cryo-sound";
import { triggerCyberExplosion } from "@/lib/cyber-explosion";

interface NexusAnimationProps {
	progressPct?: number;
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

export function NexusAnimation({ progressPct = 0 }: NexusAnimationProps) {
	const [isOverdrive, setIsOverdrive] = useState(false);
	const overdriveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const buttonRef = useRef<HTMLButtonElement | null>(null);

	// Leading comet head angle calculation
	const clampedPct = Math.min(100, Math.max(0, progressPct));
	const angleRad = (clampedPct / 100) * 2 * Math.PI - Math.PI / 2;
	const cometRadius = 50;
	const cometX = 60 + cometRadius * Math.cos(angleRad);
	const cometY = 60 + cometRadius * Math.sin(angleRad);

	const triggerOverdrive = useCallback((shootExplosion = false) => {
		setIsOverdrive(true);
		cryoSound.playReactorPulse();

		if (shootExplosion && buttonRef.current) {
			triggerCyberExplosion(buttonRef.current);
		}

		if (overdriveTimeoutRef.current) {
			clearTimeout(overdriveTimeoutRef.current);
		}
		overdriveTimeoutRef.current = setTimeout(() => {
			setIsOverdrive(false);
		}, 1000);
	}, []);

	// Listen for global task completion event to trigger overdrive
	useEffect(() => {
		function handleGlobalOverdrive() {
			triggerOverdrive(true);
		}
		window.addEventListener("core-overdrive", handleGlobalOverdrive);
		return () => {
			window.removeEventListener("core-overdrive", handleGlobalOverdrive);
			if (overdriveTimeoutRef.current) {
				clearTimeout(overdriveTimeoutRef.current);
			}
		};
	}, [triggerOverdrive]);

	return (
		<button
			ref={buttonRef}
			type="button"
			onClick={() => triggerOverdrive(true)}
			onMouseEnter={() => triggerOverdrive(false)}
			title="THE-CORE Cryo-Energy Reactor · Click to discharge"
			className="group relative flex size-32 cursor-pointer select-none items-center justify-center border-0 bg-transparent p-0 transition-transform active:scale-95"
			style={{ perspective: "800px" }}
		>
			{/* Live Micro-Telemetry Badges floating around THE-CORE */}
			<div className="pointer-events-none absolute -top-3.5 -left-4 z-20 flex items-center gap-1 rounded border border-[#7DD3FC]/35 bg-[#071322]/90 px-1.5 py-0.5 font-mono text-[#7DD3FC] text-[8.5px] shadow-[0_0_10px_rgba(56,189,248,0.25)]">
				<span className="size-1 animate-pulse rounded-full bg-[#38BDF8]" />
				<span>SYNC 100%</span>
			</div>

			<div className="pointer-events-none absolute -top-3.5 -right-6 z-20 flex items-center gap-1 rounded border border-emerald-500/35 bg-[#071322]/90 px-1.5 py-0.5 font-mono text-[8.5px] text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.2)]">
				<span className="size-1 animate-ping rounded-full bg-emerald-400" />
				<span>CRYO-STABLE</span>
			</div>

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

			{/* Soft Breathing Ambient Plasma Halo (flares intensely in Overdrive) */}
			<div
				className="pointer-events-none absolute inset-3 rounded-full transition-all duration-300"
				style={{
					background: isOverdrive
						? "radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(56,189,248,0.65) 40%, rgba(2,132,199,0.3) 70%, transparent 85%)"
						: "radial-gradient(circle, rgba(125,211,252,0.45) 0%, rgba(56,189,248,0.18) 45%, transparent 70%)",
					transform: isOverdrive ? "scale(1.28)" : "scale(1)",
					opacity: isOverdrive ? 1 : 0.6,
				}}
			/>

			{/* 3D Tilted Counter-Rotating Geometric Crystalline Rings (4x faster in Overdrive) */}
			<div className="pointer-events-none absolute inset-2 flex items-center justify-center [transform-style:preserve-3d]">
				{/* 3D Ring 1: Pitch X-tilted clockwise crystalline ring */}
				<div
					className="absolute size-24 rounded-full border border-[#7DD3FC]/50 shadow-[0_0_12px_rgba(125,211,252,0.4)]"
					style={{
						borderStyle: "dashed",
						animation: `core-3d-orbit-1 ${isOverdrive ? "2.25s" : "9s"} linear infinite`,
					}}
				/>

				{/* 3D Ring 2: Yaw Y-tilted counter-clockwise ring */}
				<div
					className="absolute size-20 rounded-full border border-[#BAE6FD]/60 shadow-[0_0_10px_rgba(186,230,253,0.35)]"
					style={{
						borderStyle: "dotted",
						animation: `core-3d-orbit-2 ${isOverdrive ? "1.75s" : "7s"} linear infinite`,
					}}
				/>

				{/* 3D Ring 3: Diagonal 45-deg tilted inner diamond frame */}
				<div
					className="absolute size-16 border border-[#38BDF8]/75 shadow-[0_0_14px_rgba(56,189,248,0.5)]"
					style={{
						animation: `core-3d-orbit-3 ${isOverdrive ? "2.75s" : "11s"} linear infinite`,
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
						<stop offset="0%" stopColor={isOverdrive ? "#FFFFFF" : "#FFFFFF"} />
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

				{/* Hexagonal Inner Reticle Vertex Ring (4x faster in Overdrive) */}
				<g
					className="origin-center motion-reduce:animate-none"
					style={{
						animation: `reticle-spin ${isOverdrive ? "4s" : "16s"} linear infinite`,
					}}
				>
					<polygon
						points="60,34 82.5,47 82.5,73 60,86 37.5,73 37.5,47"
						stroke="#BAE6FD"
						strokeWidth="1.2"
						strokeOpacity="0.65"
						filter="url(#coreGlow)"
					/>
					<circle cx="60" cy="34" r="1.8" fill="#FFFFFF" />
					<circle cx="82.5" cy="47" r="1.8" fill="#7DD3FC" />
					<circle cx="82.5" cy="73" r="1.8" fill="#7DD3FC" />
					<circle cx="60" cy="86" r="1.8" fill="#FFFFFF" />
					<circle cx="37.5" cy="73" r="1.8" fill="#7DD3FC" />
					<circle cx="37.5" cy="47" r="1.8" fill="#7DD3FC" />
				</g>

				{/* Counter-rotating Micro Diamond Core */}
				<g
					className="origin-center motion-reduce:animate-none"
					style={{
						animation: `reticle-spin-reverse ${isOverdrive ? "2.25s" : "9s"} linear infinite`,
					}}
				>
					<polygon
						points="60,45 75,60 60,75 45,60"
						stroke={isOverdrive ? "#FFFFFF" : "#38BDF8"}
						strokeWidth={isOverdrive ? "1.8" : "1.2"}
						strokeOpacity="0.85"
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
							r={isOverdrive ? "9" : "6"}
							fill="#38BDF8"
							opacity={isOverdrive ? "0.8" : "0.4"}
						/>
					</g>
				)}

				{/* Breathing Center Plasma Orb (Flares bright snow-white in Overdrive) */}
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

			{/* Telemetry Readout & Live Waveform Below */}
			<div className="pointer-events-none absolute -bottom-3 flex flex-col items-center gap-0.5">
				<div className="flex items-center gap-1 font-bold font-mono text-[#7DD3FC] text-[9.5px] tracking-[0.2em] drop-shadow-[0_0_6px_rgba(56,189,248,0.7)]">
					<span>THE-CORE</span>
					<span className="text-[#BAE6FD]">·</span>
					<span>{progressPct}%</span>
				</div>
				{/* Live animated SVG pulse waveform line */}
				<svg
					viewBox="0 0 48 8"
					className="h-1.5 w-12 text-[#38BDF8] opacity-85"
					fill="none"
					aria-hidden="true"
				>
					<path
						d="M0 4 H14 L17 1 L21 7 L24 2 L27 6 L30 4 H48"
						stroke="currentColor"
						strokeWidth="1.2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="animate-waveform"
					/>
				</svg>
			</div>

			{/* Overdrive Status Pill */}
			{isOverdrive && (
				<div className="pointer-events-none absolute -bottom-7 rounded-full border border-[#38BDF8] bg-[#38BDF8]/25 px-2 py-0.5 font-bold font-mono text-[#E0F2FE] text-[7.5px] tracking-widest shadow-[0_0_12px_rgba(56,189,248,0.8)]">
					OVERDRIVE
				</div>
			)}
		</button>
	);
}
