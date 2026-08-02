"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ReportPage() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [selectedMonth]);

  const fetchReportData = async () => {
    setLoading(true);
    const { data: income, error: incomeError } = await supabase
      .from('transaksi_offline')
      .select('*')
      .eq('status_transaksi', 'Completed')
      .gte('tanggal_transaksi', `${selectedMonth}-01`)
      .lte('tanggal_transaksi', `${selectedMonth}-31`);

    const { data: expense, error: expenseError } = await supabase
      .from('transaksi_supplier')
      .select('*, supplier ( nama_supplier )')
      .gte('tanggal_transaksi', `${selectedMonth}-01`)
      .lte('tanggal_transaksi', `${selectedMonth}-31`);

    if (!incomeError) setIncomeData(income || []);
    if (!expenseError) setExpenseData(expense || []);
    setLoading(false);
  };

  const handlePrint = () => window.print();

  const totalIncome = incomeData.reduce((sum, item) => sum + item.total_pembayaran, 0);
  const totalExpense = expenseData.reduce((sum, item) => sum + item.total_pembayaran, 0);
  const netProfit = totalIncome - totalExpense;

  return (
    <div className="flex h-screen bg-[#F9F7F4]">
      {/* SIDEBAR */}
      <div className="w-20 bg-white border-r flex flex-col items-center py-4 shadow-sm">
        <div className="text-center font-bold mb-8 text-[#5D4037] text-sm cursor-pointer" onClick={() => router.push('/')}>☕ C&J</div>
        <div className="flex flex-col gap-6 text-gray-400">
          <div className="cursor-pointer hover:text-[#5D4037]" onClick={() => router.push('/admin/dashboard')}>🏠</div>
          <div className="cursor-pointer hover:text-[#5D4037]" onClick={() => router.push('/admin/pos')}>🍽️</div>
          <div className="cursor-pointer hover:text-[#5D4037]" onClick={() => router.push('/admin/inventory')}>📦</div>
          <div className="text-[#5D4037] border-l-4 border-[#5D4037] pl-2 cursor-pointer">📊</div>
          <button onClick={() => router.push('/')} className="mt-auto cursor-pointer hover:text-[#5D4037]">🚪</button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-black">Laporan Keuangan</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white rounded-lg px-4 py-2 shadow-sm border">
              <label className="text-sm text-gray-600 mr-2">Bulan:</label>
              <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="outline-none bg-transparent text-black" />
            </div>
            <button onClick={handlePrint} className="bg-[#5D4037] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#3E2723] transition">🖨️ Print</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#DCD3C6] p-6 rounded-xl shadow-sm">
            <div className="text-gray-600 text-sm mb-1">Total Pemasukan</div>
            <div className="text-2xl font-bold text-black">Rp {totalIncome.toLocaleString()}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-gray-600 text-sm mb-1">Total Pengeluaran</div>
            <div className="text-2xl font-bold text-black">Rp {totalExpense.toLocaleString()}</div>
          </div>
          <div className={`p-6 rounded-xl shadow-sm ${netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="text-gray-600 text-sm mb-1">Laba Bersih</div>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>Rp {netProfit.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <h2 className="text-xl font-bold mb-4 text-black">Pemasukan (Penjualan)</h2>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : incomeData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F9F7F4]">
                  <tr>
                    <th className="p-3 text-black">Tanggal</th>
                    <th className="p-3 text-black">ID Transaksi</th>
                    <th className="p-3 text-black">Metode Pembayaran</th>
                    <th className="p-3 text-black text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeData.map((item) => (
                    <tr key={item.id_transaksi_offline} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-black">{new Date(item.tanggal_transaksi).toLocaleDateString('id-ID')}</td>
                      <td className="p-3 text-black font-medium">{item.id_transaksi_offline}</td>
                      <td className="p-3 text-black">{item.metode_pembayaran || 'Cash'}</td>
                      <td className="p-3 text-black text-right font-medium">Rp {item.total_pembayaran.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#DCD3C6]">
                  <tr>
                    <td colSpan="3" className="p-3 font-bold text-right text-black">Total Pemasukan:</td>
                    <td className="p-3 text-right font-bold text-black">Rp {totalIncome.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">Belum ada transaksi penjualan untuk bulan ini.</div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-black">Pengeluaran (Pembelian Supplier)</h2>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : expenseData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F9F7F4]">
                  <tr>
                    <th className="p-3 text-black">Tanggal</th>
                    <th className="p-3 text-black">Supplier</th>
                    <th className="p-3 text-black">ID Transaksi</th>
                    <th className="p-3 text-black text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseData.map((item) => (
                    <tr key={item.id_transaksi_supplier} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-black">{new Date(item.tanggal_transaksi).toLocaleDateString('id-ID')}</td>
                      <td className="p-3 text-black font-medium">{item.supplier?.nama_supplier || '-'}</td>
                      <td className="p-3 text-black">{item.id_transaksi_supplier}</td>
                      <td className="p-3 text-black text-right font-medium">Rp {item.total_pembayaran.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#DCD3C6]">
                  <tr>
                    <td colSpan="3" className="p-3 font-bold text-right text-black">Total Pengeluaran:</td>
                    <td className="p-3 text-right font-bold text-black">Rp {totalExpense.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">Belum ada transaksi pengeluaran untuk bulan ini.</div>
          )}
        </div>
      </div>
    </div>
  );
}