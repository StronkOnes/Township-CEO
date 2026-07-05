import { describe, it, expect } from 'vitest';

class CircuitBreaker {
  private trustScore: number;
  private threshold: number;
  private tripped: boolean;
  private lastCheckpoint: string | null;

  constructor(threshold = 0.4) {
    this.trustScore = 1.0;
    this.threshold = threshold;
    this.tripped = false;
    this.lastCheckpoint = null;
  }

  recordSuccess(factor = 0.05) {
    if (!this.tripped) {
      this.trustScore = Math.min(1.0, this.trustScore + factor);
    }
  }

  recordFailure(factor = 0.2) {
    this.trustScore = Math.max(0, this.trustScore - factor);
    if (this.trustScore < this.threshold) {
      this.tripped = true;
    }
  }

  isTripped() { return this.tripped; }
  getScore() { return this.trustScore; }
  getThreshold() { return this.threshold; }

  saveCheckpoint(id: string) {
    this.lastCheckpoint = id;
  }

  rollback(): string | null {
    const cp = this.lastCheckpoint;
    this.lastCheckpoint = null;
    this.trustScore = Math.min(1.0, this.trustScore + 0.3);
    this.tripped = false;
    return cp;
  }
}

describe('Circuit Breaker', () => {
  it('starts with high trust score', () => {
    const cb = new CircuitBreaker();
    expect(cb.getScore()).toBe(1.0);
    expect(cb.isTripped()).toBe(false);
  });

  it('trips when trust drops below threshold', () => {
    const cb = new CircuitBreaker(0.4);
    cb.recordFailure(0.4);
    cb.recordFailure(0.3);
    expect(cb.isTripped()).toBe(true);
    expect(cb.getScore()).toBeLessThan(0.4);
  });

  it('allows rollback after trip', () => {
    const cb = new CircuitBreaker(0.4);
    cb.saveCheckpoint('cp_001');
    cb.recordFailure(0.5);
    cb.recordFailure(0.3);
    expect(cb.isTripped()).toBe(true);

    const checkpoint = cb.rollback();
    expect(checkpoint).toBe('cp_001');
    expect(cb.isTripped()).toBe(false);
    expect(cb.getScore()).toBeGreaterThan(0.4);
  });

  it('accumulates successes to improve score', () => {
    const cb = new CircuitBreaker(0.4);
    const initial = cb.getScore();
    cb.recordFailure(0.2);
    expect(cb.getScore()).toBeLessThan(initial);

    const afterFailure = cb.getScore();
    cb.recordSuccess(0.1);
    expect(cb.getScore()).toBeGreaterThan(afterFailure);
  });

  it('does not recover once tripped without explicit rollback', () => {
    const cb = new CircuitBreaker(0.4);
    cb.recordFailure(0.6);
    cb.recordFailure(0.3);
    expect(cb.isTripped()).toBe(true);

    cb.recordSuccess(0.5);
    expect(cb.isTripped()).toBe(true);
  });

  it('handles multiple checkpoints', () => {
    const cb = new CircuitBreaker(0.4);
    cb.saveCheckpoint('cp_001');
    cb.saveCheckpoint('cp_002');
    cb.recordFailure(0.7);
    expect(cb.isTripped()).toBe(true);

    const cp = cb.rollback();
    expect(cp).toBe('cp_002');
  });
});
