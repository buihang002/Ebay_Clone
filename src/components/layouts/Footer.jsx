import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-muted py-10 border-t border-muted-foreground/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About eBay Clone</h3>
            <p className="text-muted-foreground">
              This is a demo project showcasing an eBay-like marketplace built
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Shop Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products?category=electronics"
                  className="hover:underline text-muted-foreground"
                >
                  Electronics
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=fashion"
                  className="hover:underline text-muted-foreground"
                >
                  Fashion
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=home-garden"
                  className="hover:underline text-muted-foreground"
                >
                  Home & Garden
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=toys-games"
                  className="hover:underline text-muted-foreground"
                >
                  Toys & Games
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=sports"
                  className="hover:underline text-muted-foreground"
                >
                  Sports
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="hover:underline text-muted-foreground">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:underline text-muted-foreground">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:underline text-muted-foreground">
                  Returns
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:underline text-muted-foreground">
                  Shipping Info
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Connected</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-facebook"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-twitter"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-instagram"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-muted-foreground/20 mt-8 pt-8 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} eBay Clone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
