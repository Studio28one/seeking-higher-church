import { Link, useLocation } from 'wouter';
import { LayoutDashboard, Church, LogOut, ChevronRight } from 'lucide-react';
import { trpc } from '../lib/trpc';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/churches', label: 'Churches', icon: Church },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = '/login'; },
  });

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-navy text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-1">Admin Panel</p>
          <h1 className="text-lg font-bold text-gold leading-tight">Seeking Higher Church</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location === href || (href !== '/admin' && location.startsWith(href));
            return (
              <Link key={href} href={href}>
                <a className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-gold text-navy' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}>
                  <Icon size={18} />
                  {label}
                  {active && <ChevronRight size={14} className="ml-auto" />}
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => logoutMutation.mutate()}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
