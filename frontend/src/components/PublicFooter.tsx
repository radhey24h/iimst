import Link from 'next/link';
import Image from 'next/image';
import logo from '@/assets/logo/iimst_logo.jpg';

export default function PublicFooter() {
  return (
    <footer className="bg-iimst-footer text-white mt-20">
      <div className="container mx-auto px-4 max-w-7xl py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image src={logo} alt="IIMST" width={56} height={56} className="rounded-full object-cover border-2 border-white/20" />
              <div>
                <h3 className="text-lg font-bold text-white">IIMST</h3>
                <p className="text-xs text-gray-400">Infinity Institute of Management Science & Technology</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Quality education and skill development through management, diploma and technical programs. One login — role-based access for admin and students.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5">
              <li><Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">Home</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white text-sm transition-colors">About Us</Link></li>
              <li><Link href="/courses" className="text-gray-400 hover:text-white text-sm transition-colors">Courses</Link></li>
              <li><Link href="/login" className="text-gray-400 hover:text-white text-sm transition-colors">Login</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-2.5 text-gray-400 text-sm">
              <li>N-92, Pratap Market, Munirka,<br />New Delhi – 110067</li>
              <li><a href="tel:+918595229157" className="hover:text-white transition-colors">+91 8595229157</a></li>
              <li><a href="mailto:info@iimst.co.in" className="hover:text-white transition-colors">info@iimst.co.in</a></li>
              <li>Mon - Sat: 10:00 AM - 6:00 PM</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-iimst-footer-light pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-gray-500 text-sm">
          <span>© {new Date().getFullYear()} IIMST. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/contact" className="hover:text-white transition-colors">Terms & Conditions</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
