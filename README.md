# LocalEats - Zero Commission Food Delivery Platform for Kahalgaon

## 🎯 Project Overview

LocalEats is a **complete, production-ready MVP** for a local food delivery marketplace designed for Kahalgaon, Bihar. It's built with a **zero-commission business model** to support local restaurants while providing affordable delivery to customers.

### 🚀 Key Features

**For Customers:**
- Browse restaurants by cuisine and category
- Browse menus with advanced filtering
- Add to cart with persistent state
- Real-time order tracking with driver location
- Order history and reorder functionality
- User authentication with email/phone
- Multiple delivery address management
- Live map tracking (Mapbox GL JS)

**For Restaurants:**
- Subscription-based business model (no per-order commission)
- Dashboard with real-time order management
- Menu management (CRUD operations)
- Order status updates (pending → confirmed → preparing → ready → picked_up → in_transit → delivered)
- Real-time notifications for new orders (Socket.IO)
- Earnings and subscription tracking
- Restaurant profile management

**For Admin:**
- User management (block/unblock customers)
- Restaurant approval workflow
- Delivery driver assignment (manual dispatch)
- Order monitoring dashboard
- Platform analytics with revenue breakdown
- Delivery fee zone configuration
- Subscription plan management

**For Delivery Drivers:**
- Web-based dashboard for order assignment
- Order tracking and status updates
- Real-time location sharing
- Earnings summary and analytics

---

## 💼 Business Model

### Revenue Streams

**1. Restaurant Subscriptions** (ZERO Commission per order)
- **Basic Plan:** ₹199/month
- **Premium Plan:** ₹399/month
- No per-order commission - supporting local restaurants
- Monthly recurring revenue

**2. Delivery Fees** (Customer-paid)
- < 500m: ₹0 (free delivery)
- < 2km: ₹15
- < 5km: ₹30
- Distance-based calculation with no surge pricing

**3. No Hidden Charges**
- All fees are transparent
- 5% GST on food items
- No platform commission
- No hidden charges model builds trust

### Market Context

- **Small town focus:** 20-50 restaurants, 500-700 active users
- **Direct competitor:** "Jamato" (charges 25-30% commission)
- **Our advantage:** Zero commission model attracts restaurants, lower delivery fees attract customers
- **Path to profitability:** Focus on subscription adoption and order volume

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Atlas free tier)
- **Authentication:** JWT (jsonwebtoken)
- **Real-time:** Socket.IO
- **Payment:** Razorpay (transaction-fee based)
- **Email:** Nodemailer + Brevo (free tier)
- **SMS:** MSG91 (free tier for India)
- **Image Storage:** Cloudinary (optional, free tier)
- **Security:** Helmet.js, CORS, Rate Limiting

### Frontend
- **Framework:** Next.js 14 (React 18)
- **Styling:** Tailwind CSS
- **Maps:** Mapbox GL JS (free tier) / Leaflet
- **API Client:** Axios
- **Real-time:** Socket.IO Client
- **State Management:** Zustand
- **Notifications:** React Toastify
- **Icons:** React Icons

### Deployment
- **Backend:** Render.com or Railway (free tier)
- **Frontend:** Vercel or Netlify (free tier)
- **Database:** MongoDB Atlas (free tier: 512MB)
- **Domain:** Free .in domain or custom domain

---

## 📋 Project Structure

