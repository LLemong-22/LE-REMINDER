/**
 * Custom Butter-Smooth Scroll Engine (120fps)
 * Uses requestAnimationFrame with an easeOutQuint curve (1 - Math.pow(1 - t, 5))
 * for silky-smooth, robotic-stutter-free gliding to target elements.
 */
export function smoothScrollToElement(
	element: HTMLElement | null,
	duration = 650,
	onArrival?: () => void,
) {
	if (typeof window === "undefined" || !element) return;

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
		return;
	}

	let startTime: number | null = null;

	// easeOutQuint: 1 - Math.pow(1 - t, 5)
	function step(currentTime: number) {
		if (startTime === null) startTime = currentTime;
		const elapsed = currentTime - startTime;
		const progress = Math.min(elapsed / duration, 1);
		const ease = 1 - (1 - progress) ** 5;

		window.scrollTo(0, startY + distance * ease);

		if (progress < 1) {
			requestAnimationFrame(step);
		} else {
			onArrival?.();
		}
	}

	requestAnimationFrame(step);
}
