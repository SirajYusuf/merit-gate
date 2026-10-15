'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import ScrollReveal from '@/components/ScrollReveal';
import { useToast } from '@/components/Toast';
import StatusBadge from '@/components/StatusBadge';
import TechChip from '@/components/TechChip';

export default function RunDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { addToast } = useToast();

  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedProvenance, setExpandedProvenance] = useState({});

  useEffect(() => {
    const fetchRun = async () => {
      try {
        const data = await api.get(`/api/tailoring/runs/${id}`);
        setRun(data);
      } catch (err) {
        addToast(err.message, 'error');
        if (err.status === 404) router.push('/history');
      } finally {
        setLoading(false);
      }
    };
    fetchRun();
  }, [id]);

  const toggleProvenance = (idx) => {
    setExpandedProvenance(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleCopy = () => {
    if (!run || !run.tailoredResume || !run.tailoredResume.tailoredBullets) return;
    const textToCopy = run.tailoredResume.tailoredBullets.map(b => `- ${b}`).join('\n\n');
    navigator.clipboard.writeText(textToCopy);
    addToast('Copied to clipboard', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-deep-teal/20 border-t-deep-teal rounded-full animate-spin" />
      </div>
    );
  }

  if (!run) return null;

  return (
    <div>
      {/* JD Section */}
      <section className="py-24 px-6 md:px-24 bg-deep-teal text-white">
        <ScrollReveal>
          <div className="mb-12">
            <Link 
              href="/history"
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-teal-muted hover:text-rose transition-colors mb-8"
            >
              <ArrowLeft size={16} /> Back to History
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <StatusBadge status={run.status} />
              <span className="text-sm font-bold uppercase tracking-widest text-teal-muted">
                {new Date(run.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-8">
              {run.tailoredResume?.jobTitle || 'Target Role'}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2">
              <h2 className="text-sm font-bold tracking-widest uppercase text-teal-muted mb-4">Job Description</h2>
              <div 
                className="bg-white/5 border border-white/10 p-8 text-lg text-white/80 leading-relaxed max-h-96 overflow-y-auto quill-content"
                dangerouslySetInnerHTML={{ __html: run.jobDescription }}
              />
            </div>
            
            <div>
              <h2 className="text-sm font-bold tracking-widest uppercase text-teal-muted mb-4">Extracted Metadata</h2>
              <div className="bg-black/20 p-8 border border-white/5 space-y-6">
                {run.jdMetadata?.technologies?.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-rose mb-3">Technologies</h3>
                    <div className="flex flex-wrap gap-2">
                      {run.jdMetadata.technologies.map(t => <TechChip key={t} label={t} />)}
                    </div>
                  </div>
                )}
                
                {run.jdMetadata?.concepts?.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-rose mb-3">Core Concepts</h3>
                    <div className="flex flex-wrap gap-2">
                      {run.jdMetadata.concepts.map(c => <TechChip key={c} label={c} />)}
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t border-white/10 flex justify-between text-sm uppercase tracking-widest font-bold">
                  <span className="text-teal-muted">Role:</span>
                  <span>{run.jdMetadata?.roleType || 'Unknown'}</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Tailored Output Section */}
      <section className="py-24 px-6 md:px-24 bg-base">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 border-b border-deep-teal/20 pb-8">
            <div>
              <h2 className="text-sm font-bold tracking-widest uppercase text-rose mb-4">01. Output</h2>
              <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-deep-teal">
                Tailored Match.
              </h3>
            </div>
            <button 
              onClick={handleCopy}
              className="text-sm font-bold uppercase tracking-widest text-deep-teal border-b border-deep-teal hover:text-rose hover:border-rose transition-colors pb-1 cursor-pointer"
            >
              Copy Text
            </button>
          </div>

          <div className="space-y-12">
            {run.provenanceMap?.map((prov, idx) => (
              <div key={idx} className="bg-white border border-deep-teal/10 p-8 shadow-sm">
                <div className="flex gap-6 group mb-6">
                  <span className="text-rose font-bold text-2xl mt-0.5">/</span>
                  <p className="text-xl text-deep-teal leading-relaxed font-medium">
                    {prov.tailoredBullet}
                  </p>
                </div>
                
                <div className="ml-10">
                  <button 
                    onClick={() => toggleProvenance(idx)}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-muted hover:text-rose transition-colors cursor-pointer"
                  >
                    {expandedProvenance[idx] ? <ChevronUp size={14} /> : <ChevronDown size={14} />} 
                    View Provenance • {(prov.confidenceScore * 100).toFixed(0)}% Confidence
                  </button>
                  
                  {expandedProvenance[idx] && (
                    <div className="mt-6 p-6 bg-base border-l-4 border-rose space-y-6 animate-[toast-in_0.2s_ease-out]">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-rose" />
                        <span className="text-xs font-bold uppercase tracking-widest text-deep-teal">
                          Strategy: {prov.rewriteStrategy.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-teal-muted mb-3">Source Memories Used:</h4>
                        <div className="space-y-4">
                          {prov.sourceMemoryIds.map((sourceId, sIdx) => {
                            const sourceMem = run.sourceMemories?.find(m => m._id === sourceId);
                            return sourceMem ? (
                              <div key={sIdx} className="p-4 bg-white border border-deep-teal/10">
                                <p className="text-sm text-text-body italic mb-3">&quot;{sourceMem.rawBullet}&quot;</p>
                                <div className="flex items-center gap-2">
                                  {sourceMem.memoryType && (
                                    <span className="px-2 py-0.5 bg-burgundy/10 text-burgundy text-[10px] font-bold uppercase tracking-widest rounded-sm">
                                      {sourceMem.memoryType}
                                    </span>
                                  )}
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-teal-muted">
                                    Project: {sourceMem.projectId}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div key={sIdx} className="text-sm text-status-failed">Source memory not found in payload</div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {(!run.provenanceMap || run.provenanceMap.length === 0) && (
              <div className="text-center py-12 border-2 border-dashed border-deep-teal/20 text-teal-muted font-bold uppercase tracking-widest">
                No bullets generated
              </div>
            )}
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