```
local-eats/
├── server/                          # Backend Express.js app
│   ├── models/                      # Mongoose schemas
│   │   ├── User.js                  # Customer schema
│   │   ├── Restaurant.js            # Restaurant schema
│   │   ├── MenuItem.js              # Menu items schema
│   │   ├── Order.js                 # Order schema with lifecycle
│   │   ├── Payment.js               # Payment tracking schema
│   │   ├── RestaurantOwner.js       # Restaurant owner auth
│   │   └── DeliveryDriver.js        # Delivery partner schema
│   ├── controllers/                 # Route handlers
│   │   ├── customerController.js    # Auth & customer endpoints
│   │   ├── restaurantOwnerController.js # Restaurant dashboard
│   │   ├── orderController.js       # Order & payment logic
│   │   └── adminController.js       # Admin panel endpoints
│   ├── middleware/                  # Custom middleware
│   │   ├── auth.js                  # JWT verification
│   │   ├── validation.js            # Input validation
│   │   └── errorHandler.js          # Error handling
│   ├── server.js                    # Main Express app
│   ├── package.json                 # Dependencies
│   └── .env.example                 # Environment variables template
├── client/                          # Frontend Next.js app
│   ├── pages/                       # Next.js pages
│   │   ├── index.js                 # Home page
│   │   ├── restaurants.js           # Restaurant listing
│   │   ├── [restaurantId].js        # Restaurant detail & menu
│   │   ├── cart.js                  # Shopping cart
│   │   ├── checkout.js              # Order placement
│   │   ├── orders/                  # Order tracking pages
│   │   ├── auth/                    # Authentication pages
│   │   └── dashboard/               # Customer & Restaurant dashboards
│   ├── components/                  # Reusable React components
│   │   ├── Navbar.js
│   │   ├── RestaurantCard.js
│   │   ├── MenuItem.js
│   │   ├── OrderTracker.js
│   │   ├── Map.js
│   │   └── ChatBot.js               # FAQ chatbot
│   ├── styles/                      # Global styles
│   ├── public/                      # Static assets
│   ├── next.config.js               # Next.js configuration
│   ├── tailwind.config.js           # Tailwind CSS config
│   ├── package.json                 # Dependencies
│   └── .env.example                 # Environment variables
├── README.md                        # This file
├── docker-compose.yml               # Local MongoDB setup
└── LEGAL/                           # Legal compliance
    ├── PRIVACY_POLICY.md
    ├── TERMS_AND_CONDITIONS.md
    ├── COOKIE_POLICY.md
    ├── DISCLAIMER.md
    └── GRIEVANCE_REDRESSAL.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or Atlas account for free tier)
- Razorpay API keys (free sandbox account)
- Mapbox GL JS token (free tier)

### 1. Backend Setup

```bash
# Clone repository
git clone https://github.com/yourusername/local-eats.git
cd local-eats/server

# Install dependencies
npm install

# Create .env file from template
cp .env.example .env

# Update .env with your credentials:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/local-eats
# RAZORPAY_KEY_ID=your_key
# RAZORPAY_KEY_SECRET=your_secret
# JWT_SECRET=your_super_secret_key_min_32_chars
```

### 2. MongoDB Setup (Free Tier)

1. **Create MongoDB Atlas account:** https://www.mongodb.com/cloud/atlas
2. **Create free cluster:** Select "Shared" tier (512MB free storage)
3. **Create database user:** Set username & password
4. **Whitelist IP:** Add your IP address to network access
5. **Get connection string:** Use in .env as MONGODB_URI

```bash
# Connection string format:
# mongodb+srv://username:password@cluster.mongodb.net/local-eats?retryWrites=true&w=majority
```

### 3. Start Backend

```bash
# From server directory
npm run dev

# Expected output:
# ✅ Server running on http://localhost:5000
# 🗄️  MongoDB: Connected
# 🔄 Socket.IO: Enabled for real-time tracking
```

### 4. Frontend Setup

```bash
# In new terminal, from client directory
cd ../client

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Update .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:5000
# NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

### 5. Start Frontend

```bash
npm run dev

# Opens at http://localhost:3000
```

---

## 📱 API Documentation

### Customer Endpoints

#### Authentication
```
POST   /api/auth/register              # Register customer
POST   /api/auth/login                 # Login customer
GET    /api/auth/me                    # Get profile
PUT    /api/auth/update-profile        # Update profile
POST   /api/auth/add-address           # Add delivery address
POST   /api/auth/logout                # Logout
```

