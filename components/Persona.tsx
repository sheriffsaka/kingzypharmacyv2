
import React from 'react';

interface PersonaProps {
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
}

const Persona: React.FC<PersonaProps> = ({ name, title, bio, imageUrl }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center transform hover:-translate-y-2 transition-transform duration-300">
      <img 
        src={imageUrl} 
        alt={`Portrait of ${name}`} 
        className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-brand-light shadow-sm"
      />
      <h3 className="text-xl font-bold text-brand-dark">{name}</h3>
      <p className="text-brand-secondary font-semibold mb-2">{title}</p>
      <p className="text-gray-600 text-sm">{bio}</p>
    </div>
  );
};

export default Persona;
