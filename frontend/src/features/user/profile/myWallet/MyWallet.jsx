import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  Clock,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { api } from "../../../../api/axiosInstance";
import Pagination from "../../../../components/common/Pagination";
const MyWallet = () => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 3;

  const {
    data: walletData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["myWallet"],
    queryFn: async () => {
      const [balanceRes, historyRes] = await Promise.all([
        api.get("/wallet/balance"),
        api.get("/wallet/history"),
      ]);
      console.log(balanceRes, historyRes);
      return {
        balance: balanceRes.data.balance,
        transactions: historyRes.data.transactions,
      };
    },
  });

  const balance = walletData?.balance || 0;
  const allTransactions = walletData?.transactions || [];

  const totalPages = Math.max(
    1,
    Math.ceil(allTransactions.length / itemsPerPage),
  );
  const currentTransactions = allTransactions.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const paginationData = {
    pagination: {
      currentPage: page,
      totalPages: totalPages,
    },
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 md:p-6 lg:p-8 animate-pulse">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded-lg w-64 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-96 max-w-full"></div>
        </div>

        <div className="bg-gray-50 rounded-3xl p-6 md:p-10 mb-10 border border-gray-100">
          <div className="w-32 h-4 bg-gray-200 rounded mb-4 mt-2"></div>
          <div className="w-64 h-14 md:h-16 bg-gray-200 rounded-xl"></div>

          <div className="mt-10 flex flex-wrap gap-4">
            <div className="w-40 h-10 bg-gray-200 rounded-2xl"></div>
            <div className="w-48 h-10 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm pt-6 pl-6 pr-6 pb-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </div>

          <div className="space-y-4">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-2xl border border-gray-50"
              >
                <div className="flex items-center gap-4 md:gap-5">
                  <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0"></div>

                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32 md:w-48"></div>

                    <div className="h-3 bg-gray-100 rounded w-24"></div>
                  </div>
                </div>

                <div className="h-6 bg-gray-200 rounded w-16 md:w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <Wallet size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900">
          Failed to load wallet
        </h3>
        <p className="text-gray-500 mt-2 mb-6">
          We couldn't retrieve your wallet details at the moment.
        </p>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-full font-semibold hover:bg-emerald-600 transition-colors"
        >
          <RefreshCw size={18} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Wallet className="text-emerald-500" size={32} />
          My BinIt Wallet
        </h2>
        <p className="text-gray-500 mt-2">
          Manage your earnings, refunds, and pay quickly on your next request.
        </p>
      </div>

      <div className="bg-linear-to-br from-emerald-500 to-emerald-700 rounded-3xl p-6 md:p-10 text-white shadow-xl shadow-emerald-200 relative overflow-hidden mb-10">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl mix-blend-overlay pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-300 opacity-20 rounded-full blur-3xl mix-blend-overlay pointer-events-none"></div>

        <div className="relative z-10">
          <p className="text-emerald-100 font-medium mb-1 tracking-wide flex items-center gap-2">
            Available Balance
          </p>
          <div className="flex items-end gap-2 mt-2">
            <span className="text-4xl md:text-6xl font-black tracking-tight">
              ₹
              {balance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-3 text-sm font-medium border border-white/10">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowDownLeft size={16} />
              </div>
              Earned from Scrap
            </div>
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-3 text-sm font-medium border border-white/10">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowUpRight size={16} />
              </div>
              Used for Store Orders
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm pt-6 pl-6 pr-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 px-6 md:px-0">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <History className="text-gray-400" size={24} />
            Transaction History
          </h3>
        </div>

        {allTransactions.length === 0 ? (
          <div className="py-12 text-center text-gray-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
              <History size={24} className="text-gray-300" />
            </div>
            <p className="text-lg font-medium text-gray-700">
              No transactions yet
            </p>
            <p className="text-sm mt-1">
              When you sell scrap or use wallet for orders, they will appear
              here.
            </p>
          </div>
        ) : (
          <div className="space-y-4 px-6 md:px-0">
            {currentTransactions.map((tx) => {
              const isCredit = tx.type === "CREDIT";

              return (
                <div
                  key={tx._id}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                >
                  <div className="flex items-center gap-4 md:gap-5">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isCredit ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft size={24} strokeWidth={2.5} />
                      ) : (
                        <ArrowUpRight size={24} strokeWidth={2.5} />
                      )}
                    </div>

                    <div>
                      <p className="font-bold text-gray-900 text-sm md:text-base capitalize">
                        {tx.description ||
                          tx.transactionReason?.replace(/_/g, " ") ||
                          "Wallet Transaction"}
                      </p>

                      <div className="flex items-center gap-3 mt-1 text-xs md:text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {tx.orderId && typeof tx.orderId === "string" && (
                          <span className="hidden md:inline-block px-2 py-0.5 bg-gray-100 rounded-md text-[10px] font-bold tracking-wider uppercase">
                            Order #{tx.orderId.substring(0, 6)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`text-right font-black md:text-lg ${isCredit ? "text-emerald-600" : "text-gray-900"}`}
                  >
                    {isCredit ? "+" : "-"} ₹{tx.amount.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {allTransactions.length > 0 && (
          <div>
            <Pagination data={paginationData} setPage={setPage} page={page} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyWallet;
