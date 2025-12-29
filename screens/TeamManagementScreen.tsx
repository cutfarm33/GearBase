import React, { useState, useEffect } from 'react';
import { useAppContext, supabase } from '../context/AppContext';
import { OrganizationMember, Invitation, OrganizationRole } from '../types';
import { Users, Mail, Trash2, UserPlus, X, Check, Clock, AlertCircle } from 'lucide-react';

const TeamManagementScreen: React.FC = () => {
  const { navigateTo, state } = useAppContext();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<OrganizationRole>('member');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');

  const currentOrgId = state.currentUser?.active_organization_id || state.currentUser?.organization_id;
  const currentUserId = state.currentUser?.id;

  useEffect(() => {
    loadTeamData();
  }, [currentOrgId]);

  const loadTeamData = async () => {
    if (!currentOrgId) return;

    setLoading(true);
    try {
      // Load organization members
      const { data: membersData, error: membersError } = await supabase
        .from('organization_members')
        .select(`
          *,
          user:profiles!organization_members_user_id_fkey(id, email, full_name)
        `)
        .eq('organization_id', currentOrgId);

      if (membersError) throw membersError;
      setMembers(membersData || []);

      // Load pending invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('invitations')
        .select('*')
        .eq('organization_id', currentOrgId)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());

      if (invitationsError) throw invitationsError;
      setInvitations(invitationsData || []);
    } catch (err: any) {
      console.error('Error loading team data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail || !currentOrgId || !currentUserId) return;

    setInviting(true);
    setError('');

    try {
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inviteEmail)) {
        throw new Error('Please enter a valid email address');
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', currentOrgId)
        .eq('user_id', (await supabase
          .from('profiles')
          .select('id')
          .eq('email', inviteEmail)
          .single()).data?.id || '')
        .single();

      if (existingMember) {
        throw new Error('This user is already a member of your organization');
      }

      // Check if there's already a pending invitation
      const { data: existingInvite } = await supabase
        .from('invitations')
        .select('id')
        .eq('organization_id', currentOrgId)
        .eq('email', inviteEmail)
        .eq('status', 'pending')
        .single();

      if (existingInvite) {
        throw new Error('An invitation has already been sent to this email');
      }

      // Generate token using the database function
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

      // Create invitation
      const { error: inviteError } = await supabase
        .from('invitations')
        .insert({
          email: inviteEmail,
          organization_id: currentOrgId,
          invited_by: currentUserId,
          role: inviteRole,
          token,
          status: 'pending'
        });

      if (inviteError) throw inviteError;

      // TODO: Send invitation email via Supabase Edge Function
      // For now, we'll just show the invitation link
      alert(`Invitation created! Share this link:\n${window.location.origin}/accept-invite?token=${token}`);

      // Reload data and close modal
      await loadTeamData();
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('member');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      await loadTeamData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;
      await loadTeamData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getRoleBadgeColor = (role: OrganizationRole) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'admin': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'member': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/10 to-slate-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/10 to-slate-900 text-white p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="text-emerald-500" />
              Team Management
            </h1>
            <p className="text-slate-400 mt-2">Manage your organization members and invitations</p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
          >
            <UserPlus size={20} />
            Invite Member
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="text-red-500" />
            <p>{error}</p>
          </div>
        )}

        {/* Current Members */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users size={20} className="text-emerald-500" />
            Team Members ({members.length})
          </h2>

          <div className="space-y-3">
            {members.map((member: any) => (
              <div key={member.id} className="bg-slate-700/50 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                    {member.user?.full_name?.charAt(0) || member.user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{member.user?.full_name || 'Unknown User'}</p>
                    <p className="text-sm text-slate-400">{member.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(member.role)}`}>
                    {member.role}
                  </span>
                  {member.role !== 'owner' && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock size={20} className="text-yellow-500" />
              Pending Invitations ({invitations.length})
            </h2>

            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="bg-slate-700/50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-500/20 border-2 border-yellow-500 rounded-full flex items-center justify-center">
                      <Mail className="text-yellow-500" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold">{invitation.email}</p>
                      <p className="text-sm text-slate-400">
                        Invited {new Date(invitation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(invitation.role)}`}>
                      {invitation.role}
                    </span>
                    <button
                      onClick={() => handleCancelInvitation(invitation.id)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => navigateTo('DASHBOARD')}
          className="mt-6 text-slate-400 hover:text-white transition"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Invite Team Member</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as OrganizationRole)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  {inviteRole === 'member' && 'Can view and edit items'}
                  {inviteRole === 'admin' && 'Can manage team and settings'}
                  {inviteRole === 'owner' && 'Full access to everything'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleInvite}
                disabled={inviting}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {inviting ? 'Sending...' : 'Send Invitation'}
              </button>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                  setError('');
                }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagementScreen;
