import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Tag,
  Search,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import toast from "react-hot-toast";
import { api } from "../../../api/axiosInstance";
import Pagination from "../../../components/common/Pagination";

function AdminDashboard() {
  const [filterType, setFilterType] = useState("daily");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["sales-report", filterType, startDate, endDate],
    queryFn: async () => {
      const params = { filterType };
      if (filterType === "custom") {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      const res = await api.get("/admin/reports/sales", { params });
      return res.data.data;
    },
  });

  const handleDownloadPDF = () => {
    if (!reportData?.orders?.length) {
      toast.error("No data to download");
      return;
    }
    const doc = new jsPDF();
    doc.text("Sales Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Filter: ${filterType.toUpperCase()}`, 14, 22);

    const tableData = reportData.orders.map((order) => [
      order.orderId,
      new Date(order.createdAt).toLocaleDateString(),
      order.userId?.name || "Unknown",
      order.pricing.storeItems>0 ? order.status : "N/A",
      order.pickupTimeSlot ? order.pickupStatus : "N/A",
      `Rs ${order.pricing?.totalAmount || 0}`,
      `Rs ${order.pricing?.couponDiscount || 0}`,
    ]);

    doc.autoTable({
      startY: 28,
      head: [["Order ID", "Date", "Customer", "Product Status","Pickup Status", "Amount", "Discount"]],
      body: tableData,
    });

    doc.save(`sales_report_${filterType}.pdf`);
  };

  const handleDownloadExcel = () => {
    if (!reportData?.orders?.length) {
      toast.error("No data to download");
      return;
    }
    const headers = [
      "Order ID",
      "Date",
      "Customer",
      "Product Status",
      "Pickup Status",
      "Total Amount",
      "Coupon Discount",
    ];

    const rows = reportData.orders.map((order) => {
      const escapeCSV = (value) => {
        if (value === null || value === undefined) return '""';
        const stringValue = String(value);
        if (stringValue.includes(",")) {
          return `"${stringValue}"`;
        }
        return stringValue;
      };

      return [
        escapeCSV(order.orderId),
        escapeCSV(new Date(order.createdAt).toLocaleDateString()),
        escapeCSV(order.userId?.name || "Unknown"),
        escapeCSV(order.pricing.storeItems>0 ? order.status : "N/A"),
        escapeCSV(order.pickupTimeSlot ? order.pickupStatus : "N/A"),
        escapeCSV(order.pricing?.totalAmount || 0),
        escapeCSV(order.pricing?.couponDiscount || 0),
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((e) => e.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sales_report_${filterType}.csv`;
    link.click();
  };

  const summary = reportData?.summary || {
    totalOrders: 0,
    totalAmount: 0,
    totalCouponDiscount: 0,
    totalOfferDiscount: 0,
  };

  const totalOrdersCount = reportData?.orders?.length || 0;
  const totalPages = Math.ceil(totalOrdersCount / rowsPerPage);
  console.log("Orders count:", totalOrdersCount, "| Total Pages:", totalPages);
  const startIndex = (page - 1) * rowsPerPage;

  const paginatedOrders =
    reportData?.orders?.slice(startIndex, startIndex + rowsPerPage) || [];

  const fakePaginationData = {
    pagination: {
      currentPage: page,
      totalPages: totalPages === 0 ? 1 : totalPages,
    },
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sales Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of your sales and reports
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-slate-700 rounded-lg shadow-sm hover:bg-gray-50 transition"
          >
            <FileText size={18} className="text-red-500" />
            PDF Report
          </button>

          <button
            onClick={handleDownloadExcel}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-slate-700 rounded-lg shadow-sm hover:bg-gray-50 transition"
          >
            <Download size={18} className="text-red-500" />
            CSV Report
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Date Range
          </label>
          <select
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(1);
            }}
          >
            <option value="daily">Today</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
            <option value="yearly">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {filterType === "custom" && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Start Date
              </label>
              <input
                type="date"
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                End Date
              </label>
              <input
                type="date"
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button
              onClick={() => setPage(1)}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg shadow-sm hover:bg-slate-700 transition flex items-center gap-2"
            >
              <Search size={16} /> Filter
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <TrendingUp size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
              Product Orders
            </p>
            <h3 className="text-xl lg:text-2xl font-bold text-slate-800 truncate">
              {summary.totalStoreOrders || 0}
            </h3>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <Calendar size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
              Scrap Pickups
            </p>
            <h3 className="text-xl lg:text-2xl font-bold text-slate-800 truncate">
              {summary.totalPickupsCount || 0}
            </h3>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <DollarSign size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
              Total Revenue
            </p>
            <h3 className="text-xl lg:text-2xl font-bold text-slate-800 truncate">
              ₹{summary.totalAmount?.toFixed(2) || 0}
            </h3>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl shrink-0">
            <Tag size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
              Discounts
            </p>
            <h3 className="text-xl lg:text-2xl font-bold text-slate-800 truncate">
              ₹{summary.totalCouponDiscount?.toFixed(2) || 0}
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-800">
            Recent Sales Data
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs">Order ID</th>
                <th className="px-6 py-4 font-semibold text-xs">Date</th>
                <th className="px-6 py-4 font-semibold text-xs">Customer</th>
                <th className="px-6 py-4 font-semibold text-xs">Amount</th>
                <th className="px-6 py-4 font-semibold text-xs text-center  bg-gray-100/50">
                  Product Status
                </th>
                <th className="px-6 py-4 font-semibold text-xs text-center bg-gray-100/50">
                  Pickup Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : reportData?.orders?.length > 0 ? (
                paginatedOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {order.orderId}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {order.userId?.name || "Guest"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">
                      ₹{order.pricing?.totalAmount?.toFixed(2) || 0}
                    </td>
                    <td className="px-6 py-4 text-center ">
                      {order.pricing?.storeItems > 0 ? (
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                            order.status === "Delivered"
                              ? "bg-emerald-50 text-emerald-700"
                              : order.status === "Cancelled"
                                ? "bg-red-50 text-red-600"
                                : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs font-medium">
                          N/A
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {order.pickupTimeSlot ? (
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                            order.pickupStatus === "Completed"
                              ? "bg-emerald-50 text-emerald-700"
                              : order.pickupStatus === "Cancelled"
                                ? "bg-red-50 text-red-600"
                                : "bg-indigo-50 text-indigo-700"
                          }`}
                        >
                          {order.pickupStatus}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs font-medium">
                          N/A
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No sales data found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div>
            <Pagination
              data={fakePaginationData}
              setPage={setPage}
              page={page}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
