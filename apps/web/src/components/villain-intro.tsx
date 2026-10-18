"use client";

import { motion } from "motion/react";
import { useEffect } from "react";
import { cryoSound } from "@/lib/cryo-sound";

interface VillainIntroProps {
	onComplete: () => void;
}

export function VillainIntro({ onComplete }: VillainIntroProps) {
	// 850ms single-stage lifecycle: plays true "V" crest, shockwaves, fracture burst, and shatter exit
	useEffect(() => {
		cryoSound.playReactorPulse();
		const timer = setTimeout(() => {
			onComplete();
		}, 850);

		return () => clearTimeout(timer);
	}, [onComplete]);

	return (
		<motion.div
			key="cryo-v-crest-reveal-overlay"
			initial={{ opacity: 1, scale: 1 }}
			animate={{
				opacity: [1, 1, 1, 0],
				scale: [1, 1, 1.02, 1.06],
			}}
			transition={{
				duration: 0.85,
				times: [0, 0.55, 0.7, 0.85],
				ease: [0.16, 1, 0.3, 1],
			}}
			className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-[#07111D]"
			style={{ willChange: "transform, opacity" }}
			role="presentation"
			aria-hidden="true"
		>
			{/* High-energy arctic ambient gradient burst */}
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(56,189,248,0.25),rgba(13,27,42,0.98)_80%)]" />

			{/* Center V-Wedge Glacial Flash & Shatter Exit (0.55s - 0.85s) */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{
					opacity: [0, 0, 0.9, 0],
					scale: [0.95, 0.95, 1.15, 1.4],
					filter: [
						"brightness(1)",
						"brightness(1)",
						"brightness(2.5)",
						"brightness(1)",
					],
				}}
				transition={{
					duration: 0.85,
					times: [0, 0.52, 0.65, 0.85],
					ease: [0.16, 1, 0.3, 1],
				}}
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_65%,rgba(56,189,248,0.5),rgba(186,230,253,0.1)_50%,transparent_75%)]"
			/>

			{/* True "V" Crest SVG Viewport */}
			<svg
				viewBox="0 0 1000 1000"
				className="pointer-events-none absolute inset-0 size-full"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<title>Cryo V Apex Crest</title>
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
							stdDeviation="6"
							floodColor="#38BDF8"
							floodOpacity="0.95"
						/>
						<feDropShadow
							dx="0"
							dy="0"
							stdDeviation="14"
							floodColor="#BAE6FD"
							floodOpacity="0.8"
						/>
					</filter>
					<filter
						id="intenseApexGlow"
						x="-100%"
						y="-100%"
						width="300%"
						height="300%"
					>
						<feDropShadow
							dx="0"
							dy="0"
							stdDeviation="12"
							floodColor="#FFFFFF"
							floodOpacity="1"
						/>
						<feDropShadow
							dx="0"
							dy="0"
							stdDeviation="28"
							floodColor="#38BDF8"
							floodOpacity="0.9"
						/>
					</filter>
					<linearGradient id="vBeamLeft" x1="18%" y1="0%" x2="50%" y2="76%">
						<stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.2" />
						<stop offset="40%" stopColor="#BAE6FD" />
						<stop offset="100%" stopColor="#FFFFFF" />
					</linearGradient>
					<linearGradient id="vBeamRight" x1="82%" y1="0%" x2="50%" y2="76%">
						<stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.2" />
						<stop offset="40%" stopColor="#BAE6FD" />
						<stop offset="100%" stopColor="#FFFFFF" />
					</linearGradient>
					<linearGradient
						id="innerChevronGrad"
						x1="50%"
						y1="62%"
						x2="50%"
						y2="12%"
					>
						<stop offset="0%" stopColor="#FFFFFF" />
						<stop offset="60%" stopColor="#E0F2FE" />
						<stop offset="100%" stopColor="#38BDF8" stopOpacity="0.4" />
					</linearGradient>
				</defs>

				{/* Center Glacial Wedge Fill inside the V */}
				<motion.polygon
					points="180,0 500,760 820,0"
					fill="rgba(56, 189, 248, 0.08)"
					initial={{ opacity: 0 }}
					animate={{
						opacity: [0, 0.7, 0.9, 0],
					}}
					transition={{
						duration: 0.85,
						times: [0, 0.32, 0.58, 0.85],
						ease: "easeOut",
					}}
				/>

				{/* 1. Outer Left Wing Beam: (180, 0) strictly terminating at Apex (500, 760) */}
				<motion.line
					x1="180"
					y1="0"
					x2="500"
					y2="760"
					stroke="url(#vBeamLeft)"
					strokeWidth="5"
					strokeLinecap="round"
					filter="url(#iceFlashGlow)"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{
						pathLength: [0, 1, 1],
						opacity: [0, 1, 0],
					}}
					transition={{
						duration: 0.55,
						times: [0, 0.35, 1],
						ease: [0.16, 1, 0.3, 1],
					}}
				/>

				{/* 2. Outer Right Wing Beam: (820, 0) strictly terminating at Apex (500, 760) */}
				<motion.line
					x1="820"
					y1="0"
					x2="500"
					y2="760"
					stroke="url(#vBeamRight)"
					strokeWidth="5"
					strokeLinecap="round"
					filter="url(#iceFlashGlow)"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{
						pathLength: [0, 1, 1],
						opacity: [0, 1, 0],
					}}
					transition={{
						duration: 0.55,
						times: [0, 0.35, 1],
						ease: [0.16, 1, 0.3, 1],
					}}
				/>

				{/* 3. Inner Double-Chevron Echo: 80ms after outer V locks in (at 0.36s) */}
				{/* Nested (26%, 12%) -> (50%, 62%) -> (74%, 12%) */}
				<motion.polyline
					points="260,120 500,620 740,120"
					stroke="url(#innerChevronGrad)"
					strokeWidth="3"
					strokeLinecap="round"
					strokeLinejoin="round"
					filter="url(#iceFlashGlow)"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{
						pathLength: [0, 1, 1],
						opacity: [0, 1, 0],
					}}
					transition={{
						delay: 0.1,
						duration: 0.45,
						times: [0, 0.4, 1],
						ease: [0.16, 1, 0.3, 1],
					}}
				/>

				{/* 4. Apex Impact & Shockwaves (0.28s - 0.55s) */}
				{/* Concentric Diamond Shockwave Ring 1 */}
				<motion.polygon
					points="500,710 550,760 500,810 450,760"
					stroke="#BAE6FD"
					strokeWidth="2.5"
					fill="none"
					filter="url(#iceFlashGlow)"
					style={{ transformOrigin: "500px 760px" }}
					initial={{ scale: 0.1, opacity: 0, rotate: 0 }}
					animate={{
						scale: [0.1, 4.2],
						opacity: [0, 0.95, 0],
						rotate: [0, 25],
					}}
					transition={{
						delay: 0.28,
						duration: 0.35,
						ease: [0.16, 1, 0.3, 1],
					}}
				/>

				{/* Concentric Hexagonal Shockwave Ring 2 */}
				<motion.polygon
					points="500,695 556,727 556,793 500,825 444,793 444,727"
					stroke="#7DD3FC"
					strokeWidth="2"
					fill="none"
					filter="url(#iceFlashGlow)"
					style={{ transformOrigin: "500px 760px" }}
					initial={{ scale: 0.1, opacity: 0, rotate: 0 }}
					animate={{
						scale: [0.1, 5.2],
						opacity: [0, 0.85, 0],
						rotate: [0, -30],
					}}
					transition={{
						delay: 0.32,
						duration: 0.38,
						ease: [0.16, 1, 0.3, 1],
					}}
				/>

				{/* 5. 8 Sharp SVG Frost-Crack Lightning Lines branching from Apex and V edges */}
				{/* Crack 1: Down-left from apex */}
				<motion.polyline
					points="500,760 460,815 425,845 390,860"
					stroke="#E0F2FE"
					strokeWidth="2.2"
					filter="url(#iceFlashGlow)"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{ pathLength: [0, 1], opacity: [0, 1, 0] }}
					transition={{ delay: 0.28, duration: 0.3 }}
				/>
				{/* Crack 2: Down-right from apex */}
				<motion.polyline
					points="500,760 540,815 575,845 610,860"
					stroke="#E0F2FE"
					strokeWidth="2.2"
					filter="url(#iceFlashGlow)"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{ pathLength: [0, 1], opacity: [0, 1, 0] }}
					transition={{ delay: 0.28, duration: 0.3 }}
				/>
				{/* Crack 3: Deep vertical root */}
				<motion.polyline
					points="500,760 495,830 515,885 490,930"
					stroke="#BAE6FD"
					strokeWidth="1.8"
					filter="url(#iceFlashGlow)"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{ pathLength: [0, 1], opacity: [0, 1, 0] }}
					transition={{ delay: 0.3, duration: 0.3 }}
				/>
				{/* Crack 4: Left lateral branch */}
				<motion.polyline
					points="500,760 450,768 410,795"
					stroke="#BAE6FD"
					strokeWidth="1.5"
					filter="url(#iceFlashGlow)"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{ pathLength: [0, 1], opacity: [0, 1, 0] }}
					transition={{ delay: 0.29, duration: 0.28 }}
				/>
				{/* Crack 5: Right lateral branch */}
				<motion.polyline
					points="500,760 550,768 590,795"
					stroke="#BAE6FD"
					strokeWidth="1.5"
					filter="url(#iceFlashGlow)"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{ pathLength: [0, 1], opacity: [0, 1, 0] }}
					transition={{ delay: 0.29, duration: 0.28 }}
				/>
				{/* Crack 6: Left wing mid-fracture */}
				<motion.polyline
					points="340,380 290,395 255,435"
					stroke="#E0F2FE"
					strokeWidth="1.6"
					filter="url(#iceFlashGlow)"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{ pathLength: [0, 1], opacity: [0, 1, 0] }}
					transition={{ delay: 0.32, duration: 0.28 }}
				/>
				{/* Crack 7: Right wing mid-fracture */}
				<motion.polyline
					points="660,380 710,395 745,435"
					stroke="#E0F2FE"
					strokeWidth="1.6"
					filter="url(#iceFlashGlow)"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{ pathLength: [0, 1], opacity: [0, 1, 0] }}
					transition={{ delay: 0.32, duration: 0.28 }}
				/>
				{/* Crack 8: Inner chevron lower fracture */}
				<motion.polyline
					points="500,620 465,580 435,595"
					stroke="#7DD3FC"
					strokeWidth="1.5"
					filter="url(#iceFlashGlow)"
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{ pathLength: [0, 1], opacity: [0, 1, 0] }}
					transition={{ delay: 0.34, duration: 0.26 }}
				/>

				{/* 6. Blinding Icy Flare at bottom apex tip (500, 760) */}
				<motion.circle
					cx="500"
					cy="760"
					r="36"
					fill="#FFFFFF"
					filter="url(#intenseApexGlow)"
					initial={{ scale: 0, opacity: 0 }}
					animate={{
						scale: [0, 2.8, 0],
						opacity: [0, 1, 0],
					}}
					transition={{
						delay: 0.28,
						duration: 0.32,
						ease: "easeOut",
					}}
				/>
			</svg>
		</motion.div>
	);
}
