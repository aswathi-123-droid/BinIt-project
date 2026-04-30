export const calculateOfferPrice = (originalPrice, offer) => {
  if (!offer || !offer.isActive || new Date(offer.expiryDate) < new Date()) {
    return originalPrice; 
  }

  let discountedPrice = originalPrice;
  if (offer.discountType === 'flat') {
    discountedPrice -= offer.value;
  } else if (offer.discountType === 'percent') {
    const discountAmount = originalPrice * (offer.value / 100);
    if (offer.maxRedeemableAmount > 0) {
      discountedPrice -= Math.min(discountAmount, offer.maxRedeemableAmount);
    } else {
      discountedPrice -= discountAmount;
    }
  }

  return Math.max(0, discountedPrice); 
};


export const calculateBestDiscount = (totalPrice, productOffer, categoryOffer,quantity=1) => {
    const getDiscount = (price, offer) => {
      if (!offer || !offer.isActive || new Date(offer.expiryDate) < new Date()) return 0;
      if (offer.discountType === 'flat') return offer.value *quantity;
      if (offer.discountType === 'percent') {
        let discount = price * (offer.value / 100);
        return offer.maxRedeemableAmount > 0 ? Math.min(discount, offer.maxRedeemableAmount) : discount;
      }
      return 0;
    };
    return Math.max(getDiscount(totalPrice, productOffer), getDiscount(totalPrice, categoryOffer));
  };
