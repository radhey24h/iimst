import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicHeader />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
          <p className="text-gray-600 mb-8">
            For admission, course details, portal login or any other queries, reach out to IIMST.
          </p>
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
              <p className="text-gray-600">N-92, Pratap Market, Munirka, New Delhi – 110067</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
              <a href="tel:+918595229157" className="text-iimst-orange hover:underline">+91 8595229157</a>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
              <a href="mailto:info@iimst.co.in" className="text-iimst-orange hover:underline">info@iimst.co.in</a>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Working Hours</h3>
              <p className="text-gray-600">Monday to Saturday – 10:00 AM to 6:00 PM</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Student Portal</h3>
              <p className="text-gray-600">Use the <Link href="/login" className="text-iimst-orange hover:underline">Login</Link> link to access your ID card, results and exams.</p>
            </div>
          </div>
          <p className="mt-6 text-gray-600 text-sm">
            You can also submit a quick enquiry from the <Link href="/#enquiry" className="text-iimst-orange hover:underline">home page</Link>.
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
