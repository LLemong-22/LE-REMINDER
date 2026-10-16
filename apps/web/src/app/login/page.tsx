"use client";

import { Github } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SoftAurora } from "@/components/soft-aurora";
import { authClient, useSession } from "@/lib/auth-client";

export default function LoginPage() {
	const router = useRouter();
	const { data: session, isPending } = useSession();
	const [signingIn, setSigningIn] = useState(false);

	useEffect(() => {
		if (!isPending && session) {
			router.replace("/");
		}
	}, [isPending, session, router]);

	async function handleGithubSignIn() {
		setSigningIn(true);
		try {
			await authClient.signIn.social({
				provider: "github",
				callbackURL: "/auth/loading",
			});
		} catch {
			toast.error(
				"Couldn't reach GitHub — check your connection and try again.",
			);
			setSigningIn(false);
		}
	}

	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090B]">
			<div className="absolute inset-0">
				<SoftAurora />
			</div>

			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: "easeOut" }}
				className="relative z-10 flex w-[340px] flex-col items-center gap-6 rounded-2xl border border-white/[0.08] bg-zinc-900/80 px-8 py-10 text-center shadow-[0_16px_48px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-md"
			>
				<div className="flex flex-col gap-1.5">
					<div className="font-semibold text-[#EDEDEF] text-lg uppercase tracking-wider">
						LE-REMINDER
					</div>
					<div className="text-xs text-zinc-400">
						Private dashboard. Sign in to continue.
					</div>
				</div>

				<button
					type="button"
					onClick={handleGithubSignIn}
					disabled={signingIn}
					className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-[#EDEDEF] px-4 py-2.5 font-medium text-xs text-zinc-950 shadow-sm transition-all hover:bg-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
				>
					<Github className="size-4" />
					{signingIn ? "Redirecting to GitHub…" : "Continue with GitHub"}
				</button>

				<div className="font-mono text-[11px] text-zinc-500">
					Access is restricted to one authorized account.
				</div>
			</motion.div>
		</div>
	);
}
