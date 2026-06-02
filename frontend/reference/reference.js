import React, { useState, useEffect, useRef } from 'react';
import {
    UploadCloud,
    Sparkles,
    CheckCircle2,
    ChevronRight,
    Plus,
    BarChart3,
    Search,
    X,
    Menu as MenuIcon
} from 'lucide-react';

const mockProjects = [
    { id: 'proj_1', name: 'E-commerce Microservices', role: 'Backend Engineer', date: 'Oct 2023' },
    { id: 'proj_2', name: 'React Native Delivery App', role: 'Frontend Lead', date: 'Jan 2024' },
];

const mockMatchedBullets = [
    {
        project: 'E-commerce Microservices',
        score: 98,
        bullets: [
            "Architected a scalable microservices backend using Node.js and Docker, improving system resilience by 40%.",
            "Designed and implemented RESTful APIs for inventory management, handling 10k+ concurrent requests."
        ]
    },
    {
        project: 'React Native Delivery App',
        score: 85,
        bullets: [
            "Optimized state management using Redux, reducing application load times by 25%.",
            "Collaborated with cross-functional teams to deliver a highly responsive UI/UX tailored for mobile delivery drivers."
        ]
    }
];

// Reusable ScrollReveal Component for the "fade in as you scroll" effect
function ScrollReveal({ children, delay = 0, className = "" }) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
                } ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

