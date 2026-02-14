import React from 'react';
import logo from '../assets/logo.svg';

const Footer = () => {
    return (
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 py-12 px-6">
            <div className="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                {/* Brand */}
                <div className="md:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <img src={logo} alt="Blitsum Logo" className="h-6 w-auto opacity-90 invert" />
                        <span className="font-bold text-lg text-white">Blitsum</span>
                    </div>
                    <p className="text-sm text-slate-500 max-w-xs">
                        The AI Sales Executive that works 24/7 to convert your website traffic into revenue.
                    </p>
                </div>

                {/* Links */}
                <div>
                    <h4 className="font-bold text-white mb-4">Product</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-white mb-4">Company</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-white mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-[1240px] mx-auto border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
                <p>&copy; {new Date().getFullYear()} Blitsum Inc. All rights reserved.</p>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <a href="https://x.com/Blitsum" className="hover:text-white transition-colors">X</a>
                    <a href="https://www.linkedin.com/company/blitsum" className="hover:text-white transition-colors">LinkedIn</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
