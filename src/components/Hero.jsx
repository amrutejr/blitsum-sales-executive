import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    MessageSquare,
    Users,
    GitCommit,
    BarChart3,
    BrainCircuit,
    Plug,
    Settings,
    CreditCard,
    Search,
    Bell,
    ChevronDown,
    Zap,
    TrendingUp,
    TrendingDown,
    MoreHorizontal,
    Bot,
    Calendar,
    PlayCircle,
    CheckCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const Hero = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const cleanedEmail = email.trim();

        if (!cleanedEmail || !cleanedEmail.includes('@')) {
            setStatus('error');
            setErrorMessage('Please enter a valid email address');
            return;
        }

        setStatus('loading');
        setErrorMessage('');

        try {
            await addDoc(collection(db, "waitlist"), {
                email: cleanedEmail,
                timestamp: serverTimestamp(),
                source: "hero_section"
            });
            setStatus('success');
            setEmail('');
        } catch (error) {
            console.error("Error adding document: ", error);
            setStatus('error');
            setErrorMessage('Something went wrong. Please try again later.');
        }
    };

    return (
        <div className="relative w-full min-h-screen flex flex-col items-center justify-center font-sans overflow-hidden text-slate-900 pt-32 pb-20">

            {/* --- HERO CONTENT --- */}
            <main className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center text-center">

                {/* 1. Typography */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-16 w-full flex flex-col items-center"
                >
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 drop-shadow-sm">
                        Meet Your <br className="md:hidden" />
                        AI Sales Executive
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-light">
                        Turn your static site into an agent that thinks, decides, and converts visitors 24/7.
                    </p>

                    <div className="flex flex-col items-center gap-6 mt-10 w-full max-w-md">
                        {/* Waitlist Box */}
                        <div id="waitlist-form" className="relative w-full max-w-md">
                            <form
                                onSubmit={handleSubmit}
                                className={`flex w-full items-center p-1.5 bg-white border rounded-full shadow-sm transition-all
                                ${status === 'error' ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 hover:border-indigo-300'}`}
                            >
                                <input
                                    type="email"
                                    placeholder="Enter your work email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (status === 'error') setStatus('idle');
                                    }}
                                    disabled={status === 'loading' || status === 'success'}
                                    className="flex-1 bg-transparent px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none min-w-0"
                                />
                                <button
                                    type="submit"
                                    disabled={status === 'loading' || status === 'success'}
                                    className={`font-medium px-6 py-2.5 rounded-full transition-all whitespace-nowrap shadow-md flex items-center justify-center min-w-[140px]
                                    ${status === 'success'
                                            ? 'bg-green-600 text-white cursor-default'
                                            : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                                >
                                    {status === 'loading' ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : status === 'success' ? (
                                        <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Joined!</span>
                                    ) : (
                                        'Join Waitlist'
                                    )}
                                </button>
                            </form>

                            {/* Status Message */}
                            {status === 'error' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute -bottom-8 left-0 w-full text-center"
                                >
                                    <span className="text-red-500 text-sm flex items-center justify-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> {errorMessage || 'An error occurred'}
                                    </span>
                                </motion.div>
                            )}
                        </div>

                        {/* Interactive Demo Button */}
                        <button className="flex items-center gap-2 text-slate-500 font-medium hover:text-indigo-600 transition-colors group">
                            <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span>Try Interactive Demo</span>
                        </button>
                    </div>
                </motion.div>

                {/* 2. DASHBOARD MOCKUP (Revenue Command Center) */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full max-w-[1300px] aspect-[16/10] bg-[#0f1012] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex relative group"
                >
                    {/* --- Sidebar Navigation --- */}
                    <aside className="w-64 bg-[#131416] border-r border-slate-800 flex flex-col hidden md:flex shrink-0">
                        {/* Logo Area */}
                        <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-white text-lg tracking-tight">Blitsum</span>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                            <NavItem icon={<LayoutDashboard />} label="Overview" active />
                            <NavItem icon={<MessageSquare />} label="Live Conversations" badge="3" />
                            <NavItem icon={<Users />} label="Leads" />
                            <NavItem icon={<GitCommit />} label="Pipeline" />
                            <NavItem icon={<BarChart3 />} label="Analytics" />
                            <NavItem icon={<BrainCircuit />} label="AI Training" />
                            <NavItem icon={<Plug />} label="Integrations" />
                        </div>

                        {/* Bottom Settings */}
                        <div className="p-3 border-t border-slate-800 space-y-1">
                            <NavItem icon={<Settings />} label="Settings" />
                            <NavItem icon={<CreditCard />} label="Billing" />
                        </div>

                        {/* User Profile */}
                        <div className="p-4 border-t border-slate-800 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                                A
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-white truncate">Abhinav</div>
                                <div className="text-xs text-slate-500 truncate">Pro Workspace</div>
                            </div>
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                        </div>
                    </aside>

                    {/* --- Main Content Area --- */}
                    <div className="flex-1 flex flex-col min-w-0 bg-[#0f1012]">

                        {/* Top Navigation Bar */}
                        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-[#0f1012]/50 backdrop-blur-sm z-10">
                            {/* Search */}
                            <div className="flex items-center flex-1 max-w-md">
                                <div className="relative w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Search leads, conversations..."
                                        className="w-full bg-[#1a1b1e] border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Right Actions */}
                            <div className="flex items-center gap-4 ml-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs font-medium text-green-400">AI Active</span>
                                </div>
                                <div className="h-6 w-px bg-slate-800" />
                                <button className="text-slate-400 hover:text-white transition-colors relative">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0f1012]" />
                                </button>
                            </div>
                        </header>

                        {/* Dashboard Scroll Area */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8">

                            {/* Page Header */}
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-white">Overview</h2>
                                <div className="flex items-center gap-2 bg-[#1a1b1e] border border-slate-800 rounded-lg p-1">
                                    <button className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white rounded transition-colors">7D</button>
                                    <button className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded shadow-sm">30D</button>
                                    <button className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white rounded transition-colors">Custom</button>
                                </div>
                            </div>

                            {/* KPI Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                                <KPICard title="AI Revenue" value="$42.5k" change="+12.5%" positive sparkline="path-up" />
                                <KPICard title="Leads Captured" value="1,248" change="+8.2%" positive sparkline="path-up-2" />
                                <KPICard title="Meetings" value="86" change="+24%" positive sparkline="path-up-3" />
                                <KPICard title="Conv. Rate" value="4.2%" change="-1.1%" negative sparkline="path-down" />
                                <KPICard title="Avg Deal" value="$8.5k" change="+2.4%" positive sparkline="path-up-4" />
                                <KPICard title="Pipeline" value="$340k" change="+15%" positive sparkline="path-up-5" />
                            </div>

                            {/* Main Content Split */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[400px]">

                                {/* Revenue Chart Area */}
                                <div className="lg:col-span-2 bg-[#131416] border border-slate-800 rounded-xl p-6 flex flex-col">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">Revenue Performance</h3>
                                            <p className="text-sm text-slate-500">Compare against previous period</p>
                                        </div>
                                        <button className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Mock Chart Visual */}
                                    <div className="flex-1 w-full relative">
                                        {/* Grid Lines */}
                                        <div className="absolute inset-0 flex flex-col justify-between text-xs text-slate-600">
                                            <div className="border-b border-slate-800/50 w-full h-0"></div>
                                            <div className="border-b border-slate-800/50 w-full h-0"></div>
                                            <div className="border-b border-slate-800/50 w-full h-0"></div>
                                            <div className="border-b border-slate-800/50 w-full h-0"></div>
                                        </div>
                                        {/* Graph Area (SVG or Gradient) */}
                                        <div className="absolute inset-0 flex items-end pt-4 pb-0 px-2 space-x-2">
                                            {/* Simulated Bar Chart */}
                                            {Array.from({ length: 12 }).map((_, i) => (
                                                <div key={i} className="flex-1 bg-slate-800/30 rounded-t-sm relative group overflow-hidden">
                                                    <div className="absolute bottom-0 left-0 right-0 bg-indigo-600/80 hover:bg-indigo-500 transition-all duration-500" style={{ height: `${Math.random() * 60 + 20}%` }}></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500 mt-4 px-2">
                                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                                        <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                                    </div>
                                </div>

                                {/* Live Activity Feed */}
                                <div className="bg-[#131416] border border-slate-800 rounded-xl p-6 flex flex-col">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold text-white">Live Activity</h3>
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    </div>

                                    <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                                        <ActivityItem
                                            icon={<Calendar className="w-4 h-4 text-purple-400" />}
                                            title="Demo Booked"
                                            desc="TechFlow Inc. scheduled for Tue, 2pm"
                                            time="2m ago"
                                        />
                                        <ActivityItem
                                            icon={<Zap className="w-4 h-4 text-yellow-400" />}
                                            title="High Intent Detected"
                                            desc="User viewing Pricing page > 5 mins"
                                            time="12m ago"
                                        />
                                        <ActivityItem
                                            icon={<MessageSquare className="w-4 h-4 text-blue-400" />}
                                            title="AI Conversation"
                                            desc="Engaged with lead from LinkedIn"
                                            time="24m ago"
                                        />
                                        <ActivityItem
                                            icon={<GitCommit className="w-4 h-4 text-green-400" />}
                                            title="Deal Moved"
                                            desc="Acme Corp -> Negotiation"
                                            time="1h ago"
                                        />
                                        <ActivityItem
                                            icon={<Users className="w-4 h-4 text-slate-400" />}
                                            title="New Lead"
                                            desc="Sarah J. (CTO) joined waitlist"
                                            time="2h ago"
                                        />
                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>
                </motion.div>

            </main>
        </div>
    );
};

const NavItem = ({ icon, label, badge, active }) => (
    <button className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 group
        ${active ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-[#1a1b1e] hover:text-slate-200'}`}>
        <div className="flex items-center gap-3">
            {React.cloneElement(icon, { className: `w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}` })}
            <span>{label}</span>
        </div>
        {badge && (
            <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>
        )}
    </button>
);

