import React, { useState, useEffect } from 'react';
import { useAppContext, supabase } from '../context/AppContext';
import { Invitation, Organization } from '../types';
import { Mail, Check, X, AlertCircle, Building2 } from 'lucide-react';

const AcceptInvitationScreen: React.FC = () => {
  const { navigateTo, state } = useAppContext();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Get token from URL params
  const token = state.currentView.params?.token;

  useEffect(() => {
    if (token) {
      loadInvitation();
    } else {
      setError('No invitation token provided');
      setLoading(false);
    }
  }, [token]);

  const loadInvitation = async () => {
    setLoading(true);
    try {
      // Load invitation
      const { data: inviteData, error: inviteError } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .single();

      if (inviteError) throw new Error('Invitation not found');

      // Check if invitation is still valid
      if (inviteData.status !== 'pending') {
        throw new Error('This invitation has already been used');
      }

      const expiresAt = new Date(inviteData.expires_at);
      if (expiresAt < new Date()) {
        throw new Error('This invitation has expired');
      }

      setInvitation(inviteData);

      // Load organization details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', inviteData.organization_id)
        .single();

      if (orgError) throw orgError;
      setOrganization(orgData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!invitation || !state.currentUser) return;

    setProcessing(true);
    setError('');

    try {
      // Add user to organization_members
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: invitation.organization_id,
          user_id: state.currentUser.id,
          role: invitation.role,
          invited_by: invitation.invited_by
        });

      if (memberError) {
        // Check if user is already a member
        if (memberError.code === '23505') { // Unique constraint violation
          throw new Error('You are already a member of this organization');
        }
        throw memberError;
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      if (updateError) throw updateError;

      // Switch to the new organization
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          active_organization_id: invitation.organization_id
        })
        .eq('id', state.currentUser.id);

      if (profileError) throw profileError;

      setSuccess(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.reload(); // Reload to refresh AppContext with new org
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!invitation) return;

    if (!confirm('Are you sure you want to decline this invitation?')) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'declined' })
        .eq('id', invitation.id);

      if (error) throw error;

      setTimeout(() => {
        navigateTo('DASHBOARD');
      }, 1000);
    } catch (err: any) {
      setError(err.message);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/10 to-slate-900 text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/10 to-slate-900 text-white flex items-center justify-center p-6">
        <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Invalid Invitation</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => navigateTo('DASHBOARD')}
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/10 to-slate-900 text-white flex items-center justify-center p-6">
        <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Welcome to the Team!</h2>
          <p className="text-slate-400 mb-6">
            You've successfully joined <strong className="text-white">{organization?.name}</strong>
          </p>
          <p className="text-sm text-slate-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/10 to-slate-900 text-white flex items-center justify-center p-6">
      <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">You've Been Invited!</h2>
          <p className="text-slate-400">
            You've been invited to join an organization
          </p>
        </div>

        {/* Organization Details */}
        <div className="bg-slate-700/50 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <Building2 className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{organization?.name}</h3>
              <p className="text-sm text-slate-400 capitalize">
                {invitation?.role} role
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Invited to:</span>
              <span className="font-semibold">{invitation?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Your role:</span>
              <span className="font-semibold capitalize">{invitation?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Expires:</span>
              <span className="font-semibold">
                {invitation && new Date(invitation.expires_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Role Description */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-300">
            {invitation?.role === 'owner' && '🔑 Full access to manage everything'}
            {invitation?.role === 'admin' && '⚙️ Can manage team members and settings'}
            {invitation?.role === 'member' && '👤 Can view and edit inventory'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleAccept}
            disabled={processing}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Check size={20} />
            {processing ? 'Accepting...' : 'Accept Invitation'}
          </button>
          <button
            onClick={handleDecline}
            disabled={processing}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <X size={20} />
            Decline
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-500/20 border border-red-500 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvitationScreen;
