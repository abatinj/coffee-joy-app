"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const [stats, setStats] = useState({ 
    salesToday: 0, 
    totalEarnings: 0, 
    totalOrders: 0, 
    totalVisitors: 0,
    itemsRestock: 0,
    ongoingPO: 0
  });
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: offline } = await supabase.from('transaksi_offline').select('*');
    const all = offline || [];
    
    const today = new Date().toISOString().split('T')[0];
    const todaySales = all.filter(t => t.tanggal_transaksi === today).reduce((s, t) => s + t.total_pembayaran, 0);
    const totalEarnings = all.reduce((s, t) => s + t.total_pembayaran, 0);

    // Cek stok habis & PO berjalan
    const { data: stockData } = await supabase.from('stok_bahan_baku').select('*').lt('kuantitas', 10);
    const { data: poData } = await supabase.from('transaksi_supplier').select('*').eq('status_penerimaan', 'Dalam Proses');

    setStats({
      salesToday: todaySales,
      totalEarnings,
      totalOrders: all.length,
      totalVisitors: all.length,
      itemsRestock: stockData?.length || 0,
      ongoingPO: poData?.length || 0,
    });

    const labels = [];
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      labels.push(dateStr);
      const daily = all.filter(t => t.tanggal_transaksi === dateStr).reduce((s, t) => s + t.total_pembayaran, 0);
      data.push(daily);
    }

    setChartData({
      labels,
      datasets: [{
        label: 'Revenue',
        data,
        borderColor: '#5D4037',
        tension: 0.3,
      }]
    });
  };

  return (
    <div className="flex h-screen bg-[#F9F7F4]">
      {/* SIDEBAR */}
      <div className="w-20 bg-white border-r flex flex-col items-center py-4 shadow-sm">
        <div className="text-center font-bold mb-8 text-[#5D4037] text-sm">☕ C&J</div>
        <div className="flex flex-col gap-6 text-gray-400">
          <div className="text-[#5D4037] border-l-4 border-[#5D4037] pl-2 cursor-pointer">🏠</div>
          <div className="cursor-pointer hover:text-[#5D4037]" onClick={() => window.location.href='/admin/pos'}>🍽️</div>
          <div className="cursor-pointer hover:text-[#5D4037]" onClick={() => window.location.href='/admin/inventory'}>📦</div>
          <div className="cursor-pointer hover:text-[#5D4037]" onClick={() => window.location.href='/admin/supplier'}>📄</div>
          <div className="cursor-pointer hover:text-[#5D4037]" onClick={() => window.location.href='/admin/report'}>📊</div>
          <button onClick={() => window.location.href='/'} className="mt-auto cursor-pointer hover:text-[#5D4037]">🚪</button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#3E2723]">Hello, Admin!</h1>
          <div className="text-gray-500">{new Date().toLocaleTimeString()}</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <div className="text-xl font-semibold mb-2">Revenue</div>
          <div className="text-3xl font-bold mb-4">Rp {stats.totalEarnings.toLocaleString()}</div>
          {chartData && <div className="h-64"><Line data={chartData} /></div>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#DCD3C6] p-6 rounded-xl">
            <div className="text-gray-600">Sales Today</div>
            <div className="text-2xl font-bold">Rp {stats.salesToday.toLocaleString()}</div>
          </div>
          <div className="bg-white p-6 rounded-xl">
            <div className="text-gray-600">Total Earnings</div>
            <div className="text-2xl font-bold">Rp {stats.totalEarnings.toLocaleString()}</div>
          </div>
          <div className="bg-white p-6 rounded-xl">
            <div className="text-gray-600">Total Orders</div>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </div>
          <div className="bg-white p-6 rounded-xl">
            <div className="text-gray-600">Total Visitors</div>
            <div className="text-2xl font-bold">{stats.totalVisitors}</div>
          </div>
          <div className="bg-white p-6 rounded-xl">
            <div className="text-gray-600">Items need restock</div>
            <div className="text-2xl font-bold">{stats.itemsRestock}</div>
          </div>
          <div className="bg-white p-6 rounded-xl">
            <div className="text-gray-600">Ongoing PO</div>
            <div className="text-2xl font-bold">{stats.ongoingPO}</div>
          </div>
        </div>
      </div>
    </div>
  );
}