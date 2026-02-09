import Link from 'next/link';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import Image from 'next/image';
import EnquiryForm from '@/components/EnquiryForm';
import ScrollToHash from '@/components/ScrollToHash';

export default function HomePage() {
  const achievements = [
    { value: '5,000+', label: 'Students Enrolled' },
    { value: '25+', label: 'Years of Excellence' },
    { value: '50+', label: 'Programs Offered' },
    { value: '98%', label: 'Placement Support' },
  ];

  const courses = [
    { title: 'Management Programs', desc: 'BBA, MBA, PGDM and executive diplomas for leadership and business careers.', href: '/courses#management', img: 'https://picsum.photos/400/240?random=1' },
    { title: 'Diploma Programs', desc: 'Six-month and one-year diplomas in management, IT and skill-based streams.', href: '/courses#diploma', img: 'https://picsum.photos/400/240?random=2' },
    { title: 'Technical Programs', desc: 'Diploma and certification programs in engineering and computer applications.', href: '/courses', img: 'https://picsum.photos/400/240?random=3' },
  ];

  const whyChoose = [
    { title: 'Recognized Programs', desc: 'IIMST offers industry-aligned programs designed for working professionals and career upgradation.' },
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
        {/* Hero: 2 columns - content left, enquiry form right */}
        <section id="enquiry" className="relative bg-gray-900 min-h-[480px] flex items-center">
          <div className="absolute inset-0">
            <Image src="https://picsum.photos/1920/600?random=hero" alt="" fill className="object-cover opacity-40" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/70" />
          </div>
          <div className="container mx-auto px-4 max-w-7xl relative z-10 py-12">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  Infinity Institute of Management Science & Technology
                </h1>
                <p className="text-base md:text-lg text-gray-200 mb-6">
                  Quality management and technical education through flexible learning. Enrol in diploma, MBA, PGDM and certification programs. Access your student portal for ID card, results and online exams.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/login" className="bg-iimst-orange hover:bg-iimst-orange-dark text-white px-6 py-3 rounded-md font-semibold transition-colors">
                    Portal Login
                  </Link>
                  <Link href="/courses" className="bg-white/10 hover:bg-white/20 text-white border border-white/40 px-6 py-3 rounded-md font-semibold transition-colors">
                    View Courses
                  </Link>
                </div>
              </div>
              <div className="flex justify-center lg:justify-end">
                <div className="w-full max-w-sm">
                  <EnquiryForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section className="py-14 px-4 bg-white shadow-sm">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Our Reach</h2>
            <p className="text-center text-gray-600 mb-10 max-w-xl mx-auto text-sm">
              IIMST has been enabling learners across India with management and skill-based programs.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {achievements.map((a) => (
                <div key={a.label} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-iimst-orange">{a.value}</p>
                  <p className="text-gray-600 mt-1 text-sm">{a.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Welcome */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative h-72 lg:h-96 rounded-xl overflow-hidden shadow-lg order-2 lg:order-1">
                <Image src="https://picsum.photos/600/400?random=welcome" alt="IIMST" fill className="object-cover" />
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
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2">Programs We Offer</h2>
            <p className="text-center text-gray-600 mb-10 max-w-xl mx-auto text-sm">
              Management, diploma and technical programs to suit your career goals.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {courses.map((c) => (
                <Link key={c.href} href={c.href} className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-iimst-orange/30 transition-all">
                  <div className="relative h-44 bg-gray-200">
                    <Image src={c.img} alt={c.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-iimst-orange transition-colors">{c.title}</h3>
                    <p className="text-gray-600 text-sm">{c.desc}</p>
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
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2">Why IIMST</h2>
            <p className="text-center text-gray-600 mb-10 max-w-xl mx-auto text-sm">
              Practical learning, flexible schedules and a single portal for all student needs.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyChoose.map((w) => (
                <div key={w.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900 mb-2">{w.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{w.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Accreditation */}
        <section className="py-10 px-4 bg-white border-y border-gray-100">
          <div className="container mx-auto max-w-7xl text-center">
            <p className="text-gray-600 text-sm mb-2">Accreditation & Certification</p>
            <div className="flex flex-wrap justify-center gap-8 items-center">
              <div className="w-24 h-14 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-600 font-medium">Recognized</div>
              <div className="w-24 h-14 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-600 font-medium">Quality Programs</div>
              <div className="w-24 h-14 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-600 font-medium">Student Portal</div>
            </div>
          </div>
        </section>

        {/* Updates */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Latest Updates</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {updates.map((n, i) => (
                <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <p className="font-medium text-gray-900">{n.title}</p>
                  <p className="text-gray-500 text-sm mt-1">{n.date}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">What Our Students Say</h2>
            <p className="text-center text-gray-600 mb-10 text-sm">Experiences from IIMST learners.</p>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t) => (
                <div key={t.name} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <p className="text-gray-600 text-sm italic mb-4">&ldquo;{t.text}&rdquo;</p>
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-gray-500 text-sm">{t.program} Student</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA - light section before footer */}
        <section className="py-14 px-4 bg-iimst-orange-50 border-t border-iimst-orange/10">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="flex justify-center mb-6">
              <Image src="/iimst_logo.jpg" alt="IIMST" width={72} height={72} className="rounded-full object-cover border-2 border-iimst-orange/20" />
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
