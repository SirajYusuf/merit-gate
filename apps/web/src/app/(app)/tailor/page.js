'use client';

import { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Search, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '@/lib/api';
import ScrollReveal from '@/components/ScrollReveal';
import { useToast } from '@/components/Toast';
import TechChip from '@/components/TechChip';

export default function TailorPage() {
  const { addToast } = useToast();
  
  // Form State
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [projects, setProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState({});
  const [memoryType, setMemoryType] = useState('all');
  const [topK, setTopK] = useState(20);
  const [topN, setTopN] = useState(10);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Execution State
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [expandedSource, setExpandedSource] = useState({});

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await api.get('/api/projects');
        setProjects(data);
        // Default all to selected
        const initialSelected = {};
        data.forEach(p => initialSelected[p._id] = true);
        setSelectedProjects(initialSelected);
      } catch (err) {
        addToast('Failed to load projects', 'error');
      }
    };
    fetchProjects();
  }, []);

  const toggleProject = (id) => {
    setSelectedProjects(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleSourceExpand = (idx) => {
    setExpandedSource(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      addToast('Job description is required', 'error');
      return;
    }

    const activeProjectIds = Object.keys(selectedProjects).filter(id => selectedProjects[id]);
    if (activeProjectIds.length === 0) {
      addToast('Please select at least one project', 'error');
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const payload = {
        jobTitle,
        jobDescription,
        projectIds: activeProjectIds,
        topK: Number(topK),
        topN: Number(topN),
        ...(memoryType !== 'all' && { memoryType })
      };

      const data = await api.post('/api/tailoring/run', payload);
      setResult(data);
      addToast('Target match generated successfully', 'success');
      
      // Auto-scroll mobile users to results
      if (window.innerWidth < 1280) {
        setTimeout(() => {
          document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!result || !result.tailoredBullets) return;
    const textToCopy = result.tailoredBullets.map(b => `- ${b.tailoredBullet}`).join('\n\n');
    navigator.clipboard.writeText(textToCopy);
    addToast('Copied to clipboard', 'success');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 min-h-[calc(100vh-80px)]">
      {/* INPUT SIDE (Left) */}
      <div className="bg-base p-6 md:p-12 lg:p-24 border-r border-deep-teal/10">
        <ScrollReveal className="max-w-2xl mx-auto xl:mx-0 w-full space-y-16">
          <div>
            <h2 className="text-sm font-bold tracking-widest uppercase text-rose mb-4">01. Setup Target</h2>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-deep-teal mb-4">
              Tailor<br />Resume.
            </h1>
          </div>

          <div className="space-y-12">
            <div>
              <label className="block text-sm font-bold uppercase tracking-widest text-teal-muted mb-4">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full bg-transparent border-b-2 border-deep-teal/20 focus:border-rose outline-none py-4 text-4xl font-bold text-deep-teal placeholder-deep-teal/20 transition-colors"
                placeholder="e.g. Senior Frontend Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-widest text-teal-muted mb-4">Job Description</label>
              <div
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => setJobDescription(e.currentTarget.innerHTML)}
                className="w-full h-64 bg-white border border-deep-teal/10 focus:border-rose outline-none p-8 text-xl leading-relaxed text-text-body transition-colors overflow-y-auto shadow-sm quill-content editable-rich-text"
                data-placeholder="Paste the full job description here..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-widest text-teal-muted mb-6">Select Projects to Include</label>
              <div className="space-y-4">
                {projects.map(proj => (
                  <label key={proj._id} className={`flex items-center gap-6 p-6 bg-white border cursor-pointer transition-colors ${selectedProjects[proj._id] ? 'border-rose shadow-sm' : 'border-deep-teal/10 hover:border-rose/50'}`}>
                    <input 
                      type="checkbox" 
                      className="w-6 h-6 accent-rose" 
                      checked={!!selectedProjects[proj._id]}
                      onChange={() => toggleProject(proj._id)}
                    />
                    <div>
                      <span className="block text-xl font-bold text-deep-teal">{proj.title}</span>
                      <span className="block text-sm uppercase tracking-widest text-teal-muted mt-1">{proj.memoryCount || 0} memories</span>
                    </div>
                  </label>
                ))}
                {projects.length === 0 && (
                  <p className="text-sm font-bold uppercase tracking-widest text-status-failed bg-status-failed/10 p-4">No projects available. Create one first.</p>
                )}
              </div>
            </div>

            <div>
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-teal-muted hover:text-rose transition-colors"
              >
                <SlidersHorizontal size={16} /> Advanced Settings
              </button>
              
              {showAdvanced && (
                <div className="mt-6 p-6 bg-white border border-deep-teal/10 space-y-6 animate-[toast-in_0.3s_ease-out]">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-teal-muted mb-3">Memory Filter Type</label>
                    <select 
                      value={memoryType}
                      onChange={(e) => setMemoryType(e.target.value)}
                      className="w-full bg-base border border-deep-teal/10 p-3 outline-none focus:border-rose text-deep-teal font-bold"
                    >
                      <option value="all">All Types</option>
                      <option value="strongest">Strongest Match</option>
                      <option value="ats">ATS Optimized</option>
                      <option value="product_company">Product Company</option>
                      <option value="startup">Startup</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-teal-muted mb-3">Top-K Retrieval ({topK})</label>
                      <input 
                        type="range" min="5" max="50" value={topK} onChange={(e) => setTopK(e.target.value)}
                        className="w-full accent-rose"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-teal-muted mb-3">Top-N Bullets ({topN})</label>
                      <input 
                        type="range" min="3" max="20" value={topN} onChange={(e) => setTopN(e.target.value)}
                        className="w-full accent-rose"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || projects.length === 0}
              className="w-full bg-deep-teal text-white px-8 py-6 text-lg font-bold uppercase tracking-widest hover:bg-rose transition-colors flex items-center justify-center gap-4 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>Analyzing Requirements <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /></>
              ) : (
                <>Generate Target Match <Sparkles size={24} /></>
              )}
            </button>
          </div>
        </ScrollReveal>
      </div>

      {/* OUTPUT SIDE (Right) */}
      <div id="results-section" className="relative h-full bg-muted-navy">
        <ScrollReveal delay={200} className="h-full">
          {!result ? (
            <div className="h-full min-h-[600px] border-l-2 border-dashed border-teal-muted/20 flex flex-col items-center justify-center text-center p-12 bg-white/5">
              <Search size={64} className="text-teal-muted/30 mb-8" />
              <h3 className="text-3xl font-black uppercase tracking-tight text-white mb-4">Awaiting Input</h3>
              <p className="text-xl text-teal-muted max-w-md">Provide the job requirements on the left to see your highly-targeted resume bullets appear here.</p>
            </div>
          ) : (
            <div className="bg-deep-teal text-white p-8 md:p-12 lg:p-24 min-h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose blur-[120px] opacity-20 pointer-events-none" />
              
              <div className="flex justify-between items-end border-b border-white/20 pb-8 mb-12 relative z-10">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-teal-muted mb-2">Generated Output</h2>
                  <h3 className="text-3xl font-black tracking-tight">Optimized Match</h3>
                </div>
                <button 
                  onClick={handleCopy}
                  className="text-sm font-bold uppercase tracking-widest text-rose hover:text-white transition-colors border-b border-rose pb-1 cursor-pointer"
                >
                  Copy Text
                </button>
              </div>

              <div className="flex-1 space-y-16 relative z-10">
                {/* JD Metadata Insights */}
                {result.jdMetadata && (
                  <div className="bg-black/20 p-6 border border-teal-muted/30">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-teal-muted mb-4">Extracted Requirements</h4>
                    <div className="space-y-4">
                      {result.jdMetadata.technologies?.length > 0 && (
                        <div>
                          <span className="text-xs uppercase tracking-widest text-rose mr-3">Tech:</span>
                          <span className="text-sm text-white">{result.jdMetadata.technologies.join(', ')}</span>
                        </div>
                      )}
                      {result.jdMetadata.concepts?.length > 0 && (
                        <div>
                          <span className="text-xs uppercase tracking-widest text-rose mr-3">Core:</span>
                          <span className="text-sm text-white">{result.jdMetadata.concepts.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tailored Bullets */}
                <div className="space-y-12">
                  {result.tailoredBullets?.map((bullet, idx) => (
                    <div key={idx} className="space-y-4">
                      <div className="flex gap-6 group">
                        <span className="text-teal-muted font-bold text-2xl mt-0.5">/</span>
                        <p className="text-xl text-white/90 leading-relaxed font-medium group-hover:text-white transition-colors">
                          {bullet.tailoredBullet}
                        </p>
                      </div>
                      
                      <div className="ml-10">
                        <button 
                          onClick={() => toggleSourceExpand(idx)}
                          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-muted hover:text-rose transition-colors"
                        >
                          {expandedSource[idx] ? <ChevronUp size={14} /> : <ChevronDown size={14} />} 
                          Provenance • {(bullet.confidenceScore * 100).toFixed(0)}% Confidence
                        </button>
                        
                        {expandedSource[idx] && (
                          <div className="mt-4 p-4 bg-black/30 border-l-2 border-rose space-y-4 animate-[toast-in_0.2s_ease-out]">
                            <div className="flex items-center gap-3 mb-2">
                              <CheckCircle2 size={16} className="text-rose" />
                              <span className="text-xs font-bold uppercase tracking-widest text-rose">
                                Strategy: {bullet.rewriteStrategy.replace('_', ' ')}
                              </span>
                            </div>
                            
                            {/* Find source memories from retrievedMemories array */}
                            {bullet.sourceMemoryIds.map((sourceId, sIdx) => {
                              const sourceMem = result.retrievedMemories?.find(m => m.memoryId === sourceId);
                              return sourceMem ? (
                                <div key={sIdx} className="text-sm text-teal-muted italic">
                                  &quot;{sourceMem.rawBullet}&quot;
                                </div>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </ScrollReveal>
      </div>
    </div>
  );
}
