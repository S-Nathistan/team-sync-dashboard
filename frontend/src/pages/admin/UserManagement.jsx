import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getUsers, updateUserRole, deleteUser } from '../../api/users';
import { registerUser } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';
import Table from '../../components/common/Table';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Trash2, UserPlus, Shield, UserCheck } from 'lucide-react';
import { capitalize } from '../../utils/formatters';

const newUserSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['team_member', 'manager', 'admin']),
});

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(newUserSchema),
    defaultValues: { role: 'team_member' },
  });

  const fetchUsers = () => {
    setLoading(true);
    getUsers({ limit: 100 })
      .then((res) => setUsers(res.data.users || []))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (targetUser, newRole) => {
    if (targetUser.id === currentUser?.id) {
      toast.error('You cannot change your own admin role');
      return;
    }

    try {
      await updateUserRole(targetUser.id, { role: newRole });
      toast.success(`Updated ${targetUser.full_name}'s role to ${capitalize(newRole)}`);
      fetchUsers();
    } catch {
      toast.error('Failed to update user role');
    }
  };

  const handleDelete = async (targetUser) => {
    if (targetUser.id === currentUser?.id) {
      toast.error('You cannot delete your own active admin account');
      return;
    }

    if (confirm(`Are you sure you want to permanently remove ${targetUser.full_name} (${targetUser.email})?`)) {
      try {
        await deleteUser(targetUser.id);
        toast.success(`User ${targetUser.full_name} deleted`);
        fetchUsers();
      } catch {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleCreateUser = async (data) => {
    try {
      await registerUser(data);
      toast.success(`Created account for ${data.full_name}`);
      setAddModalOpen(false);
      reset();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create user');
    }
  };

  const columns = [
    {
      key: 'full_name',
      label: 'Name',
      render: (name, u) => {
        const isSelf = u.id === currentUser?.id;
        return (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="font-semibold text-slate-800">{name}</span>
              {isSelf && (
                <span className="ml-2 px-1.5 py-0.5 rounded bg-primary-100 text-primary-700 font-bold text-[10px]">
                  YOU
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    { key: 'email', label: 'Email Address' },
    {
      key: 'role',
      label: 'Role Assignment',
      render: (role, u) => {
        const isSelf = u.id === currentUser?.id;
        if (isSelf) {
          return (
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
              Admin (Protected)
            </span>
          );
        }

        return (
          <select
            value={role}
            onChange={(e) => handleRoleChange(u, e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none font-medium text-slate-700 cursor-pointer hover:border-slate-400 transition-colors"
          >
            <option value="team_member">Team Member</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, u) => {
        const isSelf = u.id === currentUser?.id;
        if (isSelf) {
          return <span className="text-xs text-slate-300 italic">—</span>;
        }

        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(u)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            title="Remove User"
          >
            <Trash2 size={16} />
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="text-primary-600" size={24} />
            User & Role Management
          </h2>
          <p className="text-sm text-slate-500">
            Create new accounts, manage access levels, and assign organizational roles.
          </p>
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="flex items-center gap-1.5">
          <UserPlus size={16} /> Add / Invite User
        </Button>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <Table columns={columns} data={users} />
        )}
      </Card>

      {/* Add New User Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Team Member / User"
        size="md"
      >
        <form onSubmit={handleSubmit(handleCreateUser)} className="space-y-4 pt-1">
          <Input
            label="Full Name"
            placeholder="e.g. Rachel Green"
            error={errors.full_name?.message}
            {...register('full_name')}
          />
          <Input
            label="Username"
            placeholder="e.g. rachel"
            error={errors.username?.message}
            {...register('username')}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. rachel@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Temporary Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <Select
            label="Assigned Role"
            options={[
              { value: 'team_member', label: 'Team Member (Submits reports)' },
              { value: 'manager', label: 'Manager (Reviews reports & analytics)' },
              { value: 'admin', label: 'Admin (Full access)' },
            ]}
            {...register('role')}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Create User Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}