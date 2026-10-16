"use client";

import { cn } from "@LE-REMINDER/ui/lib/utils";

/**
 * Precision Monochrome SVG Gyroscope & Dial.
 * Replaces heavy canvas/3D loops with hardware-accelerated CSS rotation
 * on concentric technical measurement rings and calibration ticks.
 */
export function NexusAnimation({ className }: { className?: string }) {
	return (
		<div
			aria-hidden="true"
			className={cn(
				"relative flex size-24 select-none items-center justify-center",
				className,
			)}
		>
			<svg
				className="absolute inset-0 size-full"
				viewBox="0 0 100 100"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				{/* Static outer calibration track */}
				<circle
					cx="50"
					cy="50"
					r="46"
					stroke="rgba(255, 255, 255, 0.08)"
					strokeWidth="1"
				/>

				{/* Center crosshair reticle ticks */}
				<line
					x1="50"
					y1="6"
					x2="50"
					y2="14"
					stroke="rgba(255, 255, 255, 0.25)"
					strokeWidth="1"
				/>
				<line
					x1="50"
					y1="86"
					x2="50"
					y2="94"
					stroke="rgba(255, 255, 255, 0.25)"
					strokeWidth="1"
				/>
				<line
					x1="6"
					y1="50"
					x2="14"
					y2="50"
					stroke="rgba(255, 255, 255, 0.25)"
					strokeWidth="1"
				/>
				<line
					x1="86"
					y1="50"
					x2="94"
					y2="50"
					stroke="rgba(255, 255, 255, 0.25)"
					strokeWidth="1"
				/>

				{/* Precision 45-degree corner micro-dots */}
				<circle cx="21" cy="21" r="1" fill="rgba(255, 255, 255, 0.2)" />
				<circle cx="79" cy="21" r="1" fill="rgba(255, 255, 255, 0.2)" />
				<circle cx="21" cy="79" r="1" fill="rgba(255, 255, 255, 0.2)" />
				<circle cx="79" cy="79" r="1" fill="rgba(255, 255, 255, 0.2)" />
			</svg>

			{/* Outer clockwise rotating dashed ring */}
			<svg
				className="absolute inset-0 size-full animate-[spin-cw_36s_linear_infinite] motion-reduce:animate-none"
				viewBox="0 0 100 100"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<circle
					cx="50"
					cy="50"
					r="38"
					stroke="rgba(255, 255, 255, 0.16)"
					strokeWidth="1"
					strokeDasharray="4 6"
				/>
				{/* Single precision indicator mark on the outer ring */}
				<circle cx="50" cy="12" r="1.5" fill="#EDEDEF" />
			</svg>

			{/* Inner counter-clockwise rotating ring */}
			<svg
				className="absolute inset-0 size-full animate-[spin-ccw_24s_linear_infinite] motion-reduce:animate-none"
				viewBox="0 0 100 100"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<circle
					cx="50"
					cy="50"
					r="26"
					stroke="rgba(255, 255, 255, 0.12)"
					strokeWidth="1"
					strokeDasharray="2 4"
				/>
				<circle cx="24" cy="50" r="1.2" fill="#A1A1AA" />
				<circle cx="76" cy="50" r="1.2" fill="#A1A1AA" />
			</svg>

			{/* Center Alabaster pulse core */}
			<div className="relative flex items-center justify-center">
				<div className="size-2 rounded-full bg-[#EDEDEF] shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
				<div className="absolute -inset-1.5 animate-[core-pulse_3s_ease-in-out_infinite] rounded-full border border-white/20 motion-reduce:animate-none" />
			</div>
		</div>
	);
}
