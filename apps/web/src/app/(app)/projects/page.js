'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, ChevronRight, FolderOpen } from 'lucide-react';
import { api } from '@/lib/api';
import ScrollReveal from '@/components/ScrollReveal';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/components/Toast';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const { addToast } = useToast();

  const fetchProjects = async () => {
    try {
      const data = await api.get('/api/projects');
      setProjects(data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/api/projects', { title, description });
      setModalOpen(false);
      setTitle('');
      setDescription('');
      addToast('Project created successfully', 'success');
      fetchProjects();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <section className="py-24 md:py-32 px-6 md:px-24">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-10 border-b border-deep-teal/10">
              <div className="skeleton h-12 w-2/3 mb-3" />
              <div className="skeleton h-5 w-1/3" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div>
      <section className="py-24 md:py-32 px-6 md:px-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
          <ScrollReveal>
            <h2 className="text-sm font-bold tracking-widest uppercase text-rose mb-4">01. Archive</h2>
            <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-burgundy">
              Your Work.<br />Categorized.
            </h3>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-burgundy text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-rose transition-colors flex items-center gap-3 cursor-pointer"
            >
              <Plus size={20} /> Add New
            </button>
          </ScrollReveal>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No Projects Yet"
            description="Create your first project to start building your resume intelligence library."
            action={
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-3 bg-deep-teal text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-rose transition-colors cursor-pointer"
              >
                <Plus size={20} /> Create First Project
              </button>
            }
          />
        ) : (
          <div className="border-t-2 border-deep-teal">
            {projects.map((proj, idx) => (
              <ScrollReveal key={proj._id} delay={idx * 100}>
                <Link
                  href={`/projects/${proj._id}`}
                  className="group flex flex-col md:flex-row md:items-center justify-between py-12 border-b border-deep-teal/20 hover:border-deep-teal transition-colors cursor-pointer"
                >
                  <div className="flex-1">
                    <h4 className="text-3xl md:text-5xl font-bold tracking-tight text-deep-teal group-hover:text-rose transition-colors mb-2">
                      {proj.title}
                    </h4>
                    <p className="text-lg text-text-body font-medium uppercase tracking-widest">
                      {proj.description ? proj.description.substring(0, 80) : 'No description'}
                      <span className="opacity-40 ml-4">
                        {proj.memoryCount || 0} memories · {new Date(proj.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </p>
                  </div>
                  <div className="mt-6 md:mt-0 opacity-0 group-hover:opacity-100 transform -translate-x-8 group-hover:translate-x-0 transition-all duration-300">
                    <ChevronRight size={48} className="text-rose" />
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Project">
        <form onSubmit={handleCreate} className="space-y-8">
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-teal-muted mb-4">Project Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. E-Commerce Microservices"
              required
              className="w-full bg-transparent border-b-2 border-deep-teal/20 focus:border-rose outline-none py-4 text-2xl font-bold text-deep-teal placeholder-deep-teal/20 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-teal-muted mb-4">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the project"
              className="w-full bg-transparent border-b-2 border-deep-teal/20 focus:border-rose outline-none py-4 text-lg font-medium text-deep-teal placeholder-deep-teal/20 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={creating || !title.trim()}
            className="w-full bg-deep-teal text-white px-8 py-5 text-lg font-bold uppercase tracking-widest hover:bg-rose transition-colors flex items-center justify-center gap-4 disabled:opacity-50 cursor-pointer"
          >
            {creating ? (
              <>Creating <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /></>
            ) : (
              <>Create Project <ChevronRight size={24} /></>
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
}
