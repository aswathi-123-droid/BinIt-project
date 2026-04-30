import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Wallet,
  CreditCard,
  Banknote,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { api } from "../../../../api/axiosInstance";
import toast from "react-hot-toast";

const CheckoutPayment = ({ onBack, onConfirm }) => {
  const [paymentMethod, setPaymentMethod] = useState("Razorpay");
  const [useWallet, setUseWallet] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await api.get("/cart");
      return res.data;
    },
  });

  const { data: walletData } = useQuery({
    queryKey: ["walletInfo"],
    queryFn: async () => {
      const res = await api.get("/wallet/balance");
      return res.data;
    },
  });

  const walletBalance = walletData?.balance || 0;

  const summary = data?.summary || {
    subtotal: 0,
    earnings: 0,
    platformFee: 0,
    totalAmount: 0,
    couponDiscount: 0,
  };

  const isPayout = summary?.totalAmount <= 0;
  const originalDisplayAmount = Math.abs(summary?.totalAmount || 0);

  let amountStillOwed = originalDisplayAmount;
  let walletMoneyUsed = 0;

  if (useWallet && !isPayout) {
    if (walletBalance >= amountStillOwed) {
      walletMoneyUsed = amountStillOwed;
      amountStillOwed = 0;
    } else {
      walletMoneyUsed = walletBalance;
      amountStillOwed -= walletBalance;
    }
  }

  const hasPickupItems =
    data?.cart?.items?.some(
      (item) =>
        item.productId?.type === "recyclable" ||
        item.productId?.type === "junk",
    ) || false;

  const isCodDisabled = hasPickupItems || useWallet;

  useEffect(() => {
    if (isPayout) {
      setPaymentMethod("Wallet");
      setUseWallet(false);
    } else {
      setPaymentMethod("Razorpay");
    }
  }, [isPayout]);

  const handleRazorpayPayment = async (orderPayload) => {
    try {
      const orderResponse = await api.post("/order/create-razorpay-order", {
        amount: amountStillOwed,
      });

      const {
        id: razorpayOrderId,
        currency,
        amount,
      } = orderResponse.data.razorpayOrder;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: "BinIt Project",
        description: "Scrap & Store Checkout",
        order_id: razorpayOrderId,

        handler: async function (response) {
          try {
            const verifyResponse = await api.post("/order/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResponse.data.result.verified) {
              toast.success("Payment Verified! Placing your order...");
              const finalPayload = {
                ...orderPayload,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
              };
              if (onConfirm) onConfirm(finalPayload);
            }
          } catch (verifyError) {
            console.error("Signature verification failed!", verifyError);
            toast.error("Payment verification failed! Please contact support.");
          }
        },
        prefill: {
          name: "User Customer",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#10b981",
        },
      };

      const razorpayPopup = new window.Razorpay(options);

      razorpayPopup.on("payment.failed", function (response) {
        toast.error(`Payment Failed: ${response.error.description}`);
      });

      razorpayPopup.open();
    } catch (error) {
      console.error("Error starting Razorpay checkout:", error);
      toast.error("Failed to initialize payment gateway. Please try again.");
    }
  };

  const handleConfirmOrder = () => {
    if (!paymentMethod && !isPayout) {
      toast.error("Please select a payment method");
      return;
    }

    const orderPayload = {
      paymentMethod: isPayout ? "Wallet" : paymentMethod,
      useWallet: isPayout ? false : useWallet,
      couponCode,
      isPayout,
      totalAmount: summary.totalAmount,
    };

    if (!isPayout && paymentMethod === "Razorpay") {
      if (useWallet && amountStillOwed === 0) {
        toast.success("Paid fully using Wallet!");
        if (onConfirm) onConfirm(orderPayload);
      } else {
        handleRazorpayPayment(orderPayload);
      }
    } else {
      if (onConfirm) {
        onConfirm(orderPayload);
      } else {
        toast.success(
          isPayout
            ? "Pickup Scheduled Successfully!"
            : "Order Placed Successfully!",
        );
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Step 3: Finalize & {isPayout ? "Confirm Pickup" : "Pay"}
        </h2>
        <p className="text-gray-500 mt-1">
          {isPayout
            ? "Review your estimated earnings and confirm your pickup request."
            : "Review your order details and select a payment method."}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="grow space-y-6">
          <h3 className="text-lg font-bold text-gray-800">
            {isPayout ? "Payout Destination" : "Choose Payment Method"}
          </h3>

          {isPayout ? (
            <div className="p-6 rounded-2xl border-2 border-emerald-500 bg-emerald-50 flex items-start gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="font-bold text-emerald-900 text-lg">
                  Direct Credit to BinIt Wallet
                </p>
                <p className="text-sm text-emerald-700 mt-1 leading-relaxed">
                  Your estimated earnings from recyclables exceed the service
                  fees. The final balance of{" "}
                  <strong>₹{originalDisplayAmount.toFixed(2)}</strong> will be
                  credited to your BinIt Wallet immediately after the pickup is
                  completed and verified.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600 bg-white w-fit px-3 py-1.5 rounded-full border border-emerald-200">
                  <Wallet size={14} /> Available Balance: ₹
                  {walletBalance.toFixed(2)}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div
                // onClick={() => setUseWallet(!useWallet)}
                onClick={() => {
                  const nextUseWallet = !useWallet;
                  setUseWallet(nextUseWallet);
                  if (nextUseWallet && paymentMethod === "COD") {
                    setPaymentMethod("Razorpay");
                  }
                }}
                className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                  useWallet
                    ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500/20"
                    : "border-gray-100 bg-white hover:border-emerald-200 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${useWallet ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"}`}
                  >
                    <Wallet size={24} />
                  </div>
                  <div>
                    <p
                      className={`font-bold text-lg ${useWallet ? "text-emerald-900" : "text-gray-900"}`}
                    >
                      BinIt Wallet
                    </p>
                    <p className="text-sm text-emerald-600 font-medium">
                      Balance: ₹{walletBalance.toFixed(2)} Check to use
                    </p>
                  </div>
                </div>
                <div
                  className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${useWallet ? "bg-emerald-500" : "bg-gray-200"}`}
                >
                  <div
                    className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${useWallet ? "translate-x-6" : "translate-x-0"}`}
                  />
                </div>
              </div>

              {amountStillOwed > 0 && (
                <div className="space-y-4">
                  <label
                    className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md ${paymentMethod === "Razorpay" ? "border-emerald-500 bg-white ring-1 ring-emerald-500" : "border-gray-100 bg-white hover:border-emerald-200"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <CreditCard size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">
                          Razorpay Secure
                        </p>
                        <p className="text-sm text-gray-500">
                          UPI, Credit/Debit Cards, Netbanking
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === "Razorpay" ? "border-emerald-500 bg-white ring-1 ring-emerald-500" : "border-gray-100 bg-white hover:border-emerald-200"}`}
                    >
                      {paymentMethod === "Razorpay" && (
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-in zoom-in" />
                      )}
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      value="Razorpay"
                      className="hidden"
                      checked={paymentMethod === "Razorpay"}
                      onChange={() => setPaymentMethod("Razorpay")}
                    />
                  </label>

                  <label
                    className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                      isCodDisabled
                        ? "border-gray-100 bg-gray-50 opacity-70 cursor-not-allowed"
                        : paymentMethod === "COD"
                          ? "border-emerald-500 bg-white ring-1 ring-emerald-500 cursor-pointer hover:shadow-md"
                          : "border-gray-100 bg-white hover:border-emerald-200 cursor-pointer hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${hasPickupItems ? "bg-gray-200 text-gray-400" : "bg-orange-50 text-orange-600"}`}
                      >
                        <Banknote size={24} />
                      </div>
                      <div>
                        <p
                          className={`font-bold text-lg ${hasPickupItems ? "text-gray-500" : "text-gray-900"}`}
                        >
                          Cash on Delivery
                        </p>
                        {hasPickupItems ? (
                          <p className="text-sm text-red-500 font-medium mt-0.5">
                            COD is not possible because pickup item there
                          </p>
                        ) : useWallet ? (
                          <p className="text-sm text-red-500 font-medium mt-0.5">
                            Not available when using Wallet balance
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500">
                            Pay cash at the time of delivery
                          </p>
                        )}
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isCodDisabled
                          ? "border-gray-300 bg-gray-100"
                          : paymentMethod === "COD"
                            ? "border-emerald-500"
                            : "border-gray-300"
                      }`}
                    >
                      {paymentMethod === "COD" && !isCodDisabled && (
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-in zoom-in" />
                      )}
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      className="hidden"
                      checked={paymentMethod === "COD" && !isCodDisabled}
                      disabled={isCodDisabled}
                      onChange={() => {
                        if (!isCodDisabled) setPaymentMethod("COD");
                      }}
                    />
                  </label>
                </div>
              )}
            </>
          )}
        </div>

        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Order Summary
            </h3>

            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Store Items</span>
                <span className="font-semibold text-gray-900">
                  ₹{summary.storeItems.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Pickup Services</span>
                <span className="font-semibold text-gray-900">
                  ₹{summary.pickupServices.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Subtotal (Service Fees)</span>
                <span className="font-semibold text-gray-900">
                  ₹{summary.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-600 bg-emerald-50 p-2 rounded-lg -mx-2">
                <span>Estimated Earnings (Recycling)</span>
                <span className="font-bold">
                  - ₹{summary.earnings.toFixed(2)}
                </span>
              </div>
              {summary.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount</span>
                  <span className="font-medium">
                    - ₹{summary.couponDiscount.toFixed(2)}
                  </span>
                </div>
              )}
              {summary.offerDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Offer Discount</span>
                  <span className="font-medium">
                    - ₹{summary.offerDiscount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 border-t border-dashed border-gray-200 pt-3 mt-2">
                <span>Platform Fee</span>
                <span className="font-semibold text-gray-900">
                  ₹{summary.platformFee.toFixed(2)}
                </span>
              </div>

              {useWallet && walletMoneyUsed > 0 && !isPayout && (
                <div className="flex justify-between text-blue-600 bg-blue-50 p-2 rounded-lg -mx-2 border border-blue-100">
                  <span className="flex items-center gap-1 font-medium">
                    <Wallet size={16} /> Wallet Applied
                  </span>
                  <span className="font-black">
                    - ₹{walletMoneyUsed.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200 mb-6">
              <div className="flex justify-between items-end">
                <span className="text-gray-900 font-bold text-lg mb-3.5">
                  {isPayout ? "Total Earnings" : "Total Amount Due"}
                </span>
                <div className="text-right">
                  <p
                    className={`text-2xl font-black ${isPayout ? "text-emerald-600" : "text-gray-800"}`}
                  >
                    ₹{amountStillOwed.toLocaleString()}.00
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {isPayout
                      ? "Amount will be added to your Wallet"
                      : "Inclusive of all taxes"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-between items-center pt-8 mt-12 border-t border-gray-100 gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold px-6 py-3.5 rounded-xl hover:bg-gray-100 transition-all w-full sm:w-auto justify-center"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <button
          onClick={handleConfirmOrder}
          className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all w-full sm:w-auto ${
            isPayout || paymentMethod
              ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 hover:shadow-emerald-300 transform hover:-translate-y-0.5 active:scale-95"
              : "bg-gray-300 cursor-not-allowed shadow-none"
          }`}
        >
          <CheckCircle2 size={20} />
          {isPayout
            ? "Confirm Order"
            : useWallet && amountStillOwed === 0
              ? "Pay using full Wallet"
              : paymentMethod === "Razorpay"
                ? "Pay Securely via Razorpay"
                : `Place Order and Pay`}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPayment;
