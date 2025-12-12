
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Mail, Copy, Check, Database, Edit2, Trash2, Save, Share2, CheckSquare, X, Loader } from 'lucide-react';
import { User, UserRole } from '../types';
import ConfirmModal from '../components/ConfirmModal';

const REQUIRED_SQL = `
-- Enable Offline User Creation & New Roles
alter table profiles drop constraint if exists profiles_id_fkey;
alter table profiles disable row level security;

-- Allow any role string (Remove the check constraint)
alter table profiles drop constraint if exists profiles_role_check;
`;

const TeamScreen: React.FC = () => {
    const { state, addTeamMember, updateTeamMember, deleteTeamMember } = useAppContext();
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newRole, setNewRole] = useState<UserRole>('Crew');
    const [newEmail, setNewEmail] = useState('');
    const [generateInvite, setGenerateInvite] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [inviteCopied, setInviteCopied] = useState<string | null>(null);

    // Invite Modal State
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteDetails, setInviteDetails] = useState<{name: string, email: string} | null>(null);
    const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
    
    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{name: string, role: UserRole, email: string}>({ name: '', role: 'Crew', email: '' });
    
    // Delete State
    const [memberToDelete, setMemberToDelete] = useState<{id: string, name: string} | null>(null);

    // Multi-select State
    const [selectMode, setSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

    // Error Handling State
    const [showSqlModal, setShowSqlModal] = useState(false);

    // Multi-select handlers
    const toggleSelectMode = () => {
        setSelectMode(!selectMode);
        setSelectedIds(new Set()); // Clear selections when toggling
    };

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const selectAll = () => {
        const allIds = new Set(state.users.map(u => u.id));
        setSelectedIds(allIds);
    };

    const deselectAll = () => {
        setSelectedIds(new Set());
    };

    const confirmBulkDelete = async () => {
        for (const id of selectedIds) {
            await deleteTeamMember(id);
        }
        setSelectedIds(new Set());
        setShowBulkDeleteModal(false);
        setSelectMode(false);
    };

    const copySql = () => {
        navigator.clipboard.writeText(REQUIRED_SQL);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const copyInvite = (email: string, id: string) => {
        const inviteText = `Join us on Gear Base!\n\nI've set up your profile. To access the gear list, please sign up using this email: ${email}\n\nGo here: ${window.location.origin}`;
        navigator.clipboard.writeText(inviteText);
        setInviteCopied(id);
        setTimeout(() => setInviteCopied(null), 2000);
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        // If generate invite is checked, email is required
        if (generateInvite && !newEmail.trim()) {
            alert('Email is required to generate an invitation');
            return;
        }

        setIsSaving(true);

        try {
            // Add the team member profile with their real email
            await addTeamMember(newName, newRole, newEmail);

            // If generate invite is checked, show the invite modal
            if (generateInvite && newEmail.trim()) {
                setInviteDetails({ name: newName, email: newEmail.trim() });
                setShowInviteModal(true);
            }

            setNewName('');
            setNewEmail('');
            setGenerateInvite(false);
            setIsAdding(false);
        } catch (error: any) {
            // Check for foreign key constraint OR check constraint violation (role name)
            if (error.message && (error.message.includes('violates foreign key constraint') || error.message.includes('violates check constraint'))) {
                setShowSqlModal(true);
            } else {
                alert("Failed to add member: " + error.message);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const getInviteMessage = () => {
        if (!inviteDetails) return '';
        return `Hi ${inviteDetails.name}!\n\nYou've been invited to join our team on Gear Base - a gear tracking app for production crews.\n\nTo get started:\n1. Go to: ${window.location.origin}\n2. Click "Create Account"\n3. Sign up using this email: ${inviteDetails.email}\n\nOnce you sign up, you'll automatically be connected to our team and can start viewing and managing gear.\n\nSee you there!`;
    };

    const copyInviteMessage = () => {
        navigator.clipboard.writeText(getInviteMessage());
        setInviteLinkCopied(true);
        setTimeout(() => setInviteLinkCopied(false), 2000);
    };

    const startEdit = (user: User) => {
        setEditingId(user.id);
        setEditForm({ 
            name: user.name, 
            role: user.role as UserRole, 
            email: user.email.includes('@offline.user') ? '' : user.email 
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const saveEdit = async () => {
        if (!editingId) return;
        try {
            // If email is blank, restore original pseudo-email logic or keep existing if valid
            const finalEmail = editForm.email || `${editForm.name.toLowerCase().replace(/\s/g, '.')}@offline.user`;
            
            await updateTeamMember(editingId, editForm.name, editForm.role, finalEmail);
            setEditingId(null);
        } catch (e: any) {
             if (e.message && e.message.includes('violates check constraint')) {
                setShowSqlModal(true);
            } else {
                alert("Update failed: " + e.message);
            }
        }
    };

    const confirmDelete = async () => {
        if (memberToDelete) {
            await deleteTeamMember(memberToDelete.id);
            setMemberToDelete(null);
        }
    };

    // Helper to get color class for roles
    const getRoleColor = (role: UserRole) => {
        switch(role) {
            case 'Admin': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 border border-red-200 dark:border-red-500/20';
            case 'Producer': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20';
            case 'Director': return 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/20 dark:text-fuchsia-300 border border-fuchsia-200 dark:border-fuchsia-500/20';
            case 'DP': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/20';
            case 'AC': return 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-200 dark:border-sky-500/20';
            case 'Gaffer': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-500/20';
            case 'Grip': return 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 border border-orange-200 dark:border-orange-500/20';
            case 'PA': return 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300 border border-slate-200 dark:border-slate-600';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300 border border-slate-200 dark:border-slate-600';
        }
    };

    const RoleOptions = () => (
        <>
            <optgroup label="Management">
                <option value="Admin">Admin</option>
                <option value="Producer">Producer</option>
                <option value="Director">Director</option>
            </optgroup>
            <optgroup label="Camera">
                <option value="DP">Director of Photography</option>
                <option value="AC">Camera Assistant (AC)</option>
            </optgroup>
            <optgroup label="Lighting & Grip">
                <option value="Gaffer">Gaffer</option>
                <option value="Grip">Grip</option>
            </optgroup>
             <optgroup label="Support">
                <option value="PA">Production Assistant</option>
                <option value="Crew">General Crew</option>
            </optgroup>
        </>
    );

    return (
        <div className="max-w-5xl mx-auto">
            <ConfirmModal
                isOpen={!!memberToDelete}
                title="Remove Team Member"
                message={`Are you sure you want to remove ${memberToDelete?.name} from the team? They will be removed from any active assignments.`}
                confirmText="Remove"
                isDestructive={true}
                onConfirm={confirmDelete}
                onCancel={() => setMemberToDelete(null)}
            />
            
            {/* DATABASE FIX MODAL */}
            {showSqlModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600 dark:text-amber-400">
                                <Database size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Database Setup Required</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Offline profiles or new roles are currently blocked.</p>
                            </div>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-grow">
                            <p className="text-slate-700 dark:text-slate-300 mb-4">
                                To enable these features, run this script in your <strong>Supabase SQL Editor</strong>:
                            </p>
                            
                            <div className="relative">
                                <pre className="bg-slate-900 text-slate-200 p-4 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap border border-slate-700">
                                    {REQUIRED_SQL.trim()}
                                </pre>
                                <button 
                                    onClick={copySql}
                                    className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white p-2 rounded transition-colors border border-white/20"
                                    title="Copy to Clipboard"
                                >
                                    {copied ? <Check size={16} className="text-green-400"/> : <Copy size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50 rounded-b-lg">
                            <button 
                                onClick={() => setShowSqlModal(false)}
                                className="px-6 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Delete Modal */}
            <ConfirmModal
                isOpen={showBulkDeleteModal}
                title="Delete Selected Members"
                message={`Are you sure you want to delete ${selectedIds.size} team member${selectedIds.size > 1 ? 's' : ''}? This action cannot be undone.`}
                confirmText={`Delete ${selectedIds.size} Member${selectedIds.size > 1 ? 's' : ''}`}
                isDestructive={true}
                onConfirm={confirmBulkDelete}
                onCancel={() => setShowBulkDeleteModal(false)}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Team Management</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage producers and crew members for your jobs.</p>
                </div>
                <div className="flex gap-2">
                    {/* Select Mode Toggle */}
                    <button
                        onClick={toggleSelectMode}
                        className={`font-bold py-2 px-4 rounded-lg transition-colors shadow-sm flex items-center gap-2 ${
                            selectMode
                                ? 'bg-slate-600 hover:bg-slate-700 text-white'
                                : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white'
                        }`}
                    >
                        {selectMode ? <X size={20} /> : <CheckSquare size={20} />}
                        {selectMode ? 'Cancel' : 'Select'}
                    </button>

                    {/* Add Person Button - hidden in select mode */}
                    {!selectMode && (
                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-sm flex items-center gap-2"
                        >
                            <Plus size={20} />
                            {isAdding ? 'Cancel' : 'Add Person'}
                        </button>
                    )}
                </div>
            </div>

            {/* Selection Bar - shows when in select mode */}
            {selectMode && (
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 mb-6 flex flex-wrap items-center justify-between gap-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {selectedIds.size} of {state.users.length} selected
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={selectAll}
                                className="text-sm text-sky-600 dark:text-sky-400 hover:underline"
                            >
                                Select All
                            </button>
                            <span className="text-slate-400">|</span>
                            <button
                                onClick={deselectAll}
                                className="text-sm text-slate-600 dark:text-slate-400 hover:underline"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                    {selectedIds.size > 0 && (
                        <button
                            onClick={() => setShowBulkDeleteModal(true)}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Trash2 size={18} />
                            Delete Selected ({selectedIds.size})
                        </button>
                    )}
                </div>
            )}

            {/* Invite Message Modal */}
            {showInviteModal && inviteDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                                <Check size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Team Member Added!</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Send them this invitation to join</p>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto flex-grow">
                            <p className="text-slate-700 dark:text-slate-300 mb-4 text-sm">
                                Copy the message below and send it to <strong>{inviteDetails.email}</strong> via email or text:
                            </p>

                            <div className="relative">
                                <pre className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 p-4 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap border border-slate-200 dark:border-slate-700">
                                    {getInviteMessage()}
                                </pre>
                                <button
                                    onClick={copyInviteMessage}
                                    className="absolute top-2 right-2 bg-sky-500 hover:bg-sky-600 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium flex items-center gap-1.5"
                                >
                                    {inviteLinkCopied ? <Check size={14} /> : <Copy size={14} />}
                                    {inviteLinkCopied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>

                            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                                When they sign up with <strong>{inviteDetails.email}</strong>, they'll automatically be linked to this team profile.
                            </p>
                        </div>

                        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50 rounded-b-lg">
                            <button
                                onClick={() => {
                                    setShowInviteModal(false);
                                    setInviteDetails(null);
                                    setInviteLinkCopied(false);
                                }}
                                className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Member Form */}
            {isAdding && (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-200 dark:border-slate-700 mb-8 animate-in slide-in-from-top-5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add New Team Member</h3>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-grow">
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600"
                                    placeholder="e.g. John Doe"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                />
                            </div>
                            <div className="w-full md:w-48">
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Role</label>
                                <select
                                    className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600"
                                    value={newRole}
                                    onChange={e => setNewRole(e.target.value as UserRole)}
                                >
                                    <RoleOptions />
                                </select>
                            </div>
                            <div className="flex-grow">
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                    Email {generateInvite ? <span className="text-red-500">*</span> : '(Optional)'}
                                </label>
                                <input
                                    type="email"
                                    required={generateInvite}
                                    className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600"
                                    placeholder="john@example.com"
                                    value={newEmail}
                                    onChange={e => setNewEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Generate Invite Checkbox */}
                        <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={generateInvite}
                                    onChange={e => setGenerateInvite(e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-sky-500 focus:ring-sky-500 dark:bg-slate-700"
                                />
                                <div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors flex items-center gap-2">
                                        <Mail size={14} />
                                        Generate invite message
                                    </span>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Get a copyable message to send them via email or text
                                    </p>
                                </div>
                            </label>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="bg-green-500 hover:bg-green-600 disabled:bg-slate-400 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader size={16} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Check size={16} />
                                        {generateInvite ? 'Save & Get Invite' : 'Save'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/20 rounded border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
                        <strong>Note:</strong> Team members can be assigned to jobs immediately. Generate an invite to let them create their own account and access GearBase.
                    </div>
                </div>
            )}

            {/* Team List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.users.map(user => {
                    const isEditing = editingId === user.id;
                    const isOffline = user.email.includes('offline.user');
                    const isSelected = selectedIds.has(user.id);

                    return (
                        <div
                            key={user.id}
                            className={`bg-white dark:bg-slate-800 rounded-lg shadow p-6 border relative group transition-all ${
                                selectMode && isSelected
                                    ? 'border-sky-500 ring-2 ring-sky-500/20'
                                    : 'border-slate-200 dark:border-slate-700'
                            } ${selectMode ? 'cursor-pointer' : ''}`}
                            onClick={selectMode ? () => toggleSelection(user.id) : undefined}
                        >
                            {/* Selection Checkbox */}
                            {selectMode && (
                                <div className="absolute top-4 left-4 z-20">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSelection(user.id);
                                        }}
                                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                                            isSelected
                                                ? 'bg-sky-500 border-sky-500 text-white'
                                                : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-500'
                                        }`}
                                    >
                                        {isSelected && <Check size={14} />}
                                    </button>
                                </div>
                            )}
                            
                            {/* Edit Form */}
                            {isEditing ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Name</label>
                                        <input 
                                            type="text"
                                            value={editForm.name}
                                            onChange={e => setEditForm({...editForm, name: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded border border-slate-300 dark:border-slate-600 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Role</label>
                                        <select
                                            value={editForm.role}
                                            onChange={e => setEditForm({...editForm, role: e.target.value as UserRole})}
                                            className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded border border-slate-300 dark:border-slate-600 text-sm"
                                        >
                                            <RoleOptions />
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Email</label>
                                        <input 
                                            type="email"
                                            value={editForm.email}
                                            onChange={e => setEditForm({...editForm, email: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded border border-slate-300 dark:border-slate-600 text-sm"
                                            placeholder="Optional"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2 mt-4">
                                        <button 
                                            onClick={cancelEdit} 
                                            className="px-4 py-2 text-sm bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 rounded-lg transition-colors font-bold"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={saveEdit} 
                                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded-lg font-bold shadow-sm transition-colors text-sm"
                                        >
                                            <Save size={16} /> Save Changes
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // View Mode
                                <div className={`flex items-start gap-4 ${selectMode ? 'ml-8' : ''}`}>
                                    <div className="relative">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 ${getRoleColor(user.role)}`}>
                                            {user.name.charAt(0)}
                                        </div>
                                        {/* Status Dot */}
                                        <div
                                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${isOffline ? 'bg-slate-400' : 'bg-green-500'}`}
                                            title={isOffline ? "Offline Profile" : "Active User"}
                                        ></div>
                                    </div>
                                    <div className="flex-grow overflow-hidden">
                                        <h3 className="font-bold text-slate-900 dark:text-white truncate">{user.name}</h3>
                                        <div className="flex items-center gap-2 mb-1 mt-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleColor(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                                            <Mail size={12} /> {isOffline ? 'Offline User' : user.email}
                                        </div>

                                        {isOffline && !selectMode && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    copyInvite(user.email, user.id);
                                                }}
                                                className="mt-2 text-xs flex items-center gap-1 text-sky-600 hover:text-sky-500 dark:text-sky-400 transition-colors"
                                            >
                                                {inviteCopied === user.id ? <Check size={12}/> : <Share2 size={12}/>}
                                                {inviteCopied === user.id ? 'Copied!' : 'Copy Invite'}
                                            </button>
                                        )}
                                    </div>

                                    {/* Action Buttons - Hidden in select mode */}
                                    {!selectMode && (
                                        <div className="absolute top-4 right-4 flex gap-2 bg-white dark:bg-slate-800 pl-2 z-10">
                                            <button
                                                onClick={() => startEdit(user)}
                                                className="text-slate-400 hover:text-sky-500 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => setMemberToDelete({ id: user.id, name: user.name })}
                                                className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TeamScreen;
