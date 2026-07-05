import { describe, it, expect } from 'vitest';

function cashCalculator(revenue: number, expenses: number) {
  const margin = revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0;
  const dailyBreakEven = expenses / 30;
  const surplus = revenue - expenses;
  return { profitMargin: margin, dailyBreakEven, monthlySurplus: surplus };
}

describe('cash_calculator tool', () => {
  it('calculates correct profit margin for profitable business', () => {
    const result = cashCalculator(10000, 6000);
    expect(result.profitMargin).toBe(40);
    expect(result.monthlySurplus).toBe(4000);
  });

  it('calculates correct daily break-even', () => {
    const result = cashCalculator(9000, 4500);
    expect(result.dailyBreakEven).toBe(150);
  });

  it('handles break-even scenario (zero profit)', () => {
    const result = cashCalculator(5000, 5000);
    expect(result.profitMargin).toBe(0);
    expect(result.monthlySurplus).toBe(0);
  });

  it('handles loss scenario', () => {
    const result = cashCalculator(3000, 5000);
    expect(result.profitMargin).toBeLessThan(0);
    expect(result.monthlySurplus).toBe(-2000);
  });

  it('handles zero revenue gracefully', () => {
    const result = cashCalculator(0, 1000);
    expect(result.profitMargin).toBe(0);
    expect(result.monthlySurplus).toBe(-1000);
  });
});
