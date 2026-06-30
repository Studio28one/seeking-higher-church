import { useState } from 'react';
import { toast } from 'sonner';
import {
  Users,
  Copy,
  RefreshCw,
  Trash2,
  ChevronDown,
  Check,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { trpc } from '../lib/trpc';
import { formatDate } from '../lib/utils';

const ROLES = ['member', 'leader', 'pastor', 'admin'] as const;
type Role = (typeof ROLES)[number];

export default function MembersPage() {
  const [copiedInvite, setCopiedInvite] = useState(false);
  const utils = trpc.useUtils();

  const { data: members, isLoading: loadingMembers } = trpc.church.members.useQuery();
  const { data: inviteData } = trpc.church.inviteCode.useQuery();

  const removeMember = trpc.church.removeMember.useMutation({
    onSuccess: () => {
      toast.success('Member removed.');
      utils.church.members.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateRole = trpc.church.updateMemberRole.useMutation({
    onSuccess: () => {
      toast.success('Role updated.');
      utils.church.members.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const regenerateInvite = trpc.church.regenerateInviteCode.useMutation({
    onSuccess: () => {
      toast.success('New invite link generated.');
      utils.church.inviteCode.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const copyInviteLink = () => {
    if (!inviteData?.url) return;
    navigator.clipboard.writeText(inviteData.url);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  return (
    <DashboardLayout title="Members">
      <div className="max-w-3xl space-y-6">
        {/* Invite Section */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="font-semibold text-navy mb-1">Invite Link</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Share this link with members to invite them to your church.
          </p>
          {inviteData ? (
            <div className="flex gap-2">
              <div className="flex-1 bg-muted rounded-md px-3 py-2 text-sm font-mono truncate text-muted-foreground">
                {inviteData.url}
              </div>
              <button
                onClick={copyInviteLink}
                className="flex items-center gap-1.5 bg-navy text-white text-sm px-3 py-2 rounded-md hover:bg-navy/90 transition-colors"
              >
                {copiedInvite ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={() => regenerateInvite.mutate()}
                disabled={regenerateInvite.isPending}
                title="Generate new invite link"
                className="flex items-center gap-1.5 border border-border text-muted-foreground text-sm px-3 py-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${regenerateInvite.isPending ? 'animate-spin' : ''}`} />
              </button>
            </div>
          ) : (
            <div className="h-10 bg-muted rounded-md animate-pulse" />
          )}
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-navy" />
              <h2 className="font-semibold text-navy">
                Members{' '}
                {members && (
                  <span className="text-muted-foreground font-normal">
                    ({members.length})
                  </span>
                )}
              </h2>
            </div>
          </div>

          {loadingMembers ? (
            <div className="divide-y divide-border">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-muted rounded w-32 animate-pulse" />
                    <div className="h-3 bg-muted rounded w-48 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : members?.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted-foreground text-sm">
              No members yet. Share your invite link to get started.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {members?.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50"
                >
                  <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center text-xs font-bold text-navy shrink-0">
                    {(member.user.name ?? member.user.email)[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {member.user.name ?? '—'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.user.email}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Joined {formatDate(member.joinedAt)}
                  </p>

                  {/* Role select */}
                  <div className="relative">
                    <select
                      value={member.role}
                      onChange={(e) =>
                        updateRole.mutate({ memberId: member.id, role: e.target.value as Role })
                      }
                      className="appearance-none text-xs border border-input rounded px-2 py-1 pr-6 bg-white focus:outline-none focus:ring-1 focus:ring-navy cursor-pointer capitalize"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Remove this member from your church?')) {
                        removeMember.mutate({ memberId: member.id });
                      }
                    }}
                    title="Remove member"
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