#### Orders
```
POST   /api/orders                      # Create order
POST   /api/orders/verify-payment      # Verify Razorpay payment
GET    /api/orders/:orderId            # Get order details
GET    /api/orders/customer/my-orders  # Get my orders
GET    /api/orders/:orderId/track      # Real-time order tracking
PUT    /api/orders/:orderId/rate       # Rate order
```

#### Browse Restaurants
```
GET    /api/restaurants                 # Get all restaurants (paginated)
GET    /api/restaurants/:restaurantId  # Get restaurant & menu
```

### Restaurant Owner Endpoints

```
POST   /api/restaurants/register        # Register restaurant
POST   /api/restaurants/login           # Login
GET    /api/restaurants/dashboard       # Dashboard metrics
GET    /api/restaurants/orders          # Get all orders
PUT    /api/restaurants/orders/:id/status # Update order status
POST   /api/restaurants/menu            # Add menu item
PUT    /api/restaurants/menu/:itemId    # Update menu item
DELETE /api/restaurants/menu/:itemId    # Delete menu item
GET    /api/restaurants/menu            # Get all menu items
```

### Admin Endpoints

```
GET    /api/admin/users                 # Get all users
PUT    /api/admin/users/:userId/block   # Block/unblock user
GET    /api/admin/restaurants/pending   # Pending approvals
PUT    /api/admin/restaurants/:id/approve # Approve restaurant
GET    /api/admin/restaurants           # All restaurants
GET    /api/admin/drivers               # All drivers
PUT    /api/admin/drivers/:id/approve   # Approve driver
GET    /api/admin/analytics             # Platform analytics
PUT    /api/admin/orders/:id/assign-driver # Assign driver
GET    /api/admin/orders/monitoring     # Order monitoring
```

---

## 🔐 Razorpay Payment Integration

### Setup

1. **Create Razorpay Account:** https://razorpay.com/
2. **Get API Keys:** From Settings → API Keys
3. **Add to .env:**
```
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

### Payment Flow

1. Customer creates order → Backend generates Razorpay order
2. Frontend opens Razorpay payment modal
3. Customer completes payment
4. Razorpay webhook verifies payment
5. Order status changes to "confirmed"
6. Restaurant receives notification via Socket.IO

### Testing

Use Razorpay test credentials:
- **Test Card:** 4111 1111 1111 1111
- **Expiry:** Any future date
- **CVV:** Any 3 digits
- **OTP:** Any value

---

## 🔄 Real-Time Features (Socket.IO)

### Real-time Order Tracking

```javascript
// Frontend: Subscribe to order updates
socket.emit('subscribe_order', orderId);
socket.on('driver_location_update', (location) => {
  // Update driver marker on map
  setDriverLocation(location);
});
```

### Real-time Restaurant Notifications

```javascript
// Restaurant owner subscribes
socket.emit('subscribe_restaurant', restaurantId);
socket.on('new_order', (orderData) => {
  // Show notification toast
  showNotification('New order received!', orderData);
});
```

### Real-time Order Status Updates

```javascript
// Any order status change broadcasts to all listeners
socket.on('status_changed', (data) => {
  // Update UI with new status
  updateOrderStatus(data.status);
});
```

---

## 🗺️ Local SEO Optimization

### Implemented Features

1. **Location-based Pages**
   - `/food-delivery-in-kahalgaon`
   - `/order-food-online-kahalgaon`
   - Dynamic restaurant pages with LocalBusiness schema

2. **Meta Tags**
   ```html
   <meta name="description" content="Order authentic food in Kahalgaon with LocalEats - Zero commission, low delivery fees (₹10-30)">
   <meta name="keywords" content="food delivery in Kahalgaon, order food online, biryani, restaurants">
   ```

3. **Schema Markup**
   ```json
   {
     "@context": "https://schema.org",
     "@type": "LocalBusiness",
     "name": "LocalEats Kahalgaon",
     "image": "logo.png",
     "address": {
       "@type": "PostalAddress",
       "streetAddress": "Kahalgaon",
       "addressLocality": "Kahalgaon",
       "addressRegion": "Bihar",
       "postalCode": "813210",
       "addressCountry": "IN"
     }
   }
   ```

4. **Sitemap & Robots.txt**
   - Auto-generated sitemap.xml
   - Optimized robots.txt for crawlers

5. **Mobile Optimization**
   - Responsive design for 4G networks
   - Image compression with Next.js Image
   - Lazy loading for menu items
   - Core Web Vitals optimized

---

## 💬 AI Chatbot Implementation

### Recommended Approach: Rule-Based FAQ Chatbot

LocalEats includes a lightweight, rule-based chatbot for customer support:

```javascript
// Chat flows
const chatbotFlows = {
  "where is my order": () => fetchLatestOrderStatus(),
  "how do i cancel": () => showCancellationPolicy(),
  "track delivery": () => showMapWithDriverLocation(),
  "refund status": () => fetchRefundDetails(),
  "restaurant hours": () => showRestaurantHours()
};
```

### Optional: Advanced AI Chatbot

For more advanced needs, integrate Ollama for local LLM:

```bash
# Install Ollama
curl https://ollama.ai/install.sh | sh

