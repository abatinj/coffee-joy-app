"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function SupplierPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('supplier')
      .select(`*, stok_bahan_baku ( id_stok_bahan_baku, bahan_baku, kuantitas, harga_beli_per_unit )`);

    if (error) console.error('Error fetching suppliers:', error);
    else setSuppliers(data || []);
    setLoading(false);
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
          <div className="text-[#5D4037] border-l-4 border-[#5D4037] pl-2 cursor-pointer">📄</div>
          <div className="cursor-pointer hover:text-[#5D4037]" onClick={() => router.push('/admin/report')}>📊</div>
          <button onClick={() => router.push('/')} className="mt-auto cursor-pointer hover:text-[#5D4037]">🚪</button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-black mb-6">Suppliers</h1>

        {loading ? (
          <div className="text-center py-10">Loading suppliers...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier) => (
              <div key={supplier.id_supplier} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-black">{supplier.nama_supplier}</h3>
                    <p className="text-sm text-gray-500">{supplier.kontak_supplier}</p>
                  </div>
                  <span className="bg-[#DCD3C6] px-3 py-1 rounded-full text-xs font-semibold text-black">
                    {supplier.stok_bahan_baku?.length || 0} Items
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Bahan Baku:</p>
                  {supplier.stok_bahan_baku?.map((item) => (
                    <div key={item.id_stok_bahan_baku} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded text-sm">
                      <span>{item.bahan_baku}</span>
                      <div className="flex gap-4">
                        <span className="text-gray-500">Stok: {item.kuantitas}</span>
                        <span className="text-black font-medium">Rp {item.harga_beli_per_unit?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  ))}
                  {(!supplier.stok_bahan_baku || supplier.stok_bahan_baku.length === 0) && (
                    <p className="text-sm text-gray-400 italic">Belum ada bahan baku terdaftar.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}