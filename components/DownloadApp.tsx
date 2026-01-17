
import React from 'react';

const DownloadApp: React.FC = () => {
    return (
        <section className="bg-brand-primary">
            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row items-center justify-center text-center md:text-left gap-8">
                    <div className="md:w-1/2">
                         <h2 className="text-3xl font-bold text-white mb-4">Download the Kingzy Pharma App</h2>
                         <p className="text-brand-light mb-6">Get access to exclusive deals, manage your prescriptions, and get your medicines delivered faster. Your pharmacy, in your pocket.</p>
                         <div className="flex justify-center md:justify-start space-x-4">
                            <a href="#" aria-label="Download on the App Store">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-12" />
                            </a>
                             <a href="#" aria-label="Get it on Google Play">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-12" />
                            </a>
                         </div>
                    </div>
                     <div className="md:w-1/3 flex justify-center">
                        <img 
                            src="https://res.cloudinary.com/dzbibbld6/image/upload/v1768673680/kingzyapp2_chy5xk.jpg"
                            alt="Mobile App Screenshot"
                            className="w-64 h-auto"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default DownloadApp;