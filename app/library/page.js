'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BookOpen, FileText, Download, Search, Filter, X } from 'lucide-react';

const SAMPLE_RESOURCES = [
  { id: 1, title: 'agric', type: 'Exam', year: 'Year 1', category: 'SEMESTER 1', file_url: '#', created_at: '2026-03-23' },
  { id: 2, title: 'programmin', type: 'Notes', year: 'Year 1', category: 'ddd', file_url: '#', created_at: '2026-03-20' },
  { id: 3, title: 'ss', type: 'Notes', year: 'Year 1', category: 'ddd', file_url: '#', created_at: '2026-03-20' },
  { id: 4, title: 'sssa', type: 'Notes', year: 'Year 1', category: 'ddd', file_url: '#', created_at: '2026-03-20' },
  { id: 5, title: 'ddd', type: 'Notes', year: 'Year 2', category: 'ddd', file_url: '#', created_at: '2026-03-20' },
];

export default function LibraryPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        setResources(SAMPLE_RESOURCES);
      } else {
        setResources(data);
      }
    } catch {
      setResources(SAMPLE_RESOURCES);
    } finally {
      setLoading(false);
    }
  };

  const filtered = resources.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.category?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || r.type === typeFilter;
    const matchYear = yearFilter === 'All' || r.year === yearFilter;
    return matchSearch && matchType && matchYear;
  });

  const years = ['All', ...Array.from(new Set(resources.map((r) => r.year)))];

  return (
    <div className="library-page">
      {/* Hero Header */}
      <div className="library-header">
        <div className="container header-content">
          <div className="header-icon"><BookOpen size={36} /></div>
          <div>
            <h1>📚 Public Health Library</h1>
            <p>Download academic notes and exam papers shared by the UNIMAK Public Health Society</p>
          </div>
        </div>
      </div>

      <div className="container library-body">
        {/* Filters */}
        <div className="filters-bar">
          <div className="search-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
              id="library-search"
            />
            {search && (
              <button onClick={() => setSearch('')} className="clear-btn">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="filter-group">
            <Filter size={16} />
            <div className="filter-btns">
              {['All', 'Notes', 'Exam'].map((t) => (
                <button
                  key={t}
                  className={`filter-btn ${typeFilter === t ? 'active' : ''}`}
                  onClick={() => setTypeFilter(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <select
              className="year-select"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y === 'All' ? 'All Years' : y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="results-info">
          <span>{filtered.length} resource{filtered.length !== 1 ? 's' : ''} found</span>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="loading-grid">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={48} />
            <h3>No resources found</h3>
            <p>Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="resources-grid">
            {filtered.map((resource) => (
              <div key={resource.id} className="resource-card">
                <div className={`resource-type-badge ${resource.type === 'Exam' ? 'exam-badge' : 'notes-badge'}`}>
                  {resource.type === 'Exam' ? '📝 Exam' : '📖 Notes'}
                </div>
                <div className="resource-icon">
                  <FileText size={32} />
                </div>
                <h3 className="resource-title">{resource.title}</h3>
                <div className="resource-meta">
                  <span className="meta-tag">{resource.year}</span>
                  <span className="meta-tag category-tag">{resource.category}</span>
                </div>
                <p className="resource-date">
                  Uploaded: {new Date(resource.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <a
                  href={resource.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="download-btn"
                >
                  <Download size={18} />
                  Download PDF
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .library-page {
          min-height: 100vh;
          padding-top: 80px;
        }

        .library-header {
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          padding: 4rem 0;
          color: white;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .header-icon {
          width: 70px;
          height: 70px;
          border-radius: 1.25rem;
          background: rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .header-content h1 {
          color: white;
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          margin-bottom: 0.5rem;
        }

        .header-content p {
          opacity: 0.85;
          font-size: 1rem;
          max-width: 550px;
        }

        .library-body {
          padding-top: 2.5rem;
          padding-bottom: 4rem;
        }

        .filters-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
          background: white;
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          box-shadow: var(--shadow-sm);
        }

        .search-wrap {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .search-icon {
          position: absolute;
          top: 50%;
          left: 0.85rem;
          transform: translateY(-50%);
          color: var(--muted);
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 0.7rem 0.85rem 0.7rem 2.5rem;
          border: 2px solid var(--border);
          border-radius: 0.5rem;
          font-size: 0.95rem;
          font-family: inherit;
          outline: none;
          transition: var(--transition);
        }

        .search-input:focus {
          border-color: var(--secondary);
          box-shadow: 0 0 0 3px rgba(0,163,173,0.12);
        }

        .clear-btn {
          position: absolute;
          right: 0.6rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted);
          padding: 0.25rem;
          border-radius: 50%;
        }

        .clear-btn:hover { color: var(--foreground); }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--muted);
        }

        .filter-btns {
          display: flex;
          gap: 0.4rem;
        }

        .filter-btn {
          padding: 0.4rem 0.85rem;
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 600;
          border: 2px solid var(--border);
          color: var(--muted);
          transition: var(--transition);
        }

        .filter-btn.active, .filter-btn:hover {
          border-color: var(--secondary);
          color: var(--secondary);
          background: rgba(0,163,173,0.08);
        }

        .year-select {
          padding: 0.5rem 0.75rem;
          border: 2px solid var(--border);
          border-radius: 0.5rem;
          font-size: 0.9rem;
          color: var(--foreground);
          font-family: inherit;
          outline: none;
          cursor: pointer;
        }

        .results-info {
          font-size: 0.9rem;
          color: var(--muted);
          margin-bottom: 1.5rem;
          font-weight: 500;
        }

        .resources-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.5rem;
        }

        .resource-card {
          background: white;
          border-radius: 1.25rem;
          padding: 1.75rem;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: var(--transition);
          overflow: hidden;
        }

        .resource-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
        }

        .resource-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .resource-type-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.2rem 0.6rem;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .exam-badge {
          background: rgba(255, 184, 28, 0.15);
          color: #b45309;
        }

        .notes-badge {
          background: rgba(0, 163, 173, 0.1);
          color: var(--secondary);
        }

        .resource-icon {
          width: 50px;
          height: 50px;
          background: var(--surface);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }

        .resource-title {
          font-size: 1.1rem;
          text-transform: capitalize;
          margin-top: 0.25rem;
        }

        .resource-meta {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .meta-tag {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 0.2rem 0.6rem;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--muted);
        }

        .category-tag {
          color: var(--primary);
          border-color: rgba(0,61,122,0.2);
          background: rgba(0,61,122,0.05);
        }

        .resource-date {
          font-size: 0.8rem;
          color: var(--muted);
          margin-top: auto;
        }

        .download-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: var(--primary);
          color: white;
          padding: 0.75rem;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 0.9rem;
          transition: var(--transition);
        }

        .download-btn:hover {
          background: var(--secondary);
          transform: translateY(-1px);
        }

        .loading-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.5rem;
        }

        .skeleton-card {
          height: 260px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          border-radius: 1.25rem;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .empty-state {
          text-align: center;
          padding: 5rem 1rem;
          color: var(--muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .empty-state h3 { font-size: 1.5rem; color: var(--foreground); }
      `}</style>
    </div>
  );
}
