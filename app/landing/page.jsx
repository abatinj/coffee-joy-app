"use client";

import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F7F4]">
      <div className="text-center max-w-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-44 bg-[#3E2723] rounded-full mx-auto relative mb-6 shadow-lg">
            <div className="w-2 h-44 bg-white/20 absolute left-1/2 -ml-1 rounded-full transform rotate-6"></div>
          </div>
          
          <div className="flex items-center gap-2 text-[#3E2723] font-bold tracking-widest mb-2">
            <span className="text-sm">ES</span>
            <span className="text-sm">TD</span>
            <span className="w-20 h-0.5 bg-[#3E2723]"></span>
            <span className="text-sm">20</span>
            <span className="text-sm">22</span>
          </div>
          
          <h1 className="text-5xl font-bold text-[#3E2723] tracking-wider mb-2">COFFEE AND JOY</h1>
          <p className="text-sm text-gray-500 tracking-widest">YOU'LL KNOW WHEN YOU ENJOY</p>
        </div>

        <button
          onClick={() => router.push('/role')}
          className="mt-10 bg-[#5D4037] text-white px-12 py-4 rounded-full text-xl font-semibold hover:bg-[#3E2723] transition duration-300 shadow-lg"
        >
          Start Application
        </button>
      </div>
    </div>
  );
}