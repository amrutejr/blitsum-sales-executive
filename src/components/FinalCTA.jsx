import React from 'react';
import { Sparkles } from 'lucide-react';

const FinalCTA = () => {
    return (
        <section className="py-24 px-6">
            <div className="max-w-5xl mx-auto bg-slate-900 rounded-[2.5rem] p-12 md:p-24 text-center relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-white/90 uppercase tracking-wider mb-8 backdrop-blur-sm">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        <span>Limited Early Access</span>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
                        Ready to hire your <br className="hidden md:block" />
                        <span className="text-indigo-400">AI Sales Team?</span>
                    </h2>

                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-12 leading-relaxed">
                        Join innovative companies using Blitsum to convert traffic 24/7.
                        Setup takes less than 2 minutes.
                    </p>

                    <button
                        onClick={() => document.getElementById("waitlist-form")?.scrollIntoView({ behavior: "smooth" })}
                        className="bg-white text-indigo-950 px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]"
                    >
                        Join the Waitlist
                    </button>

                    <p className="mt-6 text-sm text-slate-500">
                        No credit card required · Free 14-day trial on launch
                    </p>
                </div>
            </div>
        </section>
    );
};

export default FinalCTA;
