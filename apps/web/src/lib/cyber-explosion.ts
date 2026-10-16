// Zero-dependency Low-Latency Particle Spark Engine
// Renders to a lightweight, temporary full-viewport canvas with hardware-accelerated RAF.
// Strictly themed to the Monochrome Smoked-Glass (Obsidian & Alabaster) palette.

const MONOCHROME_SPARK_PALETTE = [
	"#EDEDEF", // Soft Alabaster
	"#FFFFFF", // Pure Specular Spark
	"#D4D4D8", // Light Zinc 300
	"#A1A1AA", // Pewter Zinc 400
	"#71717A", // Slate Pewter 500
];

interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
	color: string;
	alpha: number;
	rotation: number;
	rotationSpeed: number;
	shape: "square" | "shard" | "diamond" | "spark";
	drag: number;
	gravity: number;
	life: number;
	maxLife: number;
}

let activeCanvas: HTMLCanvasElement | null = null;
let activeCtx: CanvasRenderingContext2D | null = null;
const particles: Particle[] = [];
let animFrameId: number | null = null;

function ensureCanvas(): {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
} | null {
	if (typeof window === "undefined") return null;

	if (!activeCanvas) {
		const canvas = document.createElement("canvas");
		canvas.style.position = "fixed";
		canvas.style.inset = "0";
		canvas.style.width = "100vw";
		canvas.style.height = "100vh";
		canvas.style.pointerEvents = "none";
		canvas.style.zIndex = "99999";
		document.body.appendChild(canvas);
		activeCanvas = canvas;
	}

	const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
	const width = window.innerWidth;
	const height = window.innerHeight;

	const targetW = Math.round(width * dpr);
	const targetH = Math.round(height * dpr);

	if (activeCanvas.width !== targetW || activeCanvas.height !== targetH) {
		activeCanvas.width = targetW;
		activeCanvas.height = targetH;
	}

	if (!activeCtx) {
		activeCtx = activeCanvas.getContext("2d");
	}

	return activeCtx ? { canvas: activeCanvas, ctx: activeCtx } : null;
}

function renderFrame() {
	if (!activeCtx || !activeCanvas) return;

	const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
	activeCtx.save();
	activeCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
	activeCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

	for (let i = particles.length - 1; i >= 0; i--) {
		const p = particles[i];
		p.life++;
		p.x += p.vx;
		p.y += p.vy;
		p.vx *= p.drag;
		p.vy = p.vy * p.drag + p.gravity;
		p.rotation += p.rotationSpeed;
		p.alpha = Math.max(0, 1 - p.life / p.maxLife);

		if (p.alpha <= 0 || p.life >= p.maxLife) {
			particles.splice(i, 1);
			continue;
		}

		activeCtx.save();
		activeCtx.translate(p.x, p.y);
		activeCtx.rotate(p.rotation);
		activeCtx.globalAlpha = p.alpha;
		activeCtx.fillStyle = p.color;

		const half = p.size / 2;

		switch (p.shape) {
			case "diamond":
				activeCtx.beginPath();
				activeCtx.moveTo(0, -p.size);
				activeCtx.lineTo(half, 0);
				activeCtx.lineTo(0, p.size);
				activeCtx.lineTo(-half, 0);
				activeCtx.closePath();
				activeCtx.fill();
				break;

			case "shard":
				activeCtx.beginPath();
				activeCtx.moveTo(-half / 2, -p.size * 1.2);
				activeCtx.lineTo(half / 2, -p.size * 1.2);
				activeCtx.lineTo(half, p.size * 1.2);
				activeCtx.lineTo(-half, p.size * 1.2);
				activeCtx.closePath();
				activeCtx.fill();
				break;

			case "spark":
				activeCtx.beginPath();
				activeCtx.arc(0, 0, half, 0, Math.PI * 2);
				activeCtx.fill();
				break;

			default:
				activeCtx.fillRect(-half, -half, p.size, p.size);
				break;
		}

		activeCtx.restore();
	}

	activeCtx.restore();

	if (particles.length > 0) {
		animFrameId = requestAnimationFrame(renderFrame);
	} else {
		animFrameId = null;
		if (activeCanvas?.parentNode) {
			activeCanvas.parentNode.removeChild(activeCanvas);
			activeCanvas = null;
			activeCtx = null;
		}
	}
}

const MAX_PARTICLES = 60;

/**
 * Triggers a crisp, low-latency monochrome spark explosion originating from the center of target element.
 * Snappy 450ms decay feels instantaneous and responsive.
 */
export function triggerCyberExplosion(
	target: HTMLElement | MouseEvent | { clientX: number; clientY: number },
) {
	if (typeof window === "undefined") return;

	// Respect system reduced-motion preferences
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		return;
	}

	const bundle = ensureCanvas();
	if (!bundle) return;

	let originX = window.innerWidth / 2;
	let originY = window.innerHeight / 2;

	if (
		"getBoundingClientRect" in target &&
		typeof target.getBoundingClientRect === "function"
	) {
		const rect = target.getBoundingClientRect();
		originX = rect.left + rect.width / 2;
		originY = rect.top + rect.height / 2;
	} else if ("clientX" in target && "clientY" in target) {
		originX = target.clientX;
		originY = target.clientY;
	}

	// Evict oldest particles if approaching upper threshold during rapid clicks
	if (particles.length > MAX_PARTICLES - 24) {
		particles.splice(0, particles.length - (MAX_PARTICLES - 24));
	}

	// 1. Core High-Velocity Radial Spark Shards (snappy alabaster blast, ~400ms decay)
	const coreParticleCount = 14;
	for (let i = 0; i < coreParticleCount; i++) {
		const angle =
			(i / coreParticleCount) * (Math.PI * 2) + (Math.random() * 0.2 - 0.1);
		const speed = 6 + Math.random() * 7;
		const color =
			MONOCHROME_SPARK_PALETTE[
				Math.floor(Math.random() * MONOCHROME_SPARK_PALETTE.length)
			];
		const shapes: Particle["shape"][] = ["shard", "diamond", "square"];

		particles.push({
			x: originX,
			y: originY,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			size: 2 + Math.random() * 2.5,
			color,
			alpha: 1,
			rotation: Math.random() * Math.PI * 2,
			rotationSpeed: (Math.random() - 0.5) * 0.35,
			shape: shapes[Math.floor(Math.random() * shapes.length)],
			drag: 0.9,
			gravity: 0.14,
			life: 0,
			maxLife: 22 + Math.floor(Math.random() * 8), // ~350-450ms at 60fps
		});
	}

	// 2. Micro Spark Embers (fast, subtle specular sparks)
	const sparkCount = 10;
	for (let i = 0; i < sparkCount; i++) {
		const angle = Math.random() * Math.PI * 2;
		const speed = 4 + Math.random() * 6;
		const color = Math.random() > 0.4 ? "#EDEDEF" : "#A1A1AA";

		particles.push({
			x: originX,
			y: originY,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			size: 1.2 + Math.random() * 1.4,
			color,
			alpha: 1,
			rotation: 0,
			rotationSpeed: 0,
			shape: "spark",
			drag: 0.92,
			gravity: 0.08,
			life: 0,
			maxLife: 18 + Math.floor(Math.random() * 8),
		});
	}

	if (!animFrameId) {
		animFrameId = requestAnimationFrame(renderFrame);
	}
}
