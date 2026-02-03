import React from 'react';
import HeroSection from './HeroSection';
import { ClipboardCheckIcon, ShieldCheckIcon, UserCircleIcon, PhoneIcon } from './Icons';
import { View } from '../types';

interface MirevaPageProps {
  onNavigate: (view: View) => void;
}

const testTypes = [
    {
        title: "Comprehensive Wellness",
        tests: ["Full Blood Count (FBC)", "Lipid Profile", "Kidney Function Test", "Liver Function Test"],
        icon: "🔬",
        color: "bg-blue-50 text-blue-700"
    },
    {
        title: "Specialized Screening",
        tests: ["HBA1C (Diabetes)", "Thyroid Profile (T3, T4, TSH)", "Tumor Markers", "Hormonal Assay"],
        icon: "🧪",
        color: "bg-purple-50 text-purple-700"
    },
    {
        title: "Infection & Immunity",
        tests: ["Malaria Parasite", "Typhoid (Widal)", "COVID-19 PCR/Rapid", "Hepatitis Screening"],
        icon: "🛡️",
        color: "bg-green-50 text-green-700"
    },
    {
        title: "Molecular & DNA",
        tests: ["Paternity Testing", "Genotype (Hemoglobin)", "Viral Load Testing", "Allergy Panels"],
        icon: "🧬",
        color: "bg-indigo-50 text-indigo-700"
    }
];

const MirevaPage: React.FC<MirevaPageProps> = ({ onNavigate }) => {
    return (
        <div className="bg-white">
            <HeroSection
                title="Mireva Diagnostic Excellence"
                subtitle="Advanced laboratory services powered by Kingzy Pharmaceuticals. Precision diagnostics for a healthier you."
                imageUrl="https://res.cloudinary.com/dzbibbld6/image/upload/v1769976731/medical_lab_hephke.jpg"
            />
            
            <div className="container mx-auto px-4 py-20">
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <h2 className="text-4xl font-extrabold text-brand-dark mb-6">World-Class Diagnostic Solutions</h2>
                    <p className="text-gray-600 text-xl leading-relaxed">
                        At Mireva Diagnostics, we believe that accurate diagnosis is the cornerstone of effective healthcare. 
                        We utilize state-of-the-art automated systems to deliver fast, reliable, and precise results.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
                    <div className="relative group">
                        <img 
                            src="https://res.cloudinary.com/dzbibbld6/image/upload/v1769975052/kngzy_meriva_otvcrj.jpg" 
                            alt="Automated Lab Testing" 
                            className="rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]" 
                        />
                        <div className="absolute -bottom-6 -right-6 bg-brand-primary text-white p-6 rounded-xl shadow-xl hidden md:block">
                            <p className="text-2xl font-bold">99.9%</p>
                            <p className="text-xs uppercase font-semibold">Accuracy Rating</p>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center space-y-8">
                        <div className="flex items-start gap-4">
                            <div className="bg-brand-light p-3 rounded-lg"><ClipboardCheckIcon className="w-8 h-8 text-brand-primary"/></div>
                            <div>
                                <h3 className="text-xl font-bold text-brand-dark mb-2">Automated Processing</h3>
                                <p className="text-gray-600">Minimizing human error through advanced robotic sample handling and analysis.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-brand-light p-3 rounded-lg"><UserCircleIcon className="w-8 h-8 text-brand-primary"/></div>
                            <div>
                                <h3 className="text-xl font-bold text-brand-dark mb-2">Home Sample Collection</h3>
                                <p className="text-gray-600">Qualified phlebotomists can visit your home or office for painless sample extraction.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-brand-light p-3 rounded-lg"><ShieldCheckIcon className="w-8 h-8 text-brand-primary"/></div>
                            <div>
                                <h3 className="text-xl font-bold text-brand-dark mb-2">Digital Results Hub</h3>
                                <p className="text-gray-600">Access your reports securely through our online portal or get them delivered via WhatsApp/Email.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-24">
                    <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">Available Laboratory Tests</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {testTypes.map((type, idx) => (
                            <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="text-4xl mb-4">{type.icon}</div>
                                <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full inline-block ${type.color}`}>
                                    {type.title}
                                </h3>
                                <ul className="space-y-3">
                                    {type.tests.map((test, tidx) => (
                                        <li key={tidx} className="text-gray-600 text-sm flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-brand-secondary rounded-full"></div>
                                            {test}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-brand-dark rounded-3xl p-10 md:p-16 text-white flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-xl text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Book Your Test Today</h2>
                        <p className="text-brand-light/70 text-lg">Speak with our diagnostic coordinator to schedule your screening or request a home visit.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <button 
                            onClick={() => onNavigate({ name: 'contact' })}
                            className="bg-accent-green text-white font-bold py-4 px-8 rounded-full flex items-center justify-center gap-3 hover:bg-green-600 transition-colors"
                        >
                            <PhoneIcon className="w-6 h-6"/>
                            Call to Schedule
                        </button>
                        <button className="bg-brand-secondary text-white font-bold py-4 px-8 rounded-full hover:bg-opacity-90 transition-all">
                            View All Price List
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MirevaPage;