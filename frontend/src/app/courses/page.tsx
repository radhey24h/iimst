'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

export default function CoursesPage() {
  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash?.slice(1) : '';
    if (hash) {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const management = [
    { title: 'BBA', desc: 'Bachelor of Business Administration' },
    { title: 'MBA', desc: 'Master of Business Administration' },
    { title: 'PGDM', desc: 'Post Graduate Diploma in Management' },
    { title: 'Diploma in Business Management', desc: 'One-year diploma for business fundamentals' },
  ];
  const diploma = [
    { title: 'Six Months Diploma', desc: 'Short-term diplomas in management and skill-based streams' },
    { title: 'One Year Diploma', desc: 'One-year diploma programs for career upgradation' },
    { title: 'Diploma in Computer Application', desc: 'DCA for IT and computer basics' },
  ];
  const technical = [
    { title: 'Mechanical Engineering', desc: 'Diploma in Mechanical Engineering' },
    { title: 'Electrical Engineering', desc: 'Diploma in Electrical Engineering' },
    { title: 'Computer Science & IT', desc: 'BCA, MCA and related programs' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicHeader />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Courses</h1>
            <p className="text-gray-600 max-w-2xl">
              IIMST offers management, diploma and technical programs through distance and online learning. Choose a program that fits your career goals and schedule.
            </p>
          </div>

          <section id="management" className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-iimst-orange rounded" /> Management Programs
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {management.map((c) => (
                <div key={c.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900 mb-2">{c.title}</h3>
                  <p className="text-gray-600 text-sm">{c.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="diploma" className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-iimst-orange rounded" /> Diploma Programs
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {diploma.map((c) => (
                <div key={c.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900 mb-2">{c.title}</h3>
                  <p className="text-gray-600 text-sm">{c.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-iimst-orange rounded" /> Technical & Engineering
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {technical.map((c) => (
                <div key={c.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900 mb-2">{c.title}</h3>
                  <p className="text-gray-600 text-sm">{c.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="bg-iimst-orange-50 rounded-xl p-8 text-center border border-iimst-orange/20">
            <p className="text-gray-700 mb-4">For admission, fees and eligibility, please contact us.</p>
            <Link href="/contact" className="inline-block bg-iimst-orange hover:bg-iimst-orange-dark text-white px-6 py-2.5 rounded-md font-medium">
              Contact Us
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
