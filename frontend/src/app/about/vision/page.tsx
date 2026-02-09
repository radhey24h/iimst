import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

export default function VisionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicHeader />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Vision & Mission</h1>
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Vision</h2>
              <p className="text-gray-600">
                To be a trusted name in management and technical education, enabling learners to achieve their career and personal development goals through quality distance and online programs.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Mission</h2>
              <p className="text-gray-600">
                To deliver industry-relevant management, diploma and technical programs with flexible learning options, supported by a transparent student portal for ID card, results and examinations. We aim to support working professionals and those seeking a second chance at higher education.
              </p>
            </section>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
