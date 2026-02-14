import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-slate-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left hover:text-indigo-600 transition-colors"
            >
                <span className="text-lg font-semibold text-slate-900">{question}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-slate-600 leading-relaxed">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FAQ = () => {
    const faqs = [
        {
            question: "How long does it take to train the AI?",
            answer: "Blitsum connects to your website and learns your product in minutes. You can fine-tune its responses, but the baseline knowledge base is created almost instantly."
        },
        {
            question: "Can I take over the conversation manually?",
            answer: "Absolutely. Blitsum has a 'Human Handoff' mode. You can monitor chats in real-time and jump in whenever you want. The AI will gracefully step back."
        },
        {
            question: "Does it work with my existing CRM?",
            answer: "Yes, we integrate natively with Salesforce, HubSpot, Pipedrive, and many others. Leads captured by Blitsum are automatically pushed to your CRM."
        },
        {
            question: "Is my data secure?",
            answer: "Security is our priority. We are SOC 2 compliant and use bank-grade encryption for all data storage and transmission."
        }
    ];

    return (
        <section className="py-24 bg-slate-50">
            <div className="max-w-3xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">Common Questions</h2>
                    <p className="text-lg md:text-xl text-slate-500 font-light leading-relaxed">Everything you need to know about the product and billing.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    {faqs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
