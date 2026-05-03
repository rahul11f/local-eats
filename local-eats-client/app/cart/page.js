'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore, useAuthStore } from '@/lib/store';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    useCartStore.persist.rehydrate();
    setMounted(true);
  }, []);

  const handleCheckout = () => {
    if (!isLoggedIn) {
      toast.error('Please login to place your order');
      router.push('/login?redirect=/cart');
      return;
    }
    // Proceed to checkout
    toast.success('Proceeding to checkout...');
    router.push('/checkout');
  };

  if (!mounted) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="bg-white p-10 rounded-3xl shadow-xl flex flex-col items-center max-w-md w-full text-center border border-gray-100">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <FiShoppingBag className="text-4xl text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added any delicious food to your cart yet.</p>
          <Link href="/" className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-transform active:scale-95 flex justify-center items-center">
            Start Exploring
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getTotal();
  const deliveryFee = 30; // ₹30 Flat fee example
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 py-10 px-4">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Your Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all hover:shadow-md">
                {/* Fallback image if there isn't one */}
                <div className="w-full sm:w-24 h-24 bg-orange-100 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl">
                  🍔
                </div>
                
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{item.description?.substring(0, 50)}...</p>
                  <p className="text-primary font-bold mt-2">₹{item.price}</p>
                </div>
                
                <div className="flex items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-primary transition-colors"
                    >
                      <FiMinus />
                    </button>
                    <span className="w-10 text-center font-semibold">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-primary transition-colors"
                    >
                      <FiPlus />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => removeItem(item._id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <FiTrash2 className="text-xl" />
                  </button>
                </div>
              </div>
            ))}
            
            <button 
              onClick={clearCart}
              className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-2 mt-4 transition-colors"
            >
              <FiTrash2 /> Clear entire cart
            </button>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h3>
              
              <div className="space-y-4 text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-800">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-gray-800">₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-success">
                  <span>Platform Fee</span>
                  <span>Free (Zero Commission)</span>
                </div>
                
                <div className="h-px bg-gray-200 my-4"></div>
                
                <div className="flex justify-between items-end">
                  <span className="font-bold text-gray-800">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-primary">₹{total.toFixed(2)}</span>
                    <p className="text-xs text-gray-400 mt-1">Includes all taxes</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleCheckout}
                className="w-full mt-8 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-transform active:scale-95 flex justify-center items-center gap-2"
              >
                Checkout <FiArrowRight />
              </button>
              
              <p className="text-center text-xs text-gray-400 mt-4">
                By proceeding, you agree to our Terms and Conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
