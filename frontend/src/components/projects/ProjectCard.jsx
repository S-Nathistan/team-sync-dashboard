import React from 'react';
import { Folder, Users, Edit, Trash2 } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

export default function ProjectCard({ project, onEdit, onDelete, onManageMembers }) {
  return (
    <Card className="flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-full"
              style={{ backgroundColor: project.color || '#3b82f6' }}
            />
            <h4 className="font-semibold text-slate-800 text-base">{project.name}</h4>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(project)} className="p-1 text-slate-400 hover:text-slate-700">
              <Edit size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(project)} className="p-1 text-rose-400 hover:text-rose-600">
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-4 line-clamp-2">
          {project.description || 'No description provided.'}
        </p>
      </div>

      <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
        <span className="text-xs text-slate-500 flex items-center gap-1.5">
          <Users size={14} />
          {project.members?.length || 0} Assigned Members
        </span>
        <Button variant="outline" size="sm" onClick={() => onManageMembers(project)} className="text-xs py-1">
          Assign
        </Button>
      </div>
    </Card>
  );
}