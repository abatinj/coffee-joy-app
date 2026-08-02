"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function SupplierDashboard() {
  const [supplierId, setSupplierId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [catalogue, setCatalogue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupplierData();
  }, []);

  const fetchSupplierData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login-supplier');
        return;
      }

      const { data: supplierData, error: supplierError } = await supabase
        .from('supplier')
        .select('id_supplier')
        .eq('id_user', user.id)
        .maybeSingle();

      if (supplierError) throw supplierError;

      if (!supplierData) {
        alert('Akun supplier Anda belum terhubung ke data supplier. Hubungi Admin.');
        await supabase.auth.signOut();
        router.push('/login-supplier');
        return;
      }

      setSupplierId(supplierData.id_supplier);

      const { data: orderData, error: orderError } = await supabase
        .from('transaksi_supplier')
        .select(`*, detail_transaksi_supplier (*)`)
        .eq('id_supplier', supplierData.id_supplier)
        .order('tanggal_transaksi', { ascending: false });

      if (!orderError) setOrders(orderData || []);

      const { data: stockData, error: stockError } = await supabase
        .from('stok_bahan_baku')
        .select('*')
        .eq('id_supplier', supplierData.id_supplier);

      if (!stockError) setCatalogue(stockData || []);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (id, newQty) => {
    const { error } = await supabase
      .from('stok_bahan_baku')
      .update({ kuantitas: newQty })
      .eq('id_stok_bahan_baku', id);

    if (!error) {
      alert('Stok berhasil diperbarui!');
      fetchSupplierData();
    } else {
      alert('Gagal update stok');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login-supplier';
  };

  if (loading) return <div className="p-10 text-center">Loading Supplier Dashboard...</div>;

  return (
    <div className="min-h-screen bg-[#F9F7F4] p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-black">Hello, Supplier!</h1>
        <button onClick={handleLogout} className="bg-[#5D4037] text-white px-6 py-2 rounded-lg hover:bg-[#3E2723]">Log Out</button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <h2 className="text-xl font-bold mb-4 text-black">Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F9F7F4]">
              <tr>
                <th className="p-3 text-black">Tanggal</th>
                <th className="p-3 text-black">Barang</th>
                <th className="p-3 text-black">Qty</th>
                <th className="p-3 text-black">Total Harga</th>
                <th className="p-3 text-black">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id_transaksi_supplier} className="border-b border-gray-200">
                  <td className="p-3 text-black">{new Date(order.tanggal_transaksi).toLocaleDateString('id-ID')}</td>
                  <td className="p-3 text-black">{order.detail_transaksi_supplier?.map(d => d.id_stok_bahan_baku).join(', ')}</td>
                  <td className="p-3 text-black">{order.detail_transaksi_supplier?.reduce((sum, d) => sum + d.kuantitas, 0)}</td>
                  <td className="p-3 text-black font-medium">Rp {order.total_pembayaran?.toLocaleString() || 0}</td>
                  <td className="p-3">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Completed</span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-black">Belum ada order</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-black">Catalogue</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F9F7F4]">
              <tr>
                <th className="p-3 text-black font-semibold">Barang</th>
                <th className="p-3 text-black font-semibold">Stok</th>
                <th className="p-3 text-black font-semibold">Harga</th>
                <th className="p-3 text-black font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {catalogue.map(item => (
                <tr key={item.id_stok_bahan_baku} className="border-b border-gray-200">
                  <td className="p-3 text-black font-medium">{item.bahan_baku}</td>
                  <td className="p-3">
                    <input type="number" defaultValue={item.kuantitas} id={`stock-${item.id_stok_bahan_baku}`} className="w-20 border border-gray-300 rounded px-2 py-1 text-black bg-white" />
                  </td>
                  <td className="p-3 text-black">
                    {item.harga_beli_per_unit && item.harga_beli_per_unit > 0 ? `Rp ${item.harga_beli_per_unit.toLocaleString()}` : '-'}
                  </td>
                  <td className="p-3">
                    <button onClick={() => {
                      const input = document.getElementById(`stock-${item.id_stok_bahan_baku}`);
                      const newQty = parseInt(input.value);
                      if (!isNaN(newQty) && newQty >= 0) updateStock(item.id_stok_bahan_baku, newQty);
                    }} className="bg-[#5D4037] text-white px-4 py-1 rounded hover:bg-[#3E2723] text-sm">Update</button>
                  </td>
                </tr>
              ))}
              {catalogue.length === 0 && <tr><td colSpan="4" className="p-4 text-center text-black">Belum ada katalog</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}