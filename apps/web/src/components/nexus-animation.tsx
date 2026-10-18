"use client";

// Deterministic PRNG so the frost dust particles match server render and hydration
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
const FROST_SPARKS = Array.from({ length: 14 }, (_, i) => ({
	left: 10 + rand() * 80,
	top: 10 + rand() * 80,
	size: 1 + rand() * 1.5,
	duration: 2.2 + rand() * 2.0,
	delay: rand() * 2.5,
	accent: i % 3 === 0,
}));

export function NexusAnimation() {
	return (
		<div
			aria-hidden="true"
			className="relative size-28 select-none"
			style={{ perspective: "600px" }}
		>
			{/* Drifting crystalline frost sparks */}
			<div className="pointer-events-none absolute inset-0">
				{FROST_SPARKS.map((s, idx) => (
					<div
						key={idx}
						className="nexus-star absolute rounded-full"
						style={
							{
								left: `${s.left}%`,
								top: `${s.top}%`,
								width: s.size,
								height: s.size,
								background: s.accent ? "#BAE6FD" : "#64748B",
								boxShadow: s.accent
									? "0 0 4px 1px rgba(186,230,253,0.6)"
									: "none",
								"--star-duration": `${s.duration}s`,
								"--star-delay": `${s.delay}s`,
							} as React.CSSProperties
						}
					/>
				))}
			</div>

			{/* Static Soft Glacial Ambient Core Glow */}
			<div
				className="absolute inset-4 animate-[cryo-glow_3s_ease-in-out_infinite] rounded-full motion-reduce:animate-none"
				style={{
					background:
						"radial-gradient(circle, rgba(186,230,253,0.22), rgba(56,189,248,0.08) 45%, transparent 70%)",
				}}
			/>

			{/* Pure SVG Cryo-Crystalline Gyroscope */}
			<svg
				viewBox="0 0 120 120"
				className="absolute inset-0 size-full"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				role="img"
				aria-label="Cryo-Crystalline Gyroscope"
			>
				<title>Cryo-Crystalline Gyroscope</title>
				<defs>
					<filter id="cryoGlow" x="-20%" y="-20%" width="140%" height="140%">
						<feDropShadow
							dx="0"
							dy="0"
							stdDeviation="3"
							floodColor="#38BDF8"
							floodOpacity="0.75"
						/>
					</filter>
				</defs>

				{/* 1. Outer Calibration Frost Ring (Clockwise) */}
				<g className="origin-center animate-[spin-cw_32s_linear_infinite] motion-reduce:animate-none">
					<circle
						cx="60"
						cy="60"
						r="50"
						stroke="#BAE6FD"
						strokeWidth="0.8"
						strokeOpacity="0.3"
						strokeDasharray="4 6"
					/>
					<circle cx="60" cy="10" r="1.8" fill="#BAE6FD" />
					<circle cx="60" cy="110" r="1.8" fill="#38BDF8" />
					<circle cx="10" cy="60" r="1.8" fill="#38BDF8" />
					<circle cx="110" cy="60" r="1.8" fill="#BAE6FD" />
				</g>

				{/* 2. Concentric Intermediate Gyro Ring (Counter-Clockwise) */}
				<g className="origin-center animate-[spin-ccw_18s_linear_infinite] motion-reduce:animate-none">
					<circle
						cx="60"
						cy="60"
						r="41"
						stroke="#38BDF8"
						strokeWidth="1.2"
						strokeOpacity="0.45"
						strokeDasharray="14 8 2 8"
					/>
					<circle cx="31" cy="31" r="1.4" fill="#BAE6FD" />
					<circle cx="89" cy="89" r="1.4" fill="#BAE6FD" />
				</g>

				{/* 3. Inner Precision Ring with Hexagonal Reticle (Clockwise) */}
				<g className="origin-center animate-[reticle-spin_12s_linear_infinite] motion-reduce:animate-none">
					{/* Concentric Circle */}
					<circle
						cx="60"
						cy="60"
						r="30"
						stroke="#BAE6FD"
						strokeWidth="1"
						strokeOpacity="0.5"
						strokeDasharray="2 4"
					/>
					{/* Hexagonal Inner Reticle */}
					<polygon
						points="60,35 81.65,47.5 81.65,72.5 60,85 38.35,72.5 38.35,47.5"
						stroke="#BAE6FD"
						strokeWidth="1.2"
						strokeOpacity="0.75"
						filter="url(#cryoGlow)"
					/>
				</g>

				{/* 4. Counter-rotating Micro Reticle (Counter-Clockwise) */}
				<g className="origin-center animate-[reticle-spin-reverse_8s_linear_infinite] motion-reduce:animate-none">
					<polygon
						points="60,44 73.85,52 73.85,68 60,76 46.15,68 46.15,52"
						stroke="#38BDF8"
						strokeWidth="0.9"
						strokeOpacity="0.8"
					/>
					{/* Crosshair Cardinal Ticks */}
					<line
						x1="60"
						y1="40"
						x2="60"
						y2="46"
						stroke="#BAE6FD"
						strokeWidth="1.2"
					/>
					<line
						x1="60"
						y1="74"
						x2="60"
						y2="80"
						stroke="#BAE6FD"
						strokeWidth="1.2"
					/>
					<line
						x1="40"
						y1="60"
						x2="46"
						y2="60"
						stroke="#BAE6FD"
						strokeWidth="1.2"
					/>
					<line
						x1="74"
						y1="60"
						x2="80"
						y2="60"
						stroke="#BAE6FD"
						strokeWidth="1.2"
					/>
				</g>

				{/* 5. Center Core Node */}
				<circle
					cx="60"
					cy="60"
					r="5.5"
					fill="#BAE6FD"
					className="animate-[core-pulse_2.2s_ease-in-out_infinite]"
					filter="url(#cryoGlow)"
				/>
				<circle cx="60" cy="60" r="2.5" fill="#FFFFFF" />
			</svg>
		</div>
	);
}
