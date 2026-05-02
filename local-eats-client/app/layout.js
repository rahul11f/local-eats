import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'LocalEats Kahalgaon - Zero Commission Food Delivery',
  description:
    'Order delicious food from local restaurants in Kahalgaon with zero commission and low delivery fees',
  keywords: 'food delivery, restaurants, Kahalgaon, online food order',
  openGraph: {
    title: 'LocalEats - Zero Commission Food Delivery in Kahalgaon',
    description: 'Order from your favorite local restaurants',
    url: 'https://localeatskahalgaon.com',
    siteName: 'LocalEats',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FF6B35" />
        {/* Structured Data for Local SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'LocalEats',
            description: 'Zero Commission Food Delivery Platform',
            image: '/logo.png',
            telephone: '+91-XXXXXXXXXX',
            email: 'support@localeatskahalgaon.com',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Kahalgaon',
              addressLocality: 'Kahalgaon',
              addressRegion: 'Bihar',
              postalCode: '813207',
              addressCountry: 'IN',
            },
            areaServed: 'Kahalgaon',
            url: 'https://localeatskahalgaon.com',
          })}
        </script>
      </head>
      <body>
        <Navbar />
        <main className="min-h-screen bg-light">{children}</main>
        <Footer />
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
