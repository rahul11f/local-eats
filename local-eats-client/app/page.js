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
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-12">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">
            Order Food Online in Kahalgaon
          </h1>
          <p className="text-xl mb-6">
            Zero Commission • Low Delivery Fees • Fresh Food
          </p>
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      {/* Cuisine Filter */}
      <section className="py-8 bg-white">
        <div className="container">
          <h2 className="text-2xl font-bold mb-6">Popular Cuisines</h2>
          <div className="flex overflow-x-auto gap-4 pb-4">
            <button
              onClick={() => handleCuisineFilter('all')}
              className={`px-6 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCuisine === '' || selectedCuisine === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-light border border-primary text-primary hover:bg-primary/10'
              }`}
            >
              All
            </button>
            {cuisines.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => handleCuisineFilter(cuisine)}
                className={`px-6 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCuisine === cuisine
                    ? 'bg-primary text-white'
                    : 'bg-light border border-primary text-primary hover:bg-primary/10'
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurants Grid */}
      <section className="py-12">
        <div className="container">
          {loading ? (
            <LoadingSpinner />
          ) : filteredRestaurants.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold mb-6">
                {filteredRestaurants.length} Restaurants Available
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant._id}
                    restaurant={restaurant}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-dark mb-4">
                No Restaurants Found
              </h2>
              <p className="text-secondary mb-6">
                Try adjusting your search or filters
              </p>
              <button
                onClick={fetchRestaurants}
                className="btn btn-primary"
              >
                View All Restaurants
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Why LocalEats? */}
      <section className="py-12 bg-white">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Why LocalEats?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Zero Commission</h3>
              <p className="text-secondary">
                Support local restaurants directly. We take no commission per order.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚗</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Low Delivery Fees</h3>
              <p className="text-secondary">
                Flat delivery rates. ₹0-₹30 based on distance.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">❤️</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Support Local</h3>
              <p className="text-secondary">
                Direct support to local businesses in Kahalgaon.
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
