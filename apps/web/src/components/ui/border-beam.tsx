"use client";

import { cn } from "@LE-REMINDER/ui/lib/utils";

interface BorderBeamProps {
	className?: string;
	size?: number;
	duration?: number;
	borderWidth?: number;
	colorFrom?: string;
	colorTo?: string;
	delay?: number;
}

export function BorderBeam({
	className,
	size = 200,
	duration = 8,
	borderWidth = 1.5,
	colorFrom = "#38BDF8",
	colorTo = "#BAE6FD",
	delay = 0,
}: BorderBeamProps) {
	return (
		<div
			aria-hidden="true"
			style={
				{
					"--size": `${size}px`,
					"--duration": `${duration}s`,
					"--delay": `-${delay}s`,
					"--color-from": colorFrom,
					"--color-to": colorTo,
					"--border-width": `${borderWidth}px`,
				} as React.CSSProperties
			}
			className={cn(
				"pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent]",
				"![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]",
				"after:absolute after:aspect-square after:w-[calc(var(--size))] after:animate-[reticle-spin_var(--duration)_linear_infinite] after:[animation-delay:var(--delay)]",
				"after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)] after:[offset-anchor:calc(var(--size)*0.5)_50%] after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]",
				className,
			)}
		/>
	);
}
