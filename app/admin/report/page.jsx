"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ReportPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // Format YYYY-MM
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data saat bulan berubah
  useEffect(() => {
    fetchReportData();
  }, [selectedMonth]);

  const fetchReportData = async () => {
    setLoading(true);
    
    // 1. Ambil data pemasukan (dari transaksi offline yang completed)
    const { data: income, error: incomeError } = await supabase
      .from('transaksi_offline')
      .select('*')
      .eq('status_transaksi', 'Completed')
      .gte('tanggal_transaksi', `${selectedMonth}-01`)
      .lte('tanggal_transaksi', `${selectedMonth}-31`);

    // 2. Ambil data pengeluaran (dari transaksi supplier)
    const { data: expense, error: expenseError } = await supabase
      .from('transaksi_supplier')
      .select('*, supplier ( nama_supplier )')
      .gte('tanggal_transaksi', `${selectedMonth}-01`)
      .lte('tanggal_transaksi', `${selectedMonth}-31`);

    if (!incomeError) setIncomeData(income || []);
    if (!expenseError) setExpenseData(expense || []);
    
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // Hitung total
  const totalIncome = incomeData.reduce((sum, item) => sum + item.total_pembayaran, 0);
  const totalExpense = expenseData.reduce((sum, item) => sum + item.total_pembayaran, 0);
  const netProfit = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-[#F9F7F4] p-8">
      {/* Header dengan Filter & Tombol Print */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-[#3E2723]">Laporan Keuangan</h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white rounded-lg px-4 py-2 shadow-sm border">
            <label className="text-sm text-gray-600 mr-2">Bulan:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="outline-none bg-transparent text-[#3E2723]"
            />
          </div>
          
          <button
            onClick={handlePrint}
            className="bg-[#5D4037] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#3E2723] transition"
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {/* Ringkasan Keuangan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#DCD3C6] p-6 rounded-xl shadow-sm">
          <div className="text-gray-600 text-sm mb-1">Total Pemasukan</div>
          <div className="text-2xl font-bold text-[#3E2723]">
            Rp {totalIncome.toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="text-gray-600 text-sm mb-1">Total Pengeluaran</div>
          <div className="text-2xl font-bold text-[#3E2723]">
            Rp {totalExpense.toLocaleString()}
          </div>
        </div>
        <div className={`p-6 rounded-xl shadow-sm ${netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="text-gray-600 text-sm mb-1">Laba Bersih</div>
          <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            Rp {netProfit.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Tabel Pemasukan */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <h2 className="text-xl font-bold mb-4 text-[#3E2723]">Pemasukan (Penjualan)</h2>
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : incomeData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F9F7F4]">
                <tr>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">ID Transaksi</th>
                  <th className="p-3">Metode Pembayaran</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {incomeData.map((item) => (
                  <tr key={item.id_transaksi_offline} className="border-b hover:bg-gray-50">
                    <td className="p-3">{new Date(item.tanggal_transaksi).toLocaleDateString('id-ID')}</td>
                    <td className="p-3 font-medium">{item.id_transaksi_offline}</td>
                    <td className="p-3">{item.metode_pembayaran || 'Cash'}</td>
                    <td className="p-3 text-right font-medium">
                      Rp {item.total_pembayaran.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#DCD3C6]">
                <tr>
                  <td colSpan="3" className="p-3 font-bold text-right">Total Pemasukan:</td>
                  <td className="p-3 text-right font-bold">Rp {totalIncome.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">Belum ada transaksi penjualan untuk bulan ini.</div>
        )}
      </div>

      {/* Tabel Pengeluaran */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-[#3E2723]">Pengeluaran (Pembelian Supplier)</h2>
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : expenseData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F9F7F4]">
                <tr>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Supplier</th>
                  <th className="p-3">ID Transaksi</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {expenseData.map((item) => (
                  <tr key={item.id_transaksi_supplier} className="border-b hover:bg-gray-50">
                    <td className="p-3">{new Date(item.tanggal_transaksi).toLocaleDateString('id-ID')}</td>
                    <td className="p-3 font-medium">{item.supplier?.nama_supplier || '-'}</td>
                    <td className="p-3">{item.id_transaksi_supplier}</td>
                    <td className="p-3 text-right font-medium">
                      Rp {item.total_pembayaran.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#DCD3C6]">
                <tr>
                  <td colSpan="3" className="p-3 font-bold text-right">Total Pengeluaran:</td>
                  <td className="p-3 text-right font-bold">Rp {totalExpense.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">Belum ada transaksi pengeluaran untuk bulan ini.</div>
        )}
      </div>
    </div>
  );
}