"use client";

import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession } from "@/lib/auth-client";

const SHOWN_DURATION_MS = 900;
const EXIT_DURATION_MS = 350;

type Phase = "waiting" | "shown" | "exiting";

export default function AuthLoadingPage() {
	const router = useRouter();
	const { data: session, isPending } = useSession();
	const [phase, setPhase] = useState<Phase>("waiting");
	const startedRef = useRef(false);

	useEffect(() => {
		if (isPending || startedRef.current) return;
		startedRef.current = true;
		setPhase("shown");
		const timer = setTimeout(() => setPhase("exiting"), SHOWN_DURATION_MS);
		return () => clearTimeout(timer);
	}, [isPending]);

	useEffect(() => {
		if (phase !== "exiting") return;
		const timer = setTimeout(() => {
			if (session) {
				router.replace("/");
			} else {
				router.replace("/login");
			}
		}, EXIT_DURATION_MS);
		return () => clearTimeout(timer);
	}, [phase, session, router]);

	const exiting = phase === "exiting";

	return (
		<div className="cryo-canvas relative flex min-h-screen items-center justify-center overflow-hidden">
			{/* Hardware-accelerated CSS glacial ambient light */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute -inset-20 bg-[radial-gradient(ellipse_60%_40%_at_50%_45%,rgba(56,189,248,0.12),transparent_70%)]"
			/>

			<motion.div
				initial={{ opacity: 0, y: 12, scale: 0.97 }}
				animate={
					exiting
						? { opacity: 0, y: -8, scale: 0.97 }
						: { opacity: 1, y: 0, scale: 1 }
				}
				transition={{
					duration: exiting ? EXIT_DURATION_MS / 1000 : 0.45,
					ease: "easeOut",
				}}
				className="frost-panel relative z-10 flex flex-col items-center gap-4 rounded-2xl p-9 text-center shadow-[0_20px_50px_rgba(2,6,23,0.85)]"
			>
				<Loader2 className="size-6 animate-spin text-[#38BDF8]" />
				<div className="font-extrabold text-[#F0F9FF] text-[17px] tracking-tight">
					{isPending ? "Verifying Cryo session…" : "Authorization Confirmed"}
				</div>
				<div className="text-[#93C5FD] text-[12px]">
					Initializing dashboard subsystem…
				</div>
			</motion.div>
		</div>
	);
}
