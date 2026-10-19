/**
 * Custom Butter-Smooth Scroll Engine (120fps)
 * Uses requestAnimationFrame with an easeOutQuint curve (1 - Math.pow(1 - t, 5))
 * for silky-smooth, robotic-stutter-free gliding to target elements.
 * Returns a cancel function and auto-cancels on user wheel or touch interaction.
 */
export function smoothScrollToElement(
	element: HTMLElement | null,
	duration = 600,
	onArrival?: () => void,
): () => void {
	if (typeof window === "undefined" || !element) return () => {};

	// Calculate target scroll position centered vertically in viewport with navbar offset
	const rect = element.getBoundingClientRect();
	const windowHeight = window.innerHeight;
	const currentScrollY = window.scrollY || window.pageYOffset;
	const navbarOffset = 72; // floating navbar height compensation
	const targetY = Math.max(
		0,
		currentScrollY +
			rect.top -
			windowHeight / 2 +
			rect.height / 2 +
			navbarOffset / 2,
	);

	const startY = currentScrollY;
	const distance = targetY - startY;

	if (Math.abs(distance) < 2) {
		onArrival?.();
		return () => {};
	}

	let startTime: number | null = null;
	let animId: number | null = null;
	let isCleanedUp = false;

	function cleanup() {
		if (isCleanedUp) return;
		isCleanedUp = true;
		if (animId !== null) {
			cancelAnimationFrame(animId);
			animId = null;
		}
		window.removeEventListener("wheel", cleanup);
		window.removeEventListener("touchmove", cleanup);
	}

	window.addEventListener("wheel", cleanup, { passive: true });
	window.addEventListener("touchmove", cleanup, { passive: true });

	// easeOutQuint: 1 - Math.pow(1 - t, 5)
	function step(currentTime: number) {
		if (isCleanedUp) return;
		if (startTime === null) startTime = currentTime;
		const elapsed = currentTime - startTime;
		const progress = Math.min(elapsed / duration, 1);
		const ease = 1 - (1 - progress) ** 5;

		window.scrollTo(0, startY + distance * ease);

		if (progress < 1) {
			animId = requestAnimationFrame(step);
		} else {
			cleanup();
			onArrival?.();
		}
	}

	animId = requestAnimationFrame(step);
	return cleanup;
}
