import AdminLayout from '../components/AdminLayout';
import { trpc } from '../lib/trpc';
import { Church, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'wouter';

export default function AdminDashboard() {
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();

  const cards = [
    { label: 'Total Churches', value: stats?.total ?? 0, icon: Church, color: 'text-navy', bg: 'bg-blue-50' },
    { label: 'Pending Review', value: stats?.pending ?? 0, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Approved', value: stats?.approved ?? 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Rejected', value: stats?.rejected ?? 0, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-navy">Dashboard</h2>
          <p className="text-gray-500 mt-1">Overview of all church registrations.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border p-6 animate-pulse h-28" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {cards.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-xl border p-6 flex items-center gap-4">
                <div className={`${bg} p-3 rounded-lg`}>
                  <Icon className={color} size={22} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-navy">{value}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {(stats?.pending ?? 0) > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="text-yellow-600" size={20} />
              <div>
                <p className="font-semibold text-yellow-800">
                  {stats!.pending} church{stats!.pending !== 1 ? 'es' : ''} awaiting review
                </p>
                <p className="text-sm text-yellow-700">Review and approve or reject applications.</p>
              </div>
            </div>
            <Link href="/admin/churches?status=pending">
              <a className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors">
                Review Now
              </a>
            </Link>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
