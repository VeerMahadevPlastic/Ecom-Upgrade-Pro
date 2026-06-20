import { Product } from "@workspace/api-client-react";

export interface PricingTierResult {
  pricePerPiece: number;
  totalAmount: number;
  discountPercentage: number;
  cartonCount: number;
}

export function calculatePricing(product: Product, quantityPcs: number): PricingTierResult {
  const cartons = quantityPcs / product.packingQty;
  const isFullCarton = cartons >= 1 && Number.isInteger(cartons);
  
  let pricePerPiece = product.pieceRate;
  
  if (isFullCarton) {
    pricePerPiece = product.boxRate / product.packingQty;
  }
  
  let totalAmount = pricePerPiece * quantityPcs;
  let discountPercentage = 0;
  
  if (cartons >= 25) {
    discountPercentage = 5;
    totalAmount = totalAmount * 0.95;
  } else if (cartons >= 10) {
    discountPercentage = 3;
    totalAmount = totalAmount * 0.97;
  }
  
  return {
    pricePerPiece,
    totalAmount,
    discountPercentage,
    cartonCount: cartons
  };
}

export function calculateCartTotal(items: { product: Product, quantity: number }[]): number {
  return items.reduce((total, item) => {
    return total + calculatePricing(item.product, item.quantity).totalAmount;
  }, 0);
}
