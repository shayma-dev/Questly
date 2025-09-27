import confetti from "canvas-confetti";

/**
 * Fire a celebratory, full-viewport confetti burst.
 * Uses document body; no canvas mounting required.
 */
export function celebrateFullScreen() {
  const defaults = {
    spread: 90,
    startVelocity: 45,
    scalar: 1.1,
    ticks: 150,
    zIndex: 9999,
  };

  // Left burst
  confetti({
    ...defaults,
    particleCount: 140,
    origin: { x: 0.1, y: 0.2 },
  });

  // Right burst
  confetti({
    ...defaults,
    particleCount: 140,
    origin: { x: 0.9, y: 0.2 },
  });

  // Bottom fountain
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 120,
      angle: 90,
      spread: 120,
      origin: { x: 0.5, y: 0.9 },
    });
  }, 180);
}