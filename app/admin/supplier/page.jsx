"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function POSPage() {
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState('Signature');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMenus();
  }, [category]);

  const fetchMenus = async () => {
    setLoading(true);
    let query = supabase.from('menu').select('*');
    if (category) query = query.eq('tipe_menu', category);
    const { data, error } = await query;
    if (!error) setMenus(data || []);
    setLoading(false);
  };

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id_menu === item.id_menu);
      if (existing) {
        return prev.map(i => i.id_menu === item.id_menu ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id_menu) => {
    setCart(prev => prev.filter(item => item.id_menu !== id_menu));
  };

  const totalPrice = cart.reduce((acc, item) => acc + item.harga_menu * item.quantity, 0);

  const handlePrintBill = async () => {
    if (cart.length === 0) {
      alert('Keranjang kosong!');
      return;
    }

    try {
      const idTransaksi = `OF-${Date.now()}`;
      const { error: transaksiError } = await supabase
        .from('transaksi_offline')
        .insert({
          id_transaksi_offline: idTransaksi,
          total_pembayaran: totalPrice,
          status_transaksi: 'Completed',
          metode_pembayaran: 'Cash'
        });

      if (transaksiError) throw transaksiError;

      const detailItems = cart.map(item => ({
        id_transaksi_offline: idTransaksi,
        id_menu: item.id_menu,
        kuantitas: item.quantity,
        harga_satuan: item.harga_menu,
        subtotal: item.harga_menu * item.quantity
      }));

      const { error: detailError } = await supabase
        .from('detail_transaksi_offline')
        .insert(detailItems);

      if (detailError) throw detailError;

      alert(`Transaksi berhasil! ID: ${idTransaksi}`);
      setCart([]);
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal menyimpan transaksi');
    }
  };

  const categories = ['Signature', 'Espresso Based', 'Manual Brew', 'Non Coffee', 'Food', 'Snacks', 'Dimsum'];

  return (
    <div className="flex h-screen bg-[#F9F7F4] font-sans">
      {/* SIDEBAR */}
      <div className="w-20 bg-white border-r flex flex-col items-center py-4 shadow-sm">
        <Link href="/" className="text-center font-bold mb-8 text-[#5D4037] text-sm cursor-pointer">
          ☕ C&J
        </Link>
        <div className="flex flex-col gap-6 text-gray-400">
          <Link href="/admin/dashboard" className="cursor-pointer hover:text-[#5D4037]">
            🏠
          </Link>
          <Link href="/admin/inventory" className="cursor-pointer hover:text-[#5D4037]">
            📦
          </Link>
          <Link href="/admin/report" className="cursor-pointer hover:text-[#5D4037]">
            📊
          </Link>
          <Link href="/" className="mt-auto cursor-pointer hover:text-[#5D4037]">
            🚪
          </Link>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Choose Category</h1>
        
        <div className="flex gap-4 mb-6 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                category === cat ? 'bg-[#5D4037] text-white' : 'bg-white text-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <h2 className="text-xl font-semibold mb-4">{category}</h2>

        {loading ? (
          <div className="text-center py-10">Loading menu...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {menus.map(item => (
              <div key={item.id_menu} className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition">
                <h3 className="font-bold text-lg">{item.nama_menu}</h3>
                <p className="text-black font-medium">Rp {item.harga_menu.toLocaleString()}</p>
                <button
                  onClick={() => addToCart(item)}
                  className="mt-3 bg-[#5D4037] text-white w-10 h-10 rounded-full flex items-center justify-center text-xl hover:bg-[#3E2723] transition"
                >
                  +
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CART */}
      <div className="w-80 bg-[#DCD3C6] p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-1">Current Orders</h2>
        <p className="text-sm text-gray-600 mb-4">Offline Customer</p>

        <div className="flex-1 overflow-y-auto space-y-3">
          {cart.map(item => (
            <div key={item.id_menu} className="flex justify-between items-center border-b border-white/30 pb-2">
              <div>
                <p className="font-medium">{item.nama_menu}</p>
                <p className="text-sm text-gray-600">x{item.quantity}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{(item.harga_menu * item.quantity).toLocaleString()}</span>
                <button onClick={() => removeFromCart(item.id_menu)} className="text-red-500 hover:bg-red-100 rounded px-1">✕</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-[#5D4037]/20">
          <div className="flex justify-between text-xl font-bold mb-4">
            <span>Total</span>
            <span>Rp {totalPrice.toLocaleString()}</span>
          </div>
          <button
            onClick={handlePrintBill}
            className="w-full bg-[#5D4037] text-white py-3 rounded-lg font-semibold hover:bg-[#3E2723] transition mb-3"
          >
            Print Bill
          </button>
          <button
            onClick={() => setCart([])}
            className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Clear Bill
          </button>
        </div>
      </div>
    </div>
  );
}