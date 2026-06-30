import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { trpc } from '../lib/trpc';
import { useAuth } from '../hooks/useAuth';

interface ProfileForm {
  name: string;
  pastorName: string;
  pastorTitle: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  serviceTimes: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
}

function Field({
  label,
  id,
  value,
  onChange,
  type = 'text',
  placeholder,
  optional,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  optional?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1.5">
        {label}{' '}
        {optional && (
          <span className="text-muted-foreground font-normal text-xs">(optional)</span>
        )}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
      />
    </div>
  );
}

export default function ChurchProfilePage() {
  const { church } = useAuth();
  const utils = trpc.useUtils();

  const [form, setForm] = useState<ProfileForm>({
    name: '',
    pastorName: '',
    pastorTitle: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    contactEmail: '',
    contactPhone: '',
    websiteUrl: '',
    serviceTimes: '',
    facebookUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
  });

  useEffect(() => {
    if (church) {
      setForm({
        name: church.name ?? '',
        pastorName: church.pastorName ?? '',
        pastorTitle: church.pastorTitle ?? '',
        description: church.description ?? '',
        address: church.address ?? '',
        city: church.city ?? '',
        state: church.state ?? '',
        zip: church.zip ?? '',
        contactEmail: church.contactEmail ?? '',
        contactPhone: church.contactPhone ?? '',
        websiteUrl: church.websiteUrl ?? '',
        serviceTimes: church.serviceTimes ?? '',
        facebookUrl: church.facebookUrl ?? '',
        instagramUrl: church.instagramUrl ?? '',
        youtubeUrl: church.youtubeUrl ?? '',
      });
    }
  }, [church]);

  const updateProfile = trpc.church.updateProfile.useMutation({
    onSuccess: () => {
      toast.success('Profile updated.');
      utils.auth.me.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const set = (key: keyof ProfileForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      name: form.name || undefined,
      pastorName: form.pastorName || undefined,
      pastorTitle: form.pastorTitle || undefined,
      description: form.description || undefined,
      address: form.address || undefined,
      city: form.city || undefined,
      state: form.state || undefined,
      zip: form.zip || undefined,
      contactEmail: form.contactEmail || undefined,
      contactPhone: form.contactPhone || undefined,
      websiteUrl: form.websiteUrl || undefined,
      serviceTimes: form.serviceTimes || undefined,
      facebookUrl: form.facebookUrl || undefined,
      instagramUrl: form.instagramUrl || undefined,
      youtubeUrl: form.youtubeUrl || undefined,
    });
  };

  return (
    <DashboardLayout title="Church Profile">
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
        {/* Church Info */}
        <div className="bg-white rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-navy">Basic Information</h2>
          <Field label="Church Name" id="name" value={form.name} onChange={set('name')} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Pastor Name" id="pastorName" value={form.pastorName} onChange={set('pastorName')} />
            <Field label="Pastor Title" id="pastorTitle" value={form.pastorTitle} onChange={set('pastorTitle')} placeholder="Senior Pastor" optional />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1.5">
              Description <span className="text-muted-foreground font-normal text-xs">(optional)</span>
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => set('description')(e.target.value)}
              rows={4}
              className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy resize-none"
              placeholder="Tell people about your church…"
            />
          </div>
          <div>
            <label htmlFor="serviceTimes" className="block text-sm font-medium mb-1.5">
              Service Times <span className="text-muted-foreground font-normal text-xs">(optional)</span>
            </label>
            <input
              id="serviceTimes"
              type="text"
              value={form.serviceTimes}
              onChange={(e) => set('serviceTimes')(e.target.value)}
              className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
              placeholder="Sundays at 10:00 AM & 6:00 PM"
            />
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-navy">Location</h2>
          <Field label="Street Address" id="address" value={form.address} onChange={set('address')} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="col-span-2">
              <Field label="City" id="city" value={form.city} onChange={set('city')} />
            </div>
            <Field label="State" id="state" value={form.state} onChange={set('state')} placeholder="TX" />
            <Field label="ZIP" id="zip" value={form.zip} onChange={set('zip')} />
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-navy">Contact & Links</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Contact Email" id="contactEmail" type="email" value={form.contactEmail} onChange={set('contactEmail')} />
            <Field label="Contact Phone" id="contactPhone" type="tel" value={form.contactPhone} onChange={set('contactPhone')} optional />
          </div>
          <Field label="Website URL" id="websiteUrl" type="url" value={form.websiteUrl} onChange={set('websiteUrl')} placeholder="https://yourachurch.org" optional />
          <Field label="Facebook URL" id="facebookUrl" type="url" value={form.facebookUrl} onChange={set('facebookUrl')} placeholder="https://facebook.com/yourachurch" optional />
          <Field label="Instagram URL" id="instagramUrl" type="url" value={form.instagramUrl} onChange={set('instagramUrl')} placeholder="https://instagram.com/yourachurch" optional />
          <Field label="YouTube URL" id="youtubeUrl" type="url" value={form.youtubeUrl} onChange={set('youtubeUrl')} placeholder="https://youtube.com/@yourachurch" optional />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="flex items-center gap-2 bg-navy text-white font-semibold px-6 py-2.5 rounded-md hover:bg-navy/90 transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {updateProfile.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}
