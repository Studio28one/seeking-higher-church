import { Link } from 'wouter';
import { Clock, BookOpen, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function PendingApproval() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-navy rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-gold" />
          </div>
          <span className="font-semibold text-navy text-lg">Seeking Higher Church</span>
        </Link>

        <div className="bg-white rounded-xl border border-border shadow-sm p-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>

          <h1 className="text-2xl font-bold text-navy mb-3">
            Your application is under review
          </h1>

          <p className="text-muted-foreground leading-relaxed mb-4">
            Thank you for registering with Seeking Higher Church. Your application is
            currently being reviewed by our team.
          </p>

          {user?.email && (
            <div className="flex items-center justify-center gap-2 bg-navy/5 rounded-lg px-4 py-3 mb-4">
              <Mail className="w-4 h-4 text-navy" />
              <p className="text-sm text-navy font-medium">{user.email}</p>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            We&apos;ll notify you at the email above once your church has been approved.
            This typically takes <strong>1–2 business days</strong>.
          </p>

          <div className="border-t border-border mt-6 pt-6 text-xs text-muted-foreground space-y-1">
            <p>Have questions? Contact us at</p>
            <a
              href="mailto:churches@seekinghigher.app"
              className="text-navy underline"
            >
              churches@seekinghigher.app
            </a>
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          <Link href="/" className="text-navy underline">
            Return to home
          </Link>
        </p>
      </div>
    </div>
  );
}
