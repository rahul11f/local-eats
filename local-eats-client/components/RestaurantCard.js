import Link from 'next/link';
import Image from 'next/image';
import { FiStar, FiMapPin, FiClock } from 'react-icons/fi';

export default function RestaurantCard({ restaurant }) {
  const getDeliveryTime = () => {
    return `${Math.floor(Math.random() * 30) + 30}-${Math.floor(Math.random() * 30) + 45}`;
  };

  return (
    <Link href={`/restaurant/${restaurant._id}`}>
      <div className="card cursor-pointer group">
        {/* Restaurant Banner */}
        <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-200">
          {restaurant.banner ? (
            <Image
              src={restaurant.banner}
              alt={restaurant.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white text-4xl">🍽️</span>
            </div>
          )}
          {/* Badge */}
          <div className="absolute top-3 right-3 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
            ₹0 Commission
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="space-y-3">
          {/* Name & Rating */}
          <div>
            <h3 className="font-bold text-lg text-dark mb-1 truncate">
              {restaurant.name}
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded text-sm">
                <FiStar className="w-4 h-4" />
                <span>{restaurant.avgRating?.toFixed(1) || 4.5}</span>
              </div>
              <span className="text-sm text-secondary">
                ({restaurant.totalRatings || 0} ratings)
              </span>
            </div>
          </div>

          {/* Cuisines */}
          <div className="text-sm text-secondary">
            {restaurant.cuisine?.join(', ') || 'Various'}
          </div>

          {/* Delivery Time & Fee */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-secondary">
              <FiClock className="w-4 h-4" />
              <span>{getDeliveryTime()} mins</span>
            </div>
            <div className="text-primary font-semibold">
              ₹{restaurant.minOrderValue || 100}+ order
            </div>
          </div>

          {/* Minimum Order & Status */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-secondary">Min: ₹{restaurant.minOrderValue || 100}</span>
            {restaurant.isActive ? (
              <span className="badge badge-success">Open</span>
            ) : (
              <span className="badge bg-gray-300 text-dark">Closed</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