# Run locally (no API costs)
ollama run llama2

# Train on LocalEats FAQs
python fine_tune_chatbot.py --model llama2 --data faqs.json
```

### Indian Language Support (Optional)

```bash
# Install Bhashini for multilingual support
npm install bhashini-ai

# Supports Hindi, Hinglish, regional languages
```

---

## 📧 Email & SMS Setup

### Email (Brevo/Sendinblue - Free Tier)

1. **Sign up:** https://www.sendinblue.com/
2. **Get SMTP credentials:**
   ```
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_USER=your_email
   SMTP_PASSWORD=your_password
   ```
3. **Email templates configured:**
   - Welcome email
   - Order confirmation
   - Order ready
   - Delivery notification

### SMS (MSG91 - Free Tier for India)

1. **Sign up:** https://msg91.com/
2. **Get AUTH_KEY:**
   ```
   MSG91_AUTH_KEY=your_auth_key
   MSG91_ROUTE=4
   ```
3. **SMS templates:**
   - OTP verification
   - Order confirmation
   - Delivery updates

---

## 🚀 Deployment Guide

### 1. Backend Deployment (Render.com - Free Tier)

```bash
# 1. Create Render account: https://render.com/
# 2. Connect GitHub repository
# 3. Create new Web Service
# 4. Set environment variables in Render dashboard
# 5. Deploy!

# Render free tier includes:
# - Auto-deploys on git push
# - 750 hours/month
# - Custom domain available
```

### 2. Frontend Deployment (Vercel - Free)

```bash
# 1. Push code to GitHub
# 2. Go to https://vercel.com/
# 3. Import project
# 4. Set environment variables:
#    - NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com
#    - NEXT_PUBLIC_MAPBOX_TOKEN=your_token
# 5. Deploy!

# Vercel free tier includes:
# - Unlimited deploys
# - CDN included
# - Automatic SSL
# - Analytics
```

### 3. Database Deployment (MongoDB Atlas - Free)

Already covered in Quick Start → MongoDB Setup section.

### 4. Custom Domain Setup

```bash
# Free .in domain (if eligible): https://registry.in/
# Alternative free domains: .tk, .ml, .ga (freenom.com)
# or use Render/Vercel's free subdomains

# Add SSL certificate (auto-provided by Vercel/Render)
```

### 5. GitHub Setup for CI/CD

```bash
# Create .github/workflows/deploy.yml for automated testing
# On each push: run tests, build, deploy to Render/Vercel
```

---

## 🧪 Testing

### Backend Testing

```bash
cd server
npm test

