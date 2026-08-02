"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function GrabFoodPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('transaksi_online')
      .select(`*, driver_online ( nama_driver, rating_driver ), status_pemesanan_online ( status_pemesanan )`)
      .order('tanggal_transaksi', { ascending: false });

    if (!error) setOrders(data || []);
    setLoading(false);
  };

  const updateStatus = async (id_transaksi, newStatus) => {
    const { data: statusData } = await supabase
      .from('status_pemesanan_online')
      .select('id_status')
      .eq('status_pemesanan', newStatus)
      .single();

    if (statusData) {
      const { error } = await supabase
        .from('transaksi_online')
        .update({ id_status: statusData.id_status })
        .eq('id_transaksi_online', id_transaksi);

      if (!error) {
        alert(`Status berhasil diubah menjadi ${newStatus}`);
        fetchOrders();
      } else {
        alert('Gagal mengubah status');
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#F9F7F4] font-sans">
      {/* SIDEBAR */}
      <div className="w-20 bg-white border-r flex flex-col items-center py-4 shadow-sm">
        <div className="text-center font-bold mb-8 text-[#5D4037] text-sm cursor-pointer" onClick={() => router.push('/')}>☕ C&J</div>
        <div className="flex flex-col gap-6 text-gray-400">
          <div className="cursor-pointer hover:text-[#5D4037]" onClick={() => router.push('/admin/dashboard')}>🏠</div>
          <div className="cursor-pointer hover:text-[#5D4037]" onClick={() => router.push('/admin/pos')}>🍽️</div>
          <div className="cursor-pointer hover:text-[#5D4037]" onClick={() => router.push('/admin/inventory')}>📦</div>
          <div className="text-[#5D4037] border-l-4 border-[#5D4037] pl-2 cursor-pointer">🚗</div>
          <div className="cursor-pointer hover:text-[#5D4037]" onClick={() => router.push('/admin/report')}>📊</div>
          <button onClick={() => router.push('/')} className="mt-auto cursor-pointer hover:text-[#5D4037]">🚪</button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-black mb-6">GrabFood Online Order</h1>

        {loading ? (
          <div className="text-center py-10">Loading orders...</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id_transaksi_online} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-black">{order.id_transaksi_online}</span>
                      <span className="text-sm text-gray-500">{new Date(order.tanggal_transaksi).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Total: <span className="font-bold text-black">Rp {order.total_pembayaran.toLocaleString()}</span>
                      <span className="mx-2">•</span>
                      {order.metode_pembayaran || 'GrabPay'}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 bg-gray-50 px-4 py-2 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-700">Driver</div>
                      <div className="font-bold text-black">{order.driver_online?.nama_driver || 'Belum assigned'}</div>
                      <div className="text-xs text-gray-500">ID: {order.id_driver_online || '-'}</div>
                    </div>
                    <div className="text-center border-l pl-4 border-gray-200">
                      <div className="text-sm font-medium text-gray-700">Rating</div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <span className="text-xl">⭐</span>
                        <span className="font-bold text-black">{order.driver_online?.rating_driver || 0}/5</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 min-w-[120px]">
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-semibold
                      ${order.status_pemesanan_online?.status_pemesanan === 'Ready' ? 'bg-blue-100 text-blue-700' : ''}
                      ${order.status_pemesanan_online?.status_pemesanan === 'On The Way' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${order.status_pemesanan_online?.status_pemesanan === 'Delivered' ? 'bg-green-100 text-green-700' : ''}
                    `}>
                      {order.status_pemesanan_online?.status_pemesanan || 'Pending'}
                    </span>
                    {order.status_pemesanan_online?.status_pemesanan === 'Ready' && (
                      <button onClick={() => updateStatus(order.id_transaksi_online, 'On The Way')} className="bg-[#5D4037] text-white px-3 py-1 rounded text-xs hover:bg-[#3E2723] transition">Set On The Way</button>
                    )}
                    {order.status_pemesanan_online?.status_pemesanan === 'On The Way' && (
                      <button onClick={() => updateStatus(order.id_transaksi_online, 'Delivered')} className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition">Set Delivered</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && <div className="text-center py-10 text-gray-500">Belum ada pesanan online.</div>}
          </div>
        )}
      </div>
    </div>
  );
}