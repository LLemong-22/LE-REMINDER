import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import "../index.css";
import Providers from "@/components/providers";

const inter = Inter({
	variable: "--font-sans",
	subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
	variable: "--font-mono",
	weight: ["400", "500", "600"],
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "LE-REMINDER",
	description: "LE-REMINDER",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `(function(){try{var t=localStorage.getItem("le-reminder-theme");if(t==="light"||(!t&&window.matchMedia("(prefers-color-scheme: light)").matches)){document.documentElement.classList.add("light");}}catch(e){}})();`,
					}}
				/>
			</head>
			<body
				className={`${inter.variable} ${ibmPlexMono.variable} min-h-screen w-full bg-[var(--canvas-bg,#09090B)] text-[var(--text-primary,#F4F4F6)] antialiased transition-colors duration-200`}
			>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
