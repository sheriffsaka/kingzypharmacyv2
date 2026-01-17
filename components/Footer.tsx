
import React from 'react';
import { FacebookIcon, TwitterIcon, InstagramIcon, LinkedInIcon } from './Icons';

const Footer: React.FC = () => {
    return (
        <footer className="bg-brand-dark text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    {/* Company */}
                    <div className="col-span-2 md:col-span-4 lg:col-span-1">
                         <div className="flex items-center mb-4">
                            <div className="bg-white rounded-full p-1 mr-2 shadow-sm">
                                <img src="https://res.cloudinary.com/dzbibbld6/image/upload/v1768670962/kingzylogo_rflzr9.png" alt="Kingzy Pharmaceuticals Logo" className="h-10" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">Kingzy Pharmaceuticals</h1>
                        </div>
                        <p className="text-gray-400">Your trusted partner in health and wellness. Providing quality pharmaceuticals since 2024.</p>
                    </div>

                    {/* Featured Categories */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">Featured Categories</h3>
                        <ul className="space-y-2 text-gray-300">
                            <li><a href="#" className="hover:text-brand-secondary transition-colors">Pain Relief</a></li>
                            <li><a href="#" className="hover:text-brand-secondary transition-colors">Vitamins</a></li>
                            <li><a href="#" className="hover:text-brand-secondary transition-colors">Allergy & Hay Fever</a></li>
                            <li><a href="#" className="hover:text-brand-secondary transition-colors">Digestive Health</a></li>
                        </ul>
                    </div>

                    {/* Need Help */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">Need Help</h3>
                        <ul className="space-y-2 text-gray-300">
                            <li><a href="#" className="hover:text-brand-secondary transition-colors">Contact Us</a></li>
                            <li><a href="#" className="hover:text-brand-secondary transition-colors">FAQs</a></li>
                            <li><a href="#" className="hover:text-brand-secondary transition-colors">Shipping Information</a></li>
                            <li><a href="#" className="hover:text-brand-secondary transition-colors">Returns Policy</a></li>
                        </ul>
                    </div>

                    {/* Policy Info */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">Policy Info</h3>
                        <ul className="space-y-2 text-gray-300">
                            <li><a href="#" className="hover:text-brand-secondary transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-brand-secondary transition-colors">Terms of Use</a></li>
                            <li><a href="#" className="hover:text-brand-secondary transition-colors">Cookie Policy</a></li>
                        </ul>
                    </div>

                    {/* Follow Us */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">Follow Us</h3>
                        <div className="flex space-x-4">
                            <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-white transition-colors"><FacebookIcon className="h-6 w-6" /></a>
                            <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-white transition-colors"><TwitterIcon className="h-6 w-6" /></a>
                            <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-white transition-colors"><InstagramIcon className="h-6 w-6" /></a>
                             <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-white transition-colors"><LinkedInIcon className="h-6 w-6" /></a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-black bg-opacity-20 py-4">
                <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} Kingzy Pharmaceuticals Ltd. All Rights Reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;