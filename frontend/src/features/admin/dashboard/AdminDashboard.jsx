import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, Calendar, TrendingUp, DollarSign, Tag, Search } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';
import { api } from '../../../api/axiosInstance';

function AdminDashboard() {
  const [filterType, setFilterType] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['sales-report', filterType, startDate, endDate],
    queryFn: async () => {
      const params = { filterType };
      if (filterType === 'custom') {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      const res = await api.get('/admin/reports/sales', { params });
      return res.data.data;
    },
  });

  const handleDownloadPDF = () => {
    if (!reportData?.orders?.length) {
      toast.error('No data to download');
      return;
    }
    const doc = new jsPDF();
    doc.text('Sales Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Filter: ${filterType.toUpperCase()}`, 14, 22);

    const tableData = reportData.orders.map((order) => [
      order.orderId,
      new Date(order.createdAt).toLocaleDateString(),
      order.userId?.name || 'Unknown',
      order.status,
      `Rs ${order.pricing?.totalAmount || 0}`,
      `Rs ${order.pricing?.couponDiscount || 0}`,
    ]);

    doc.autoTable({
      startY: 28,
      head: [['Order ID', 'Date', 'Customer', 'Status', 'Amount', 'Discount']],
      body: tableData,
    });

    doc.save(`sales_report_${filterType}.pdf`);
  };

  const handleDownloadExcel = () => {
    if (!reportData?.orders?.length) {
      toast.error('No data to download');
      return;
    }
    const headers = ['Order ID', 'Date', 'Customer', 'Status', 'Total Amount', 'Coupon Discount'];
    const rows = reportData.orders.map(order => [
      order.orderId,
      new Date(order.createdAt).toLocaleDateString(),
      order.userId?.name || 'Unknown',
      order.status,
      order.pricing?.totalAmount || 0,
      order.pricing?.couponDiscount || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sales_report_${filterType}.csv`;
    link.click();
  };

  const summary = reportData?.summary || { totalOrders: 0, totalAmount: 0, totalCouponDiscount: 0, totalOfferDiscount: 0 };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sales Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your sales and reports</p>
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
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-sm hover:bg-emerald-700 transition"
          >
            <Download size={18} />
            CSV Report
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Range</label>
          <select 
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="daily">Today</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
            <option value="yearly">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {filterType === 'custom' && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Date</label>
              <input 
                type="date" 
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">End Date</label>
              <input 
                type="date" 
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button className="px-4 py-2 bg-slate-800 text-white rounded-lg shadow-sm hover:bg-slate-700 transition flex items-center gap-2">
              <Search size={16} /> Filter
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Sales Count</p>
            <h3 className="text-2xl font-bold text-slate-800">{summary.totalOrders}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Order Amount</p>
            <h3 className="text-2xl font-bold text-slate-800">₹{summary.totalAmount?.toFixed(2) || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <Tag size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Discounts (Coupons)</p>
            <h3 className="text-2xl font-bold text-slate-800">₹{summary.totalCouponDiscount?.toFixed(2) || 0}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-800">Recent Sales Data</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs">Order ID</th>
                <th className="px-6 py-4 font-semibold text-xs">Date</th>
                <th className="px-6 py-4 font-semibold text-xs">Customer</th>
                <th className="px-6 py-4 font-semibold text-xs">Amount</th>
                <th className="px-6 py-4 font-semibold text-xs">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">Loading...</td>
                </tr>
              ) : reportData?.orders?.length > 0 ? (
                reportData.orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700">{order.orderId}</td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{order.userId?.name || 'Guest'}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">₹{order.pricing?.totalAmount?.toFixed(2) || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                        order.status === 'Completed' || order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' :
                        order.status === 'Cancelled' ? 'bg-red-50 text-red-600' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">No sales data found for this period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard
