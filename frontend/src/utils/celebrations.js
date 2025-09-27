// src/utils/celebrations.js
import confetti from "canvas-confetti";

function originFromElement(el) {
  const rect = el?.getBoundingClientRect?.();
  if (!rect) return { x: 0.5, y: 0.5 };
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;
  return { x, y };
}

/**
 * Playful, localized "poof" for marking a habit as done today.
 * Call: celebrateDoneToday({ triggerEl: e.currentTarget })
 */
export function celebrateDoneToday({ triggerEl } = {}) {
  const origin = originFromElement(triggerEl);
  const base = {
    zIndex: 9999,
    disableForReducedMotion: true,
    origin,
  };

  confetti({
    ...base,
    particleCount: 28,
    spread: 58,
    startVelocity: 26,
    scalar: 0.85,
    ticks: 90,
    colors: ["#a78bfa", "#60a5fa", "#34d399", "#fbbf24"],
  });

  confetti({
    ...base,
    particleCount: 16,
    startVelocity: 20,
    spread: 70,
    scalar: 0.8,
    ticks: 100,
    shapes: ["emoji"],
    emojiSize: 18,
    emojis: ["✨", "✅", "💫"],
  });

  setTimeout(() => {
    confetti({
      ...base,
      particleCount: 18,
      spread: 40,
      startVelocity: 14,
      scalar: 0.75,
      ticks: 80,
      colors: ["#93c5fd", "#c4b5fd", "#6ee7b7"],
    });
  }, 120);
}

/**
 * Big, multi-stage celebration when a goal is achieved.
 * Call: celebrateGoalAchieved()
 */
export function celebrateGoalAchieved() {
  const base = {
    zIndex: 9999,
    disableForReducedMotion: true,
  };

  // Side streamers
  confetti({
    ...base,
    particleCount: 90,
    angle: 60,
    spread: 55,
    startVelocity: 55,
    origin: { x: 0, y: 0.6 },
    colors: ["#f472b6", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa"],
    scalar: 1.1,
    ticks: 160,
  });
  confetti({
    ...base,
    particleCount: 90,
    angle: 120,
    spread: 55,
    startVelocity: 55,
    origin: { x: 1, y: 0.6 },
    colors: ["#f472b6", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa"],
    scalar: 1.1,
    ticks: 160,
  });

  // Center burst
  setTimeout(() => {
    confetti({
      ...base,
      particleCount: 220,
      spread: 100,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.4 },
      scalar: 1.2,
      ticks: 170,
    });
  }, 240);

  // Starfall + emojis
  setTimeout(() => {
    confetti({
      ...base,
      particleCount: 60,
      spread: 80,
      startVelocity: 20,
      origin: { x: 0.5, y: 0.2 },
      scalar: 1.2,
      ticks: 220,
      shapes: ["star"],
      colors: ["#fcd34d", "#fde68a", "#f59e0b"],
    });

    confetti({
      ...base,
      particleCount: 40,
      spread: 80,
      startVelocity: 15,
      origin: { x: 0.5, y: 0.2 },
      ticks: 220,
      shapes: ["emoji"],
      emojis: ["🏆", "🎉", "✨", "⭐️"],
      emojiSize: 24,
    });
  }, 480);
}