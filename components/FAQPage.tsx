
import React, { useState } from 'react';
import HeroSection from './HeroSection';
import { ChevronDownIcon } from './Icons';

const faqData = [
  {
    question: "How do I place an order?",
    answer: "Browse our products, add items to your cart, and proceed to checkout. You will need to fill in your delivery details and choose a payment method to complete the order. An account is required to place an order."
  },
  {
    question: "What are the available payment options?",
    answer: "Currently, we offer a 'Pay on Delivery' option. You can pay with cash or card when your order arrives. Online payments via card and bank transfer will be available soon."
  },
  {
    question: "How long does delivery take?",
    answer: "Deliveries within Lagos typically take 1-2 business days. For other states, it may take 3-5 business days. You will be notified once your order is shipped."
  },
  {
    question: "Do I need a prescription for all medications?",
    answer: "Not all, but some medications are marked as 'Prescription Required'. For these items, our pharmacist may contact you to verify your prescription details before the order is processed. This is to ensure your safety and compliance with regulations."
  },
  {
    question: "How can I be sure the medicines are authentic?",
    answer: "We take authenticity very seriously. All our products are sourced directly from manufacturers and their authorized distributors. We guarantee that every product you receive is 100% genuine."
  },
  {
    question: "What is your return policy?",
    answer: "Due to the nature of pharmaceutical products, we do not accept returns on most items. However, if you receive a damaged or incorrect product, please contact our customer support within 24 hours of delivery, and we will resolve the issue."
  },
   {
    question: "How does wholesale purchasing work?",
    answer: "If you are a pharmacy, hospital, or licensed healthcare provider, you can register for a wholesale account. Once your account is approved by our admin team, you will gain access to exclusive bulk pricing tiers on our products."
  }
];

const AccordionItem: React.FC<{
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}> = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b">
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center text-left py-4 px-2"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-semibold text-brand-dark">{question}</span>
        <ChevronDownIcon className={`w-6 h-6 text-brand-primary transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
        <div className="p-4 bg-gray-50 text-gray-700">
          <p>{answer}</p>
        </div>
      </div>
    </div>
  );
};


const FAQPage: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="bg-white">
            <HeroSection 
                title="Frequently Asked Questions"
                subtitle="Have questions? We've got answers. Find what you're looking for below."
                imageUrl="https://images.unsplash.com/photo-1521737852577-6848d81b2123?q=80&w=1200"
            />
            <section className="py-16">
                <div className="container mx-auto px-4 max-w-3xl">
                    <div className="bg-white rounded-lg shadow-md border overflow-hidden">
                        {faqData.map((faq, index) => (
                            <AccordionItem 
                                key={index}
                                question={faq.question}
                                answer={faq.answer}
                                isOpen={openIndex === index}
                                onClick={() => handleToggle(index)}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FAQPage;
