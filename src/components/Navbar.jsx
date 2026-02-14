import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToWaitlist = async () => {
        if (location.pathname !== '/') {
            await navigate('/');
            setTimeout(() => {
                const waitlistForm = document.getElementById("waitlist-form");
                if (waitlistForm) {
                    waitlistForm.scrollIntoView({ behavior: "smooth" });
                }
            }, 100);
        } else {
            const waitlistForm = document.getElementById("waitlist-form");
            if (waitlistForm) {
                waitlistForm.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    return (
        <nav className={`fixed z-50 transition-all duration-300 ease-in-out flex items-center justify-between px-6 left-1/2 -translate-x-1/2
            ${isScrolled
                ? "top-4 w-[95%] max-w-[1240px] h-16 bg-white/70 backdrop-blur-xl border border-white/40 shadow-sm rounded-full"
                : "top-0 w-full h-16 bg-transparent border-b border-transparent rounded-none"
            }`}
        >
            <div className="w-full max-w-[1240px] mx-auto flex items-center justify-between relative">
                <Link to="/" className="flex items-center gap-2">
                    <img src={logo} alt="Blitsum Logo" className="h-8 w-auto" />
                    <span className="font-bold text-xl tracking-tight text-slate-900">Blitsum</span>
                </Link>

                {/* Center Nav - Pill Design (Absolute Center) */}
                <div className="hidden md:flex items-center bg-indigo-50/50 backdrop-blur-md rounded-full px-1.5 py-1.5 border border-indigo-100/50 absolute left-1/2 -translate-x-1/2">
                    <Link to="/" className="text-slate-500 hover:text-indigo-600 px-5 py-1.5 text-sm font-medium transition-colors">Home</Link>
                    <Link to="/about" className="text-slate-500 hover:text-indigo-600 px-5 py-1.5 text-sm font-medium transition-colors">About</Link>
                    <Link to="/" className="text-slate-500 hover:text-indigo-600 px-5 py-1.5 text-sm font-medium transition-colors">Blogs</Link>
                    <Link to="/" className="text-slate-500 hover:text-indigo-600 px-5 py-1.5 text-sm font-medium transition-colors">Tools</Link>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={scrollToWaitlist}
                        className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
                    >
                        Join Waitlist
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
