"use client";

// Subtle monochrome ambient specular glow behind panels
export function AuroraGlow() {
	return (
		<div
			aria-hidden
			className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
		>
			<div
				className="absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full blur-[100px]"
				style={{
					background: "rgba(var(--spotlight-rgb, 255, 255, 255), 0.04)",
				}}
			/>
		</div>
	);
}
