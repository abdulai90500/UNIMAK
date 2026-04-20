'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  BookOpen, Upload, Trash2, LogOut, Plus, X, FileText,
  LayoutDashboard, Mail, ChevronDown, CheckCircle, AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [resources, setResources] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resources');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [newResource, setNewResource] = useState({
    title: '', type: 'Notes', year: 'Year 1', category: '', file: null
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    setUser(session.user);
    fetchAll();
  };

  const fetchAll = async () => {
    setLoading(true);
    const [res, msgs] = await Promise.all([
      supabase.from('resources').select('*').order('created_at', { ascending: false }),
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
    ]);
    setResources(res.data || []);
    setMessages(msgs.data || []);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!newResource.title || !newResource.category) {
      showToast('Please fill in all fields.', 'error');
      return;
    }
    setUploading(true);

    let file_url = '#';
    let file_name = '';

    if (newResource.file) {
      const fileExt = newResource.file.name.split('.').pop();
      const fileName = `${Date.now()}-${newResource.title.replace(/\s+/g, '-')}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resources')
        .upload(fileName, newResource.file);

      if (uploadError) {
        showToast('File upload failed: ' + uploadError.message, 'error');
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from('resources').getPublicUrl(fileName);
      file_url = urlData.publicUrl;
      file_name = newResource.file.name;
    }

    const { error } = await supabase.from('resources').insert([{
      title: newResource.title,
      type: newResource.type,
      year: newResource.year,
      category: newResource.category,
      file_url,
      file_name,
    }]);

    setUploading(false);
    if (error) {
      showToast('Failed to save resource: ' + error.message, 'error');
    } else {
      showToast('Resource uploaded successfully!');
      setShowUploadForm(false);
      setNewResource({ title: '', type: 'Notes', year: 'Year 1', category: '', file: null });
      fetchAll();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    const { error } = await supabase.from('resources').delete().eq('id', id);
    if (!error) {
      showToast('Resource deleted.');
      setResources((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const markRead = async (id) => {
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, is_read: true } : m));
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader" />
        <p>Loading dashboard...</p>
        <style jsx>{`
          .loading-screen { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; }
          .loader { width: 48px; height: 48px; border: 4px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">PH</div>
          <span>Admin Panel</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'resources' ? 'active' : ''}`}
            onClick={() => setActiveTab('resources')}
          >
            <BookOpen size={20} /> Resources
          </button>
          <button
            className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <Mail size={20} /> Messages
            {messages.filter((m) => !m.is_read).length > 0 && (
              <span className="badge">{messages.filter((m) => !m.is_read).length}</span>
            )}
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.email?.[0]?.toUpperCase()}</div>
            <span className="user-email">{user?.email}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1>{activeTab === 'resources' ? 'Resource Management' : 'Contact Messages'}</h1>
            <p>{activeTab === 'resources' ? `${resources.length} total resources` : `${messages.length} messages`}</p>
          </div>
          {activeTab === 'resources' && (
            <button className="btn btn-primary add-btn" onClick={() => setShowUploadForm(true)}>
              <Plus size={18} /> Add Resource
            </button>
          )}
        </div>

        {/* Upload Form Modal */}
        {showUploadForm && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowUploadForm(false)}>
            <div className="modal">
              <div className="modal-header">
                <h2>Upload New Resource</h2>
                <button onClick={() => setShowUploadForm(false)}><X size={22} /></button>
              </div>
              <form onSubmit={handleUpload} className="upload-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Epidemiology Notes Ch.1"
                      value={newResource.title}
                      onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <input
                      type="text"
                      placeholder="e.g. SEMESTER 1"
                      value={newResource.category}
                      onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select value={newResource.type} onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}>
                      <option value="Notes">Notes</option>
                      <option value="Exam">Exam</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Year</label>
                    <select value={newResource.year} onChange={(e) => setNewResource({ ...newResource, year: e.target.value })}>
                      <option value="Year 1">Year 1</option>
                      <option value="Year 2">Year 2</option>
                      <option value="Year 3">Year 3</option>
                      <option value="Year 4">Year 4</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>PDF File</label>
                  <div className="file-drop">
                    <input
                      type="file"
                      accept=".pdf"
                      id="file-upload"
                      onChange={(e) => setNewResource({ ...newResource, file: e.target.files[0] })}
                    />
                    <label htmlFor="file-upload" className="file-label">
                      <Upload size={24} />
                      <span>{newResource.file ? newResource.file.name : 'Click to select PDF'}</span>
                    </label>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setShowUploadForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={uploading}>
                    {uploading ? <span className="spinner" /> : <><Upload size={16} /> Upload Resource</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Resources Table */}
        {activeTab === 'resources' && (
          <div className="table-wrap">
            {resources.length === 0 ? (
              <div className="empty-state">
                <FileText size={48} />
                <h3>No resources yet</h3>
                <p>Click "Add Resource" to upload your first academic file.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Year</th>
                    <th>Category</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div className="resource-cell">
                          <FileText size={16} className="cell-icon" />
                          {r.title}
                        </div>
                      </td>
                      <td>
                        <span className={`type-chip ${r.type === 'Exam' ? 'exam' : 'notes'}`}>{r.type}</span>
                      </td>
                      <td>{r.year}</td>
                      <td>{r.category}</td>
                      <td>{new Date(r.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="action-btns">
                          <a href={r.file_url} target="_blank" rel="noreferrer" className="action-view">View</a>
                          <button className="action-delete" onClick={() => handleDelete(r.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Messages */}
        {activeTab === 'messages' && (
          <div className="messages-list">
            {messages.length === 0 ? (
              <div className="empty-state">
                <Mail size={48} />
                <h3>No messages yet</h3>
                <p>Contact form submissions will appear here.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`message-card ${!msg.is_read ? 'unread' : ''}`}>
                  <div className="msg-header">
                    <div className="msg-sender">
                      <div className="sender-avatar">{msg.name[0]}</div>
                      <div>
                        <strong>{msg.name}</strong>
                        <span>{msg.email}</span>
                      </div>
                    </div>
                    <div className="msg-meta">
                      <span className="msg-date">{new Date(msg.created_at).toLocaleDateString()}</span>
                      {!msg.is_read && (
                        <button className="mark-read-btn" onClick={() => markRead(msg.id)}>Mark Read</button>
                      )}
                      {msg.is_read && <span className="read-badge">Read</span>}
                    </div>
                  </div>
                  <p className="msg-body">{msg.message}</p>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <style jsx>{`
        .admin-page {
          display: flex;
          min-height: 100vh;
          padding-top: 80px;
          background: var(--surface);
        }

        /* Toast */
        .toast {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 600;
          box-shadow: var(--shadow-xl);
          animation: slideUp 0.3s ease;
        }
        .toast-success { background: #064E3B; color: white; }
        .toast-error { background: #7F1D1D; color: white; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        /* Sidebar */
        .sidebar {
          width: 260px;
          background: var(--primary);
          color: white;
          display: flex;
          flex-direction: column;
          padding: 2rem 1.25rem;
          position: fixed;
          top: 80px;
          left: 0;
          bottom: 0;
          z-index: 100;
        }

        @media (max-width: 768px) {
          .sidebar { display: none; }
          .admin-main { margin-left: 0 !important; }
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 800;
          font-size: 1.1rem;
          margin-bottom: 2.5rem;
          font-family: 'Outfit', sans-serif;
        }

        .logo-icon {
          width: 36px; height: 36px;
          background: rgba(255,255,255,0.2);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          border-radius: 0.75rem;
          color: rgba(255,255,255,0.7);
          font-weight: 500;
          transition: var(--transition);
          cursor: pointer;
          position: relative;
        }

        .nav-item:hover { background: rgba(255,255,255,0.1); color: white; }
        .nav-item.active { background: rgba(255,255,255,0.15); color: white; }

        .badge {
          margin-left: auto;
          background: var(--accent);
          color: var(--primary);
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.1rem 0.5rem;
          border-radius: 100px;
        }

        .sidebar-footer {
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 36px; height: 36px;
          background: var(--secondary);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 1rem;
        }

        .user-email {
          font-size: 0.8rem;
          opacity: 0.8;
          word-break: break-all;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255,255,255,0.7);
          padding: 0.6rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.9rem;
          font-family: inherit;
          cursor: pointer;
          transition: var(--transition);
        }

        .logout-btn:hover { background: rgba(255,0,0,0.2); color: white; }

        /* Main content */
        .admin-main {
          flex: 1;
          margin-left: 260px;
          padding: 2.5rem;
          min-height: calc(100vh - 80px);
        }

        .admin-topbar {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .admin-topbar h1 { font-size: 1.75rem; margin-bottom: 0.25rem; }
        .admin-topbar p { color: var(--muted); font-size: 0.9rem; }

        .add-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Table */
        .table-wrap {
          background: white;
          border-radius: 1.25rem;
          border: 1px solid var(--border);
          overflow: auto;
          box-shadow: var(--shadow-sm);
        }

        .data-table {
          width: 100%;
          min-width: 700px;
          border-collapse: collapse;
        }

        .data-table th {
          background: var(--surface);
          padding: 1rem 1.25rem;
          text-align: left;
          font-size: 0.85rem;
          color: var(--muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--border);
        }

        .data-table td {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--border);
          font-size: 0.95rem;
        }

        .data-table tr:last-child td { border-bottom: none; }
        .data-table tr:hover td { background: var(--surface); }

        .resource-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .cell-icon { color: var(--primary); flex-shrink: 0; }

        .type-chip {
          padding: 0.2rem 0.65rem;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .type-chip.exam { background: rgba(255,184,28,0.15); color: #b45309; }
        .type-chip.notes { background: rgba(0,163,173,0.1); color: var(--secondary); }

        .action-btns { display: flex; align-items: center; gap: 0.5rem; }

        .action-view {
          padding: 0.35rem 0.75rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          font-size: 0.85rem;
          color: var(--primary);
          font-weight: 500;
          transition: var(--transition);
        }
        .action-view:hover { background: var(--primary); color: white; }

        .action-delete {
          width: 32px; height: 32px;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 0.5rem;
          display: flex; align-items: center; justify-content: center;
          color: #DC2626;
          cursor: pointer;
          transition: var(--transition);
        }
        .action-delete:hover { background: #DC2626; color: white; }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 5rem 1rem;
          color: var(--muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        .empty-state h3 { font-size: 1.4rem; color: var(--foreground); }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .modal {
          background: white;
          border-radius: 1.5rem;
          padding: 2.5rem;
          width: 100%;
          max-width: 600px;
          box-shadow: var(--shadow-xl);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
        }

        .modal-header h2 { font-size: 1.5rem; }
        .modal-header button { color: var(--muted); cursor: pointer; }
        .modal-header button:hover { color: var(--foreground); }

        .upload-form { display: flex; flex-direction: column; gap: 1.25rem; }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 480px) {
          .form-row { grid-template-columns: 1fr; }
        }

        .form-group label {
          display: block;
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .form-group input, .form-group select {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid var(--border);
          border-radius: 0.75rem;
          font-size: 0.95rem;
          font-family: inherit;
          outline: none;
          transition: var(--transition);
        }

        .form-group input:focus, .form-group select:focus {
          border-color: var(--secondary);
        }

        .file-drop { margin-top: 0; }

        .file-drop input[type="file"] {
          display: none;
        }

        .file-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border: 2px dashed var(--border);
          border-radius: 0.75rem;
          padding: 2rem;
          cursor: pointer;
          color: var(--muted);
          transition: var(--transition);
        }

        .file-label:hover {
          border-color: var(--secondary);
          color: var(--secondary);
          background: rgba(0,163,173,0.04);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }

        .spinner {
          width: 20px; height: 20px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* Messages */
        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .message-card {
          background: white;
          border-radius: 1.25rem;
          padding: 1.75rem;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
        }

        .message-card.unread {
          border-left: 4px solid var(--secondary);
        }

        .msg-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .msg-sender {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .sender-avatar {
          width: 40px; height: 40px;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700;
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .msg-sender strong { display: block; font-size: 1rem; }
        .msg-sender span { font-size: 0.85rem; color: var(--muted); }

        .msg-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .msg-date { font-size: 0.85rem; color: var(--muted); }

        .mark-read-btn {
          padding: 0.3rem 0.75rem;
          background: var(--secondary);
          color: white;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: var(--transition);
        }

        .mark-read-btn:hover { background: var(--primary); }

        .read-badge {
          padding: 0.2rem 0.6rem;
          background: var(--surface);
          color: var(--muted);
          border-radius: 100px;
          font-size: 0.8rem;
        }

        .msg-body {
          font-size: 0.95rem;
          color: var(--muted);
          line-height: 1.7;
          background: var(--surface);
          padding: 1rem;
          border-radius: 0.75rem;
        }
      `}</style>
    </div>
  );
}
