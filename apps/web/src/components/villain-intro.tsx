"use client";

import { motion } from "motion/react";
import { useEffect } from "react";

interface VillainIntroProps {
	onComplete: () => void;
}

export function VillainIntro({ onComplete }: VillainIntroProps) {
	// Strict 650ms single-stage lifecycle: plays on every reload, then completely unmounts
	useEffect(() => {
		const timer = setTimeout(() => {
			onComplete();
		}, 650);

		return () => clearTimeout(timer);
	}, [onComplete]);

	return (
		<motion.div
			key="cryo-slash-reveal-overlay"
			initial={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
			animate={{
				opacity: [1, 1, 0.95, 0],
				scale: [1, 1, 1.03, 1.08],
				filter: ["blur(0px)", "blur(0px)", "blur(2px)", "blur(8px)"],
			}}
			transition={{
				duration: 0.65,
				times: [0, 0.35, 0.45, 0.65],
				ease: [0.16, 1, 0.3, 1],
			}}
			className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-[#07111D]"
			style={{ willChange: "transform, opacity, filter" }}
			role="presentation"
			aria-hidden="true"
		>
			{/* High-energy arctic ambient gradient burst */}
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(125,211,252,0.28),rgba(13,27,42,0.95)_75%)]" />

			{/* Center Crystalline Shockwave expanding outward */}
			<motion.div
				initial={{ scale: 0.15, opacity: 0, rotate: 0 }}
				animate={{
					scale: [0.15, 0.8, 3.2],
					opacity: [0, 0.95, 0],
					rotate: [0, 15, 45],
				}}
				transition={{
					duration: 0.58,
					ease: [0.16, 1, 0.3, 1],
				}}
				className="pointer-events-none absolute size-64 rounded-full border border-[#BAE6FD] shadow-[0_0_50px_rgba(56,189,248,0.85),inset_0_0_30px_rgba(224,242,254,0.6)]"
			/>

			{/* Secondary Diamond Shockwave */}
			<motion.div
				initial={{ scale: 0.1, opacity: 0, rotate: 45 }}
				animate={{
					scale: [0.1, 0.6, 2.6],
					opacity: [0, 0.85, 0],
					rotate: [45, 60, 90],
				}}
				transition={{
					delay: 0.05,
					duration: 0.52,
					ease: [0.16, 1, 0.3, 1],
				}}
				className="pointer-events-none absolute size-52 border border-[#7DD3FC]/80 shadow-[0_0_35px_rgba(125,211,252,0.7)]"
			/>

			{/* Laser Slash SVG Viewport */}
			<svg
				viewBox="0 0 1000 1000"
				className="pointer-events-none absolute inset-0 size-full"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<title>Laser Slash Reveal</title>
				<defs>
					<filter
						id="iceFlashGlow"
						x="-50%"
						y="-50%"
						width="200%"
						height="200%"
					>
						<feDropShadow
							dx="0"
							dy="0"
							stdDeviation="8"
							floodColor="#38BDF8"
							floodOpacity="0.95"
						/>
						<feDropShadow
							dx="0"
							dy="0"
							stdDeviation="16"
							floodColor="#BAE6FD"
							floodOpacity="0.8"
						/>
					</filter>
					<linearGradient id="slashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#FFFFFF" />
						<stop offset="50%" stopColor="#BAE6FD" />
						<stop offset="100%" stopColor="#38BDF8" />
					</linearGradient>
				</defs>

				{/* Primary Top-Left to Bottom-Right Hyper-Speed Laser Slash */}
				<motion.line
					x1="-100"
					y1="-100"
					x2="1100"
					y2="1100"
					stroke="url(#slashGrad)"
					strokeWidth="4"
					filter="url(#iceFlashGlow)"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{
						pathLength: [0, 1, 1],
						opacity: [0, 1, 0],
					}}
					transition={{
						duration: 0.38,
						ease: "easeOut",
					}}
				/>

				{/* Intersecting Top-Right to Bottom-Left Laser Slash */}
				<motion.line
					x1="1100"
					y1="-100"
					x2="-100"
					y2="1100"
					stroke="url(#slashGrad)"
					strokeWidth="4"
					filter="url(#iceFlashGlow)"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{
						pathLength: [0, 1, 1],
						opacity: [0, 1, 0],
					}}
					transition={{
						delay: 0.04,
						duration: 0.36,
						ease: "easeOut",
					}}
				/>

				{/* Crosshair Cardinal Crystalline Fracture Lines */}
				<motion.line
					x1="500"
					y1="200"
					x2="500"
					y2="800"
					stroke="#E0F2FE"
					strokeWidth="1.5"
					filter="url(#iceFlashGlow)"
					initial={{ scaleY: 0, opacity: 0 }}
					animate={{ scaleY: [0, 1, 0], opacity: [0, 1, 0] }}
					transition={{ delay: 0.1, duration: 0.32 }}
				/>
				<motion.line
					x1="200"
					y1="500"
					x2="800"
					y2="500"
					stroke="#E0F2FE"
					strokeWidth="1.5"
					filter="url(#iceFlashGlow)"
					initial={{ scaleX: 0, opacity: 0 }}
					animate={{ scaleX: [0, 1, 0], opacity: [0, 1, 0] }}
					transition={{ delay: 0.1, duration: 0.32 }}
				/>

				{/* Center Glacial Apex Flash */}
				<motion.circle
					cx="500"
					cy="500"
					r="22"
					fill="#FFFFFF"
					filter="url(#iceFlashGlow)"
					initial={{ scale: 0, opacity: 0 }}
					animate={{
						scale: [0, 2.5, 0],
						opacity: [0, 1, 0],
					}}
					transition={{
						delay: 0.12,
						duration: 0.32,
						ease: "easeOut",
					}}
				/>
			</svg>
		</motion.div>
	);
}
