"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    // Ambil transaksi supplier beserta detail barangnya
    const { data, error } = await supabase
      .from('transaksi_supplier')
      .select(`
        *,
        supplier ( nama_supplier ),
        detail_transaksi_supplier (
          id_stok_bahan_baku,
          kuantitas,
          harga_beli_satuan,
          subtotal
        )
      `)
      .order('tanggal_transaksi', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-[#F9F7F4] font-sans">
      {/* Sidebar */}
      <div className="w-20 bg-white border-r flex flex-col items-center py-4 shadow-sm">
        <div className="text-center font-bold mb-8 text-[#5D4037] text-sm">☕ C&J</div>
        <div className="flex flex-col gap-6 text-gray-400">
          <div className="cursor-pointer hover:text-[#5D4037]">🏠</div>
          <div className="cursor-pointer hover:text-[#5D4037]">🍽️</div>
          <div className="cursor-pointer hover:text-[#5D4037]">📦</div>
          <div className="text-[#5D4037] border-l-4 border-[#5D4037] pl-2 cursor-pointer">📋</div>
          <button onClick={() => window.location.href='/'} className="mt-auto cursor-pointer hover:text-[#5D4037]">🚪</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-[#3E2723] mb-6">Purchase Orders</h1>

        {loading ? (
          <div className="text-center py-10">Loading orders...</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id_transaksi_supplier} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#3E2723]">
                      {order.supplier?.nama_supplier || 'Unknown Supplier'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.tanggal_transaksi).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-xl font-bold text-[#5D4037]">
                      Rp {order.total_pembayaran?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>

                {/* Detail items */}
                <div className="mt-4 border-t pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Items:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {order.detail_transaksi_supplier?.map((detail, idx) => (
                      <div key={idx} className="bg-gray-50 px-3 py-2 rounded text-sm">
                        <span className="font-medium">Item #{idx + 1}</span>
                        <div className="flex justify-between text-gray-600">
                          <span>Qty: {detail.kuantitas}</span>
                          <span>Rp {detail.subtotal?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {(!order.detail_transaksi_supplier || order.detail_transaksi_supplier.length === 0) && (
                    <p className="text-sm text-gray-400 italic">Tidak ada detail item.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            Belum ada purchase order.
          </div>
        )}
      </div>
    </div>
  );
}