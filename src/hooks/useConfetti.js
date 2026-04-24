import { useCallback } from 'react';
import confetti from 'canvas-confetti';

export function useConfetti() {
  const fire = useCallback((options = {}) => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F5A623', '#4A9EFF', '#22C55E', '#EC4899', '#A855F7'],
      ...options,
    });
  }, []);

  const fireCannon = useCallback(() => {
    const end = Date.now() + 1200;
    const interval = setInterval(() => {
      if (Date.now() > end) { clearInterval(interval); return; }
      confetti({
        particleCount: 30,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors: ['#F5A623', '#4A9EFF', '#22C55E'],
      });
      confetti({
        particleCount: 30,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors: ['#F5A623', '#EC4899', '#A855F7'],
      });
    }, 100);
  }, []);

  const fireFullHouse = useCallback(() => {
    fireCannon();
    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 180,
        origin: { y: 0.4 },
        startVelocity: 35,
        gravity: 0.8,
        colors: ['#F5A623', '#FFD166', '#F5A623'],
      });
    }, 500);
  }, [fireCannon]);

  return { fire, fireCannon, fireFullHouse };
}
