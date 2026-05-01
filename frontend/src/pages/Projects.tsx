import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface Project {
  id: string;
  name: string;
  description: string;
  owner: { name: string };
  _count: { tasks: number };
}

const Projects = () => {
  const { token, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (token) fetchProjects();
  }, [token]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/projects', { name, description }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setName('');
      setDescription('');
      fetchProjects();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Projects</h2>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
        )}
      </div>

      <div className="grid grid-cols-2">
        {projects.map(project => (
          <Link to={`/projects/${project.id}`} key={project.id}>
            <div className="glass-panel" style={{ transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>{project.name}</h3>
                <span className="badge badge-todo">{project._count.tasks} Tasks</span>
              </div>
              <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>{project.description || 'No description provided.'}</p>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Owner: <span style={{ color: 'var(--primary)' }}>{project.owner.name}</span>
              </div>
            </div>
          </Link>
        ))}
        {projects.length === 0 && <p className="text-muted">No projects found.</p>}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel" style={{ width: '400px' }}>
            <h3>Create Project</h3>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Project Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="form-input" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="form-input" rows={3}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
