"use client";

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
	// Leading comet head angle calculation
	const clampedPct = Math.min(100, Math.max(0, progressPct));
	const angleRad = (clampedPct / 100) * 2 * Math.PI - Math.PI / 2;
	const cometRadius = 50;
	const cometX = 60 + cometRadius * Math.cos(angleRad);
	const cometY = 60 + cometRadius * Math.sin(angleRad);

	return (
		<button
			type="button"
			onClick={(e) => triggerCyberExplosion(e.currentTarget)}
			title="THE-CORE Cryo-Energy Reactor · Click to discharge"
			className="group relative flex size-32 cursor-pointer select-none items-center justify-center border-0 bg-transparent p-0 transition-transform active:scale-95"
			style={{ perspective: "800px" }}
		>
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
				className="pointer-events-none absolute inset-3 animate-[plasma-breathe_3s_ease-in-out_infinite] rounded-full opacity-60"
				style={{
					background:
						"radial-gradient(circle, rgba(125,211,252,0.45) 0%, rgba(56,189,248,0.18) 45%, transparent 70%)",
				}}
			/>

			{/* 3D Tilted Counter-Rotating Geometric Crystalline Rings */}
			<div className="pointer-events-none absolute inset-2 flex items-center justify-center [transform-style:preserve-3d]">
				{/* 3D Ring 1: Pitch X-tilted clockwise crystalline ring */}
				<div
					className="absolute size-24 animate-[core-3d-orbit-1_9s_linear_infinite] rounded-full border border-[#7DD3FC]/50 shadow-[0_0_12px_rgba(125,211,252,0.4)]"
					style={{
						borderStyle: "dashed",
					}}
				/>

				{/* 3D Ring 2: Yaw Y-tilted counter-clockwise ring */}
				<div
					className="absolute size-20 animate-[core-3d-orbit-2_7s_linear_infinite] rounded-full border border-[#BAE6FD]/60 shadow-[0_0_10px_rgba(186,230,253,0.35)]"
					style={{
						borderStyle: "dotted",
					}}
				/>

				{/* 3D Ring 3: Diagonal 45-deg tilted inner diamond frame */}
				<div className="absolute size-16 animate-[core-3d-orbit-3_11s_linear_infinite] border border-[#38BDF8]/75 shadow-[0_0_14px_rgba(56,189,248,0.5)]" />
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
					<filter id="coreGlow" x="-30%" y="-30%" width="160%" height="160%">
						<feDropShadow
							dx="0"
							dy="0"
							stdDeviation="4"
							floodColor="#38BDF8"
							floodOpacity="0.85"
						/>
						<feDropShadow
							dx="0"
							dy="0"
							stdDeviation="8"
							floodColor="#7DD3FC"
							floodOpacity="0.6"
						/>
					</filter>
					<radialGradient id="plasmaOrbGrad" cx="50%" cy="50%" r="50%">
						<stop offset="0%" stopColor="#FFFFFF" />
						<stop offset="45%" stopColor="#7DD3FC" />
						<stop offset="85%" stopColor="#0284C7" />
						<stop offset="100%" stopColor="#082F49" />
					</radialGradient>
				</defs>

				{/* Hexagonal Inner Reticle Vertex Ring */}
				<g className="origin-center animate-[reticle-spin_16s_linear_infinite] motion-reduce:animate-none">
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
				<g className="origin-center animate-[reticle-spin-reverse_9s_linear_infinite] motion-reduce:animate-none">
					<polygon
						points="60,45 75,60 60,75 45,60"
						stroke="#38BDF8"
						strokeWidth="1.2"
						strokeOpacity="0.8"
					/>
				</g>

				{/* Glowing Leading Ice Comet Head on the Progress Perimeter */}
				{clampedPct > 0 && (
					<g filter="url(#coreGlow)">
						<circle
							cx={cometX}
							cy={cometY}
							r="3.2"
							fill="#FFFFFF"
							className="animate-pulse"
						/>
						<circle
							cx={cometX}
							cy={cometY}
							r="6"
							fill="#38BDF8"
							opacity="0.4"
						/>
					</g>
				)}

				{/* Breathing Center Plasma Orb */}
				<circle
					cx="60"
					cy="60"
					r="7"
					fill="url(#plasmaOrbGrad)"
					filter="url(#coreGlow)"
					className="animate-[plasma-breathe_2.4s_ease-in-out_infinite]"
				/>
				<circle cx="60" cy="60" r="2.8" fill="#FFFFFF" />
			</svg>

			{/* Telemetry Readout Below */}
			<div className="pointer-events-none absolute -bottom-1.5 flex items-center gap-1 font-bold font-mono text-[#7DD3FC] text-[9.5px] tracking-[0.2em] drop-shadow-[0_0_6px_rgba(56,189,248,0.7)]">
				<span>THE-CORE</span>
				<span className="text-[#BAE6FD]">·</span>
				<span>{progressPct}%</span>
			</div>
		</button>
	);
}
