'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UploadCloud, Sparkles, CheckCircle2, Search, X, Trash2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '@/lib/api';
import ScrollReveal from '@/components/ScrollReveal';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import EmbeddingProgress from '@/components/EmbeddingProgress';
import StatusBadge from '@/components/StatusBadge';
import TechChip from '@/components/TechChip';
import EmptyState from '@/components/EmptyState';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { addToast } = useToast();

  const [project, setProject] = useState(null);
  const [memories, setMemories] = useState([]);
  const [embeddingStatus, setEmbeddingStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Ingest State
  const [ingestMode, setIngestMode] = useState('paste'); // 'paste' | 'upload'
  const [rawText, setRawText] = useState('');
  const [file, setFile] = useState(null);
  const [ingesting, setIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState(null);
  const fileInputRef = useRef(null);

  // Memory Filter State
  const [expandedMemories, setExpandedMemories] = useState({});

  const toggleMemory = (memoryId) => {
    setExpandedMemories(prev => ({
      ...prev,
      [memoryId]: !prev[memoryId]
    }));
  };

  const fetchData = async () => {
    try {
      const [projData, memData, statusData] = await Promise.all([
        api.get(`/api/projects/${id}`),
        api.get(`/api/projects/${id}/memories?limit=100`),
        api.get(`/api/projects/${id}/embedding-status`)
      ]);
      setProject(projData);
      setMemories(memData.memories || []);
      setEmbeddingStatus(statusData);
    } catch (err) {
      addToast(err.message, 'error');
      if (err.status === 404) router.push('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  // Polling for embedding status
  useEffect(() => {
    let interval;
    if (embeddingStatus && !embeddingStatus.isFullyEmbedded) {
      interval = setInterval(async () => {
        try {
          const statusData = await api.get(`/api/projects/${id}/embedding-status`);
          setEmbeddingStatus(statusData);
          if (statusData.isFullyEmbedded) {
            // Refresh memories when done
            const memData = await api.get(`/api/projects/${id}/memories?limit=100`);
            setMemories(memData.memories || []);
            clearInterval(interval);
          }
        } catch (err) {
          console.error('Polling error', err);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [id, embeddingStatus]);

  const handleDelete = async () => {
    try {
      await api.delete(`/api/projects/${id}`);
      addToast('Project deleted', 'success');
      router.push('/projects');
    } catch (err) {
      addToast(err.message, 'error');
      setDeleteModalOpen(false);
    }
  };

  const handleRetryEmbeddings = async () => {
    try {
      await api.post(`/api/projects/${id}/embedding-retry`, {});
      addToast('Retry triggered', 'info');
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleIngest = async () => {
    setIngesting(true);
    setIngestResult(null);
    try {
      let res;
      if (ingestMode === 'paste') {
        if (!rawText.trim()) throw new Error('Please enter some text');
        res = await api.post(`/api/projects/${id}/ingest`, { rawText });
      } else {
        if (!file) throw new Error('Please select a file');
        const formData = new FormData();
        formData.append('file', file);
        res = await api.upload(`/api/projects/upload`, formData);
        res = await api.post(`/api/projects/${id}/ingest`, { fileName: res.fileName });
      }
      setIngestResult(res);
      addToast('Ingestion started successfully', 'success');
      setRawText('');
      setFile(null);
      fetchData(); // Refresh overview and start polling
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIngesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-deep-teal/20 border-t-deep-teal rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div>
      {/* Overview Section */}
      <section className="py-24 px-6 md:px-24 bg-base border-b border-deep-teal/10">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12">
            <div>
              <h2 className="text-sm font-bold tracking-widest uppercase text-teal-muted mb-4">Project Overview</h2>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-deep-teal leading-none mb-6">
                {project.title}
              </h1>
              {project.description && (
                <p className="text-xl text-text-body font-medium max-w-3xl mb-8 uppercase tracking-widest">
                  {project.description}
                </p>
              )}
              <div className="flex items-center gap-6 text-sm font-bold uppercase tracking-widest text-teal-muted">
                <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                <span>{project.memoryCount || 0} Memories</span>
              </div>
            </div>
            
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="shrink-0 flex items-center gap-2 text-status-failed border border-status-failed/30 px-6 py-3 font-bold uppercase tracking-widest hover:bg-status-failed/10 transition-colors"
            >
              <Trash2 size={18} /> Delete Project
            </button>
          </div>

          {embeddingStatus && embeddingStatus.total > 0 && (
            <div className="bg-white border border-deep-teal/10 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold tracking-widest uppercase text-deep-teal">Embedding Engine Status</h3>
                {embeddingStatus.isFullyEmbedded ? (
                  <StatusBadge status="done" />
                ) : (
                  <StatusBadge status="processing" />
                )}
              </div>
              
              <EmbeddingProgress memories={embeddingStatus} />
              
              {embeddingStatus.hasFailures && (
                <div className="mt-8 pt-6 border-t border-deep-teal/10 flex justify-between items-center bg-rose/5 p-4 border border-rose/20">
                  <div className="flex items-center gap-3 text-rose">
                    <X size={20} />
                    <span className="font-bold uppercase tracking-widest text-sm">{embeddingStatus.failed} memories failed to embed</span>
                  </div>
                  <button
                    onClick={handleRetryEmbeddings}
                    className="flex items-center gap-2 bg-rose text-white px-5 py-2 text-sm font-bold uppercase tracking-widest hover:bg-rose-dark transition-colors"
                  >
                    <RefreshCw size={16} /> Retry Failed
                  </button>
                </div>
              )}
            </div>
          )}
        </ScrollReveal>
      </section>

      {/* Ingest Section (Dark) */}
      <section className="py-24 px-6 md:px-24 bg-muted-navy text-white">
        <ScrollReveal>
          <h2 className="text-sm font-bold tracking-widest uppercase text-rose mb-4">02. Feed The Engine</h2>
          <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-white mb-16">
            Ingest Data.
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div className="flex border-b border-teal-muted/30">
                <button
                  onClick={() => setIngestMode('paste')}
                  className={`pb-4 px-6 text-sm font-bold uppercase tracking-widest transition-colors ${ingestMode === 'paste' ? 'text-rose border-b-2 border-rose' : 'text-teal-muted hover:text-white'}`}
                >
                  Raw Text
                </button>
                <button
                  onClick={() => setIngestMode('upload')}
                  className={`pb-4 px-6 text-sm font-bold uppercase tracking-widest transition-colors ${ingestMode === 'upload' ? 'text-rose border-b-2 border-rose' : 'text-teal-muted hover:text-white'}`}
                >
                  File Upload
                </button>
              </div>

              {ingestMode === 'paste' ? (
                <div>
                  <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    className="w-full h-64 bg-black/20 border-2 border-dashed border-teal-muted/50 focus:border-rose outline-none p-6 text-lg font-mono placeholder-white/30 transition-colors resize-none"
                    placeholder="Paste your raw resume bullets, markdown notes, or performance reviews here..."
                  />
                </div>
              ) : (
                <div 
                  className={`w-full h-64 border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-colors cursor-pointer ${file ? 'border-rose bg-rose/10' : 'border-teal-muted/50 bg-black/20 hover:border-rose/50'}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => setFile(e.target.files[0])}
                    accept=".txt,.md,.json,.csv"
                    className="hidden"
                  />
                  {file ? (
                    <>
                      <CheckCircle2 size={48} className="text-rose mb-4" />
                      <p className="text-xl font-bold text-white mb-2">{file.name}</p>
                      <p className="text-sm font-bold uppercase tracking-widest text-teal-muted">Click to change file</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={48} className="text-teal-muted/50 mb-4" />
                      <p className="text-xl font-bold text-white mb-2">Upload a document</p>
                      <p className="text-sm font-bold uppercase tracking-widest text-teal-muted">Supports .txt, .md, .csv</p>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-12">
              <div className="flex-1">
                <p className="text-lg text-teal-muted leading-relaxed max-w-md">
                  The ingestion engine will parse your raw input into atomic memory units. 
                  Each unit will be cleaned, normalized, and embedded using our vector model for semantic retrieval.
                </p>
              </div>

              {ingestResult ? (
                <div className="bg-white text-deep-teal p-8 border-l-8 border-rose">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-deep-teal text-white flex items-center justify-center rounded-full">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black uppercase tracking-tight">Extraction Complete</h4>
                      <p className="text-teal-muted font-bold uppercase tracking-widest text-xs">Bullets queued for embedding</p>
                    </div>
                  </div>
                  <div className="flex gap-12">
                    <div>
                      <div className="text-4xl font-black text-rose mb-1">{ingestResult.parsedCount || 0}</div>
                      <div className="text-xs font-bold uppercase tracking-widest text-teal-muted">Parsed</div>
                    </div>
                    <div>
                      <div className="text-4xl font-black text-deep-teal mb-1">{ingestResult.queuedCount || 0}</div>
                      <div className="text-xs font-bold uppercase tracking-widest text-teal-muted">Queued</div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleIngest}
                  disabled={ingesting || (ingestMode === 'paste' && !rawText) || (ingestMode === 'upload' && !file)}
                  className="bg-rose text-white px-8 py-6 text-lg font-bold uppercase tracking-widest hover:bg-rose-dark transition-colors flex items-center justify-center gap-4 disabled:opacity-50 w-full"
                >
                  {ingesting ? (
                    <>Processing Data <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /></>
                  ) : (
                    <>Extract & Embed <Sparkles size={24} /></>
                  )}
                </button>
              )}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Memory Library Section */}
      <section className="py-24 px-6 md:px-24 bg-base min-h-screen">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div>
              <h2 className="text-sm font-bold tracking-widest uppercase text-teal-muted mb-4">03. Memory Bank</h2>
              <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-deep-teal">
                Atomic Units.
              </h3>
            </div>
          </div>

          {memories.length === 0 ? (
            <div className="border-2 border-dashed border-deep-teal/20 py-32 text-center bg-white/50">
              <Search size={64} className="text-teal-muted/30 mb-8 mx-auto" />
              <h4 className="text-3xl font-black uppercase tracking-tight text-deep-teal mb-4">Empty Bank</h4>
              <p className="text-xl text-text-body max-w-md mx-auto">Ingest some data above to generate your first memories for this project.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {memories.map((memory, idx) => {
                const isExpanded = expandedMemories[memory._id];
                return (
                  <ScrollReveal key={memory._id} delay={(idx % 10) * 50}>
                    <div className="bg-white border border-deep-teal/10 hover:border-rose transition-colors p-6 md:p-8 flex flex-col md:flex-row gap-6 group">
                      <div className="hidden md:block">
                        <span className="text-rose font-bold text-3xl leading-none">/</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <StatusBadge status={memory.embeddingStatus} />
                          {memory.memoryType && (
                            <span className="px-2 py-1 bg-burgundy/10 text-burgundy text-xs font-bold uppercase tracking-widest rounded-sm">
                              {memory.memoryType}
                            </span>
                          )}
                          {memory.technologies?.slice(0, 3).map(tech => (
                            <TechChip key={tech} label={tech} />
                          ))}
                          {memory.technologies?.length > 3 && (
                            <span className="text-xs font-bold text-teal-muted">+{memory.technologies.length - 3}</span>
                          )}
                        </div>
                        
                        <div className="md:hidden mb-2">
                          <span className="text-rose font-bold text-xl mr-2">/</span>
                        </div>
                        <p className="text-xl text-deep-teal leading-relaxed font-medium mb-4">
                          {memory.rawBullet}
                        </p>

                        {isExpanded && (
                          <div className="mt-6 pt-6 border-t border-deep-teal/10 grid grid-cols-1 md:grid-cols-2 gap-8 animate-[toast-in_0.3s_ease-out]">
                            <div>
                              <h5 className="text-xs font-bold uppercase tracking-widest text-teal-muted mb-2">Normalized Output</h5>
                              <p className="text-text-body">{memory.normalizedBullet || 'Pending processing'}</p>
                            </div>
                            <div className="space-y-4">
                              {memory.impactMetrics?.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-bold uppercase tracking-widest text-teal-muted mb-2">Impact Metrics</h5>
                                  <ul className="list-disc list-inside text-sm text-text-body space-y-1">
                                    {memory.impactMetrics.map((metric, i) => <li key={i}>{metric}</li>)}
                                  </ul>
                                </div>
                              )}
                              {memory.domainTags?.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-bold uppercase tracking-widest text-teal-muted mb-2">Domain Tags</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {memory.domainTags.map(tag => <TechChip key={tag} label={tag} />)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <button 
                          onClick={() => toggleMemory(memory._id)}
                          className="flex items-center gap-2 mt-4 text-xs font-bold uppercase tracking-widest text-teal-muted hover:text-rose transition-colors"
                        >
                          {isExpanded ? <><ChevronUp size={16} /> Show Less</> : <><ChevronDown size={16} /> Show Details</>}
                        </button>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </ScrollReveal>
      </section>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Project">
        <div className="space-y-8">
          <p className="text-lg text-text-body">
            Are you sure you want to delete <span className="font-bold text-deep-teal">{project.title}</span>? 
            This will permanently remove all associated memories and embedding data. This action cannot be undone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1 border border-deep-teal text-deep-teal px-8 py-4 font-bold uppercase tracking-widest hover:bg-deep-teal/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 bg-status-failed text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-red-600 transition-colors"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
