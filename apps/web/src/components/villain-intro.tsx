"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface VillainIntroProps {
	onComplete: () => void;
}

const CIPHER_CHARS = "01XZV#$!*+/-\\_";
const TARGET_TEXT = "V // CRYO-COMMAND ONLINE";

export function VillainIntro({ onComplete }: VillainIntroProps) {
	const [cipherText, setCipherText] = useState("V // -------------");

	// Strict 950ms lifecycle: completely unmounts after 0.95s
	useEffect(() => {
		// 0.30s - 0.65s: Decrypt cipher text underneath the V insignia
		const cipherStartTimeout = setTimeout(() => {
			let iterations = 0;
			const maxIterations = 8;
			const interval = setInterval(() => {
				iterations++;
				const progress = iterations / maxIterations;
				const lockedLen = Math.floor(progress * TARGET_TEXT.length);

				setCipherText(
					TARGET_TEXT.split("")
						.map((char, i) => {
							if (i < lockedLen) return char;
							if (char === " ") return " ";
							return CIPHER_CHARS[
								Math.floor(Math.random() * CIPHER_CHARS.length)
							];
						})
						.join(""),
				);

				if (iterations >= maxIterations) {
					clearInterval(interval);
					setCipherText(TARGET_TEXT);
				}
			}, 35);

			return () => clearInterval(interval);
		}, 300);

		// At 950ms, notify parent to unmount from DOM
		const completeTimeout = setTimeout(() => {
			if (typeof window !== "undefined") {
				sessionStorage.setItem("le_reminder_v_intro", "true");
			}
			onComplete();
		}, 950);

		return () => {
			clearTimeout(cipherStartTimeout);
			clearTimeout(completeTimeout);
		};
	}, [onComplete]);

	return (
		<motion.div
			key="villain-boot-overlay"
			initial={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
			animate={{
				opacity: [1, 1, 1, 0],
				scale: [1, 1, 1, 1.06],
				filter: ["blur(0px)", "blur(0px)", "blur(0px)", "blur(6px)"],
			}}
			transition={{
				duration: 0.95,
				times: [0, 0.65, 0.7, 0.95],
				ease: [0.22, 1, 0.36, 1],
			}}
			className="fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden bg-[#05080F]"
			style={{ willChange: "transform, opacity, filter" }}
		>
			{/* Static subtle cryogenic vignette light */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(56,189,248,0.12),rgba(5,8,15,0.95)_70%)]"
			/>

			<div className="relative flex flex-col items-center justify-center">
				{/* 0.30s - 0.65s: Crystalline Diamond/Hexagon Shockwave */}
				<motion.div
					initial={{ scale: 0.15, opacity: 0 }}
					animate={{
						scale: [0.15, 0.3, 2.2],
						opacity: [0, 0.9, 0],
					}}
					transition={{
						delay: 0.3,
						duration: 0.38,
						ease: [0.16, 1, 0.3, 1],
					}}
					className="pointer-events-none absolute size-48 rounded-full border border-[#BAE6FD]/60 shadow-[0_0_30px_rgba(56,189,248,0.6)]"
				/>

				{/* Insignia SVG */}
				<svg
					width="180"
					height="160"
					viewBox="0 0 200 180"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className="relative z-10"
					role="img"
					aria-label="Cryo-Vault V Insignia"
				>
					<title>Cryo-Vault V Insignia</title>
					<defs>
						<filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
							<feDropShadow
								dx="0"
								dy="0"
								stdDeviation="6"
								floodColor="#38BDF8"
								floodOpacity="0.9"
							/>
							<feDropShadow
								dx="0"
								dy="0"
								stdDeviation="12"
								floodColor="#BAE6FD"
								floodOpacity="0.6"
							/>
						</filter>
						<linearGradient id="vIcyGrad" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#FFFFFF" />
							<stop offset="50%" stopColor="#BAE6FD" />
							<stop offset="100%" stopColor="#38BDF8" />
						</linearGradient>
					</defs>

					{/* 0.0s - 0.35s: Razor-sharp laser lines slashing down */}
					{/* Left Laser Slash */}
					<motion.line
						x1="-20"
						y1="-20"
						x2="100"
						y2="155"
						stroke="#BAE6FD"
						strokeWidth="2.5"
						filter="url(#laserGlow)"
						initial={{ pathLength: 0, opacity: 0 }}
						animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
						transition={{ duration: 0.35, ease: "easeOut" }}
					/>

					{/* Right Laser Slash */}
					<motion.line
						x1="220"
						y1="-20"
						x2="100"
						y2="155"
						stroke="#BAE6FD"
						strokeWidth="2.5"
						filter="url(#laserGlow)"
						initial={{ pathLength: 0, opacity: 0 }}
						animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
						transition={{ duration: 0.35, ease: "easeOut" }}
					/>

					{/* Aggressive Symmetrical Geometric "V" Villain Insignia */}
					{/* Left Wing Facet */}
					<motion.path
						d="M32 20 L88 152 L100 152 L60 20 Z"
						fill="url(#vIcyGrad)"
						filter="url(#laserGlow)"
						initial={{ opacity: 0, x: -35, y: -25 }}
						animate={{ opacity: 1, x: 0, y: 0 }}
						transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
					/>

					{/* Right Wing Facet */}
					<motion.path
						d="M168 20 L112 152 L100 152 L140 20 Z"
						fill="url(#vIcyGrad)"
						filter="url(#laserGlow)"
						initial={{ opacity: 0, x: 35, y: -25 }}
						animate={{ opacity: 1, x: 0, y: 0 }}
						transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
					/>

					{/* Center Apex Core Fang */}
					<motion.polygon
						points="100,165 92,142 100,146 108,142"
						fill="#FFFFFF"
						initial={{ scale: 0, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ delay: 0.28, duration: 0.15 }}
					/>

					{/* Outer Precision Reticle Calibration Marks */}
					<motion.circle
						cx="100"
						cy="85"
						r="70"
						stroke="rgba(186, 230, 253, 0.25)"
						strokeWidth="1"
						strokeDasharray="4 8"
						initial={{ opacity: 0, rotate: -45 }}
						animate={{ opacity: 1, rotate: 45 }}
						transition={{ delay: 0.15, duration: 0.5 }}
					/>
				</svg>

				{/* 0.30s - 0.65s: Scrambled Monospace Cipher Underneath */}
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.25, duration: 0.2 }}
					className="mt-6 flex flex-col items-center gap-1.5"
				>
					<span className="font-mono text-[#BAE6FD] text-[11px] tracking-[0.35em] drop-shadow-[0_0_10px_rgba(56,189,248,0.7)]">
						{cipherText}
					</span>
					<div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-[#BAE6FD]/40 to-transparent" />
				</motion.div>
			</div>
		</motion.div>
	);
}
