"use client";

import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SoftAurora } from "@/components/soft-aurora";
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
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090B]">
			<div className="absolute inset-0">
				<SoftAurora />
			</div>

			<motion.div
				initial={{ opacity: 0, y: 12, scale: 0.97 }}
				animate={
					exiting
						? { opacity: 0, y: -8, scale: 0.97 }
						: { opacity: 1, y: 0, scale: 1 }
				}
				transition={{
					duration: exiting ? EXIT_DURATION_MS / 1000 : 0.5,
					ease: "easeOut",
				}}
				className="relative z-10 flex flex-col items-center gap-4 rounded-2xl border border-white/[0.08] bg-zinc-900/80 px-10 py-9 text-center shadow-[0_16px_48px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-md"
			>
				<Loader2 className="size-5 animate-spin text-[#EDEDEF]" />
				<div className="font-medium text-[#EDEDEF] text-sm tracking-tight">
					{isPending ? "Verifying your session…" : "Welcome back"}
				</div>
				<div className="font-mono text-xs text-zinc-500">
					{isPending ? "Connecting to auth provider" : "Opening dashboard"}
				</div>
			</motion.div>
		</div>
	);
}
