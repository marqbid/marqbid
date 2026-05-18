// components/layout/Navbar.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LogIn, PlusCircle, LayoutDashboard } from 'lucide-react';

const PLATFORM = process.env.NEXT_PUBLIC_PLATFORM_NAME || 'MarqBid';

export default function Navbar() {
  const path = usePathname();

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900 tracking-tight">
          <Home size={18} className="text-brand-400" />
          <span>
            <span className="text-brand-400">Marq</span>Bid
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/listings" className={`btn-ghost ${path.startsWith('/listings') ? 'text-brand-600 bg-brand-50' : ''}`}>
            Browse listings
          </Link>
          <Link href="/realtor" className={`btn-ghost ${path.startsWith('/realtor') ? 'text-brand-600 bg-brand-50' : ''}`}>
            For realtors
          </Link>
          <Link href="/dashboard" className="btn-ghost hidden sm:flex">
            <LayoutDashboard size={15} />
            Dashboard
          </Link>
          <Link href="/list" className="btn-primary">
            <PlusCircle size={15} />
            List my home
          </Link>
          <Link href="/auth/login" className="btn-outline hidden sm:flex">
            <LogIn size={15} />
            Sign in
          </Link>
        </div>
      </div>
    </nav>
  );
}
