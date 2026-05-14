// src/utils/pricingHelper.js
// Pure functions — same logic as backend/utils/pricingHelper.js
// Used in CartContext, Browse, ProductDetail, Cart

export const getPriceForQty = (priceTiers = [], qty) => {
  let applicable = priceTiers[0];
  for (const tier of priceTiers) {
    if (qty >= tier.minQty) applicable = tier;
  }
  return applicable?.price ?? 0;
};

export const getNextTier = (priceTiers = [], qty) => {
  for (const tier of priceTiers) {
    if (qty < tier.minQty) return tier;
  }
  return null;
};

export const calcLineTotal = (priceTiers, qty) =>
  getPriceForQty(priceTiers, qty) * qty;