export default function App() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const scrollToSection = (id) => {
        setIsMenuOpen(false);
        setTimeout(() => {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, 400); // Wait for menu close animation
    };

    return (
        <div className="bg-[#f4f5f5] min-h-screen font-sans text-[#2E151B] selection:bg-[#DA7B93] selection:text-white overflow-x-hidden">

            {/* Sticky Header */}
            <header className="fixed top-0 left-0 w-full z-40 p-6 flex justify-between items-center mix-blend-difference text-[#f4f5f5]">
                <div
                    className="font-black text-2xl tracking-tighter cursor-pointer uppercase"
                    onClick={() => scrollToSection('hero')}
                >
                    CVSync AI.
                </div>
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className="flex items-center gap-2 font-bold tracking-widest uppercase text-sm hover:opacity-70 transition-opacity"
                >
                    Menu <MenuIcon size={24} />
                </button>
            </header>

            {/* Fullscreen Overlay Menu */}
            <div
                className={`fixed inset-0 z-50 bg-[#1C3334] text-[#f4f5f5] flex flex-col justify-center px-8 md:px-24 transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'
                    }`}
            >
                <button
                    onClick={() => setIsMenuOpen(false)}
                    className="absolute top-6 right-6 flex items-center gap-2 font-bold tracking-widest uppercase text-sm hover:text-[#DA7B93] transition-colors"
                >
                    Close <X size={24} />
                </button>

                <nav className="flex flex-col gap-6 md:gap-10">
                    <MenuLink onClick={() => scrollToSection('dashboard')} number="01" text="Overview" />
                    <MenuLink onClick={() => scrollToSection('library')} number="02" text="Project Library" />
                    <MenuLink onClick={() => scrollToSection('add-project')} number="03" text="Ingest Data" />
                    <MenuLink onClick={() => scrollToSection('tailor')} number="04" text="Tailor Resume" />
                    <MenuLink onClick={() => scrollToSection('evals')} number="05" text="Evaluations" />
                </nav>

                <div className="absolute bottom-8 left-8 md:left-24 flex gap-8 text-[#376E6F] font-bold text-sm tracking-widest uppercase">
                    <a href="#" className="hover:text-[#DA7B93] transition-colors">Documentation</a>
                    <a href="#" className="hover:text-[#DA7B93] transition-colors">Account</a>
                </div>
            </div>

            {/* Main Content Area */}
            <main>
                {/* HERO SECTION */}
                <section id="hero" className="min-h-screen flex flex-col justify-center px-6 md:px-24 pt-32 pb-20">
                    <ScrollReveal>
                        <h1 className="text-6xl md:text-[8rem] font-black uppercase leading-[0.85] tracking-tighter text-[#1C3334]">
                            Elevate <br /> Your <span className="text-[#DA7B93]">Career.</span>
                        </h1>
                    </ScrollReveal>
                    <ScrollReveal delay={200} className="mt-12 md:mt-24 max-w-2xl">
                        <p className="text-xl md:text-3xl font-medium text-[#2F4454] leading-tight">
                            We turn your raw project data into highly targeted, deeply professional resume points.
                            <br /><br />
                            No more guessing. Just perfect matches.
                        </p>
                    </ScrollReveal>
                    <ScrollReveal delay={400} className="mt-16">
                        <button
                            onClick={() => scrollToSection('tailor')}
                            className="group flex items-center gap-4 text-xl font-bold uppercase tracking-widest border-b-2 border-[#2E151B] pb-2 hover:text-[#DA7B93] hover:border-[#DA7B93] transition-colors inline-flex"
                        >
                            Start Tailoring
                            <span className="transform group-hover:translate-x-4 transition-transform duration-300">
                                <ChevronRight size={28} />
                            </span>
                        </button>
                    </ScrollReveal>
                </section>

                {/* DASHBOARD STATS SECTION */}
                <section id="dashboard" className="py-32 px-6 md:px-24 bg-[#1C3334] text-white">
                    <ScrollReveal>
                        <h2 className="text-sm font-bold tracking-widest uppercase text-[#376E6F] mb-16">01. The Numbers</h2>
                    </ScrollReveal>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
                        <ScrollReveal delay={100}>
                            <StatBlock value="12" label="Projects Parsed" trend="Growing library" />
                        </ScrollReveal>
                        <ScrollReveal delay={200}>
                            <StatBlock value="48" label="Resumes Tailored" trend="Active applications" />
                        </ScrollReveal>
                        <ScrollReveal delay={300}>
                            <StatBlock value="92%" label="Avg. Match Score" trend="Top tier accuracy" />
                        </ScrollReveal>
                    </div>
                </section>

                {/* PROJECTS LIBRARY SECTION */}
                <section id="library" className="py-32 px-6 md:px-24">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
                        <ScrollReveal>
                            <h2 className="text-sm font-bold tracking-widest uppercase text-[#DA7B93] mb-4">02. Archive</h2>
                            <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-[#2E151B]">
                                Your Work. <br /> Categorized.
                            </h3>
                        </ScrollReveal>
                        <ScrollReveal delay={200}>
                            <button
                                onClick={() => scrollToSection('add-project')}
                                className="bg-[#2E151B] text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-[#DA7B93] transition-colors flex items-center gap-3"
                            >
                                <Plus size={20} /> Add New
                            </button>
                        </ScrollReveal>
                    </div>

                    <div className="border-t-2 border-[#1C3334]">
                        {mockProjects.map((proj, idx) => (
                            <ScrollReveal key={proj.id} delay={idx * 100}>
                                <div className="group flex flex-col md:flex-row md:items-center justify-between py-12 border-b border-[#1C3334]/20 hover:border-[#1C3334] transition-colors cursor-pointer">
                                    <div className="flex-1">
                                        <h4 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1C3334] group-hover:text-[#DA7B93] transition-colors mb-2">
                                            {proj.name}
                                        </h4>
                                        <p className="text-lg text-[#2F4454] font-medium uppercase tracking-widest">
                                            {proj.role} <span className="opacity-40 ml-4">{proj.date}</span>
                                        </p>
                                    </div>
                                    <div className="mt-6 md:mt-0 opacity-0 group-hover:opacity-100 transform -translate-x-8 group-hover:translate-x-0 transition-all duration-300">
                                        <ChevronRight size={48} className="text-[#DA7B93]" />
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </section>

                {/* ADD PROJECT SECTION */}
                <section id="add-project" className="py-32 px-6 md:px-24 bg-[#2F4454] text-white">
                    <ScrollReveal>
                        <h2 className="text-sm font-bold tracking-widest uppercase text-[#DA7B93] mb-4">03. Ingest Data</h2>
                        <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-white mb-16">
                            Feed The <br /> Engine.
                        </h3>
                    </ScrollReveal>

                    <AddProjectLogic />
                </section>

                {/* TAILOR RESUME SECTION */}
                <section id="tailor" className="py-32 px-6 md:px-24 min-h-screen">
                    <ScrollReveal>
                        <h2 className="text-sm font-bold tracking-widest uppercase text-[#376E6F] mb-4">04. The Magic</h2>
                        <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-[#1C3334] mb-16">
                            Target <br /> Locked.
                        </h3>
                    </ScrollReveal>

                    <TailorResumeLogic />
                </section>

                {/* EVALS / FOOTER SECTION */}
                <section id="evals" className="py-32 px-6 md:px-24 bg-[#2E151B] text-[#f4f5f5] flex flex-col items-center justify-center text-center min-h-[70vh]">
                    <ScrollReveal>
                        <div className="w-24 h-24 bg-[#DA7B93] rounded-full flex items-center justify-center mb-12 mx-auto">
                            <BarChart3 className="w-12 h-12 text-[#2E151B]" />
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-white mb-8">
                            Strict <br /> Evaluations.
                        </h2>
                        <p className="text-xl md:text-2xl text-white/60 font-medium max-w-2xl mx-auto mb-12">
                            Coming Q4. We are building an advanced scoring system against industry standards and ATS algorithms.
                        </p>
                        <div className="inline-block border border-[#DA7B93] text-[#DA7B93] px-8 py-4 font-bold uppercase tracking-widest">
                            Join Waitlist
                        </div>
                    </ScrollReveal>
                </section>

            </main>
        </div>
    );
}

// --- Sub Components ---

function MenuLink({ onClick, number, text }) {
    return (
        <button
            onClick={onClick}
            className="group flex flex-col md:flex-row md:items-baseline gap-2 md:gap-8 text-left"
        >
            <span className="text-lg md:text-xl font-bold text-[#376E6F] tracking-widest uppercase">
                {number}.
            </span>
            <span className="text-5xl md:text-7xl font-black uppercase tracking-tighter group-hover:text-[#DA7B93] group-hover:pl-4 transition-all duration-300">
                {text}
            </span>
        </button>
    );
}

function StatBlock({ value, label, trend }) {
    return (
        <div className="flex flex-col">
            <div className="text-7xl md:text-8xl font-black tracking-tighter text-[#DA7B93] mb-4">
                {value}
            </div>
            <div className="text-xl font-bold uppercase tracking-widest mb-2 border-b border-[#376E6F] pb-4">
                {label}
            </div>
            <div className="text-[#376E6F] font-medium">
                {trend}
            </div>
        </div>
    );
}

function AddProjectLogic() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const handleProcess = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setShowResults(true);
        }, 1500);
    };

    if (showResults) {
        return (
            <ScrollReveal className="bg-white text-[#2E151B] p-8 md:p-16 border-l-8 border-[#DA7B93]">
                <div className="flex items-center gap-4 mb-12">
                    <div className="w-16 h-16 bg-[#1C3334] text-white flex items-center justify-center rounded-full">
                        <CheckCircle2 size={32} />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black uppercase tracking-tight">Extraction Complete</h3>
                        <p className="text-[#376E6F] font-bold uppercase tracking-widest">Bullets generated successfully</p>
                    </div>
                </div>
                <div className="space-y-6 mb-16">
                    {[
                        "Spearheaded the development of a real-time analytics dashboard using React and WebSockets, handling 50k+ daily active users.",
                        "Reduced data payload size by 30% through implementation of advanced GraphQL query batching.",
                        "Collaborated with UI/UX teams to establish a cohesive component library, improving developer velocity across 3 squads."
                    ].map((bullet, i) => (
                        <div key={i} className="flex gap-6 group">
                            <span className="text-[#DA7B93] font-bold text-xl mt-1">/</span>
                            <p className="text-xl text-[#2F4454] leading-relaxed font-medium">{bullet}</p>
                        </div>
                    ))}
                </div>
                <div className="flex flex-wrap gap-6">
                    <button onClick={() => setShowResults(false)} className="border border-[#1C3334] text-[#1C3334] px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors">
                        Process Another
                    </button>
                    <button className="bg-[#1C3334] text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-[#DA7B93] transition-colors">
                        Save to Library
                    </button>
                </div>
            </ScrollReveal>
        );
    }

    return (
        <ScrollReveal className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-12">
                <div>
                    <label className="block text-sm font-bold uppercase tracking-widest text-[#376E6F] mb-4">01. Project Name</label>
                    <input
                        type="text"
                        className="w-full bg-transparent border-b-2 border-[#376E6F]/50 focus:border-[#DA7B93] outline-none py-4 text-3xl font-bold placeholder-white/20 transition-colors"
                        placeholder="e.g. Analytics Engine"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold uppercase tracking-widest text-[#376E6F] mb-4">02. Your Role</label>
                    <input
                        type="text"
                        className="w-full bg-transparent border-b-2 border-[#376E6F]/50 focus:border-[#DA7B93] outline-none py-4 text-3xl font-bold placeholder-white/20 transition-colors"
                        placeholder="e.g. Lead Developer"
                    />
                </div>
            </div>

            <div className="flex flex-col space-y-12">
                <div className="flex-1">
                    <label className="block text-sm font-bold uppercase tracking-widest text-[#376E6F] mb-4">03. Raw Markdown</label>
                    <textarea
                        className="w-full h-48 bg-black/20 border-2 border-dashed border-[#376E6F]/50 focus:border-[#DA7B93] outline-none p-6 text-lg font-mono placeholder-white/30 transition-colors resize-none"
                        placeholder="Paste your markdown or raw text here..."
                    ></textarea>
                </div>

                <button
                    onClick={handleProcess}
                    disabled={isProcessing}
                    className="bg-[#DA7B93] text-white px-8 py-6 text-lg font-bold uppercase tracking-widest hover:bg-[#c96a82] transition-colors flex items-center justify-center gap-4 disabled:opacity-50"
                >
                    {isProcessing ? (
                        <>Processing Data <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div></>
                    ) : (
                        <>Extract & Enhance <Sparkles size={24} /></>
                    )}
                </button>
            </div>
        </ScrollReveal>
    );
}

function TailorResumeLogic() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            setShowResults(true);
        }, 2000);
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 xl:gap-24">
            {/* Input Side */}
            <ScrollReveal className="space-y-12">
                <div>
                    <label className="block text-sm font-bold uppercase tracking-widest text-[#376E6F] mb-4">Job Title</label>
                    <input
                        type="text"
                        className="w-full bg-transparent border-b-2 border-[#1C3334]/20 focus:border-[#DA7B93] outline-none py-4 text-4xl font-bold text-[#1C3334] placeholder-[#1C3334]/20 transition-colors"
                        placeholder="e.g. Senior Frontend Engineer"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold uppercase tracking-widest text-[#376E6F] mb-4">Job Description</label>
                    <textarea
                        className="w-full h-64 bg-white border border-[#1C3334]/10 focus:border-[#DA7B93] outline-none p-8 text-xl leading-relaxed text-[#2F4454] placeholder-[#2F4454]/30 transition-colors resize-none shadow-sm"
                        placeholder="Paste the full job description here..."
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-bold uppercase tracking-widest text-[#376E6F] mb-6">Select Projects to Include</label>
                    <div className="space-y-4">
                        {mockProjects.map(proj => (
                            <label key={proj.id} className="flex items-center gap-6 p-6 bg-white border border-[#1C3334]/10 cursor-pointer hover:border-[#DA7B93] transition-colors">
                                <input type="checkbox" className="w-6 h-6 accent-[#DA7B93]" defaultChecked />
                                <div>
                                    <span className="block text-xl font-bold text-[#1C3334]">{proj.name}</span>
                                    <span className="block text-sm uppercase tracking-widest text-[#376E6F] mt-1">{proj.role}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full bg-[#1C3334] text-white px-8 py-6 text-lg font-bold uppercase tracking-widest hover:bg-[#DA7B93] transition-colors flex items-center justify-center gap-4 disabled:opacity-50"
                >
                    {isGenerating ? (
                        <>Analyzing Requirements <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div></>
                    ) : (
                        <>Generate Target Match <Sparkles size={24} /></>
                    )}
                </button>
            </ScrollReveal>

            {/* Output Side */}
            <ScrollReveal delay={200} className="relative h-full">
                {!showResults ? (
                    <div className="h-full min-h-[600px] border-2 border-dashed border-[#1C3334]/20 flex flex-col items-center justify-center text-center p-12 bg-white/50">
                        <Search size={64} className="text-[#376E6F]/30 mb-8" />
                        <h3 className="text-3xl font-black uppercase tracking-tight text-[#1C3334] mb-4">Awaiting Input</h3>
                        <p className="text-xl text-[#2F4454] max-w-md">Provide the job requirements on the left to see your highly-targeted resume bullets appear here.</p>
                    </div>
                ) : (
                    <div className="bg-[#1C3334] text-white p-8 md:p-12 min-h-full flex flex-col shadow-2xl relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#DA7B93] blur-[100px] opacity-40"></div>

                        <div className="flex justify-between items-end border-b border-white/20 pb-8 mb-12 relative z-10">
                            <div>
                                <h2 className="text-sm font-bold uppercase tracking-widest text-[#376E6F] mb-2">Generated Output</h2>
                                <h3 className="text-3xl font-black tracking-tight">Optimized Match</h3>
                            </div>
                            <button className="text-sm font-bold uppercase tracking-widest text-[#DA7B93] hover:text-white transition-colors border-b border-[#DA7B93] pb-1">
                                Copy Text
                            </button>
                        </div>

                        <div className="flex-1 space-y-12 relative z-10">
                            {mockMatchedBullets.map((match, idx) => (
                                <div key={idx} className="space-y-6">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <h3 className="text-xl font-bold uppercase tracking-widest text-[#DA7B93]">{match.project}</h3>
                                        <div className="flex items-center gap-2 border border-[#376E6F] text-[#376E6F] px-4 py-2 text-sm font-bold uppercase tracking-widest">
                                            <CheckCircle2 size={16} /> {match.score}% Match
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        {match.bullets.map((bullet, i) => (
                                            <div key={i} className="flex gap-6 group">
                                                <span className="text-[#376E6F] font-bold text-xl mt-1">/</span>
                                                <p className="text-lg text-white/80 leading-relaxed font-medium group-hover:text-white transition-colors">{bullet}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </ScrollReveal>
        </div>
    );
}