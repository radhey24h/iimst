import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import Link from 'next/link';

export default function AboutPage() {
  const features = [
    { icon: '🎓', title: 'Quality Education', desc: 'Industry-aligned programs designed for working professionals and career advancement' },
    { icon: '🌐', title: 'Distance Learning', desc: 'Flexible online and distance learning modes to balance work and education' },
    { icon: '📱', title: 'Digital Portal', desc: 'Unified student portal for ID card, results, and online examinations' },
    { icon: '🤝', title: 'Dedicated Support', desc: 'Admission guidance, study material, and continuous academic support' },
  ];

  const portalFeatures = [
    { icon: '👤', text: 'Single login for students — role-based access' },
    { icon: '🆔', text: 'Digital ID card — view and download anytime' },
    { icon: '📊', text: 'Semester-wise results and grade cards' },
    { icon: '📝', text: 'Subject-wise online examinations with passing criteria' },
    { icon: '⚙️', text: 'Admin dashboard for managing students and results' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About IIMST</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Infinity Institute of Management Science & Technology
            </p>
            <div className="mt-6 inline-block bg-white/20 backdrop-blur-sm rounded-xl px-8 py-4">
              <p className="text-2xl font-bold text-white mb-1">तमसो मा ज्योतिर्गमय</p>
              <p className="text-white/90">From darkness, lead me to light</p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-gray-100 mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-1 h-8 bg-iimst-orange rounded"></span>
                Who We Are
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                <strong className="text-iimst-orange">Infinity Institute of Management Science & Technology (IIMST)</strong> offers professional development programs, diploma courses and skill-based certifications through distance and online learning. Our aim is to help working professionals and learners upgrade their skills and qualifications without compromising on their current commitments.
              </p>
              <p className="text-gray-600 leading-relaxed text-lg">
                IIMST students get access to a unified student portal. After login, you can view and download your digital ID card, check semester-wise results and take subject-wise online examinations. The institute manages admissions, study material and exam schedules, with dedicated support for queries.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {features.map((feature) => (
                <div key={feature.title} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-xl hover:border-iimst-orange/30 transition-all">
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Portal Features */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-8 text-center">Student Portal Features</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {portalFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors">
                    <span className="text-2xl">{feature.icon}</span>
                    <p className="text-white text-sm pt-1">{feature.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-12">
              <Link href="/about/vision" className="inline-flex items-center gap-2 bg-iimst-orange hover:bg-iimst-orange-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl">
                Our Vision & Mission →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
