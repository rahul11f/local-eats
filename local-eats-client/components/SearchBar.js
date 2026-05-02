'use client';

import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length > 0) {
      onSearch(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search restaurants, cuisines, or dishes..."
          className="w-full px-6 py-4 pl-12 rounded-full text-dark placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl" />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-opacity-90 transition"
        >
          Search
        </button>
      </div>
    </form>
  );
}
