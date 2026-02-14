import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const steps = [
    {
        id: 1,
        title: "Paste your website link",
        description: "Share your website URL. Blitsum securely scans your site, understands your product, and maps every page automatically.",
        visual: "scan",
        color: "bg-indigo-500"
    },
    {
        id: 2,
        title: "Customize your sales agent",
        description: "Choose how Blitsum speaks and appears. Adjust tone, personality, placement, and UI so it feels native to your brand.",
        visual: "customize",
        color: "bg-emerald-500"
    },
    {
        id: 3,
        title: "Deploy the SDK",
        description: "Get a custom SDK snippet and a clear integration guide. Add it to your site once — Blitsum adapts automatically.",
        visual: "deploy",
        color: "bg-blue-500"
    },
];

// --- Visual Components ---

const BrowserVisual = () => {
    return (
        <div className="w-full h-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col relative select-none">
            <div className="h-6 md:h-8 bg-white border-b border-slate-100 flex items-center px-3 gap-2">
                <div className="flex gap-1.5">
                    <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-slate-300" />
                    <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-slate-300" />
                </div>
                <div className="flex-1 ml-2 bg-slate-50 h-4 md:h-5 rounded flex items-center px-2 text-[8px] md:text-[10px] text-slate-400 font-mono overflow-hidden whitespace-nowrap">
                    https://yoursite.com
                </div>
            </div>
            <div className="flex-1 p-3 md:p-5 relative overflow-hidden flex flex-col gap-2 md:gap-3">
                <div className="w-1/3 h-3 md:h-4 bg-slate-200 rounded-md" />
                <div className="w-2/3 h-12 md:h-20 bg-slate-100 rounded-md" />
                <div className="grid grid-cols-3 gap-2 md:gap-3 mt-1 md:mt-2">
                    <div className="h-10 md:h-16 bg-slate-100 rounded-md" />
                    <div className="h-10 md:h-16 bg-slate-100 rounded-md" />
                    <div className="h-10 md:h-16 bg-slate-100 rounded-md" />
                </div>

                <motion.div
                    animate={{ top: ["0%", "120%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                    className="absolute left-0 w-full h-px bg-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.6)] z-10 top-0 pointer-events-none"
                >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-indigo-600 text-[8px] md:text-[9px] text-white px-1.5 py-0.5 rounded-l-md font-mono">
                        Scanning...
                    </div>
                </motion.div>

                <motion.div
                    initial={{ scale: 0, opacity: 0, y: 10 }}
                    whileInView={{ scale: 1, opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="absolute top-8 md:top-10 right-8 md:right-10 bg-green-100 text-green-700 text-[8px] md:text-[10px] font-bold px-2 py-1 rounded-full shadow-sm border border-green-200"
                >
                    Product Data Found
                </motion.div>
                <motion.div
                    initial={{ scale: 0, opacity: 0, y: 10 }}
                    whileInView={{ scale: 1, opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.9, type: "spring" }}
                    className="absolute bottom-8 md:bottom-12 left-8 md:left-12 bg-blue-100 text-blue-700 text-[8px] md:text-[10px] font-bold px-2 py-1 rounded-full shadow-sm border border-blue-200"
                >
                    Pricing Mapped
                </motion.div>
            </div>
        </div>
    );
};

const CustomizeVisual = () => {
    return (
        <div className="w-full h-full bg-white border border-slate-200 rounded-xl p-4 md:p-6 flex flex-col gap-3 md:gap-5 shadow-sm relative overflow-hidden select-none">
            <div className="flex justify-between items-center">
                <div className="text-[10px] md:text-xs font-bold text-slate-800 uppercase tracking-wider">Agent Personality</div>
                <div className="flex gap-2 items-center">
                    <span className="text-[8px] md:text-[10px] text-slate-400 font-medium">Interactive</span>
                    <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
                </div>
            </div>

            <div className="space-y-2 md:space-y-4">
                {[
                    { label: "Friendly Tone", color: "bg-indigo-500", on: true },
                    { label: "Proactive Sales", color: "bg-emerald-500", on: true },
                ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between group">
                        <span className="text-xs md:text-sm text-slate-500 font-medium">{item.label}</span>
                        <div className={`w-8 md:w-11 h-4 md:h-6 rounded-full flex items-center px-0.5 ${item.on ? item.color : 'bg-slate-200'}`}>
                            <div className={`w-3 md:w-5 h-3 md:h-5 bg-white rounded-full shadow-sm transform transition-transform ${item.on ? 'translate-x-[14px] md:translate-x-[20px]' : 'translate-x-0'}`} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-1 md:mt-2 space-y-2 md:space-y-4">
                <div className="space-y-1 md:space-y-1.5">
                    <div className="text-[8px] md:text-[10px] text-slate-400 font-semibold flex justify-between">
                        <span>Creativity</span>
                        <span className="text-slate-600">High</span>
                    </div>
                    <div className="w-full h-1 md:h-1.5 bg-slate-100 rounded-full relative overflow-hidden">
                        <motion.div
                            className="absolute left-0 top-0 bottom-0 bg-indigo-500 rounded-full"
                            initial={{ width: "0%" }}
                            whileInView={{ width: "85%" }}
                            viewport={{ once: false }}
                            transition={{ duration: 1.2, delay: 0.2, ease: "circOut" }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const DeployVisual = () => {
    return (
        <div className="w-full h-full bg-[#0f172a] rounded-xl overflow-hidden shadow-xl flex flex-col font-mono text-[10px] md:text-xs border border-slate-800 select-none">
            <div className="h-7 md:h-9 bg-[#1e293b] flex items-center px-3 md:px-4 border-b border-slate-700 justify-between">
                <span className="text-slate-400 font-medium">index.html</span>
                <div className="flex gap-1.5">
                    <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-slate-600"></div>
                </div>
            </div>
            <div className="flex-1 p-3 md:p-5 text-slate-300 space-y-1 md:space-y-2 relative">
                <div>
                    <span className="text-purple-400">const</span> <span className="text-blue-400">blitsum</span> = <span className="text-yellow-300">new</span> <span className="text-blue-400">Blitsum</span>({'{'}
                </div>
                <div className="pl-4">
                    apiKey: <span className="text-emerald-400">"pk_live..."</span>,
                </div>
                <div className="pl-4">
                    mode: <span className="text-emerald-400">"auto_detect"</span>
                </div>
                <div>
                    {'}'});
                </div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 10 }}
                    whileInView={{ scale: 1, opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="mt-4 md:mt-6 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 p-2 md:p-3 rounded-lg flex items-center gap-2 md:gap-3"
                >
                    <div className="w-4 md:w-5 h-4 md:h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[#0f172a] font-bold text-[8px] md:text-[10px]">✓</div>
                    <span>Ready</span>
                </motion.div>
            </div>
        </div>
    );
};


const TextBlock = ({ title, description, index, scrollYProgress }) => {
    // 3 steps. Each step gets a 1/3 slice of scroll.
    const stepSize = 1 / steps.length;
    const start = index * stepSize;
    const end = start + stepSize;

    // Use transforms based on scrollYProgress passed from parent
    const opacity = useTransform(
        scrollYProgress,
        [start, start + 0.2, end - 0.2, end],
        [0, 1, 1, 0]
    );

    const y = useTransform(
        scrollYProgress,
        [start, start + 0.2, end - 0.2, end],
        [20, 0, 0, -20]
    );

    return (
        <motion.div
            style={{ opacity, y, top: 0, left: 0 }}
            className="absolute w-full h-full flex flex-col justify-center px-6 md:px-12"
        >
            <div className={`inline-block w-fit px-3 py-1 mb-4 md:mb-6 rounded-full ${steps[index].color.replace('bg-', 'bg-')}/10 border ${steps[index].color.replace('bg-', 'border-')}/20 text-xs font-bold tracking-wide uppercase ${steps[index].color.replace('bg-', 'text-')}`}>
                Step 0{index + 1}
            </div>
            <h3 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                {title}
            </h3>
            <p className="text-lg text-slate-500 leading-relaxed font-light">
                {description}
            </p>
        </motion.div>
    )
}

const VisualBlock = ({ visual, index, scrollYProgress }) => {
    const stepSize = 1 / steps.length;
    const start = index * stepSize;
    const end = start + stepSize;

    // Entrance animation: Slide up from bottom
    const y = useTransform(
        scrollYProgress,
        [start - 0.1, start + 0.2], // Start entering before its text turn?
        ["100%", "0%"]
    );

    // Scale down/fade out when next one comes (at 'end')
    const scale = useTransform(
        scrollYProgress,
        [end - 0.1, end + 0.2],
        [1, 0.8]
    );

    const opacity = useTransform(
        scrollYProgress,
        [end - 0.1, end + 0.2],
        [1, 0]
    );

    // Adjusting zIndex to ensure stacking order
    return (
        <motion.div
            style={{
                y: index === 0 ? "0%" : y, // First one starts visible without sliding up? Or slide it up too?
                scale: index === steps.length - 1 ? 1 : scale, // Last one stays?
                opacity: index === steps.length - 1 ? 1 : opacity,
                zIndex: index
            }}
            className="absolute top-0 left-0 w-full h-full flex items-center justify-center p-6 md:p-12"
        >
            <div className="w-full aspect-[4/3] md:aspect-square max-w-[500px] bg-slate-50 rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-3 md:p-4">
                <div className="w-full h-full bg-slate-50 rounded-xl relative overflow-hidden">
                    {visual === 'scan' && <BrowserVisual />}
                    {visual === 'customize' && <CustomizeVisual />}
                    {visual === 'deploy' && <DeployVisual />}
                </div>
            </div>
        </motion.div>
    );
};

const HowItWorks = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    return (
        <section ref={containerRef} className="relative h-[300vh] bg-white">
            <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center">

                {/* Section Header */}
                <div className="absolute top-6 md:top-10 text-center z-10 w-full px-4">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-2">
                        How Blitsum Works
                    </h2>
                </div>

                <div className="relative w-full h-full max-w-7xl mx-auto flex flex-col lg:flex-row pt-20">

                    {/* LEFT COLUMN: Text */}
                    <div className="w-full lg:w-1/2 h-1/2 lg:h-full relative">
                        {steps.map((step, i) => (
                            <TextBlock
                                key={i}
                                index={i}
                                {...step}
                                scrollYProgress={scrollYProgress}
                            />
                        ))}
                    </div>

                    {/* RIGHT COLUMN: Visuals */}
                    <div className="w-full lg:w-1/2 h-1/2 lg:h-full relative">
                        {steps.map((step, i) => (
                            <VisualBlock
                                key={i}
                                index={i}
                                {...step}
                                scrollYProgress={scrollYProgress}
                            />
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
