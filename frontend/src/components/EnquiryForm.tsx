'use client';

import { useState } from 'react';
import { submitEnquiry } from '@/lib/api';

export default function EnquiryForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [courseInterest, setCourseInterest] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setStatus('sending');
    try {
      await submitEnquiry({ name, email, phone: phone || undefined, message: message || undefined, courseInterest: courseInterest || undefined });
      setStatus('success');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setCourseInterest('');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Could not submit. Try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 space-y-3">
      <h3 className="font-semibold text-gray-900 text-lg">Quick Enquiry</h3>
      <input
        type="text"
        placeholder="Your name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-iimst-orange focus:border-transparent"
        required
      />
      <input
        type="email"
        placeholder="Email *"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-iimst-orange focus:border-transparent"
        required
      />
      <input
        type="tel"
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-iimst-orange focus:border-transparent"
      />
      <select
        value={courseInterest}
        onChange={(e) => setCourseInterest(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-iimst-orange focus:border-transparent bg-white"
      >
        <option value="">Course interest (optional)</option>
        <option value="Management">Management</option>
        <option value="Diploma">Diploma</option>
        <option value="Technical">Technical</option>
      </select>
      <textarea
        placeholder="Message (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-iimst-orange focus:border-transparent resize-none"
      />
      {status === 'success' && <p className="text-green-600 text-sm">Thank you. We will get back to you soon.</p>}
      {status === 'error' && <p className="text-red-600 text-sm">{errorMsg}</p>}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full bg-iimst-orange hover:bg-iimst-orange-dark text-white py-2 rounded-md font-medium text-sm disabled:opacity-50"
      >
        {status === 'sending' ? 'Sending...' : 'Submit Enquiry'}
      </button>
    </form>
  );
}