const KPICard = ({ title, value, change, positive, negative }) => (
    <div className="bg-[#131416] p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
        <h4 className="text-xs font-medium text-slate-500 mb-2 truncate">{title}</h4>
        <div className="flex items-end justify-between">
            <div>
                <div className="text-xl font-bold text-white mb-1">{value}</div>
                <div className={`text-xs font-medium flex items-center gap-1 ${positive ? 'text-green-400' : 'text-red-400'}`}>
                    {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {change}
                </div>
            </div>
            {/* Tiny Mock Sparkline */}
            <div className="w-12 h-8 opacity-50 relative overflow-hidden">
                <div className={`absolute bottom-0 left-0 right-0 top-0 border-b-2 ${positive ? 'border-green-500/50' : 'border-red-500/50'}`} style={{ clipPath: 'polygon(0 100%, 20% 60%, 40% 80%, 60% 40%, 80% 50%, 100% 20%, 100% 100%)', background: positive ? 'linear-gradient(to top, rgba(34, 197, 94, 0.1), transparent)' : 'linear-gradient(to top, rgba(239, 68, 68, 0.1), transparent)' }}></div>
            </div>
        </div>
    </div>
);

const ActivityItem = ({ icon, title, desc, time }) => (
    <div className="flex gap-3 group">
        <div className="mt-1 relative">
            <div className="w-8 h-8 rounded-lg bg-[#1a1b1e] border border-slate-800 flex items-center justify-center shrink-0 relative z-10 group-hover:border-slate-700 transition-colors">
                {icon}
            </div>
            <div className="absolute top-8 left-1/2 -translate-x-1/2 bottom-[-24px] w-px bg-slate-800 group-last:hidden"></div>
        </div>
        <div className="pb-1">
            <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-slate-200">{title}</span>
                <span className="text-[10px] text-slate-600">{time}</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
        </div>
    </div>
);

export default Hero;
