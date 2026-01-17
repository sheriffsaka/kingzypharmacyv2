
import React from 'react';
import { Profile } from '../types';

interface WholesaleDashboardProps {
  profile: Profile;
}

const WholesaleDashboard: React.FC<WholesaleDashboardProps> = ({ profile }) => {
  const isApproved = profile.approval_status === 'approved';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-brand-dark mb-6">Wholesale Buyer Area</h1>
      <div className={`p-6 rounded-lg shadow-md ${isApproved ? 'bg-green-100' : 'bg-yellow-100'}`}>
        <h2 className="text-xl font-semibold mb-2">Account Status: <span className="capitalize">{profile.approval_status}</span></h2>
        
        {isApproved ? (
          <div>
            <p className="text-green-800">
              Welcome! Your account has been approved. You can now access wholesale pricing and features.
            </p>
            {/* You would list wholesale-specific products or features here */}
          </div>
        ) : (
          <p className="text-yellow-800">
            Your application is currently pending review. An administrator will approve your account shortly. Please check back later.
          </p>
        )}
      </div>
    </div>
  );
};

export default WholesaleDashboard;
