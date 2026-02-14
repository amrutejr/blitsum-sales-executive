import React from 'react';
import { motion } from 'framer-motion';
import {
    MessageSquare, Globe, Brain, TrendingUp,
    Mic, Code, Palette, BarChart3,
    Database, ShieldCheck, Languages, FlaskConical
} from 'lucide-react';

const Features = () => {
    return (
        <section className="w-full py-24 px-4 sm:px-6 md:px-12 bg-slate-50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                        Everything you need to sell
                    </h2>
                    <p className="text-lg md:text-xl text-slate-500 font-light">
                        Built for conversion. Powered by intelligence.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">

                    {/* 1. Human-Like Conversations (Large: 2x2) */}
                    <div className="md:col-span-2 md:row-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-900/5 transition-all group relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative z-10 p-3 bg-indigo-50 rounded-lg w-fit mb-4 border border-indigo-100">
                            <MessageSquare className="w-8 h-8 text-indigo-600" />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Human-Like Conversations</h3>
                            <div className="flex items-start gap-3">
                                <div className="w-1 h-12 bg-indigo-500 rounded-full shrink-0 mt-1"></div>
                                <p className="text-slate-500 leading-relaxed">Natural, empathetic interactions that feel real. Blitsum understands context, tone, and nuance to build trust.</p>
                            </div>
                        </div>
                    </div>

                    {/* 2. Intent Detection (Small: 1x1) */}
                    <div className="md:col-span-1 md:row-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group relative flex flex-col justify-between">
                        <div className="p-2 bg-emerald-50 rounded-lg w-fit border border-emerald-100 mb-4">
                            <Brain className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Intent Detection</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">Predicts user needs before they ask.</p>
                        </div>
                    </div>

                    {/* 3. Conversion Engine (Small: 1x1) */}
                    <div className="md:col-span-1 md:row-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group relative flex flex-col justify-between">
                        <div className="p-2 bg-amber-50 rounded-lg w-fit border border-amber-100 mb-4">
                            <TrendingUp className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Conversion Engine</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">Optimized to close deals instantly.</p>
                        </div>
                    </div>

                    {/* 4. Website-Aware Navigation (Wide: 2x1) */}
                    <div className="md:col-span-2 md:row-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group relative flex flex-col justify-center">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-2 bg-purple-50 rounded-lg w-fit border border-purple-100">
                                <Globe className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Website-Aware Navigation</h3>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-1 h-8 bg-purple-500 rounded-full shrink-0"></div>
                            <p className="text-sm text-slate-500">Knows every product and pricing tier, guiding users instantly.</p>
                        </div>
                    </div>

                    {/* ROW 3: Voice, SDK, Brand, Analytics (4x1) */}

                    <div className="md:col-span-1 md:row-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group relative flex flex-col justify-between">
                        <div className="p-2 bg-blue-50 rounded-lg w-fit border border-blue-100 mb-3">
                            <Mic className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Voice Mode</h3>
                            <p className="text-xs text-slate-500">Real-time switching.</p>
                        </div>
                    </div>

                    <div className="md:col-span-1 md:row-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group relative flex flex-col justify-between">
                        <div className="p-2 bg-slate-100 rounded-lg w-fit border border-slate-200 mb-3">
                            <Code className="w-5 h-5 text-slate-700" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">SDK Gen</h3>
                            <p className="text-xs text-slate-500">Setup in 60s.</p>
                        </div>
                    </div>

                    <div className="md:col-span-1 md:row-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group relative flex flex-col justify-between">
                        <div className="p-2 bg-pink-50 rounded-lg w-fit border border-pink-100 mb-3">
                            <Palette className="w-5 h-5 text-pink-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Branding</h3>
                            <p className="text-xs text-slate-500">Your agent, your way.</p>
                        </div>
                    </div>

                    <div className="md:col-span-1 md:row-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group relative flex flex-col justify-between">
                        <div className="p-2 bg-cyan-50 rounded-lg w-fit border border-cyan-100 mb-3">
                            <BarChart3 className="w-5 h-5 text-cyan-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Analytics</h3>
                            <p className="text-xs text-slate-500">Deep insights.</p>
                        </div>
                    </div>

                    {/* ROW 4: CRM, Privacy, Multi-lang, A/B (4x1) */}

                    <div className="md:col-span-1 md:row-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group relative flex flex-col justify-center items-center text-center">
                        <div className="p-2 bg-orange-50 rounded-full border border-orange-100 mb-2">
                            <Database className="w-5 h-5 text-orange-600" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">CRM Integration</h3>
                    </div>

                    <div className="md:col-span-1 md:row-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group relative flex flex-col justify-center items-center text-center">
                        <div className="p-2 bg-teal-50 rounded-full border border-teal-100 mb-2">
                            <ShieldCheck className="w-5 h-5 text-teal-600" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">Data Privacy</h3>
                    </div>

                    <div className="md:col-span-1 md:row-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group relative flex flex-col justify-center items-center text-center">
                        <div className="p-2 bg-indigo-50 rounded-full border border-indigo-100 mb-2">
                            <Languages className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">Multi-language</h3>
                    </div>

                    <div className="md:col-span-1 md:row-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group relative flex flex-col justify-center items-center text-center">
                        <div className="p-2 bg-violet-50 rounded-full border border-violet-100 mb-2">
                            <FlaskConical className="w-5 h-5 text-violet-600" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">A/B Testing</h3>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Features;
