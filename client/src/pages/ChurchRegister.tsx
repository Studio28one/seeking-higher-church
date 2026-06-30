import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { toast } from 'sonner';
import { BookOpen, CheckCircle2, Circle, ChevronRight, ChevronLeft } from 'lucide-react';
import { trpc } from '../lib/trpc';
import { slugify } from '../lib/utils';

// ─── Step 1: Doctrinal Affirmation ───────────────────────────────────────────

interface AffirmationState {
  scripture: boolean;
  trinity: boolean;
  christology: boolean;
  salvation: boolean;
  atonement: boolean;
  discipleship: boolean;
}

const AFFIRMATIONS: { key: keyof AffirmationState; text: string }[] = [
  {
    key: 'scripture',
    text: 'We affirm the full authority, inspiration, and sufficiency of Scripture as the Word of God.',
  },
  {
    key: 'trinity',
    text: 'We affirm the doctrine of the Trinity — one God eternally existing in three persons: Father, Son, and Holy Spirit.',
  },
  {
    key: 'christology',
    text: 'We affirm the full deity and full humanity of Jesus Christ.',
  },
  {
    key: 'salvation',
    text: 'We affirm that salvation is by grace alone, through faith alone, in Christ alone.',
  },
  {
    key: 'atonement',
    text: 'We affirm the atoning death of Jesus Christ for sinners and His bodily resurrection from the dead.',
  },
  {
    key: 'discipleship',
    text: 'We affirm the call to faithful discipleship and life together within the body of Christ, the Church.',
  },
];

function StepAffirmation({
  affirmations,
  onChange,
  onNext,
}: {
  affirmations: AffirmationState;
  onChange: (key: keyof AffirmationState, value: boolean) => void;
  onNext: () => void;
}) {
  const allChecked = Object.values(affirmations).every(Boolean);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-navy mb-2">
          Doctrinal Affirmation — Required
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Before registering, your church must affirm the following historic orthodox tenets of
          the Christian faith. All six must be affirmed to proceed.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {AFFIRMATIONS.map(({ key, text }) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key, !affirmations[key])}
            className={`w-full text-left flex items-start gap-3 p-4 rounded-lg border-2 transition-colors ${
              affirmations[key]
                ? 'border-navy bg-navy/5'
                : 'border-border hover:border-navy/30 bg-white'
            }`}
          >
            {affirmations[key] ? (
              <CheckCircle2 className="w-5 h-5 text-navy mt-0.5 shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
            )}
            <span className="text-sm leading-relaxed text-foreground">{text}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!allChecked}
        className="w-full flex items-center justify-center gap-2 bg-navy text-white font-semibold py-3 rounded-md hover:bg-navy/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue to Church Details
        <ChevronRight className="w-4 h-4" />
      </button>
      {!allChecked && (
        <p className="text-center text-xs text-muted-foreground mt-2">
          All six affirmations must be checked to continue.
        </p>
      )}
    </div>
  );
}

// ─── Step 2: Church Details ───────────────────────────────────────────────────

interface ChurchDetails {
  name: string;
  slug: string;
  pastorName: string;
  pastorTitle: string;
  denomination: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  description: string;
  ownerEmail: string;
  ownerPassword: string;
  ownerName: string;
}

