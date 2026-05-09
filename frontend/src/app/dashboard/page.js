"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('chat');
  const [prompt, setPrompt] = useState('');
  const [chatResponse, setChatResponse] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [showMetadataLogId, setShowMetadataLogId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fullLogs, setFullLogs] = useState({});
  const [loadingLogId, setLoadingLogId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
    }
  }, [router]);

  const fetchLogDetails = async (id) => {
    if (fullLogs[id]) return; // Already fetched
    setLoadingLogId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/chat/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFullLogs(prev => ({ ...prev, [id]: data }));
      }
    } catch (err) {
      console.error('Failed to fetch log details', err);
    } finally {
      setLoadingLogId(null);
    }
  };

  const fetchHistory = async (pageNumber = 1) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/chat/history?page=${pageNumber}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setHistory(data.logs);
        setTotalPages(data.totalPages);
        setPage(data.currentPage);
      }
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const handleChat = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setChatResponse(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ message: prompt }),
      });
      const data = await res.json();
      if (res.ok) {
        setChatResponse(data.response);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
      setPrompt('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const renderParsedMetadata = (metadataStr) => {
    if (!metadataStr) return 'No metadata available';
    try {
      const parsed = JSON.parse(metadataStr);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return metadataStr;
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Resume AI Hub
        </h1>
        <button onClick={handleLogout} style={{ background: 'transparent', color: '#f87171', border: '1px solid #f87171', padding: '8px 16px', borderRadius: '8px' }}>
          Logout
        </button>
      </header>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          <button 
            onClick={() => setActiveTab('chat')} 
            style={{ flex: 1, padding: '16px', background: activeTab === 'chat' ? 'rgba(255,255,255,0.05)' : 'transparent', color: activeTab === 'chat' ? 'white' : '#94a3b8', fontWeight: activeTab === 'chat' ? '600' : '400' }}>
            Chat with API
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            style={{ flex: 1, padding: '16px', background: activeTab === 'history' ? 'rgba(255,255,255,0.05)' : 'transparent', color: activeTab === 'history' ? 'white' : '#94a3b8', fontWeight: activeTab === 'history' ? '600' : '400' }}>
            View Conversations
          </button>
        </div>

        <div style={{ padding: '30px' }}>
          {activeTab === 'chat' && (
            <div>
              <form onSubmit={handleChat} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ask the AI about your resume..." 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={loading}
                />
                <button type="submit" className="btn-primary" disabled={loading || !prompt.trim()} style={{ whiteSpace: 'nowrap' }}>
                  {loading ? 'Sending...' : 'Send Prompt'}
                </button>
              </form>

              {chatResponse && (
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '20px', borderRadius: '12px' }}>
                  <h3 style={{ marginBottom: '15px', color: '#60a5fa', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>AI Response</h3>
                  {Array.isArray(chatResponse) ? (
                    chatResponse.map((line, idx) => <p key={idx} style={{ marginBottom: '10px', lineHeight: '1.6' }}>{line}</p>)
                  ) : (
                    <p style={{ lineHeight: '1.6' }}>{chatResponse}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {history.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>No conversations yet.</p>
              ) : (
                history.map((log) => {
                  const isExpanded = expandedLogId === log._id;
                  const isMetadataExpanded = showMetadataLogId === log._id;
                  const fullLog = fullLogs[log._id];
                  const isLoading = loadingLogId === log._id;
                  const displayLog = isExpanded && fullLog ? fullLog : log;
                  
                  return (
                    <div key={log._id} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                      <div 
                        onClick={() => {
                          const willExpand = !isExpanded;
                          setExpandedLogId(willExpand ? log._id : null);
                          if (willExpand) {
                            setShowMetadataLogId(null);
                            fetchLogDetails(log._id);
                          }
                        }}
                        style={{ padding: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <div style={{ flex: 1, minWidth: 0, paddingRight: '20px' }}>
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Prompt <span style={{ marginLeft: '10px', fontSize: '0.75rem', color: '#64748b', textTransform: 'none' }}>({new Date(log.createdAt).toLocaleString()})</span>
                          </span>
                          <p style={{ marginTop: '8px', fontSize: '1rem', color: '#e2e8f0', whiteSpace: isExpanded ? 'normal' : 'nowrap', overflow: 'hidden', textOverflow: isExpanded ? 'clip' : 'ellipsis' }}>
                            {displayLog.input}
                          </p>
                        </div>
                        <div style={{ color: '#8b5cf6', fontSize: '1.2rem', opacity: 0.8 }}>
                          {isExpanded ? '▼' : '▶'}
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          {isLoading ? (
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '20px' }}>Loading details...</p>
                          ) : fullLog && (
                            <>
                              <div style={{ marginTop: '20px' }}>
                                <span style={{ fontSize: '0.8rem', color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '1px' }}>Response</span>
                                <div style={{ marginTop: '12px', color: '#f8fafc', background: 'rgba(59, 130, 246, 0.05)', padding: '15px', borderRadius: '8px' }}>
                                  {fullLog.output ? fullLog.output.split('\n').filter(line => line.trim() !== '').map((line, idx) => (
                                    <p key={idx} style={{ marginBottom: '8px', lineHeight: '1.6' }}>{line}</p>
                                  )) : <p>No response generated.</p>}
                                </div>
                              </div>
                              
                              {fullLog.metadata && (
                                <div style={{ marginTop: '20px' }}>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setShowMetadataLogId(isMetadataExpanded ? null : log._id); }}
                                    style={{ background: 'transparent', color: '#94a3b8', fontSize: '0.85rem', padding: '6px 12px', border: '1px solid #334155', borderRadius: '6px' }}
                                  >
                                    {isMetadataExpanded ? 'Hide Metadata' : 'Show Metadata'}
                                  </button>
                                  
                                  {isMetadataExpanded && (
                                    <pre style={{ marginTop: '12px', padding: '15px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', overflowX: 'auto', fontSize: '0.75rem', color: '#a78bfa' }}>
                                      {renderParsedMetadata(fullLog.metadata)}
                                    </pre>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px', alignItems: 'center' }}>
                  <button 
                    disabled={page === 1}
                    onClick={() => fetchHistory(page - 1)}
                    style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px', opacity: page === 1 ? 0.5 : 1, border: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    Previous
                  </button>
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Page {page} of {totalPages}</span>
                  <button 
                    disabled={page === totalPages}
                    onClick={() => fetchHistory(page + 1)}
                    style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px', opacity: page === totalPages ? 0.5 : 1, border: 'none', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
