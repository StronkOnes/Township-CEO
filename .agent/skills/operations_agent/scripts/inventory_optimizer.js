export function inventoryOptimizer({ topSellingItems, leadTimeDays, dailySalesRate, safetyStockDays }) {
  const safetyStock = dailySalesRate * safetyStockDays;
  const reorderPoint = dailySalesRate * leadTimeDays + safetyStock;
  const optimalOrder = reorderPoint * 2;
  return {
    reorderPoint: Math.round(reorderPoint),
    optimalOrderQuantity: Math.round(optimalOrder),
    safetyStock: Math.round(safetyStock),
    suggestedReviewCycle: leadTimeDays <= 2 ? 'weekly' : 'biweekly',
    recommendations: [
      `Set reorder alert at ${Math.round(reorderPoint)} units`,
      `Order ${Math.round(optimalOrder)} units when reorder point is hit`,
      `Keep ${Math.round(safetyStock)} units as emergency buffer`
    ]
  };
}
