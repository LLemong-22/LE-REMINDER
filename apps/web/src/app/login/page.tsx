"use client";

import { Github } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
		<div className="cryo-canvas relative flex min-h-screen items-center justify-center overflow-hidden">
			{/* Hardware-accelerated CSS glacial ambient light (0 WebGL / 0% GPU drain) */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute -inset-20 bg-[radial-gradient(ellipse_60%_40%_at_50%_45%,rgba(56,189,248,0.12),transparent_70%)]"
			/>

			<motion.div
				initial={{ opacity: 0, y: 14 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: "easeOut" }}
				className="frost-panel relative z-10 flex w-[340px] flex-col items-center gap-6 rounded-2xl p-8 text-center shadow-[0_20px_50px_rgba(2,6,23,0.85)]"
			>
				<div className="flex flex-col gap-1.5">
					<div className="font-extrabold text-[#F0F9FF] text-[22px] tracking-tight drop-shadow-[0_0_12px_rgba(56,189,248,0.3)]">
						LE-REMINDER
					</div>
					<div className="text-[#93C5FD] text-[13px]">
						Cryo-Vault Command. Sign in to proceed.
					</div>
				</div>

				<button
					type="button"
					onClick={handleGithubSignIn}
					disabled={signingIn}
					className="frost-pill-btn flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl px-4 py-2.5 font-semibold text-[13.5px] disabled:cursor-not-allowed disabled:opacity-60"
				>
					<Github className="size-4" />
					{signingIn ? "Redirecting to GitHub…" : "Continue with GitHub"}
				</button>

				<div className="font-mono text-[#64748B] text-[11px]">
					Access is restricted to one authorized account.
				</div>
			</motion.div>
		</div>
	);
}
