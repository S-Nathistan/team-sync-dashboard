import React, { useState, useEffect } from 'react';
import { getUsers } from '../../api/users';
import { addProjectMembers, removeProjectMember } from '../../api/projects';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function MemberAssignment({ project, onClose, onUpdated }) {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getUsers({ limit: 100 })
      .then((res) => {
        // Filter strictly to show team members (individual contributors)
        const membersOnly = (res.data.users || []).filter(
          (u) => u.role === 'team_member'
        );
        setTeamMembers(membersOnly);
      })
      .catch(() => toast.error('Failed to load team members'))
      .finally(() => setLoading(false));
  }, []);

  const assignedIds = new Set(project.members?.map((m) => m.id) || []);

  const handleToggle = async (user) => {
    setSaving(true);
    try {
      if (assignedIds.has(user.id)) {
        await removeProjectMember(project.id, user.id);
        toast.success(`Removed ${user.full_name} from ${project.name}`);
      } else {
        await addProjectMembers(project.id, { user_ids: [user.id] });
        toast.success(`Assigned ${user.full_name} to ${project.name}`);
      }
      onUpdated();
    } catch {
      toast.error('Failed to update project assignment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        Click to assign or remove team members from <strong>{project.name}</strong>.
      </p>

      {teamMembers.length === 0 ? (
        <p className="text-sm text-slate-400 py-6 text-center">
          No team members available for assignment.
        </p>
      ) : (
        <div className="max-h-72 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
          {teamMembers.map((u) => {
            const isAssigned = assignedIds.has(u.id);
            return (
              <div key={u.id} className="flex items-center justify-between p-2 pt-2.5">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{u.full_name}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </div>
                <Button
                  size="sm"
                  variant={isAssigned ? 'danger' : 'outline'}
                  disabled={saving}
                  onClick={() => handleToggle(u)}
                  className="min-w-[80px]"
                >
                  {isAssigned ? 'Remove' : 'Assign'}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-end pt-3 border-t border-slate-100">
        <Button variant="secondary" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}