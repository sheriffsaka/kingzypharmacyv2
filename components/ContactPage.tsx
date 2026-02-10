import React, { useState } from 'react';
import HeroSection from './HeroSection';
import { PhoneIcon, MailIcon, LocationMarkerIcon } from './Icons';

const ContactPage: React.FC = () => {
    const [formState, setFormState] = useState({ name: '', email: '', message: '' });
    const [formMessage, setFormMessage] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // This is a UI-only demonstration. In a real app, you would handle form submission here.
        setFormMessage('Thank you for your message! We will get back to you shortly.');
        setFormState({ name: '', email: '', message: '' });
    };

    return (
        <div className="bg-white">
            <HeroSection 
                title="Get In Touch"
                subtitle="We're here to help. Contact us with any questions or concerns, and our team will get back to you as soon as possible."
                imageUrl="https://res.cloudinary.com/dzbibbld6/image/upload/v1768765666/contactbanner_vrn0dc.jpg"
            />
            
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Contact Info */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-gray-50 p-6 rounded-lg shadow-sm border flex items-start gap-4">
                                <PhoneIcon className="w-8 h-8 text-brand-primary mt-1" />
                                <div>
                                    <h3 className="text-xl font-semibold">Call Us</h3>
                                    <p className="text-gray-600">Our team is available from 9am-5pm, Mon-Fri.</p>
                                    <a href="tel:+2348059013884" className="block text-brand-primary font-bold hover:underline">+234 805 901 3884</a>
                                    <a href="tel:+2348034946900" className="block text-brand-primary font-bold hover:underline">+234 803 494 6900</a>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-lg shadow-sm border flex items-start gap-4">
                                <MailIcon className="w-8 h-8 text-brand-primary mt-1" />
                                <div>
                                    <h3 className="text-xl font-semibold">Email Us</h3>
                                    <p className="text-gray-600">Send us your questions anytime.</p>
                                    <a href="mailto:support@kingzypharma.com" className="text-brand-primary font-bold hover:underline">support@kingzypharma.com</a>
                                </div>
                            </div>
                             <div className="bg-gray-50 p-6 rounded-lg shadow-sm border flex items-start gap-4">
                                <LocationMarkerIcon className="w-8 h-8 text-brand-primary mt-1" />
                                <div>
                                    <h3 className="text-xl font-semibold">Our Office</h3>
                                    <p className="text-gray-600">Kingzy Foundation Complex,<br />100 Ahoada East - West Road,<br/>Rumudara, Port Harcourt,<br/>Rivers State, Nigeria.</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="md:col-span-1 lg:col-span-2 bg-white p-8 rounded-lg shadow-md border">
                            <h2 className="text-2xl font-bold text-brand-dark mb-6">Send Us a Message</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="sr-only">Your Name</label>
                                    <input type="text" name="name" id="name" placeholder="Your Name" required value={formState.name} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary"/>
                                </div>
                                 <div>
                                    <label htmlFor="email" className="sr-only">Your Email</label>
                                    <input type="email" name="email" id="email" placeholder="Your Email" required value={formState.email} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary"/>
                                </div>
                                <div>
                                    <label htmlFor="message" className="sr-only">Your Message</label>
                                    <textarea name="message" id="message" placeholder="Your Message" rows={5} required value={formState.message} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary"></textarea>
                                </div>
                                <button type="submit" className="w-full bg-brand-primary text-white font-bold py-3 px-6 rounded-md hover:bg-brand-primary/90 transition-colors">
                                    Send Message
                                </button>
                                {formMessage && <p className="text-center text-green-600 mt-4">{formMessage}</p>}
                            </form>
                        </div>
                    </div>
                </div>
            </section>

             <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-brand-dark mb-4">Our Location</h2>
                    <div className="relative h-96 rounded-lg shadow-lg overflow-hidden border">
                         <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15902.94931221194!2d6.983945637213327!3d4.85501819500055!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1069d51e06497e61%3A0x1359a35b43695279!2sRumudara%2C%20Port%20Harcourt!5e0!3m2!1sen!2sng!4v1770123456789!5m2!1sen!2sng"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen={false}
                            loading="lazy"
                            title="Office Location Map"
                            className="absolute inset-0">
                        </iframe>
                    </div>
                </div>
             </section>
        </div>
    );
};

export default ContactPage;