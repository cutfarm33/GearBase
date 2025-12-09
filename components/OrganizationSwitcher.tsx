import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../context/AppContext';
import { OrganizationMember, Organization } from '../types';
import { Building2, ChevronDown, Check } from 'lucide-react';

interface OrganizationSwitcherProps {
  currentUser: any;
  onSwitch?: () => void;
}

const OrganizationSwitcher: React.FC<OrganizationSwitcherProps> = ({ currentUser, onSwitch }) => {
  const [userOrganizations, setUserOrganizations] = useState<(OrganizationMember & { organization: Organization })[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOrgId = currentUser?.active_organization_id || currentUser?.organization_id;

  useEffect(() => {
    loadUserOrganizations();
  }, [currentUser?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadUserOrganizations = async () => {
    if (!currentUser?.id) return;

    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('user_id', currentUser.id);

      if (error) throw error;
      setUserOrganizations(data as any || []);
    } catch (err) {
      console.error('Error loading organizations:', err);
    }
  };

  const handleSwitchOrganization = async (orgId: string) => {
    if (orgId === activeOrgId || switching) return;

    setSwitching(true);
    try {
      // Update active_organization_id in profiles
      const { error } = await supabase
        .from('profiles')
        .update({ active_organization_id: orgId })
        .eq('id', currentUser.id);

      if (error) throw error;

      // Reload the page to refresh all data
      window.location.reload();

      if (onSwitch) {
        onSwitch();
      }
    } catch (err) {
      console.error('Error switching organization:', err);
      setSwitching(false);
    }
  };

  const currentOrg = userOrganizations.find(m => m.organization_id === activeOrgId);

  // Don't show switcher if user only belongs to one organization
  if (userOrganizations.length <= 1) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors"
      >
        <Building2 size={18} className="text-emerald-500" />
        <span className="font-semibold max-w-[150px] truncate">
          {currentOrg?.organization?.name || 'Select Organization'}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-2 border-b border-slate-700">
            <p className="text-xs text-slate-400 px-2 py-1">Switch Organization</p>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {userOrganizations.map((member: any) => {
              const isActive = member.organization_id === activeOrgId;
              return (
                <button
                  key={member.id}
                  onClick={() => handleSwitchOrganization(member.organization_id)}
                  disabled={switching}
                  className={`w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/50 transition-colors ${
                    isActive ? 'bg-emerald-500/10' : ''
                  } ${switching ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}>
                      <Building2 size={20} className="text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{member.organization.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{member.role}</p>
                    </div>
                  </div>
                  {isActive && (
                    <Check size={18} className="text-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-2 border-t border-slate-700 bg-slate-900/50">
            <p className="text-xs text-slate-500 px-2">
              {userOrganizations.length} organization{userOrganizations.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {switching && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Switching organization...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationSwitcher;
