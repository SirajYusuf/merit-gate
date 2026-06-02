'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, FileText, Calendar, Database } from 'lucide-react';
import { api } from '@/lib/api';
import ScrollReveal from '@/components/ScrollReveal';
import EmptyState from '@/components/EmptyState';
import StatusBadge from '@/components/StatusBadge';
import { useToast } from '@/components/Toast';

export default function HistoryPage() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addToast } = useToast();

  const fetchRuns = async (pageNum = 1) => {
    setLoading(true);
    try {
      const data = await api.get(`/api/tailoring/runs?page=${pageNum}&limit=10`);
      setRuns(data.runs || []);
      setTotalPages(data.totalPages || 1);
      setPage(data.currentPage || 1);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRuns(page); }, []);

  if (loading && runs.length === 0) {
    return (
      <section className="py-24 md:py-32 px-6 md:px-24">
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="py-10 border-b border-deep-teal/10">
              <div className="skeleton h-8 w-24 mb-4" />
              <div className="skeleton h-12 w-full max-w-3xl mb-3" />
              <div className="skeleton h-5 w-1/3" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 md:py-32 px-6 md:px-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
        <ScrollReveal>
          <h2 className="text-sm font-bold tracking-widest uppercase text-rose mb-4">04. The Log</h2>
          <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-burgundy">
            Past<br />Runs.
          </h3>
        </ScrollReveal>
      </div>

      {runs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Tailoring History"
          description="You haven't generated any tailored resumes yet. Head over to the Tailor section to create your first match."
          action={
            <Link
              href="/tailor"
              className="inline-flex items-center gap-3 bg-deep-teal text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-rose transition-colors cursor-pointer"
            >
              Start Tailoring
            </Link>
          }
        />
      ) : (
        <>
          <div className="border-t-2 border-deep-teal">
            {runs.map((run, idx) => (
              <ScrollReveal key={run._id} delay={(idx % 10) * 50}>
                <Link
                  href={`/history/${run._id}`}
                  className="group flex flex-col md:flex-row md:items-center justify-between py-12 border-b border-deep-teal/20 hover:border-deep-teal transition-colors cursor-pointer"
                >
                  <div className="flex-1 pr-8">
                    <div className="mb-4">
                      <StatusBadge status={run.status} />
                    </div>
                    
                    <h4 className="text-2xl md:text-3xl font-bold tracking-tight text-deep-teal group-hover:text-rose transition-colors mb-4 line-clamp-2">
                      {run.jobDescription ? `JD: ${run.jobDescription.substring(0, 100)}...` : 'Unknown Job Description'}
                    </h4>
                    
                    <div className="flex flex-wrap gap-6 text-sm font-bold uppercase tracking-widest text-teal-muted">
                      <span className="flex items-center gap-2">
                        <Calendar size={16} />
                        {new Date(run.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-2">
                        <Database size={16} />
                        {run.projectIds?.length || 0} Project(s) Selected
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 md:mt-0 opacity-0 group-hover:opacity-100 transform -translate-x-8 group-hover:translate-x-0 transition-all duration-300">
                    <ChevronRight size={48} className="text-rose" />
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-8">
              <button
                onClick={() => fetchRuns(page - 1)}
                disabled={page === 1 || loading}
                className="text-sm font-bold uppercase tracking-widest text-deep-teal hover:text-rose disabled:opacity-30 disabled:hover:text-deep-teal transition-colors cursor-pointer"
              >
                Previous
              </button>
              <span className="text-lg font-black text-rose">
                {page} <span className="text-teal-muted font-bold text-sm">/ {totalPages}</span>
              </span>
              <button
                onClick={() => fetchRuns(page + 1)}
                disabled={page === totalPages || loading}
                className="text-sm font-bold uppercase tracking-widest text-deep-teal hover:text-rose disabled:opacity-30 disabled:hover:text-deep-teal transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
