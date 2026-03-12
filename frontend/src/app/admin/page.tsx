import Link from 'next/link';

export default function AdminDashboard() {
  const links = [
    { href: '/admin/courses', label: 'Courses', desc: 'Add, edit courses (e.g. BBA, Diploma)' },
    { href: '/admin/branches', label: 'Branches', desc: 'Manage branches per course' },
    { href: '/admin/subjects', label: 'Subjects', desc: 'Manage subjects per course, branch and semester (exam link, min/max marks)' },
    { href: '/admin/students', label: 'Students', desc: 'Add, edit student details and assign course/branch' },
    { href: '/admin/results', label: 'Results', desc: 'View results and add bulk result entry' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-iimst-orange hover:shadow-md transition"
          >
            <h2 className="font-semibold text-gray-900">{l.label}</h2>
            <p className="text-sm text-gray-500 mt-1">{l.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
