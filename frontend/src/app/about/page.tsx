import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicHeader />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">About IIMST</h1>
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
            <p className="text-gray-600 mb-6 leading-relaxed">
              <strong>Infinity Institute of Management Science & Technology (IIMST)</strong> offers management education, diploma courses and technical programs through distance and online learning. Our aim is to help working professionals and learners upgrade their qualifications without compromising on their current commitments.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              IIMST students get access to a unified student portal. After login, you can view and download your digital ID card, check semester-wise results and take subject-wise online examinations. The institute manages admissions, study material and exam schedules, with dedicated support for queries.
            </p>
            <div className="flex items-center gap-4 p-6 bg-iimst-orange-50 rounded-xl">
              <Image src="/iimst_logo.jpg" alt="IIMST" width={80} height={80} className="rounded-full object-cover" />
              <div>
                <p className="text-lg font-semibold text-gray-800">तमसो मा ज्योतिर्गमय</p>
                <p className="text-gray-600 text-sm">From darkness, lead me to light.</p>
              </div>
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Portal Features</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <li>Single login for students — role-based access</li>
            <li>Digital ID card — view and download anytime</li>
            <li>Semester-wise results and grade cards</li>
            <li>Subject-wise online examinations with minimum passing criteria</li>
            <li>Admin dashboard for institute staff to manage students, subjects and results</li>
          </ul>
          <p className="mt-6">
            <Link href="/about/vision" className="text-iimst-orange font-semibold hover:underline">Vision & Mission →</Link>
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
