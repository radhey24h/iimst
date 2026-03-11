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
    { title: 'BBA Program', desc: 'Bachelor of Business Administration - Professional Development Program', duration: '3 Years', icon: '💼' },
    { title: 'MBA Program', desc: 'Master of Business Administration - Professional Development Program', duration: '2 Years', icon: '🎓' },
    { title: 'PGDM', desc: 'Post Graduate Diploma in Management - Industry Certification', duration: '2 Years', icon: '📈' },
    { title: 'Diploma in Business Management', desc: 'One-year diploma for business fundamentals', duration: '1 Year', icon: '📊' },
  ];
  const diploma = [
    { title: 'Six Months Diploma', desc: 'Short-term diplomas in management and skill-based streams', duration: '6 Months', icon: '⏱️' },
    { title: 'One Year Diploma', desc: 'One-year diploma programs for career upgradation', duration: '1 Year', icon: '📝' },
    { title: 'Diploma in Computer Application', desc: 'DCA for IT and computer basics', duration: '1 Year', icon: '💻' },
  ];
  const technical = [
    { title: 'Mechanical Engineering', desc: 'Diploma in Mechanical Engineering', duration: '3 Years', icon: '⚙️' },
    { title: 'Electrical Engineering', desc: 'Diploma in Electrical Engineering', duration: '3 Years', icon: '⚡' },
    { title: 'Computer Science & IT', desc: 'BCA, MCA and related programs', duration: '3-4 Years', icon: '🖥️' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 py-16 px-4">
          <div className="container mx-auto max-w-7xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Courses</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-6">
              IIMST offers professional development, diploma and skill-based programs through distance and online learning. Choose a program that fits your career goals and schedule.
            </p>
          </div>
        </section>

        {/* Courses Content */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            {/* Management Programs */}
            <section id="management" className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💼</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Management Programs</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {management.map((c) => (
                  <div key={c.title} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-orange-300 transition-all group">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{c.icon}</div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{c.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{c.desc}</p>
                    <div className="flex items-center gap-2 text-xs text-iimst-orange font-semibold">
                      <span>🕒</span>
                      <span>{c.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Diploma Programs */}
            <section id="diploma" className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎓</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Diploma Programs</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {diploma.map((c) => (
                  <div key={c.title} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-blue-300 transition-all group">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{c.icon}</div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{c.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{c.desc}</p>
                    <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold">
                      <span>🕒</span>
                      <span>{c.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Technical & Engineering */}
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💻</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Technical & Engineering</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {technical.map((c) => (
                  <div key={c.title} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-purple-300 transition-all group">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{c.icon}</div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{c.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{c.desc}</p>
                    <div className="flex items-center gap-2 text-xs text-purple-600 font-semibold">
                      <span>🕒</span>
                      <span>{c.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA Section */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-center shadow-2xl">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ready to Start Your Learning Journey?
              </h3>
              <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
                For admission details, fees structure, and eligibility criteria, our team is here to help.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/contact" className="inline-block bg-iimst-orange hover:bg-iimst-orange-dark text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                  Contact for Admission
                </Link>
                <Link href="/login" className="inline-block bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-2 border-white px-8 py-3 rounded-lg font-semibold transition-all">
                  Student Login
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
