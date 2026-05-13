/**
 * pricingHelper.js
 * Core tier pricing logic — used in both order controller (priceAtPurchase)
 * and can be reused in product detail (live preview).
 *
 * priceTiers: [{ minQty: Number, price: Number }]  — must be sorted ascending
 */

export const getPriceForQty = (priceTiers, qty) => {
  let applicable = priceTiers[0];
  for (const tier of priceTiers) {
    if (qty >= tier.minQty) applicable = tier;
  }
  return applicable.price;
};

export const getNextTier = (priceTiers, qty) => {
  for (const tier of priceTiers) {
    if (qty < tier.minQty) return tier;
  }
  return null; // already at best tier
};

export const calcSavings = (priceTiers, qty) => {
  const basePrice   = priceTiers[0].price;
  const currentPrice = getPriceForQty(priceTiers, qty);
  return (basePrice - currentPrice) * qty;
};
