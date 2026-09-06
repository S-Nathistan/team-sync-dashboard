import { useState, useCallback } from 'react';
import { getProjects } from '../api/projects';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getProjects({ limit: 200 });
      setProjects(data.projects);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { projects, loading, fetchProjects };
}