# Test files in __tests__ folder
# Jest + Supertest for API testing
# Covers critical flows:
# - User registration & login
# - Order creation & payment verification
# - Restaurant dashboard
```

### Manual API Testing

Use Postman collection: `LocalEats.postman_collection.json`

```bash
# Import collection and test all endpoints
# Test authentication flows
# Test payment verification
# Test Socket.IO connections
```

---

## 📋 Legal Compliance

All required documents included in `/LEGAL` folder:

### 1. Privacy Policy
- Compliant with: India's IT Act 2000, SPDI Rules 2011, DPDP Act 2023
- Covers: Data collection, usage, sharing, user rights
- Includes: Complaint redressal mechanism

### 2. Terms & Conditions
- Compliant with: Indian Contract Act 1872, IT Act 2000
- Covers: Acceptable use, disclaimer, refund policy, termination
- Includes: Indemnity clauses for third-party failures

### 3. Cookie Policy
- Explains cookie usage (essential, functional, analytics)
- User consent management
- Compliance with IT Act Section 66D

### 4. Disclaimer
- Liability protection for:
  - Delivery delays
  - Food quality issues
  - Restaurant closure
  - Force majeure events
- Food allergy disclaimer (restaurant responsibility)

### 5. Grievance Redressal
- Designated grievance officer contact
- 48-hour response time
- Compliant with Consumer Protection (E-Commerce) Rules 2020

---

## 🔒 Security Best Practices

✅ **Implemented:**
- JWT token-based authentication
- Password hashing with bcryptjs
- Rate limiting (100 requests/15 mins per IP)
- CORS enabled with frontend URL
- Helmet.js for security headers
- Environment variables for secrets (no hardcoding)
- Input validation & sanitization with Joi
- HTTPS enforced on production
- Razorpay signature verification for payments

✅ **Recommended:**
- Enable 2FA for admin accounts
- Regular security audits
- Data encryption at rest & in transit
- Regular backups (MongoDB Atlas auto-backups)
- Monitor API usage with rate limiting

---

## 📊 Performance Optimization

**Backend:**
- Database indexing on frequently queried fields
- Pagination for list endpoints
- Compression middleware
- Caching strategies

**Frontend:**
- Next.js Image component for optimization
- Lazy loading for menu items
- Code splitting & tree shaking
- CDN via Vercel
- Service Workers for offline support

---

## 🛠️ Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
→ Ensure MongoDB Atlas cluster is running or local MongoDB is started
```

### Razorpay Payment Fails
```
Error: Invalid signature
→ Verify RAZORPAY_KEY_SECRET in .env is correct
→ Test with Razorpay test credentials first
```

### Socket.IO Not Connecting
```
→ Ensure SOCKET_CORS_ORIGIN matches frontend URL in .env
→ Check browser console for CORS errors
```

### CORS Errors
```
→ Update FRONTEND_URL in backend .env
→ Ensure origins match exactly (http vs https, port number)
```

---

## 📞 Support & Feedback

- **Email:** support@localeatskahalgaon.com
- **Phone:** Contact grievance officer (see GRIEVANCE_REDRESSAL.md)
- **GitHub Issues:** Report bugs and request features

---

## 📝 License

This project is licensed under the MIT License. See LICENSE file for details.

---

## 🎯 Future Roadmap

### Phase 2 (Post-MVP)
- [ ] Native mobile apps (React Native/Flutter)
- [ ] Marketing website & SEO optimization
- [ ] Customer loyalty program
- [ ] Referral rewards system
- [ ] Analytics dashboard improvements
- [ ] Multi-language support (Hindi, regional)
- [ ] Subscription management improvements
- [ ] Advanced scheduling (pre-orders)

### Phase 3 (Scaling)
- [ ] Expand to other towns in Bihar
- [ ] AI-powered recommendations
- [ ] Surge pricing during peak hours
- [ ] Partnerships with payment providers
- [ ] Institutional delivery (offices, schools)
- [ ] Food aggregator APIs

---

## 🙏 Credits

Built with ❤️ for local restaurants and customers in Kahalgaon.

**Technology Stack Credits:**
- Next.js & React teams
- Express.js & Node.js communities
- MongoDB & Mongoose
- Razorpay for payment processing
- Mapbox for mapping services
- Socket.IO for real-time communication

---

**Made with ❤️ to support local businesses and connect communities.**
