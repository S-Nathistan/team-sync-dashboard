import React, { useEffect, useState } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../../api/projects';
import ProjectCard from '../../components/projects/ProjectCard';
import ProjectForm from '../../components/projects/ProjectForm';
import MemberAssignment from '../../components/projects/MemberAssignment';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';

export default function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchAll = () => {
    setLoading(true);
    getProjects({ limit: 100 })
      .then((res) => setProjects(res.data.projects))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSave = async (data) => {
    try {
      if (selectedProject) {
        await updateProject(selectedProject.id, data);
        toast.success('Project updated');
      } else {
        await createProject(data);
        toast.success('Project created');
      }
      setModalOpen(false);
      fetchAll();
    } catch {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (p) => {
    if (confirm(`Are you sure you want to delete project ${p.name}?`)) {
      try {
        await deleteProject(p.id);
        toast.success('Project deleted');
        fetchAll();
      } catch {
        toast.error('Failed to delete project');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Projects & Categories</h2>
          <p className="text-sm text-slate-500">Manage work streams and assign team members.</p>
        </div>
        <Button onClick={() => { setSelectedProject(null); setModalOpen(true); }}>
          <Plus size={18} /> New Project
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onEdit={(proj) => { setSelectedProject(proj); setModalOpen(true); }}
              onDelete={handleDelete}
              onManageMembers={(proj) => { setSelectedProject(proj); setAssignModalOpen(true); }}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedProject ? 'Edit Project' : 'Create New Project'}
      >
        <ProjectForm
          initialData={selectedProject}
          onSubmit={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      {/* Member Assignment Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Members: ${selectedProject?.name}`}
      >
        {selectedProject && (
          <MemberAssignment
            project={selectedProject}
            onClose={() => setAssignModalOpen(false)}
            onUpdated={fetchAll}
          />
        )}
      </Modal>
    </div>
  );
}