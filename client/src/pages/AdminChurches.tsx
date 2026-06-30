import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { trpc } from '../lib/trpc';
import { CheckCircle, XCircle, RotateCcw, Eye, EyeOff, ChevronDown } from 'lucide-react';

type Status = 'all' | 'pending' | 'approved' | 'rejected';

const STATUS_TABS: { label: string; value: Status }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function AdminChurches() {
  const [status, setStatus] = useState<Status>('all');
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: churches = [], isLoading } = trpc.admin.allChurches.useQuery({ status });

  const approve = trpc.admin.approveChurch.useMutation({
    onSuccess: () => utils.admin.allChurches.invalidate(),
  });
  const reject = trpc.admin.rejectChurch.useMutation({
    onSuccess: () => { utils.admin.allChurches.invalidate(); setRejectingId(null); setRejectReason(''); },
  });
  const resetPending = trpc.admin.resetToPending.useMutation({
    onSuccess: () => utils.admin.allChurches.invalidate(),
  });
  const toggleActive = trpc.admin.toggleActive.useMutation({
    onSuccess: () => utils.admin.allChurches.invalidate(),
  });

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-navy">Churches</h2>
          <p className="text-gray-500 mt-1">Manage church registrations and approvals.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === tab.value
                  ? 'bg-navy text-white'
                  : 'bg-white border text-gray-600 hover:border-navy hover:text-navy'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border p-5 animate-pulse h-20" />
            ))}
          </div>
        ) : churches.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
            No churches found.
          </div>
        ) : (
          <div className="space-y-3">
            {churches.map((church) => (
              <div key={church.id} className="bg-white rounded-xl border overflow-hidden">
                {/* Row */}
                <div className="flex items-center gap-4 p-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-navy truncate">{church.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[church.approvalStatus ?? 'pending']}`}>
                        {church.approvalStatus}
                      </span>
                      {!church.isActive && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {church.pastorName} · {church.city}, {church.state} · {church.ownerEmail}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {church.approvalStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => approve.mutate({ churchId: church.id })}
                          disabled={approve.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle size={14} />
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectingId(church.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </>
                    )}

                    {church.approvalStatus === 'approved' && (
                      <button
                        onClick={() => toggleActive.mutate({ churchId: church.id, isActive: !church.isActive })}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        {church.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                        {church.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}

                    {(church.approvalStatus === 'approved' || church.approvalStatus === 'rejected') && (
                      <button
                        onClick={() => resetPending.mutate({ churchId: church.id })}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                        title="Reset to pending"
                      >
                        <RotateCcw size={14} />
                        Reset
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedId(expandedId === church.id ? null : church.id)}
                      className="p-1.5 text-gray-400 hover:text-navy transition-colors"
                    >
                      <ChevronDown size={16} className={`transition-transform ${expandedId === church.id ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Reject form */}
                {rejectingId === church.id && (
                  <div className="border-t bg-red-50 p-4">
                    <p className="text-sm font-medium text-red-800 mb-2">Reason for rejection (will be visible to church admin):</p>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={2}
                      placeholder="e.g. Does not meet doctrinal requirements…"
                      className="w-full border border-red-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => reject.mutate({ churchId: church.id, reason: rejectReason })}
                        disabled={!rejectReason.trim() || reject.isPending}
                        className="px-4 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        Confirm Reject
                      </button>
                      <button
                        onClick={() => { setRejectingId(null); setRejectReason(''); }}
                        className="px-4 py-1.5 bg-white border text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Expanded details */}
                {expandedId === church.id && (
                  <div className="border-t bg-gray-50 p-4 grid grid-cols-2 gap-3 text-sm">
                    <Detail label="Slug" value={`/church/${church.slug}`} />
                    <Detail label="Contact Email" value={church.contactEmail ?? '—'} />
                    <Detail label="Registered" value={church.createdAt ? new Date(church.createdAt).toLocaleDateString() : '—'} />
                    {church.approvedAt && <Detail label="Approved At" value={new Date(church.approvedAt).toLocaleDateString()} />}
                    {church.rejectionReason && (
                      <div className="col-span-2">
                        <p className="text-gray-500 mb-0.5">Rejection Reason</p>
                        <p className="text-red-700 font-medium">{church.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  );
}
