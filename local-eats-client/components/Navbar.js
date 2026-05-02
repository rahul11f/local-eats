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

  useEffect(() => {
    useAuthStore.persist.rehydrate();
    setItemCount(getItemCount());
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
          {isLoggedIn ? (
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
          )}
        </div>

        {/* Cart & Mobile Menu Button */}
        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="relative p-2 hover:bg-light rounded-lg transition"
          >
            <FiShoppingCart className="text-2xl" />
            {itemCount > 0 && (
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
            {isLoggedIn ? (
              <>
                <Link href="/" className="text-dark hover:text-primary">
                  Home
                </Link>
                <Link href="/orders" className="text-dark hover:text-primary">
                  Orders
                </Link>
                <Link href="/profile" className="text-dark hover:text-primary">
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
                <Link href="/login" className="text-dark hover:text-primary">
                  Login
                </Link>
                <Link href="/register" className="btn btn-primary text-center">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
