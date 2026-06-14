import confetti from "canvas-confetti";

/** Fire a DBZ-themed confetti burst — gold, orange, red stars */
export function fireConfetti() {
  const colors = ["#ffc107", "#ff6f00", "#e53935", "#ffd54f", "#ff8f00"];

  // Main burst
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors,
    shapes: ["star", "circle"],
    scalar: 1.2,
  });

  // Side bursts for extra drama
  setTimeout(() => {
    confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors });
    confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors });
  }, 150);
}
