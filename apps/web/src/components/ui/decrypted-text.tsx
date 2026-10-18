"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface DecryptedTextProps {
	text: string;
	speed?: number;
	maxIterations?: number;
	characters?: string;
	className?: string;
	parentClassName?: string;
	encryptedClassName?: string;
	animateOn?: "mount" | "hover";
	sequential?: boolean;
}

const DEFAULT_CHARS =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><";

export function DecryptedText({
	text,
	speed = 35,
	maxIterations = 10,
	characters = DEFAULT_CHARS,
	className = "",
	parentClassName = "",
	encryptedClassName = "text-[#38BDF8] opacity-80",
	animateOn = "mount",
	sequential = true,
}: DecryptedTextProps) {
	const [displayText, setDisplayText] = useState(text);
	const [isScrambling, setIsScrambling] = useState(false);
	const iterationRef = useRef(0);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const triggerDecrypt = useCallback(() => {
		if (intervalRef.current) clearInterval(intervalRef.current);
		iterationRef.current = 0;
		setIsScrambling(true);

		const textLength = text.length;
		const charArray = characters.split("");

		intervalRef.current = setInterval(() => {
			iterationRef.current += 1;

			setDisplayText(() => {
				return text
					.split("")
					.map((char, index) => {
						if (char === " ") return " ";
						if (sequential) {
							// Gradually lock in characters from left to right
							const progress = iterationRef.current / maxIterations;
							const lockedIndex = Math.floor(progress * textLength);
							if (index < lockedIndex) {
								return text[index];
							}
						} else {
							if (iterationRef.current >= maxIterations) {
								return text[index];
							}
						}
						return charArray[Math.floor(Math.random() * charArray.length)];
					})
					.join("");
			});

			if (iterationRef.current >= maxIterations) {
				if (intervalRef.current) clearInterval(intervalRef.current);
				intervalRef.current = null;
				setDisplayText(text);
				setIsScrambling(false);
			}
		}, speed);
	}, [characters, maxIterations, sequential, speed, text]);

	useEffect(() => {
		if (animateOn === "mount") {
			triggerDecrypt();
		}
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [animateOn, triggerDecrypt]);

	return (
		<span className={`inline-block ${parentClassName}`}>
			<span className="sr-only">{text}</span>
			<span
				aria-hidden="true"
				className={`${className} ${isScrambling ? encryptedClassName : ""}`}
			>
				{displayText}
			</span>
		</span>
	);
}
