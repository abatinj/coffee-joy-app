"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function InventoryPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('stok_bahan_baku')
      .select(`*, supplier ( nama_supplier )`);

    if (!error) {
      setItems(data || []);
      setFilteredItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    const result = items.filter(item =>
      item.bahan_baku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.supplier?.nama_supplier || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(result);
  }, [searchTerm, items]);

  const updateStock = async (id, newQty) => {
    const { error } = await supabase
      .from('stok_bahan_baku')
      .update({ kuantitas: newQty })
      .eq('id_stok_bahan_baku', id);

    if (!error) {
      alert('Stok berhasil diperbarui!');
      fetchInventory();
    } else {
      alert('Gagal update stok');
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
          <div className="text-[#5D4037] border-l-4 border-[#5D4037] pl-2 cursor-pointer">📦</div>
          <div className="cursor-pointer hover:text-[#5D4037]" onClick={() => router.push('/admin/report')}>📊</div>
          <button onClick={() => router.push('/')} className="mt-auto cursor-pointer hover:text-[#5D4037]">🚪</button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black">Inventory</h1>
          
          <div className="flex items-center bg-white rounded-lg px-4 py-2 shadow-sm border">
            <span className="text-gray-400 mr-2">🔍</span>
            <input
              type="text"
              placeholder="Search Items"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="outline-none w-64 text-black"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">Loading inventory...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id_stok_bahan_baku} className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition">
                <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400 text-4xl">📦</div>
                <h3 className="font-bold text-lg">{item.bahan_baku}</h3>
                <p className="text-sm text-gray-600 mb-1">Supplier: {item.supplier?.nama_supplier || 'Umum'}</p>
                <p className="text-black font-medium">Stok: {item.kuantitas} {item.tipe_bahan_baku || 'pcs'}</p>
                <div className="mt-3 flex gap-2">
                  <input type="number" defaultValue={item.kuantitas} id={`stock-${item.id_stok_bahan_baku}`} className="w-16 border rounded px-2 py-1 text-sm text-black" />
                  <button onClick={() => {
                    const input = document.getElementById(`stock-${item.id_stok_bahan_baku}`);
                    const newQty = parseInt(input.value);
                    if (!isNaN(newQty) && newQty >= 0) updateStock(item.id_stok_bahan_baku, newQty);
                  }} className="bg-[#5D4037] text-white px-3 py-1 rounded text-sm hover:bg-[#3E2723]">Update</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-20 text-gray-500">Tidak ada item yang ditemukan.</div>
        )}
      </div>
    </div>
  );
}