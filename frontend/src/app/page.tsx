import Link from 'next/link';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import HeroCarousel from '@/components/HeroCarousel';
import Image from 'next/image';
import logo from '@/assets/logo/iimst_logo.jpg';
import ScrollToHash from '@/components/ScrollToHash';

export default function HomePage() {
  const achievements = [
    { value: '2,000+', label: 'Students Enrolled' },
    { value: '15+', label: 'Years of Excellence' },
    { value: '100+', label: 'Programs Offered' },
    { value: '98%', label: 'Placement Support' },
  ];

  const courses = [
    { title: 'Management Programs', desc: 'BBA, MBA, PGDM and executive diplomas for leadership and business careers.', href: '/courses#management', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80' },
    { title: 'Diploma Programs', desc: 'Six-month and one-year diplomas in management, IT and skill-based streams.', href: '/courses#diploma', image: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=800&q=80' },
    { title: 'Technical Programs', desc: 'Diploma and certification programs in engineering and computer applications.', href: '/courses', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80' },
  ];

  const whyChoose = [
    { title: 'Industry-Aligned Programs', desc: 'IIMST offers skill-based and professional development programs designed for working professionals and career upgradation.' },
    { title: 'Flexible Learning', desc: 'Study at your own pace with distance and online options. Balance work and education easily.' },
    { title: 'Student Portal', desc: 'One login for digital ID card, semester results and subject-wise online examinations.' },
    { title: 'Dedicated Support', desc: 'Admission guidance, study material and exam support from our academic team.' },
  ];

  const updates = [
    { title: 'Admission open for MBA and PGDM 2025–26', date: 'Jan 2025' },
    { title: 'New diploma batches starting March 2025', date: 'Jan 2025' },
    { title: 'Portal login for results and ID card now active', date: '2025' },
  ];

  const testimonials = [
    { name: 'Priya S.', program: 'MBA', text: 'IIMST gave me the flexibility to complete my MBA while working. The portal made checking results and downloading my ID card very simple.' },
    { name: 'Rahul M.', program: 'Diploma', text: 'Smooth admission process and clear communication. The online exam and result system is straightforward.' },
    { name: 'Anita K.', program: 'PGDM', text: 'Good faculty support and study material. I could access my semester grades and documents anytime from the portal.' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ScrollToHash />
      <PublicHeader />
      <main className="flex-1">
        {/* Hero Carousel */}
        <HeroCarousel />

        {/* Achievements */}
        <section className="py-14 px-4 bg-gradient-to-b from-orange-50 via-white to-white border-b border-gray-100">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Our Reach</h2>
            <p className="text-center text-gray-600 mb-10 max-w-xl mx-auto text-sm">
              IIMST has been enabling learners across India with management and skill-based programs.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {achievements.map((a) => (
                <div key={a.label} className="text-center group">
                  <p className="text-3xl md:text-4xl font-bold text-iimst-orange group-hover:scale-110 transition-transform">{a.value}</p>
                  <p className="text-gray-600 mt-1 text-sm">{a.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Welcome */}
        <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative h-72 lg:h-96 rounded-2xl overflow-hidden shadow-xl order-2 lg:order-1">
                <img
                  src="https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80"
                  alt="IIMST Campus - Education Excellence"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="relative text-white p-8 flex flex-col justify-end h-full">
                  <h3 className="text-3xl font-bold mb-2">Education Excellence</h3>
                  <p className="text-white/90 text-lg">Building Futures Through Learning</p>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">About IIMST</h2>
                <p className="text-gray-600 mb-4">
                  IIMST (Infinity Institute of Management Science & Technology) focuses on management education, diploma courses and technical programs through distance and online modes. Our courses are designed for working professionals and learners who want to upgrade their qualifications without leaving their jobs.
                </p>
                <p className="text-gray-600 mb-6">
                  Registered students get access to a single portal: view and download your digital ID card, check semester-wise results and take subject-wise online examinations. Our admin and academic teams ensure smooth admission, study material and exam support.
                </p>
                <Link href="/about" className="text-iimst-orange font-semibold hover:underline">More about IIMST →</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Programs */}
        <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2">Programs We Offer</h2>
            <p className="text-center text-gray-600 mb-10 max-w-xl mx-auto text-sm">
              Professional development, diploma and skill-based programs to suit your career goals.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {courses.map((c) => (
                <Link key={c.href} href={c.href} className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-iimst-orange/50 transition-all">
                  <div className="relative h-44 overflow-hidden">
                    <img src={c.image} alt={c.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <img src={c.image} alt={c.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-iimst-orange transition-colors">{c.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{c.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/courses" className="inline-block bg-iimst-orange hover:bg-iimst-orange-dark text-white px-6 py-2.5 rounded-md font-medium">
                View All Courses
              </Link>
            </div>
          </div>
        </section>

        {/* Why IIMST */}
        <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2">Why IIMST</h2>
            <p className="text-center text-gray-600 mb-10 max-w-xl mx-auto text-sm">
              Practical learning, flexible schedules and a single portal for all student needs.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyChoose.map((w, index) => (
                <div 
                  key={w.title} 
                  className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-2xl hover:border-iimst-orange/30 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-iimst-orange/10 to-iimst-orange/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    <span className="text-2xl">{index === 0 ? '🎯' : index === 1 ? '⏰' : index === 2 ? '🖥️' : '🤝'}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-iimst-orange transition-colors">{w.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{w.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Accreditation */}
        <section className="py-10 px-4 bg-gradient-to-r from-blue-50/30 via-purple-50/30 to-orange-50/30 border-y border-gray-100">
          <div className="container mx-auto max-w-7xl text-center">
            <p className="text-gray-600 text-sm mb-4 font-medium">Accreditation & Certification</p>
            <div className="flex flex-wrap justify-center gap-8 items-center">
              <div className="group w-28 h-16 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 flex items-center justify-center text-xs text-gray-700 font-semibold border-2 border-blue-200/50 hover:border-blue-400 hover:scale-110 hover:shadow-lg transition-all duration-300 cursor-pointer">
                <span className="group-hover:scale-110 transition-transform">✓ Recognized</span>
              </div>
              <div className="group w-28 h-16 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 flex items-center justify-center text-xs text-gray-700 font-semibold border-2 border-green-200/50 hover:border-green-400 hover:scale-110 hover:shadow-lg transition-all duration-300 cursor-pointer">
                <span className="group-hover:scale-110 transition-transform">★ Quality Programs</span>
              </div>
              <div className="group w-28 h-16 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 flex items-center justify-center text-xs text-gray-700 font-semibold border-2 border-orange-200/50 hover:border-orange-400 hover:scale-110 hover:shadow-lg transition-all duration-300 cursor-pointer">
                <span className="group-hover:scale-110 transition-transform">🎓 Student Portal</span>
              </div>
            </div>
          </div>
        </section>

        {/* Updates */}
        <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Latest Updates</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {updates.map((n, i) => (
                <div 
                  key={i} 
                  className="group bg-white rounded-xl p-6 border-2 border-gray-100 shadow-sm hover:shadow-xl hover:border-iimst-orange hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-iimst-orange/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="flex items-start gap-3 relative">
                    <div className="flex-shrink-0 w-10 h-10 bg-iimst-orange/10 group-hover:bg-iimst-orange/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                      <span className="text-lg">{i === 0 ? '📢' : i === 1 ? '🎓' : '🔔'}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 group-hover:text-iimst-orange transition-colors">{n.title}</p>
                      <p className="text-gray-500 text-sm mt-2 flex items-center gap-1">
                        <span className="text-xs">📅</span> {n.date}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">What Our Students Say</h2>
            <p className="text-center text-gray-600 mb-10 text-sm">Experiences from IIMST learners.</p>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t, index) => (
                <div 
                  key={t.name} 
                  className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100 hover:border-iimst-orange/30 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer relative"
                >
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-iimst-orange/10 group-hover:bg-iimst-orange/20 rounded-full flex items-center justify-center text-2xl group-hover:rotate-12 transition-all duration-300">
                    💬
                  </div>
                  <div className="relative mt-4">
                    <div className="text-4xl text-iimst-orange/20 font-serif leading-none mb-2">&ldquo;</div>
                    <p className="text-gray-600 text-sm italic mb-4 leading-relaxed">{t.text}</p>
                    <div className="text-4xl text-iimst-orange/20 font-serif leading-none text-right">&rdquo;</div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="font-bold text-gray-900 group-hover:text-iimst-orange transition-colors">{t.name}</p>
                    <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                      <span className="text-xs">🎓</span> {t.program} Student
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA - light section before footer */}
        <section className="py-14 px-4 bg-gradient-to-b from-gray-50 to-orange-50 border-t border-iimst-orange/10">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="flex justify-center mb-6">
              <Image src={logo} alt="IIMST" width={72} height={72} className="rounded-full object-cover border-2 border-iimst-orange/20" />
            </div>
            <p className="text-xl font-semibold text-gray-800 mb-2">तमसो मा ज्योतिर्गमय</p>
            <p className="text-gray-600 text-sm mb-6">From darkness, lead me to light.</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Your Student Portal</h2>
            <p className="text-gray-600 mb-6">Login to view your ID card, semester results and attempt subject-wise exams.</p>
            <Link href="/login" className="inline-block bg-iimst-orange hover:bg-iimst-orange-dark text-white px-8 py-3 rounded-md font-semibold">
              Login
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
