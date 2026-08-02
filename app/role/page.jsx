"use client";

import { useRouter } from 'next/navigation';

export default function RoleSelectionPage() {
  const router = useRouter();

  const handleSelectRole = (role) => {
    if (role === 'Admin') {
      router.push('/admin/dashboard');
    } else if (role === 'Supplier') {
      router.push('/dashboard-supplier');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F7F4] p-6">
      <h1 className="text-3xl font-bold text-[#3E2723] mb-10">Please Select Your Role</h1>
      
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
        {/* Supplier Card */}
        <button
          onClick={() => handleSelectRole('Supplier')}
          className="flex-1 bg-white p-10 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition duration-200 flex flex-col items-center border-2 border-transparent hover:border-[#5D4037]"
        >
          <div className="text-7xl mb-4">👷‍♂️</div>
          <h2 className="text-2xl font-bold text-[#5D4037]">Supplier</h2>
          <p className="text-gray-500 text-sm mt-2 text-center">
            Kelola katalog produk dan stok bahan baku Anda.
          </p>
        </button>

        {/* Admin Card */}
        <button
          onClick={() => handleSelectRole('Admin')}
          className="flex-1 bg-white p-10 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition duration-200 flex flex-col items-center border-2 border-transparent hover:border-[#5D4037]"
        >
          <div className="text-7xl mb-4">👨‍💻</div>
          <h2 className="text-2xl font-bold text-[#5D4037]">Admin</h2>
          <p className="text-gray-500 text-sm mt-2 text-center">
            Kelola POS, Inventory, Supplier, dan Laporan Keuangan.
          </p>
        </button>
      </div>
    </div>
  );
}