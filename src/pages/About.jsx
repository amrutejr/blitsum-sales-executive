import React from 'react';
import { motion } from 'framer-motion';
import { Users, Zap, Shield, Target } from 'lucide-react';

const About = () => {
    return (
        <div className="pt-24 pb-12 w-full bg-slate-50 min-h-screen">
            <div className="max-w-[1240px] mx-auto px-6">

                {/* Hero Section */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-6"
                    >
                        Our Mission
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight"
                    >
                        Revolutionizing Sales with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">Artificial Intelligence</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-500 font-light leading-relaxed"
                    >
                        We believe that every website visitor deserves immediate, intelligent, and human-like attention. Blitsum is building the future where AI doesn't just chat—it sells.
                    </motion.p>
                </div>

                {/* Values Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    {/* Value 1 */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                            <Zap className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Speed & Precision</h3>
                        <p className="text-slate-500 leading-relaxed">
                            In sales, timing is everything. Our AI responds instantly with the right information, capturing interest at the peak moment.
                        </p>
                    </div>

                    {/* Value 2 */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
                            <Users className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Human-Centric AI</h3>
                        <p className="text-slate-500 leading-relaxed">
                            Technology should enhance human connection, not replace it. We build AI that feels natural, empathetic, and truly helpful.
                        </p>
                    </div>

                    {/* Value 3 */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                            <Target className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Result Driven</h3>
                        <p className="text-slate-500 leading-relaxed">
                            Pretty chats don't pay bills. Our entire architecture is optimized for one metric: converting visitors into customers.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default About;
