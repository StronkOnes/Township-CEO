export function cashCalculator(revenue, expenses) {
  const margin = revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0;
  const dailyBreakEven = expenses / 30;
  const surplus = revenue - expenses;
  const dailyFixedCosts = expenses * 0.3 / 30;
  const costOfSales = expenses * 0.7;
  return {
    profitMargin: margin,
    dailyBreakEven,
    monthlySurplus: surplus,
    dailyFixedCosts,
    costOfSales,
    marginStatus: margin < 25 ? 'critical' : margin < 35 ? 'warning' : 'healthy',
    runwayDays: expenses > 0 ? Math.round((revenue / expenses) * 30) : Infinity
  };
}
