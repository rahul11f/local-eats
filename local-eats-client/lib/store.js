import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

// Auth Store
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoggedIn: false,

      setAuth: (user, token) => {
        set({ user, token, isLoggedIn: true });
        Cookies.set('user', JSON.stringify(user));
        Cookies.set('token', token);
      },

      logout: () => {
        set({ user: null, token: null, isLoggedIn: false });
        Cookies.remove('user');
        Cookies.remove('token');
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        const updated = { ...currentUser, ...userData };
        set({ user: updated });
        Cookies.set('user', JSON.stringify(updated));
      },

      initializeAuth: () => {
        const user = Cookies.get('user');
        const token = Cookies.get('token');
        if (user && token) {
          set({
            user: JSON.parse(user),
            token,
            isLoggedIn: true,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      skipHydration: true,
    }
  )
);

// Cart Store
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,

      addItem: (menuItem, quantity = 1, customizations = []) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) =>
              item._id === menuItem._id &&
              JSON.stringify(item.customizations) ===
                JSON.stringify(customizations)
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item._id === menuItem._id &&
                JSON.stringify(item.customizations) ===
                  JSON.stringify(customizations)
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          return {
            items: [
              ...state.items,
              { ...menuItem, quantity, customizations },
            ],
          };
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item._id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item._id === itemId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], restaurantId: null });
      },

      setRestaurant: (restaurantId) => {
        set({ restaurantId });
      },

      getTotal: () => {
        return get().items.reduce(
          (sum, item) =>
            sum +
            (item.discountPrice || item.price) * item.quantity +
            (item.customizations?.reduce(
              (custSum, cust) => custSum + (cust.additionalPrice || 0),
              0
            ) || 0) * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      skipHydration: true,
    }
  )
);

// Orders Store
export const useOrderStore = create((set) => ({
  currentOrder: null,
  orders: [],

  setCurrentOrder: (order) => {
    set({ currentOrder: order });
  },

  setOrders: (orders) => {
    set({ orders });
  },

  updateOrderStatus: (orderId, status) => {
    set((state) => ({
      currentOrder:
        state.currentOrder?._id === orderId
          ? { ...state.currentOrder, status }
          : state.currentOrder,
      orders: state.orders.map((order) =>
        order._id === orderId ? { ...order, status } : order
      ),
    }));
  },

  clearCurrentOrder: () => {
    set({ currentOrder: null });
  },
}));

// Restaurants Store
export const useRestaurantStore = create((set) => ({
  restaurants: [],
  selectedRestaurant: null,
  loading: false,

  setRestaurants: (restaurants) => {
    set({ restaurants });
  },

  setSelectedRestaurant: (restaurant) => {
    set({ selectedRestaurant: restaurant });
  },

  setLoading: (loading) => {
    set({ loading });
  },

  searchRestaurants: (query) => {
    set((state) => ({
      restaurants: state.restaurants.filter((r) =>
        r.name.toLowerCase().includes(query.toLowerCase())
      ),
    }));
  },
}));

// Delivery Location Store
export const useLocationStore = create((set) => ({
  userLocation: null,
  selectedAddress: null,

  setUserLocation: (lat, lng) => {
    set({ userLocation: { latitude: lat, longitude: lng } });
  },

  setSelectedAddress: (address) => {
    set({ selectedAddress: address });
  },
}));
