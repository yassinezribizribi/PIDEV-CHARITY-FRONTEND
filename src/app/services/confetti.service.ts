import { Injectable } from '@angular/core';
import confetti from 'canvas-confetti';

@Injectable({
  providedIn: 'root'
})
export class ConfettiService {
  private duration = 3000; // 3 seconds

  triggerBasicConfetti() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  triggerCelebration() {
    const end = Date.now() + this.duration;
    const colors = ['#ffd700', '#4CAF50', '#2196F3'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: colors
      });

      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());

    // Final burst
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: colors,
        shapes: ['circle', 'square', 'star']
      });
    }, this.duration - 500);
  }

  triggerAchievement() {
    const colors = ['#ffd700', '#ffc107', '#ff9800'];
    
    // Initial burst from bottom
    confetti({
      particleCount: 80,
      startVelocity: 30,
      spread: 360,
      origin: { x: 0.5, y: 1 },
      colors: colors,
      shapes: ['star']
    });

    // Delayed side bursts
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: colors
      });

      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: colors
      });
    }, 750);
  }

  triggerTierUpgrade() {
    const colors = ['#ffd700', '#ff9800', '#f44336'];
    const end = Date.now() + this.duration;

    // Continuous side streams
    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: colors,
        shapes: ['circle', 'square']
      });

      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: colors,
        shapes: ['circle', 'square']
      });

      // Golden stars from bottom
      confetti({
        particleCount: 2,
        angle: 90,
        spread: 45,
        origin: { x: 0.5, y: 1 },
        colors: ['#ffd700'],
        shapes: ['star']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());

    // Final celebratory burst
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: colors,
        shapes: ['star', 'circle', 'square'],
        ticks: 200
      });
    }, this.duration - 500);
  }
} 