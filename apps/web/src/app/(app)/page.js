'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Plus, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import ScrollReveal from '@/components/ScrollReveal';
import StatBlock from '@/components/StatBlock';

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [tailoringTotal, setTailoringTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, tailoringData] = await Promise.all([
          api.get('/api/projects'),
          api.get('/api/tailoring/runs?limit=1'),
        ]);
        setProjects(projectsData);
        setTailoringTotal(tailoringData.total || 0);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalMemories = projects.reduce((sum, p) => sum + (p.memoryCount || 0), 0);

  if (loading) {
    return (
      <div>
        <section className="py-32 px-6 md:px-24 bg-deep-teal text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="skeleton-dark h-20 w-32" />
                <div className="skeleton-dark h-6 w-48" />
                <div className="skeleton-dark h-4 w-36" />
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Section */}
      <section className="py-24 md:py-32 px-6 md:px-24 bg-deep-teal text-white">
        <ScrollReveal>
          <h2 className="text-sm font-bold tracking-widest uppercase text-teal-muted mb-16">01. The Numbers</h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
          <ScrollReveal delay={100}>
            <StatBlock value={projects.length} label="Projects" trend="Your library" />
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <StatBlock value={totalMemories} label="Memories" trend="Bullet points parsed" />
          </ScrollReveal>
          <ScrollReveal delay={300}>
            <StatBlock value={tailoringTotal} label="Tailoring Runs" trend="Resumes generated" />
          </ScrollReveal>
        </div>
      </section>

      {/* Recent Projects Section */}
      <section className="py-24 md:py-32 px-6 md:px-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <ScrollReveal>
            <h2 className="text-sm font-bold tracking-widest uppercase text-rose mb-4">02. Recent Work</h2>
            <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-deep-teal">
              Your<br />Projects.
            </h3>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <Link
              href="/projects"
              className="bg-burgundy text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-rose transition-colors flex items-center gap-3"
            >
              <Plus size={20} /> View All
            </Link>
          </ScrollReveal>
        </div>

        {projects.length === 0 ? (
          <ScrollReveal>
            <div className="border-2 border-dashed border-deep-teal/20 py-24 text-center">
              <h4 className="text-2xl font-black uppercase tracking-tight text-deep-teal mb-4">No Projects Yet</h4>
              <p className="text-lg text-text-body mb-8">Create your first project to start building your resume intelligence.</p>
              <Link
                href="/projects"
                className="inline-flex items-center gap-3 bg-deep-teal text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-rose transition-colors"
              >
                <Plus size={20} /> Create Project
              </Link>
            </div>
          </ScrollReveal>
        ) : (
          <div className="border-t-2 border-deep-teal">
            {projects.slice(0, 3).map((proj, idx) => (
              <ScrollReveal key={proj._id} delay={idx * 100}>
                <Link href={`/projects/${proj._id}`} className="group flex flex-col md:flex-row md:items-center justify-between py-10 border-b border-deep-teal/20 hover:border-deep-teal transition-colors cursor-pointer">
                  <div className="flex-1">
                    <h4 className="text-3xl md:text-5xl font-bold tracking-tight text-deep-teal group-hover:text-rose transition-colors mb-2">
                      {proj.title}
                    </h4>
                    <p className="text-lg text-text-body font-medium uppercase tracking-widest">
                      {proj.memoryCount || 0} memories
                      <span className="opacity-40 ml-4">{new Date(proj.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 opacity-0 group-hover:opacity-100 transform -translate-x-8 group-hover:translate-x-0 transition-all duration-300">
                    <ChevronRight size={48} className="text-rose" />
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="py-24 md:py-32 px-6 md:px-24 bg-burgundy text-text-light flex flex-col items-center justify-center text-center">
        <ScrollReveal>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-white mb-12">
            Ready To<br />Tailor<span className="text-rose">?</span>
          </h2>
          <div className="flex flex-wrap gap-6 justify-center">
            <Link
              href="/projects"
              className="border border-rose text-rose px-8 py-4 font-bold uppercase tracking-widest hover:bg-rose hover:text-white transition-colors flex items-center gap-3"
            >
              <Plus size={20} /> New Project
            </Link>
            <Link
              href="/tailor"
              className="bg-rose text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-rose-dark transition-colors flex items-center gap-3"
            >
              <Sparkles size={20} /> Start Tailoring
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
