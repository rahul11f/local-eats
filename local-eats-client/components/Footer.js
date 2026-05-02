'use client';

import Link from 'next/link';
import { FiFacebook, FiInstagram, FiTwitter, FiPhone, FiMail } from 'react-icons/fi';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">LocalEats</h3>
            <p className="text-gray-400 mb-4">
              Zero commission food delivery platform supporting local restaurants in Kahalgaon.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary transition">
                <FiFacebook className="text-2xl" />
              </a>
              <a href="#" className="hover:text-primary transition">
                <FiInstagram className="text-2xl" />
              </a>
              <a href="#" className="hover:text-primary transition">
                <FiTwitter className="text-2xl" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/" className="hover:text-primary transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-primary transition">
                  Browse Restaurants
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-primary transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-primary transition">
                  Partner with Us
                </Link>
              </li>
            </ul>
          </div>

          {/* For Restaurants */}
          <div>
            <h4 className="text-lg font-bold mb-4">For Restaurants</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/" className="hover:text-primary transition">
                  Register Restaurant
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-primary transition">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-primary transition">
                  Subscription Plans
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-primary transition">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-4">Contact Us</h4>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center gap-3">
                <FiPhone className="text-primary" />
                <span>+91-9876543210</span>
              </div>
              <div className="flex items-center gap-3">
                <FiMail className="text-primary" />
                <span>support@localeatskahalgaon.com</span>
              </div>
              <p className="text-sm mt-4">Kahalgaon, Bihar 813207</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-400 text-sm">
            <div className="flex gap-4 flex-wrap">
              <Link href="/" className="hover:text-primary transition">
                Privacy Policy
              </Link>
              <Link href="/" className="hover:text-primary transition">
                Terms & Conditions
              </Link>
              <Link href="/" className="hover:text-primary transition">
                Cookie Policy
              </Link>
            </div>
            <div className="text-center">
              <p>&copy; {currentYear} LocalEats. All rights reserved.</p>
            </div>
            <div className="text-right">
              <p>Made with ❤️ for Kahalgaon</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
