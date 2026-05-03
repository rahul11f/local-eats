'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore, useCartStore } from '@/lib/store';
import { FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    useAuthStore.persist.rehydrate();
    setItemCount(getItemCount());
    setMounted(true);
  }, [getItemCount]);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container flex items-center justify-between py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary text-white px-3 py-2 rounded-lg font-bold">
            LocalEats
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {mounted ? (
            isLoggedIn ? (
              <>
                <Link href="/" className="text-dark hover:text-primary transition">
                  Home
                </Link>
                <Link href="/orders" className="text-dark hover:text-primary transition">
                  Orders
                </Link>
                <Link href="/profile" className="text-dark hover:text-primary transition">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-dark hover:text-primary transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-dark hover:text-primary transition">
                  Login
                </Link>
                <Link href="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              </>
            )
          ) : (
            <div className="w-48 h-8 bg-gray-200 animate-pulse rounded"></div>
          )}
        </div>

        {/* Cart & Mobile Menu Button */}
        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="relative p-2 hover:bg-light rounded-lg transition"
          >
            <FiShoppingCart className="text-2xl" />
            {mounted && itemCount > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-light rounded-lg transition"
          >
            {isMobileMenuOpen ? (
              <FiX className="text-2xl" />
            ) : (
              <FiMenu className="text-2xl" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-light border-t">
          <div className="container py-4 flex flex-col gap-4">
            {mounted && (
              isLoggedIn ? (
                <>
                  <Link href="/" className="text-dark hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                    Home
                  </Link>
                  <Link href="/orders" className="text-dark hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                    Orders
                  </Link>
                  <Link href="/profile" className="text-dark hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                    Profile ({user?.name})
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left text-dark hover:text-primary"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-dark hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                    Login
                  </Link>
                  <Link href="/register" className="btn btn-primary text-center" onClick={() => setIsMobileMenuOpen(false)}>
                    Sign Up
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
