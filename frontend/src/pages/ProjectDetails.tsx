import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface User { id: string; name: string; }
interface Task {
  id: string; title: string; description: string; status: string;
  dueDate: string | null; assignee: { id: string; name: string } | null;
}
interface Project {
  id: string; name: string; description: string; owner: User; tasks: Task[];
}

const ProjectDetails = () => {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  
  // Modals state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Filters state
  const [filterUser, setFilterUser] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const fetchProject = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProject(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProject();
      if (user?.role === 'ADMIN') fetchUsers();
    }
  }, [token, id, user]);

  const resetForm = () => {
    setTitle(''); setDescription(''); setAssigneeId(''); setDueDate('');
    setIsEditing(false); setEditingTaskId(''); setShowTaskModal(false);
  };

  const handleOpenEditModal = (task: Task) => {
    setTitle(task.title);
    setDescription(task.description);
    setAssigneeId(task.assignee?.id || '');
    setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    setIsEditing(true);
    setEditingTaskId(task.id);
    setShowTaskModal(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.patch(`http://localhost:5001/api/tasks/${editingTaskId}`, {
          title, description, assigneeId: assigneeId || null, dueDate: dueDate ? new Date(dueDate).toISOString() : null
        }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post('http://localhost:5001/api/tasks', {
          title, description, projectId: id, assigneeId: assigneeId || null, dueDate: dueDate ? new Date(dueDate).toISOString() : null
        }, { headers: { Authorization: `Bearer ${token}` } });
      }
      resetForm();
      fetchProject();
    } catch (error) {
      console.error(error);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await axios.patch(`http://localhost:5001/api/tasks/${taskId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProject();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`http://localhost:5001/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProject();
    } catch (error) {
      console.error(error);
    }
  };

  // Derived state for filtering tasks
  const filteredTasks = useMemo(() => {
    if (!project) return [];
    return project.tasks.filter(task => {
      let matchesUser = true;
      let matchesDate = true;

      if (filterUser) {
        if (filterUser === 'unassigned') matchesUser = !task.assignee;
        else matchesUser = task.assignee?.id === filterUser;
      }
      if (filterDate) {
        const taskDate = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
        matchesDate = taskDate === filterDate;
      }

      return matchesUser && matchesDate;
    });
  }, [project, filterUser, filterDate]);

  if (!project) return <div className="container" style={{ marginTop: '2rem' }}>Loading project...</div>;

  return (
    <div className="container animate-fade-in" style={{ marginTop: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2>{project.name}</h2>
        <p className="text-muted">{project.description}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ margin: 0 }}>Tasks Board</h3>
        
        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label className="text-muted" style={{ fontSize: '0.85rem' }}>User Filter:</label>
            <select className="form-input" style={{ width: '150px', padding: '0.3rem 0.5rem' }} value={filterUser} onChange={e => setFilterUser(e.target.value)}>
              <option value="">All Users</option>
              <option value="unassigned">Unassigned</option>
              {user?.role === 'ADMIN' && users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              {user?.role === 'MEMBER' && <option value={user?.id}>My Tasks</option>}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label className="text-muted" style={{ fontSize: '0.85rem' }}>Date Filter:</label>
            <input type="date" className="form-input" style={{ width: '150px', padding: '0.3rem 0.5rem' }} value={filterDate} onChange={e => setFilterDate(e.target.value)} />
            {filterDate && <button className="btn btn-ghost" style={{ padding: '0.3rem' }} onClick={() => setFilterDate('')}>&times;</button>}
          </div>
          {user?.role === 'ADMIN' && (
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowTaskModal(true); }}>+ Add Task</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3">
        {['To Do', 'In Progress', 'Completed'].map(status => (
          <div key={status} className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)' }}>
            <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
              {status}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredTasks.filter(t => t.status === status).map(task => (
                <div key={task.id} className="glass-panel" style={{ padding: '1rem', background: 'var(--bg-card)', position: 'relative' }}>
                  {user?.role === 'ADMIN' && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
                      <button 
                        onClick={() => handleOpenEditModal(task)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '1rem' }}
                        title="Edit Task"
                      >✎</button>
                      <button 
                        onClick={() => deleteTask(task.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: '1rem' }}
                        title="Delete Task"
                      >&times;</button>
                    </div>
                  )}
                  <h5 style={{ marginBottom: '0.5rem', paddingRight: '3rem' }}>{task.title}</h5>
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>{task.description}</p>
                  
                  {task.dueDate && (
                    <div style={{ fontSize: '0.75rem', marginBottom: '0.5rem', color: new Date(task.dueDate) < new Date() && task.status !== 'Completed' ? 'var(--danger)' : 'var(--text-muted)' }}>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '500' }}>
                      {task.assignee ? task.assignee.name : 'Unassigned'}
                    </div>
                    {/* Status switcher */}
                    <select 
                      className="form-input" 
                      style={{ width: 'auto', padding: '0.2rem 0.5rem', fontSize: '0.8rem', height: 'auto' }}
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
              {filteredTasks.filter(t => t.status === status).length === 0 && (
                <p className="text-muted" style={{ fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>No tasks found</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {showTaskModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel" style={{ width: '400px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{isEditing ? 'Edit Task' : 'Create Task'}</h3>
            <form onSubmit={handleSaveTask}>
              <div className="form-group">
                <label>Task Title *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="form-input" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="form-input" rows={3}></textarea>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="form-input" />
              </div>
              <div className="form-group">
                <label>Assignee</label>
                <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className="form-input">
                  <option value="">Unassigned</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary">{isEditing ? 'Save Changes' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
