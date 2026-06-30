import { useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Users, Settings, Shield, Clock, ArrowRight } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import { trpc } from '../lib/trpc';
import { formatDate } from '../lib/utils';

export default function ChurchDashboard() {
  const [, navigate] = useLocation();
  const { user, church, isLoading } = useAuth();

  const { data: members } = trpc.church.members.useQuery(undefined, {
    enabled: church?.approvalStatus === 'approved',
  });

  useEffect(() => {
    if (!isLoading && church?.approvalStatus === 'pending') {
      navigate('/pending');
    }
  }, [isLoading, church, navigate]);

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-4 border-navy border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!church) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="max-w-md">
          <p className="text-muted-foreground mb-4">
            You don&apos;t have a church registered yet.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-navy/90 transition-colors"
          >
            Register a Church
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      label: 'Members',
      value: members?.length ?? '—',
      icon: Users,
      href: '/dashboard/members',
    },
    {
      label: 'Status',
      value: church.approvalStatus === 'approved' ? 'Approved' : 'Pending',
      icon: church.approvalStatus === 'approved' ? Shield : Clock,
      href: null,
    },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="max-w-4xl space-y-6">
        {/* Church Header */}
        <div className="bg-white rounded-xl border border-border p-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-navy">{church.name}</h2>
              {church.approvalStatus === 'approved' && (
                <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                  <Shield className="w-3 h-3" />
                  Approved
                </span>
              )}
            </div>
            {church.pastorName && (
              <p className="text-muted-foreground text-sm">
                {church.pastorTitle ?? 'Pastor'} {church.pastorName}
              </p>
            )}
            {church.city && church.state && (
              <p className="text-muted-foreground text-sm">
                {church.city}, {church.state}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Registered {formatDate(church.createdAt)}
            </p>
          </div>
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-1.5 text-sm text-navy border border-navy/20 px-3 py-1.5 rounded-md hover:bg-navy/5 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            Edit Profile
          </Link>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 gap-4">
          {stats.map(({ label, value, icon: Icon, href }) => {
            const card = (
              <div className="bg-white rounded-xl border border-border p-6 flex items-center gap-4 group">
                <div className="w-11 h-11 bg-navy/10 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-navy" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-navy">{value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
                {href && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-navy transition-colors" />
                )}
              </div>
            );
            return href ? (
              <Link key={label} href={href}>
                {card}
              </Link>
            ) : (
              <div key={label}>{card}</div>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="font-semibold text-navy mb-4">Quick Actions</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              href="/dashboard/members"
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-navy/30 hover:bg-navy/5 transition-colors group"
            >
              <Users className="w-5 h-5 text-navy" />
              <span className="text-sm font-medium text-navy">Manage Members</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-navy transition-colors" />
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-navy/30 hover:bg-navy/5 transition-colors group"
            >
              <Settings className="w-5 h-5 text-navy" />
              <span className="text-sm font-medium text-navy">Edit Church Profile</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-navy transition-colors" />
            </Link>
            {church.slug && (
              <Link
                href={`/church/${church.slug}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-navy/30 hover:bg-navy/5 transition-colors group"
              >
                <Shield className="w-5 h-5 text-navy" />
                <span className="text-sm font-medium text-navy">View Public Profile</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-navy transition-colors" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
