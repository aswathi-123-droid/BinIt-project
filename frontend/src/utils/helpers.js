export const calculateOfferPrice = (originalPrice, offer) => {
  if (!offer || !offer.isActive || new Date(offer.expiryDate) < new Date()) {
    return originalPrice; // No active offer
  }

  let discountedPrice = originalPrice;
  if (offer.discountType === 'flat') {
    discountedPrice -= offer.value;
  } else if (offer.discountType === 'percent') {
    const discountAmount = originalPrice * (offer.value / 100);
    // If there is a max redeemable cap (e.g., Max ₹500 off)
    if (offer.maxRedeemableAmount > 0) {
      discountedPrice -= Math.min(discountAmount, offer.maxRedeemableAmount);
    } else {
      discountedPrice -= discountAmount;
    }
  }

  return Math.max(0, discountedPrice); // Prevent negative prices
};


export const calculateBestDiscount = (totalPrice, productOffer, categoryOffer,quantity=1) => {
    const getDiscount = (price, offer) => {
      if (!offer || !offer.isActive || new Date(offer.expiryDate) < new Date()) return 0;
      if (offer.minTransactionalValue && price < offer.minTransactionalValue) return 0;
      if (offer.discountType === 'flat') return offer.value *quantity;
      if (offer.discountType === 'percent') {
        let discount = price * (offer.value / 100);
        return offer.maxRedeemableAmount > 0 ? Math.min(discount, offer.maxRedeemableAmount) : discount;
      }
      return 0;
    };
    return Math.max(getDiscount(totalPrice, productOffer), getDiscount(totalPrice, categoryOffer));
  };
