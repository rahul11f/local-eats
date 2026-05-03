'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { FiUsers, FiShoppingBag, FiDollarSign, FiCheckCircle, FiActivity } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setMounted(true);
    // Secure this route
    if (!isLoggedIn || user?.role !== 'admin') {
      toast.error('Unauthorized. Admins only.');
      router.push('/');
    }
  }, [isLoggedIn, user, router]);

  if (!mounted || !isLoggedIn || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Revenue', value: '₹45,231', icon: <FiDollarSign />, color: 'bg-green-500' },
    { title: 'Active Orders', value: '24', icon: <FiShoppingBag />, color: 'bg-primary' },
    { title: 'Registered Users', value: '1,432', icon: <FiUsers />, color: 'bg-blue-500' },
    { title: 'Pending Approvals', value: '5', icon: <FiCheckCircle />, color: 'bg-warning' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 min-h-screen shadow-sm sticky top-0">
        <div className="p-6">
          <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
            <FiActivity className="text-primary" /> Admin Panel
          </h2>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">LocalEats Management</p>
        </div>
        <nav className="mt-4 px-4 space-y-2">
          {['overview', 'restaurants', 'orders', 'users', 'drivers'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium capitalize ${
                activeTab === tab
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 capitalize">{activeTab}</h1>
              <p className="text-gray-500 mt-1">Manage and monitor platform activity</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-gray-700">System Live</span>
            </div>
          </header>

          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl ${stat.color} shadow-lg`}>
                          {stat.icon}
                        </div>
                      </div>
                      <h3 className="text-gray-500 font-medium">{stat.title}</h3>
                      <p className="text-3xl font-black text-gray-800 mt-1">{stat.value}</p>
                    </div>
                    {/* Decorative background shape */}
                    <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 ${stat.color}`}></div>
                  </div>
                ))}
              </div>

              {/* Recent Activity Mockup */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <FiShoppingBag />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">New Order #89{i}2</p>
                        <p className="text-sm text-gray-500">Just placed at Biryani House</p>
                      </div>
                      <span className="ml-auto text-xs text-gray-400 font-medium">Just now</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'overview' && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 h-[600px] flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <FiActivity className="text-4xl text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h3>
              <p className="text-gray-500 max-w-md">The {activeTab} management interface is currently being connected to the backend APIs. Check back soon!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
