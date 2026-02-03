
import React from 'react';
import HeroSection from './HeroSection';

const TermsAndConditionsPage: React.FC = () => {
    return (
        <div className="bg-white">
            <HeroSection
                title="Terms and Conditions"
                subtitle="Please read our terms and conditions carefully before using our services."
                imageUrl="https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=1470"
            />

            <section className="py-16">
                <div className="container mx-auto px-4 max-w-4xl prose lg:prose-lg text-gray-700">
                    <h2 className="text-brand-dark">1. Introduction</h2>
                    <p>
                        Welcome to Kingzy Pharmaceuticals. These terms and conditions outline the rules and regulations for the use of
                        Kingzy Pharmaceuticals's Website, located at this domain. By accessing this website, we assume you accept
                        these terms and conditions. Do not continue to use Kingzy Pharmaceuticals if you do not agree to take all of the
                        terms and conditions stated on this page.
                    </p>

                    <h2 className="text-brand-dark">2. User Accounts</h2>
                    <p>
                        When you create an account with us, you must provide us with information that is accurate, complete, and
                        current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate
                        termination of your account on our Service. You are responsible for safeguarding the password that you use to
                        access the Service and for any activities or actions under your password.
                    </p>

                    <h2 className="text-brand-dark">3. Orders and Payments</h2>
                    <p>
                        By placing an order on our platform, you warrant that you are legally capable of entering into binding
                        contracts. All orders are subject to availability and confirmation of the order price. For prescription
                        medications, you may be required to provide a valid prescription, and our pharmacists reserve the right to
                        verify this information. Payment must be made in full before dispatch of the goods, unless 'Pay on Delivery'
                        is selected and available for your order.
                    </p>

                    <h2 className="text-brand-dark">4. Intellectual Property</h2>
                    <p>
                        The Service and its original content, features, and functionality are and will remain the exclusive property of
                        Kingzy Pharmaceuticals and its licensors. The Service is protected by copyright, trademark, and other laws of
                        both Nigeria and foreign countries. Our trademarks and trade dress may not be used in connection with any
                        product or service without the prior written consent of Kingzy Pharmaceuticals.
                    </p>

                    <h2 className="text-brand-dark">5. Limitation of Liability</h2>
                    <p>
                        In no event shall Kingzy Pharmaceuticals, nor its directors, employees, partners, agents, suppliers, or
                        affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including
                        without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your
                        access to or use of or inability to access or use the Service. The information provided by our AI Assistant
                        is for informational purposes only and is not a substitute for professional medical advice.
                    </p>
                    
                    <h2 className="text-brand-dark">6. Governing Law</h2>
                    <p>
                        These Terms shall be governed and construed in accordance with the laws of the Federal Republic of Nigeria,
                        without regard to its conflict of law provisions. Our failure to enforce any right or provision of these
                        Terms will not be considered a waiver of those rights.
                    </p>

                    <h2 className="text-brand-dark">7. Changes to Terms</h2>
                    <p>
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision
                        is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What
                        constitutes a material change will be determined at our sole discretion.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default TermsAndConditionsPage;
