"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function SupplierLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError) throw authError;

    // --- BAGIAN INI DIUBAH ---
    // Supplier juga diarahkan ke Role Selection.
    router.push('/role');
    // -------------------------

  } catch (err) {
    setError(err.message || 'Login gagal. Periksa email dan password.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F7F4]">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-[#3E2723] mb-6">Supplier Login</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#5D4037]"
              placeholder="Email Supplier"
              required
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#5D4037]"
              placeholder="Password"
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5D4037] text-white py-3 rounded-lg font-semibold"
          >
            {loading ? 'Logging in...' : 'Login Supplier'}
          </button>
        </form>
      </div>
    </div>
  );
}