function StepDetails({
  details,
  onChange,
  onNext,
  onBack,
}: {
  details: ChurchDetails;
  onChange: (key: keyof ChurchDetails, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const handleNameChange = (value: string) => {
    onChange('name', value);
    onChange('slug', slugify(value));
  };

  const isValid =
    details.name.length >= 2 &&
    details.slug.length >= 2 &&
    details.pastorName.length >= 1 &&
    details.address.length >= 1 &&
    details.city.length >= 1 &&
    details.state.length >= 1 &&
    details.zip.length >= 1 &&
    details.contactEmail.includes('@') &&
    details.ownerEmail.includes('@') &&
    details.ownerPassword.length >= 8;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-navy mb-2">Church Details</h2>
        <p className="text-sm text-muted-foreground">
          Tell us about your church. This information will appear on your public profile.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {/* Church Name */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Church Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={details.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
              placeholder="Grace Community Church"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              URL Slug <span className="text-destructive">*</span>
            </label>
            <div className="flex items-center border border-input rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-navy/30 focus-within:border-navy">
              <span className="px-2 text-xs text-muted-foreground bg-muted border-r border-input py-2.5">
                /church/
              </span>
              <input
                type="text"
                value={details.slug}
                onChange={(e) => onChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="flex-1 px-2 py-2 text-sm focus:outline-none bg-transparent"
                placeholder="grace-community"
              />
            </div>
          </div>
        </div>

        {/* Pastor */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Pastor Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={details.pastorName}
              onChange={(e) => onChange('pastorName', e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
              placeholder="John Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Pastor Title</label>
            <input
              type="text"
              value={details.pastorTitle}
              onChange={(e) => onChange('pastorTitle', e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
              placeholder="Senior Pastor"
            />
          </div>
        </div>

        {/* Denomination */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Denomination <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={details.denomination}
            onChange={(e) => onChange('denomination', e.target.value)}
            className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
            placeholder="Baptist, Presbyterian, Non-denominational…"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Street Address <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={details.address}
            onChange={(e) => onChange('address', e.target.value)}
            className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
            placeholder="123 Main St"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">
              City <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={details.city}
              onChange={(e) => onChange('city', e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              State <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={details.state}
              onChange={(e) => onChange('state', e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
              placeholder="TX"
              maxLength={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              ZIP <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={details.zip}
              onChange={(e) => onChange('zip', e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
              placeholder="75001"
            />
          </div>
        </div>

        {/* Contact */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Contact Email <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              value={details.contactEmail}
              onChange={(e) => onChange('contactEmail', e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
              placeholder="info@yourachurch.org"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contact Phone</label>
            <input
              type="tel"
              value={details.contactPhone}
              onChange={(e) => onChange('contactPhone', e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
              placeholder="(555) 000-0000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Website URL</label>
          <input
            type="url"
            value={details.websiteUrl}
            onChange={(e) => onChange('websiteUrl', e.target.value)}
            className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
            placeholder="https://yourachurch.org"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Church Description</label>
          <textarea
            value={details.description}
            onChange={(e) => onChange('description', e.target.value)}
            rows={4}
            className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy resize-none"
            placeholder="Tell people about your church — your mission, style, and community…"
          />
        </div>

        {/* Account */}
        <div className="border-t border-border pt-4">
          <p className="text-sm font-semibold text-navy mb-3">Your Admin Account</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Your Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={details.ownerName}
                onChange={(e) => onChange('ownerName', e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Your Email <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                value={details.ownerEmail}
                onChange={(e) => onChange('ownerEmail', e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">
              Password <span className="text-destructive">*</span>{' '}
              <span className="text-muted-foreground font-normal">(min. 8 characters)</span>
            </label>
            <input
              type="password"
              value={details.ownerPassword}
              onChange={(e) => onChange('ownerPassword', e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 border border-border text-foreground font-medium px-5 py-2.5 rounded-md hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 flex items-center justify-center gap-2 bg-navy text-white font-semibold py-2.5 rounded-md hover:bg-navy/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Review & Submit
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Review & Submit ──────────────────────────────────────────────────

function StepReview({
  affirmations,
  details,
  onBack,
  onSubmit,
  isPending,
}: {
  affirmations: AffirmationState;
  details: ChurchDetails;
  onBack: () => void;
  onSubmit: () => void;
  isPending: boolean;
}) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-navy mb-2">Review & Submit</h2>
        <p className="text-sm text-muted-foreground">
          Please review your information before submitting.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {/* Affirmation Summary */}
        <div className="bg-navy/5 border border-navy/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-navy" />
            <p className="text-sm font-semibold text-navy">Statement of Faith Affirmed</p>
          </div>
          <p className="text-xs text-muted-foreground">
            All {Object.values(affirmations).filter(Boolean).length} doctrinal affirmations confirmed.
          </p>
        </div>

        {/* Church Info */}
        <div className="bg-white border border-border rounded-lg p-4 space-y-2">
          <p className="text-sm font-semibold text-navy mb-3">Church Information</p>
          <Row label="Church Name" value={details.name} />
          <Row label="URL" value={`/church/${details.slug}`} />
          <Row label="Pastor" value={`${details.pastorTitle ? details.pastorTitle + ' ' : ''}${details.pastorName}`} />
          {details.denomination && <Row label="Denomination" value={details.denomination} />}
          <Row label="Address" value={`${details.address}, ${details.city}, ${details.state} ${details.zip}`} />
          <Row label="Contact Email" value={details.contactEmail} />
          {details.contactPhone && <Row label="Phone" value={details.contactPhone} />}
          {details.websiteUrl && <Row label="Website" value={details.websiteUrl} />}
          {details.description && <Row label="Description" value={details.description} />}
        </div>

        {/* Account Info */}
        <div className="bg-white border border-border rounded-lg p-4 space-y-2">
          <p className="text-sm font-semibold text-navy mb-3">Admin Account</p>
          <Row label="Name" value={details.ownerName} />
          <Row label="Email" value={details.ownerEmail} />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <strong>What happens next:</strong> Your application will be reviewed by the Seeking
          Higher team. You&apos;ll be notified at{' '}
          <strong>{details.ownerEmail}</strong> once your church has been approved. This
          typically takes 1–2 business days.
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isPending}
          className="flex items-center gap-2 border border-border text-foreground font-medium px-5 py-2.5 rounded-md hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 bg-navy text-white font-semibold py-2.5 rounded-md hover:bg-navy/90 transition-colors disabled:opacity-60"
        >
          {isPending ? 'Submitting…' : 'Submit Application'}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-muted-foreground w-28 shrink-0">{label}:</span>
      <span className="text-foreground break-words">{value}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const STEPS = ['Statement of Faith', 'Church Details', 'Review & Submit'];

export default function ChurchRegister() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);

  const [affirmations, setAffirmations] = useState<AffirmationState>({
    scripture: false,
    trinity: false,
    christology: false,
    salvation: false,
    atonement: false,
    discipleship: false,
  });

  const [details, setDetails] = useState<ChurchDetails>({
    name: '',
    slug: '',
    pastorName: '',
    pastorTitle: 'Pastor',
    denomination: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    contactEmail: '',
    contactPhone: '',
    websiteUrl: '',
    description: '',
    ownerEmail: '',
    ownerPassword: '',
    ownerName: '',
  });

  const registerMutation = trpc.church.register.useMutation({
    onSuccess: () => {
      toast.success('Application submitted! Redirecting…');
      navigate('/pending');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleAffirmationChange = (key: keyof AffirmationState, value: boolean) => {
    setAffirmations((prev) => ({ ...prev, [key]: value }));
  };

  const handleDetailsChange = (key: keyof ChurchDetails, value: string) => {
    setDetails((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    registerMutation.mutate({
      name: details.name,
      slug: details.slug,
      pastorName: details.pastorName,
      pastorTitle: details.pastorTitle || undefined,
      denomination: details.denomination || undefined,
      address: details.address,
      city: details.city,
      state: details.state,
      zip: details.zip,
      contactEmail: details.contactEmail,
      contactPhone: details.contactPhone || undefined,
      description: details.description || undefined,
      websiteUrl: details.websiteUrl || undefined,
      ownerEmail: details.ownerEmail,
      ownerPassword: details.ownerPassword,
      ownerName: details.ownerName || undefined,
      affirmation: {
        scripture: true,
        trinity: true,
        christology: true,
        salvation: true,
        atonement: true,
        discipleship: true,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-navy rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-gold" />
            </div>
            <span className="font-semibold text-navy text-lg">Seeking Higher Church</span>
          </Link>
          <h1 className="text-2xl font-bold text-navy">Register Your Church</h1>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  i < step
                    ? 'bg-navy text-white'
                    : i === step
                    ? 'bg-gold text-navy'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  i === step ? 'text-navy' : 'text-muted-foreground'
                }`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px ${i < step ? 'bg-navy' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-8">
          {step === 0 && (
            <StepAffirmation
              affirmations={affirmations}
              onChange={handleAffirmationChange}
              onNext={() => setStep(1)}
            />
          )}
          {step === 1 && (
            <StepDetails
              details={details}
              onChange={handleDetailsChange}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <StepReview
              affirmations={affirmations}
              details={details}
              onBack={() => setStep(1)}
              onSubmit={handleSubmit}
              isPending={registerMutation.isPending}
            />
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already registered?{' '}
          <Link href="/login" className="text-navy underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
