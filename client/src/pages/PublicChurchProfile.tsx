import { Link, useParams } from 'wouter';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Shield,
  BookOpen,
  Facebook,
  Youtube,
  Instagram,
  ArrowLeft,
} from 'lucide-react';
import { trpc } from '../lib/trpc';

export default function PublicChurchProfile() {
  const { slug } = useParams<{ slug: string }>();

  const { data: church, isLoading, error } = trpc.church.publicProfile.useQuery(
    { slug },
    { retry: false }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-navy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !church) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4">
        <BookOpen className="w-12 h-12 text-muted-foreground opacity-30" />
        <h1 className="text-2xl font-bold text-navy">Church Not Found</h1>
        <p className="text-muted-foreground text-sm">
          This church profile doesn&apos;t exist or hasn&apos;t been approved yet.
        </p>
        <Link href="/find-church" className="text-navy underline text-sm">
          Search for churches
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-navy text-white py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold rounded-sm flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-navy" />
            </div>
            <span className="font-semibold text-sm">Seeking Higher Church</span>
          </Link>
          <Link
            href="/find-church"
            className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Find a Church
          </Link>
        </div>
      </header>

      {/* Cover / Hero */}
      <div className="bg-navy text-white py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-6">
            {church.logoUrl ? (
              <img
                src={church.logoUrl}
                alt={`${church.name} logo`}
                className="w-20 h-20 rounded-xl object-cover border-2 border-white/20 shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-10 h-10 text-gold" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold mb-1">{church.name}</h1>
              {church.pastorName && (
                <p className="text-white/80 mb-2">
                  {church.pastorTitle ?? 'Pastor'} {church.pastorName}
                </p>
              )}
              {(church.city || church.state) && (
                <div className="flex items-center gap-1.5 text-white/70 text-sm">
                  <MapPin className="w-4 h-4" />
                  {[church.city, church.state].filter(Boolean).join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Affirmation Badge */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-green-800 text-sm">
                Seeking Higher Statement of Faith Affirmed
              </p>
              <p className="text-xs text-green-700 mt-0.5">
                This church has affirmed the Seeking Higher Statement of Faith — including
                the authority of Scripture, the doctrine of the Trinity, the full deity and
                humanity of Christ, salvation by grace through faith alone, and the bodily
                resurrection of Jesus.
              </p>
            </div>
          </div>

          {/* About */}
          {church.description && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="font-semibold text-navy mb-3">About</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {church.description}
              </p>
            </div>
          )}

          {/* Service Times */}
          {church.serviceTimes && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="font-semibold text-navy mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Service Times
              </h2>
              <p className="text-sm text-muted-foreground">{church.serviceTimes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Contact */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h2 className="font-semibold text-navy mb-4">Contact</h2>
            <div className="space-y-3">
              {church.address && (
                <div className="flex items-start gap-2.5 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    {church.address}
                    <br />
                    {[church.city, church.state, church.zip].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
              {church.contactEmail && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <a
                    href={`mailto:${church.contactEmail}`}
                    className="text-navy hover:underline break-all"
                  >
                    {church.contactEmail}
                  </a>
                </div>
              )}
              {church.contactPhone && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <a href={`tel:${church.contactPhone}`} className="text-navy hover:underline">
                    {church.contactPhone}
                  </a>
                </div>
              )}
              {church.websiteUrl && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                  <a
                    href={church.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-navy hover:underline break-all"
                  >
                    {church.websiteUrl.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>

            {/* Social */}
            {(church.facebookUrl || church.instagramUrl || church.youtubeUrl) && (
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                {church.facebookUrl && (
                  <a
                    href={church.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-navy transition-colors"
                    title="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {church.instagramUrl && (
                  <a
                    href={church.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-navy transition-colors"
                    title="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {church.youtubeUrl && (
                  <a
                    href={church.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-navy transition-colors"
                    title="YouTube"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          <Link
            href="/find-church"
            className="flex items-center gap-2 text-sm text-navy hover:underline px-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to search
          </Link>
        </div>
      </div>
    </div>
  );
}
