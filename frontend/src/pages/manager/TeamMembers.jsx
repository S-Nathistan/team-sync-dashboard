import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '../../api/users';
import Table from '../../components/common/Table';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { capitalize } from '../../utils/formatters';
import { Users } from 'lucide-react';

export default function TeamMembers() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getUsers({ limit: 100 })
      .then((res) => {
        // Strictly filter the list to show individual contributors (team_member role only)
        const membersOnly = (res.data.users || []).filter(
          (u) => u.role === 'team_member'
        );
        setTeamMembers(membersOnly);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'full_name', label: 'Name' },
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email Address' },
    { 
      key: 'role', 
      label: 'Role', 
      render: (v) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">
          {capitalize(v)}
        </span>
      ) 
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="text-primary-600" size={24} />
          Team Members
        </h2>
        <p className="text-sm text-slate-500">
          Click on any team member below to inspect their full weekly report history and performance statistics.
        </p>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm">
        {loading ? (
          <LoadingSpinner />
        ) : teamMembers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No registered team members found.
          </div>
        ) : (
          <Table
            columns={columns}
            data={teamMembers}
            onRowClick={(u) => navigate(`/manager/team/${u.id}`)}
          />
        )}
      </Card>
    </div>
  );
}