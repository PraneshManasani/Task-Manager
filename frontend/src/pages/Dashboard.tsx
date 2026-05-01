import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface Stats {
  totalProjects: number;
  totalTasks: number;
  statusCounts: { 'To Do': number; 'In Progress': number; 'Completed': number };
  overdueTasks: number;
  tasks: Array<{
    id: string; title: string; description: string; status: string; dueDate: string | null;
    project: { name: string }; assignee: { name: string } | null;
  }>;
}

const Dashboard = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    if (token) fetchStats();
  }, [token]);

  if (!stats) return <div className="container" style={{ marginTop: '2rem' }}>Loading dashboard...</div>;

  return (
    <div className="container animate-fade-in" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>Welcome back, {user?.name}!</h2>
          <p className="text-muted">Here's an overview of your tasks and projects.</p>
        </div>
        <Link to="/projects" className="btn btn-primary">View Projects</Link>
      </div>

      <div className="grid grid-cols-3">
        <div className="glass-panel text-center">
          <h3 className="text-muted" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Total Projects</h3>
          <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--primary)' }}>{stats.totalProjects}</div>
        </div>
        <div className="glass-panel text-center">
          <h3 className="text-muted" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>My Tasks</h3>
          <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--primary)' }}>{stats.totalTasks}</div>
        </div>
        <div className="glass-panel text-center" style={{ borderLeft: stats.overdueTasks > 0 ? '4px solid var(--danger)' : '' }}>
          <h3 className="text-muted" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Overdue Tasks</h3>
          <div style={{ fontSize: '3rem', fontWeight: '700', color: stats.overdueTasks > 0 ? 'var(--danger)' : 'var(--text-main)' }}>
            {stats.overdueTasks}
          </div>
        </div>
      </div>

      <h3 style={{ marginTop: '3rem', marginBottom: '1.5rem' }}>Task Status Breakdown</h3>
      <div className="grid grid-cols-3">
        <div className="glass-panel" style={{ borderTop: '4px solid #94a3b8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '600' }}>To Do</span>
            <span className="badge badge-todo">{stats.statusCounts['To Do'] || 0}</span>
          </div>
        </div>
        <div className="glass-panel" style={{ borderTop: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '600' }}>In Progress</span>
            <span className="badge badge-inprogress">{stats.statusCounts['In Progress'] || 0}</span>
          </div>
        </div>
        <div className="glass-panel" style={{ borderTop: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '600' }}>Completed</span>
            <span className="badge badge-done">{stats.statusCounts['Completed'] || 0}</span>
          </div>
        </div>
      </div>

      <h3 style={{ marginTop: '3rem', marginBottom: '1.5rem' }}>Your Tasks</h3>
      <div className="grid grid-cols-2">
        {stats.tasks.length === 0 ? (
          <p className="text-muted">You have no tasks assigned.</p>
        ) : (
          stats.tasks.map(task => (
            <div key={task.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ margin: 0, color: 'var(--text-main)' }}>{task.title}</h4>
                <span className={`badge ${task.status === 'To Do' ? 'badge-todo' : task.status === 'In Progress' ? 'badge-inprogress' : 'badge-done'}`}>
                  {task.status}
                </span>
              </div>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '1rem' }}>{task.description}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div>
                  <strong>Project:</strong> <span style={{ color: 'var(--primary)' }}>{task.project.name}</span>
                </div>
                {task.dueDate && (
                  <div style={{ color: new Date(task.dueDate) < new Date() && task.status !== 'Completed' ? 'var(--danger)' : 'var(--text-muted)' }}>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;

