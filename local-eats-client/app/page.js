'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRestaurantStore } from '@/lib/store';
import { restaurantAPI } from '@/lib/api';
import RestaurantCard from '@/components/RestaurantCard';
import SearchBar from '@/components/SearchBar';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function HomePage() {
  const { restaurants, setRestaurants, setLoading, loading } = useRestaurantStore();
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const response = await restaurantAPI.getAllRestaurants({});
      setRestaurants(response.data.restaurants);
      setFilteredRestaurants(response.data.restaurants);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterRestaurants(query, selectedCuisine);
  };

  const handleCuisineFilter = (cuisine) => {
    setSelectedCuisine(cuisine);
    filterRestaurants(searchQuery, cuisine);
  };

  const filterRestaurants = (query, cuisine) => {
    let filtered = restaurants;

    if (query) {
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (cuisine && cuisine !== 'all') {
      filtered = filtered.filter((r) =>
        r.cuisine.includes(cuisine)
      );
    }

    setFilteredRestaurants(filtered);
  };

  const cuisines = [
    'North Indian',
    'Chinese',
    'Fast Food',
    'Biryani',
    'Pizza',
    'Desserts',
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#FFF5F1] to-[#FFEBE1] pt-24 pb-32 overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-warning/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-10 left-10 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

        <div className="container relative z-10 flex flex-col items-center text-center">
          <span className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold text-primary mb-6 shadow-sm border border-primary/10">
            Kahalgaon's #1 Food Delivery App
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight max-w-4xl">
            Order food online in <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Kahalgaon</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl font-medium">
            Zero Commission • Low Delivery Fees • Fresh Food Direct from Local Kitchens
          </p>
          
          <div className="w-full max-w-2xl bg-white p-2 rounded-2xl shadow-xl shadow-primary/10 border border-white/50">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Cuisine Filter */}
      <section className="py-16 bg-white relative z-20 -mt-10">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Explore Categories</h2>
            <span className="text-primary font-semibold hidden md:block cursor-pointer hover:underline">View All Cuisines &rarr;</span>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x">
            <button
              onClick={() => handleCuisineFilter('all')}
              className={`flex-shrink-0 snap-start px-8 py-3 rounded-2xl font-bold whitespace-nowrap transition-all shadow-sm ${
                selectedCuisine === '' || selectedCuisine === 'all'
                  ? 'bg-primary text-white shadow-primary/30 shadow-lg scale-105'
                  : 'bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Cuisines
            </button>
            {cuisines.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => handleCuisineFilter(cuisine)}
                className={`flex-shrink-0 snap-start px-8 py-3 rounded-2xl font-bold whitespace-nowrap transition-all shadow-sm ${
                  selectedCuisine === cuisine
                    ? 'bg-primary text-white shadow-primary/30 shadow-lg scale-105'
                    : 'bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurants Grid */}
      <section className="py-12 bg-gray-50">
        <div className="container">
          {loading ? (
            <LoadingSpinner />
          ) : filteredRestaurants.length > 0 ? (
            <div>
              <div className="flex justify-between items-end mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  Featured Restaurants
                </h2>
                <span className="text-gray-500 font-medium">{filteredRestaurants.length} places found</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant._id}
                    restaurant={restaurant}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No Restaurants Found
              </h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                We couldn't find any restaurants matching your current filters.
              </p>
              <button
                onClick={fetchRestaurants}
                className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-transform active:scale-95"
              >
                View All Restaurants
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Why LocalEats? */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-success/5 rounded-full filter blur-3xl"></div>
        
        <div className="container relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Why Choose LocalEats?</h2>
            <p className="text-lg text-gray-500">We're built differently. By cutting out the middleman, we make food delivery better for everyone.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:border-primary/30 transition-colors group">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary transition-all">
                <span className="text-3xl group-hover:text-white transition-colors">🤝</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Zero Commission</h3>
              <p className="text-gray-600 leading-relaxed">
                We charge absolutely ₹0 commission to our restaurant partners. Your money goes directly to the people cooking your food.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:border-success/30 transition-colors group">
              <div className="bg-success/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-success transition-all">
                <span className="text-3xl group-hover:text-white transition-colors">🚀</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Lowest Delivery Fees</h3>
              <p className="text-gray-600 leading-relaxed">
                Enjoy flat delivery rates from ₹0 to ₹30. No hidden charges, no surge pricing, no unexpected packaging fees.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:border-warning/30 transition-colors group">
              <div className="bg-warning/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-warning transition-all">
                <span className="text-3xl group-hover:text-white transition-colors">❤️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Hyper-Local Focus</h3>
              <p className="text-gray-600 leading-relaxed">
                Built specifically for Kahalgaon. We know the town, the restaurants, and the delivery routes better than anyone else.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Meta Content */}
      <section className="hidden">
        <h2>Food Delivery in Kahalgaon</h2>
        <p>Order food online from your favorite restaurants in Kahalgaon with zero commission and low delivery fees.</p>
      </section>
    </div>
  );
}
