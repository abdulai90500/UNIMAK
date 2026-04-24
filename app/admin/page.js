'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  BookOpen, Upload, Trash2, LogOut, Plus, X, FileText,
  LayoutDashboard, Mail, ChevronDown, CheckCircle, AlertCircle,
  Users, Image as ImageIcon, Pencil, IdCard, Download, Search, Printer
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { useRef } from 'react';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [resources, setResources] = useState([]);
  const [messages, setMessages] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resources');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingTeam, setUploadingTeam] = useState(false);
  const [toast, setToast] = useState(null);
  const [newResource, setNewResource] = useState({
    title: '', type: 'Notes', year: 'Year 1', category: '', file: null
  });
  const [newTeamMember, setNewTeamMember] = useState({
    name: '', role: '', file: null
  });
  const [teamImagePreview, setTeamImagePreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  
  // Ordinary Members States
  const [members, setMembers] = useState([]);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [uploadingMember, setUploadingMember] = useState(false);
  const [newMember, setNewMember] = useState({
    full_name: '', student_id: '', department: '', level: 'Year 1', file: null
  });
  const [memberImagePreview, setMemberImagePreview] = useState(null);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [showIdCard, setShowIdCard] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const idCardRef = useRef(null);
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
    const [res, msgs, teamRes, membersRes] = await Promise.all([
      supabase.from('resources').select('*').order('created_at', { ascending: false }),
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
      supabase.from('team_members').select('*').order('display_order', { ascending: true }),
      supabase.from('members').select('*').order('created_at', { ascending: false }),
    ]);
    setResources(res.data || []);
    setMessages(msgs.data || []);
    setTeam(teamRes.data || []);
    setMembers(membersRes.data || []);
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

  const handleTeamUpload = async (e) => {
    e.preventDefault();
    if (!newTeamMember.name || !newTeamMember.role) {
      showToast('Please fill in name and role.', 'error');
      return;
    }
    setUploadingTeam(true);

    let image_url = null;

    if (newTeamMember.file) {
      const fileExt = newTeamMember.file.name.split('.').pop();
      const fileName = `team-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('team')
        .upload(fileName, newTeamMember.file);

      if (uploadError) {
        showToast('Image upload failed: ' + uploadError.message, 'error');
        setUploadingTeam(false);
        return;
      }

      const { data: urlData } = supabase.storage.from('team').getPublicUrl(fileName);
      image_url = urlData.publicUrl;
    }

    let error;
    if (editingId) {
      const updateData = {
        name: newTeamMember.name,
        role: newTeamMember.role,
      };
      if (image_url) updateData.image_url = image_url;
      
      const { error: err } = await supabase
        .from('team_members')
        .update(updateData)
        .eq('id', editingId);
      error = err;
    } else {
      const { error: err } = await supabase.from('team_members').insert([{
        name: newTeamMember.name,
        role: newTeamMember.role,
        image_url,
        display_order: team.length
      }]);
      error = err;
    }

    setUploadingTeam(false);
    if (error) {
      showToast('Failed to save team member: ' + error.message, 'error');
    } else {
      showToast(editingId ? 'Member updated successfully!' : 'Team member added successfully!');
      setShowTeamForm(false);
      setNewTeamMember({ name: '', role: '', file: null });
      setTeamImagePreview(null);
      setEditingId(null);
      fetchAll();
    }
  };

  const handleEditTeam = (m) => {
    setNewTeamMember({ name: m.name, role: m.role, file: null });
    setTeamImagePreview(m.image_url);
    setEditingId(m.id);
    setShowTeamForm(true);
  };

  const handleTeamFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewTeamMember({ ...newTeamMember, file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setTeamImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTeamDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (!error) {
      showToast('Team member removed.');
      setTeam((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handleMemberUpload = async (e) => {
    e.preventDefault();
    if (!newMember.full_name || !newMember.student_id) {
      showToast('Name and Student ID are required.', 'error');
      return;
    }
    setUploadingMember(true);

    let photo_url = editingMemberId ? members.find(m => m.id === editingMemberId)?.photo_url : null;

    if (newMember.file) {
      const fileExt = newMember.file.name.split('.').pop();
      const fileName = `member-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('team')
        .upload(fileName, newMember.file);

      if (uploadError) {
        showToast('Photo upload failed: ' + uploadError.message, 'error');
        setUploadingMember(false);
        return;
      }

      const { data: urlData } = supabase.storage.from('team').getPublicUrl(fileName);
      photo_url = urlData.publicUrl;
    }

    let error;
    const memberData = {
      full_name: newMember.full_name,
      student_id: newMember.student_id,
      department: newMember.department,
      level: newMember.level,
      photo_url
    };

    if (editingMemberId) {
      const { error: err } = await supabase.from('members').update(memberData).eq('id', editingMemberId);
      error = err;
    } else {
      const { error: err } = await supabase.from('members').insert([memberData]);
      error = err;
    }

    setUploadingMember(false);
    if (error) {
      showToast('Failed: ' + error.message, 'error');
    } else {
      showToast(editingMemberId ? 'Member updated!' : 'Member added!');
      setShowMemberForm(false);
      setNewMember({ full_name: '', student_id: '', department: '', level: 'Year 1', file: null });
      setMemberImagePreview(null);
      setEditingMemberId(null);
      fetchAll();
    }
  };

  const handleMemberDelete = async (id) => {
    if (!confirm('Permanently remove this member?')) return;
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (!error) {
      showToast('Member removed.');
      setMembers(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleEditMember = (m) => {
    setNewMember({ full_name: m.full_name, student_id: m.student_id, department: m.department, level: m.level, file: null });
    setMemberImagePreview(m.photo_url);
    setEditingMemberId(m.id);
    setShowMemberForm(true);
  };

  const downloadIdCard = async () => {
    if (idCardRef.current === null) return;
    try {
      const dataUrl = await toPng(idCardRef.current, { cacheBust: true, quality: 1.0 });
      const link = document.createElement('a');
      link.download = `ID-${selectedMember.type === 'executive' ? 'EXEC-' + selectedMember.id : selectedMember.student_id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      showToast('Error generating ID card', 'error');
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
            className={`nav-item ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            <Users size={20} /> Team Members
          </button>
          <button
            className={`nav-item ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            <IdCard size={20} /> Ordinary Members
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
            <h1>
              {activeTab === 'resources' ? 'Resource Management' : 
               activeTab === 'team' ? 'Team Management' : 
               activeTab === 'members' ? 'Member Management' : 'Contact Messages'}
            </h1>
            <p>
              {activeTab === 'resources' ? `${resources.length} total resources` : 
               activeTab === 'team' ? `${team.length} total members` : 
               activeTab === 'members' ? `${members.length} total students` : `${messages.length} messages`}
            </p>
          </div>
          {activeTab === 'resources' && (
            <button className="btn btn-primary add-btn" onClick={() => setShowUploadForm(true)}>
              <Plus size={18} /> Add Resource
            </button>
          )}
          {activeTab === 'team' && (
            <button className="btn btn-primary add-btn" onClick={() => setShowTeamForm(true)}>
              <Plus size={18} /> Add Executive
            </button>
          )}
          {activeTab === 'members' && (
            <div className="members-actions">
              <div className="search-box">
                <Search size={18} />
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="btn btn-primary add-btn" onClick={() => setShowMemberForm(true)}>
                <Plus size={18} /> Add Member
              </button>
            </div>
          )}
        </div>

        {/* Team Member Modal */}
        {showTeamForm && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowTeamForm(false)}>
            <div className="modal">
              <div className="modal-header">
                <h2>{editingId ? 'Edit Executive Member' : 'Add Executive Member'}</h2>
                <button onClick={() => { setShowTeamForm(false); setEditingId(null); setNewTeamMember({ name: '', role: '', file: null }); setTeamImagePreview(null); }}><X size={22} /></button>
              </div>
              <form onSubmit={handleTeamUpload} className="upload-form">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Ibrahim Joseph Kamara"
                    value={newTeamMember.name}
                    onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role / Position *</label>
                  <input
                    type="text"
                    placeholder="e.g. President"
                    value={newTeamMember.role}
                    onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Profile Image (Optional)</label>
                  <div className="file-drop">
                    <input
                      type="file"
                      accept="image/*"
                      id="image-upload"
                      onChange={handleTeamFileChange}
                    />
                    <label htmlFor="image-upload" className="file-label">
                    {teamImagePreview ? (
                      <div className="preview-container">
                        <img src={teamImagePreview} alt="Preview" className="image-preview-img" />
                        <span className="change-text">Click to change</span>
                      </div>
                    ) : (
                      <>
                        <ImageIcon size={24} />
                        <span>{newTeamMember.file ? newTeamMember.file.name : 'Click to select Image'}</span>
                      </>
                    )}
                    </label>
                  </div>
                </div>

                {/* Live Preview Card */}
                <div className="preview-card-wrap">
                  <label className="preview-label">Live Preview (How it will look)</label>
                  <div className="member-card-preview">
                    <div className="member-avatar-preview" style={{ 
                      backgroundImage: teamImagePreview ? `url(${teamImagePreview})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: '#003D7A'
                    }}>
                      {!teamImagePreview && (newTeamMember.name ? (newTeamMember.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)) : '??')}
                    </div>
                    <div className="member-info-preview">
                      <h3>{newTeamMember.name || 'Full Name'}</h3>
                      <p>{newTeamMember.role || 'Member Role'}</p>
                    </div>
                    <div className="member-number-preview">00</div>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-outline" onClick={() => { setShowTeamForm(false); setEditingId(null); setNewTeamMember({ name: '', role: '', file: null }); setTeamImagePreview(null); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={uploadingTeam}>
                    {uploadingTeam ? <span className="spinner" /> : <>{editingId ? <CheckCircle size={16} /> : <Plus size={16} />} {editingId ? 'Save Changes' : 'Add Member'}</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Resource Upload Modal */}
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

        {/* Team Members Table */}
        {activeTab === 'team' && (
          <div className="table-wrap">
            {team.length === 0 ? (
              <div className="empty-state">
                <Users size={48} />
                <h3>No executive members yet</h3>
                <p>Click "Add Executive" to add your first team member.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {team.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div className="sender-avatar" style={{ 
                          backgroundImage: m.image_url ? `url(${m.image_url})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}>
                          {!m.image_url && m.name[0]}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{m.name}</td>
                      <td>{m.role}</td>
                      <td>
                        <div className="action-btns">
                          <button className="action-idcard" title="Generate ID Card" onClick={() => { setSelectedMember({...m, type: 'executive'}); setShowIdCard(true); }}>
                            <IdCard size={16} />
                          </button>
                          <button className="action-edit" onClick={() => handleEditTeam(m)}>
                            <Pencil size={16} />
                          </button>
                          <button className="action-delete" onClick={() => handleTeamDelete(m.id)}>
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

        {/* Ordinary Members Table */}
        {activeTab === 'members' && (
          <div className="table-wrap">
            {members.length === 0 ? (
              <div className="empty-state">
                <IdCard size={48} />
                <h3>No members registered</h3>
                <p>Register your first society member to start generating ID cards.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Student ID</th>
                    <th>Dept & Level</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.filter(m => 
                    m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    m.student_id.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div className="sender-avatar" style={{ 
                          backgroundImage: m.photo_url ? `url(${m.photo_url})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}>
                          {!m.photo_url && m.full_name[0]}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{m.full_name}</td>
                      <td><code>{m.student_id}</code></td>
                      <td>
                        <div className="dept-cell">
                          <span>{m.department}</span>
                          <small>{m.level}</small>
                        </div>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="action-idcard" title="Generate ID Card" onClick={() => { setSelectedMember({...m, type: 'ordinary'}); setShowIdCard(true); }}>
                            <IdCard size={16} />
                          </button>
                          <button className="action-edit" onClick={() => handleEditMember(m)}>
                            <Pencil size={16} />
                          </button>
                          <button className="action-delete" onClick={() => handleMemberDelete(m.id)}>
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

        {/* Member Form Modal */}
        {showMemberForm && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowMemberForm(false)}>
            <div className="modal">
              <div className="modal-header">
                <h2>{editingMemberId ? 'Edit Member' : 'Register New Member'}</h2>
                <button onClick={() => { setShowMemberForm(false); setEditingMemberId(null); setNewMember({ full_name: '', student_id: '', department: '', level: 'Year 1', file: null }); setMemberImagePreview(null); }}><X size={22} /></button>
              </div>
              <form onSubmit={handleMemberUpload} className="upload-form">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    placeholder="Student Corporate name"
                    value={newMember.full_name}
                    onChange={(e) => setNewMember({ ...newMember, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Student ID *</label>
                    <input
                      type="text"
                      placeholder="e.g. 102934"
                      value={newMember.student_id}
                      onChange={(e) => setNewMember({ ...newMember, student_id: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Year / Level</label>
                    <select value={newMember.level} onChange={(e) => setNewMember({ ...newMember, level: e.target.value })}>
                      <option value="Year 1">Year 1</option>
                      <option value="Year 2">Year 2</option>
                      <option value="Year 3">Year 3</option>
                      <option value="Year 4">Year 4</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Public Health"
                    value={newMember.department}
                    onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Photo</label>
                  <div className="file-drop">
                    <input
                      type="file"
                      accept="image/*"
                      id="member-photo"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setNewMember({...newMember, file});
                        if(file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setMemberImagePreview(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label htmlFor="member-photo" className="file-label">
                      {memberImagePreview ? (
                        <img src={memberImagePreview} alt="Preview" className="image-preview-img" />
                      ) : (
                        <ImageIcon size={24} />
                      )}
                      <span>{newMember.file ? newMember.file.name : 'Choose student photo'}</span>
                    </label>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setShowMemberForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={uploadingMember}>
                    {uploadingMember ? <span className="spinner" /> : <>{editingMemberId ? 'Save Changes' : 'Register Student'}</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ID Card Modal */}
        {showIdCard && selectedMember && (
          <div className="modal-overlay id-card-overlay" onClick={(e) => e.target === e.currentTarget && setShowIdCard(false)}>
            <div className="modal id-card-modal">
              <div className="modal-header">
                <h2>Membership ID Card</h2>
                <button onClick={() => setShowIdCard(false)}><X size={22} /></button>
              </div>
              
              <div className="id-card-viewport">
                <div className="id-card-design" ref={idCardRef}>
                  <div className="card-header">
                    <img src="/images/unimak (9).jpeg" alt="Logo" className="card-logo" />
                    <div className="card-header-text">
                      <span className="inst">UNIVERSITY OF MAKENI</span>
                      <span className="soc">PUBLIC HEALTH SOCIETY</span>
                      <span className="motto">Motto: Prevent, Protect and Promote</span>
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <div className="card-photo-wrap">
                      <img 
                        src={selectedMember.photo_url || selectedMember.image_url || "/images/unimak (1).jpeg"} 
                        alt={selectedMember.full_name || selectedMember.name} 
                        className="card-photo" 
                      />
                    </div>
                    
                    <div className="card-details">
                      <div className="detail-item">
                        <label>NAME</label>
                        <span>{(selectedMember.full_name || selectedMember.name).toUpperCase()}</span>
                      </div>
                      {selectedMember.type === 'executive' ? (
                        <div className="detail-item">
                          <label>ROLE</label>
                          <span>{selectedMember.role.toUpperCase()}</span>
                        </div>
                      ) : (
                        <>
                          <div className="detail-item">
                            <label>STUDENT ID</label>
                            <span>{selectedMember.student_id}</span>
                          </div>
                          <div className="detail-item">
                            <label>DEPARTMENT</label>
                            <span>{selectedMember.department?.toUpperCase()}</span>
                          </div>
                          <div className="detail-item">
                            <label>LEVEL</label>
                            <span>{selectedMember.level}</span>
                          </div>
                        </>
                      )}
                      <div className="detail-item">
                        <label>S/N</label>
                        <span>{selectedMember.type === 'executive' ? `EXEC-${selectedMember.id.toString().padStart(4, '0')}` : `ORD-${selectedMember.id.toString().padStart(4, '0')}`}</span>
                      </div>
                    </div>

                    <div className="card-qr">
                      <QRCodeSVG 
                        value={`UNIMAK-PHS|${selectedMember.type === 'executive' ? 'EXEC' : selectedMember.student_id}|${selectedMember.full_name || selectedMember.name}`} 
                        size={70}
                        fgColor="#003D7A"
                        level="H"
                      />
                      <span className="qr-label">VALIDATED UNIT</span>
                    </div>
                  </div>
                  
                  <div className="card-footer">
                    <span>MEMBER SINCE {selectedMember.created_at ? new Date(selectedMember.created_at).getFullYear() : new Date().getFullYear()}</span>
                    <div className="footer-line"></div>
                  </div>
                </div>
              </div>

              <div className="modal-actions id-actions">
                <button className="btn btn-outline" onClick={() => window.print()}>
                  <Printer size={18} /> Print Card
                </button>
                <button className="btn btn-primary" onClick={downloadIdCard}>
                  <Download size={18} /> Download Image
                </button>
              </div>
            </div>
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

        .action-edit {
          width: 32px; height: 32px;
          background: #EFF6FF;
          border: 1px solid #DBEAFE;
          border-radius: 0.5rem;
          display: flex; align-items: center; justify-content: center;
          color: #2563EB;
          cursor: pointer;
          transition: var(--transition);
        }
        .action-edit:hover { background: #2563EB; color: white; }

        .action-idcard {
          width: 32px; height: 32px;
          background: #ECFDF5;
          border: 1px solid #D1FAE5;
          border-radius: 0.5rem;
          display: flex; align-items: center; justify-content: center;
          color: #059669;
          cursor: pointer;
          transition: var(--transition);
        }
        .action-idcard:hover { background: #059669; color: white; }

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
          max-height: 90vh;
          overflow-y: auto;
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

        .image-preview-img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 0.5rem;
          border: 2px solid var(--secondary);
        }

        .preview-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .change-text {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--secondary);
        }

        .preview-card-wrap {
          margin-top: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
        }

        .preview-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 1rem;
          text-align: center;
        }

        .member-card-preview {
          background: white;
          border-radius: 1.25rem;
          padding: 1.5rem;
          text-align: center;
          position: relative;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          border: 1px solid var(--border);
          max-width: 240px;
          margin: 0 auto;
        }

        .member-avatar-preview {
          width: 100px;
          height: 100px;
          border-radius: 20px;
          margin: 0 auto 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }

        .member-info-preview h3 {
          font-size: 1.2rem;
          margin-bottom: 0.35rem;
          color: var(--primary);
        }

        .member-info-preview p {
          font-size: 1rem;
          color: var(--secondary);
        }

        .member-number-preview {
          position: absolute;
          top: 1rem;
          right: 1.25rem;
          font-size: 2rem;
          font-weight: 900;
          color: rgba(0,0,0,0.03);
          font-family: 'Outfit', sans-serif;
        }

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

        /* Members & ID Card Styles */
        .members-actions { display: flex; align-items: center; gap: 1rem; }
        .search-box {
          display: flex; align-items: center; gap: 0.75rem;
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 0.5rem 1rem;
          border-radius: 100px;
          min-width: 300px;
        }
        .search-box input {
          background: none; border: none; outline: none;
          width: 100%; font-size: 0.9rem;
        }
        .search-box svg { color: var(--muted); }

        .dept-cell { display: flex; flex-direction: column; }
        .dept-cell span { font-weight: 500; }
        .dept-cell small { color: var(--muted); font-size: 0.75rem; }

        .id-card-viewport {
          padding: 2rem 0;
          background: #f1f5f9;
          border-radius: 1rem;
          margin: 1.5rem 0;
          display: flex; justify-content: center;
        }

        .id-card-design {
          width: 480px;
          height: 280px;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          font-family: 'Outfit', sans-serif;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
        }

        .card-header {
          background: linear-gradient(135deg, #003D7A 0%, #001f4d 100%);
          color: white;
          padding: 1rem 1.5rem;
          display: flex; align-items: center; gap: 1rem;
          border-bottom: 4px solid #FFB81C;
        }
        .card-logo { width: 45px; height: 45px; border-radius: 8px; object-fit: contain; background: white; padding: 2px; }
        .card-header-text { display: flex; flex-direction: column; line-height: 1.2; }
        .card-header-text .inst { font-size: 0.7rem; font-weight: 700; opacity: 0.8; }
        .card-header-text .soc { font-size: 0.85rem; font-weight: 900; letter-spacing: 0.5px; }

        .card-body { 
          padding: 1rem 1.5rem; 
          display: flex; 
          align-items: center; 
          gap: 1.5rem; 
          flex: 1;
        }
        .card-photo-wrap {
          width: 110px; height: 110px;
          border-radius: 12px;
          border: 3px solid #f8fafc;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          overflow: hidden;
          flex-shrink: 0;
          margin: 0;
        }
        .card-photo { width: 100%; height: 100%; object-fit: cover; }

        .card-details { 
          text-align: left; 
          flex: 1; 
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          margin: 0;
        }
        .detail-item { margin-bottom: 0; }
        .detail-item label { display: block; font-size: 0.6rem; font-weight: 700; color: #94a3b8; margin-bottom: 1px; }
        .detail-item span { display: block; font-size: 0.85rem; font-weight: 800; color: #1e293b; }

        .card-qr {
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.5rem; background: #f8fafc; border-radius: 8px;
          flex-shrink: 0;
        }
        .qr-label {
          writing-mode: horizontal-tb;
          font-size: 0.5rem; font-weight: 800; color: #94a3b8; letter-spacing: 1px;
        }

        .card-footer {
          position: absolute; bottom: 0; inset-x: 0;
          padding: 0.5rem 1.5rem; text-align: center;
          font-size: 0.6rem; font-weight: 700; color: #94a3b8;
          display: flex; flex-direction: column; gap: 2px;
        }
        .motto {
          color: #FFB81C;
          font-style: italic;
          font-size: 0.65rem;
          font-weight: 600;
          margin-top: 2px;
        }
        .footer-line { height: 4px; background: #00A3AD; margin-top: 2px; border-radius: 2px; }

        .id-actions { margin-top: 0; padding: 1.5rem; border-top: 1px solid #e2e8f0; }

        @media print {
          .sidebar, .admin-topbar, .modal-header, .id-actions { display: none !important; }
          .modal-overlay { background: white !important; position: absolute !important; padding: 0 !important; }
          .modal { box-shadow: none !important; border: none !important; width: 100% !important; max-width: none !important; padding: 0 !important; }
          .id-card-viewport { background: white !important; padding: 0 !important; margin: 0 !important; }
          .id-card-design { box-shadow: none !important; border: none !important; }
        }
      `}</style>
    </div>
  );
}
