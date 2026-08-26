import confetti from 'canvas-confetti';

/**
 * Triggers a pleasant celebratory burst of particles when a habit, streak, or milestone is completed.
 */
export function triggerCelebration(type: 'subtle' | 'medium' | 'major' = 'subtle') {
  try {
    if (type === 'subtle') {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#10B981', '#3B82F6', '#6366F1', '#EC4899', '#F59E0B'],
        disableForReducedMotion: true,
      });
    } else if (type === 'medium') {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#10B981', '#3B82F6', '#6366F1', '#EC4899', '#F59E0B'],
        disableForReducedMotion: true,
      });
    } else {
      // Major milestone / program complete
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  } catch (e) {
    // Graceful fallback if canvas is not supported
  }
}

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

/**
 * Simulated light haptic feedback vibration for mobile feel
 */
export function triggerHaptic(type: 'light' | 'medium' | 'success' = 'light') {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (type === 'light') navigator.vibrate(10);
      else if (type === 'medium') navigator.vibrate(25);
      else if (type === 'success') navigator.vibrate([15, 30, 20]);
    } catch (e) {
      // Ignore vibration errors
    }
  }
}
