"use client";

import { cn } from "@LE-REMINDER/ui/lib/utils";

export interface SoftAuroraProps {
	className?: string;
	style?: React.CSSProperties;
	speed?: number;
	scale?: number;
	brightness?: number;
	noiseFreq?: number;
	noiseAmp?: number;
	bandHeight?: number;
	bandSpread?: number;
	octaveDecay?: number;
	layerOffset?: number;
	color1?: string;
	color2?: string;
	colorSpeed?: number;
	mouseInfluence?: number;
	enableMouse?: boolean;
}

/**
 * Zero-cost, high-performance CSS ambient backdrop with tactile SVG noise texture.
 * Eliminates continuous WebGL GPU rendering loops in favor of hardware-accelerated CSS
 * and a static SVG noise pattern for the Obsidian & Alabaster design system.
 */
export function SoftAurora({ className, style }: SoftAuroraProps) {
	return (
		<div
			aria-hidden="true"
			className={cn(
				"pointer-events-none absolute inset-0 select-none overflow-hidden",
				className,
			)}
			style={style}
		>
			{/* Top-center ambient specular sheen */}
			<div
				className="absolute inset-0"
				style={{
					background:
						"radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255, 255, 255, 0.07), transparent 70%)",
				}}
			/>

			{/* Subtle bottom-edge depth anchor */}
			<div
				className="absolute inset-x-0 bottom-0 h-1/3"
				style={{
					background:
						"radial-gradient(ellipse 60% 40% at 50% 110%, rgba(255, 255, 255, 0.02), transparent 70%)",
				}}
			/>

			{/* Tactile micro-noise overlay (zero layout cost, pure SVG filter data URI) */}
			<svg
				className="absolute inset-0 size-full opacity-[0.025]"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<filter id="monochrome-noise">
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.8"
						numOctaves="3"
						stitchTiles="stitch"
					/>
					<feColorMatrix type="saturate" values="0" />
				</filter>
				<rect width="100%" height="100%" filter="url(#monochrome-noise)" />
			</svg>
		</div>
	);
}
