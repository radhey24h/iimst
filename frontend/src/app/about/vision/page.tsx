import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import Link from 'next/link';

export default function VisionPage() {
  const values = [
    { icon: '🎯', title: 'Excellence', desc: 'Committed to delivering quality education and continuous improvement' },
    { icon: '🔓', title: 'Accessibility', desc: 'Making education accessible to working professionals and all learners' },
    { icon: '🤝', title: 'Integrity', desc: 'Transparent processes and honest communication with all stakeholders' },
    { icon: '🚀', title: 'Innovation', desc: 'Embracing technology and modern teaching methodologies' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Vision & Mission</h1>
            <p className="text-xl text-white/90">Guiding principles that drive IIMST forward</p>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {/* Vision */}
              <div className="bg-white rounded-2xl p-8 md:p-10 shadow-xl border-t-4 border-blue-500 hover:shadow-2xl transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🔭</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
                </div>
                <p className="text-gray-600 leading-relaxed text-lg">
                  To be a <strong className="text-blue-600">trusted name</strong> in professional development and skill-based education, enabling learners to achieve their career and personal development goals through quality distance and online programs.
                </p>
              </div>

              {/* Mission */}
              <div className="bg-white rounded-2xl p-8 md:p-10 shadow-xl border-t-4 border-purple-500 hover:shadow-2xl transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
                </div>
                <p className="text-gray-600 leading-relaxed text-lg">
                  To deliver <strong className="text-purple-600">industry-relevant</strong> professional development, diploma and skill-based certification programs with flexible learning options, supported by a transparent student portal for ID card, results and examinations. We aim to support working professionals and those seeking career advancement opportunities.
                </p>
              </div>
            </div>

            {/* Core Values */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 shadow-xl mb-12">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Core Values</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {values.map((value) => (
                  <div key={value.title} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all">
                    <div className="text-4xl mb-3">{value.icon}</div>
                    <h3 className="font-bold text-white text-lg mb-2">{value.title}</h3>
                    <p className="text-white/80 text-sm leading-relaxed">{value.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Commitment Section */}
            <div className="bg-gradient-to-r from-iimst-orange to-orange-600 rounded-2xl p-8 md:p-10 shadow-xl text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Committed to Your Success
              </h3>
              <p className="text-white/90 text-lg max-w-3xl mx-auto mb-6">
                At IIMST, we believe education is a lifelong journey. We're dedicated to providing the tools, resources, and support you need to achieve your academic and career goals.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/courses" className="bg-white text-iimst-orange px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                  Explore Courses
                </Link>
                <Link href="/contact" className="bg-white/20 backdrop-blur-sm text-white border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors">
                  Contact Us
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
