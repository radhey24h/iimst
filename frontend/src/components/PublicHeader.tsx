'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import logo from '@/assets/logo/iimst_logo.jpg';

type NavLink = { label: string; href: string };
type NavItem = NavLink | { label: string; children: NavLink[] };

const mainNav: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'About Us',
    children: [
      { label: 'About IIMST', href: '/about' },
      { label: 'Vision & Mission', href: '/about/vision' },
    ],
  },
  {
    label: 'Courses',
    children: [
      { label: 'Management Programs', href: '/courses#management' },
      { label: 'Diploma Programs', href: '/courses#diploma' },
      { label: 'All Courses', href: '/courses' },
    ],
  },
  { label: 'Contact', href: '/contact' },
];

function hasChildren(item: NavItem): item is NavItem & { children: NavLink[] } {
  return Array.isArray((item as { children?: NavLink[] }).children);
}

export default function PublicHeader() {
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <>
      {/* Top bar - contact only, no login */}
      <div className="bg-gray-800 text-white text-sm">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-wrap items-center justify-between py-2 gap-2">
            <div className="flex flex-wrap items-center gap-6">
              <a href="tel:+918595229157" className="hover:text-iimst-orange-light transition-colors">+91 8595229157</a>
              <a href="mailto:info@iimst.co.in" className="hover:text-iimst-orange-light transition-colors">info@iimst.co.in</a>
              <span className="hidden sm:inline text-gray-400">Mon - Sat: 6:00 AM - 6:00 PM</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-400 hidden md:inline">Follow Us</span>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">f</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">𝕏</a>
            </div>
          </div>
        </div>
      </div>

      {/* Main nav - orange bar with single Login */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 flex-shrink-0">
              <Image src={logo} alt="IIMST" width={52} height={52} className="rounded-full object-cover border-2 border-iimst-orange/20" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">IIMST</h1>
                <p className="text-xs text-gray-500 hidden lg:block">Infinity Institute of Management Science & Technology</p>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {mainNav.map((item) =>
                hasChildren(item) ? (
                  <div
                    key={item.label}
                    className="relative py-4 z-50"
                    onMouseEnter={() => setOpenDropdown(item.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button type="button" className="px-4 py-2 text-gray-700 hover:text-iimst-orange font-medium text-sm rounded-md hover:bg-iimst-orange-50 transition-colors">
                      {item.label} ▾
                    </button>
                    {openDropdown === item.label && (
                      <div className="absolute top-full left-0 mt-0 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-[100] min-w-max">
                        {(item.children || []).map((c) => (
                          <Link
                            key={c.href}
                            href={c.href}
                            className="block px-4 py-2.5 text-gray-700 hover:bg-iimst-orange-50 hover:text-iimst-orange text-sm transition-colors"
                          >
                            {c.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-4 py-2 text-gray-700 hover:text-iimst-orange font-medium text-sm rounded-md hover:bg-iimst-orange-50 transition-colors"
                  >
                    {item.label}
                  </Link>
                )
              )}
              <Link
                href="/login"
                className="ml-2 bg-iimst-orange hover:bg-iimst-orange-dark text-white px-5 py-2 rounded-md font-semibold text-sm shadow-sm transition-colors"
              >
                Login
              </Link>
            </nav>

            <button
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              <span className="block w-6 h-0.5 bg-gray-700 mb-1.5" />
              <span className="block w-6 h-0.5 bg-gray-700 mb-1.5" />
              <span className="block w-6 h-0.5 bg-gray-700" />
            </button>
          </div>

          {open && (
            <div className="lg:hidden py-4 border-t border-gray-100 bg-white relative z-50" aria-label="Mobile menu">
              {mainNav.map((item) =>
                hasChildren(item) ? (
                  <div key={item.label} className="py-1">
                    <p className="px-3 py-1.5 font-semibold text-gray-700 text-sm">{item.label}</p>
                    {(item.children || []).map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="block py-2 px-5 text-gray-600 hover:text-iimst-orange text-sm"
                        onClick={() => setOpen(false)}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block py-2.5 px-3 text-gray-700 hover:text-iimst-orange font-medium"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              )}
              <Link
                href="/login"
                className="mt-3 mx-3 inline-block bg-iimst-orange text-white px-5 py-2.5 rounded-md font-semibold text-center w-[calc(100%-24px)]"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
            </div>
          )}
        </div>

        {/* Orange accent strip under nav */}
        <div className="h-1 bg-gradient-to-r from-iimst-orange to-iimst-orange-dark" />
      </header>
    </>
  );
}
