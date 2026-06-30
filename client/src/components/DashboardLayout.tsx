import { Link, useLocation } from 'wouter';
import {
  BookOpen,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '../lib/trpc';
import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/members', label: 'Members', icon: Users },
  { href: '/dashboard/profile', label: 'Church Profile', icon: Settings },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [location, navigate] = useLocation();
  const { user, church } = useAuth();
  const utils = trpc.useUtils();

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success('Signed out.');
      navigate('/');
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-navy text-white flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gold rounded-sm flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-navy" />
            </div>
            <span className="font-semibold text-sm leading-tight">
              Seeking Higher
              <br />
              <span className="text-white/70 font-normal">Church</span>
            </span>
          </Link>
        </div>

        {church && (
          <div className="px-5 py-4 border-b border-white/10">
            <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Church</p>
            <p className="font-semibold text-sm leading-snug">{church.name}</p>
            {church.approvalStatus === 'approved' ? (
              <span className="inline-block mt-1.5 bg-green-500/20 text-green-300 text-xs px-2 py-0.5 rounded-full">
                Approved
              </span>
            ) : (
              <span className="inline-block mt-1.5 bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full">
                Pending
              </span>
            )}
          </div>
        )}

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = location === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white font-medium'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          {user && (
            <div className="flex items-center gap-2 px-3 py-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center text-xs font-bold text-gold shrink-0">
                {(user.name ?? user.email)[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">
                  {user.name ?? 'Account'}
                </p>
                <p className="text-xs text-white/50 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => logoutMutation.mutate()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {title && (
          <div className="bg-white border-b border-border px-8 py-5">
            <h1 className="text-xl font-bold text-navy">{title}</h1>
          </div>
        )}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
