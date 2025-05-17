import React from 'react';

const LoanRequirements = () => {
    const requirements = [
        {
            title: "Requirements for Financing",
            items: [
                "2 Valid I.D",
                "Bank Statement / Gcash Statement",
                "Proof of Billing",
                "COE or Payslip - if Employed",
                "Business Permit or DTI - if with Business"
            ]
        }
    ];

    const freebies = [
        {
            title: "Freebies",
            items: [
                "Free Transfer of Ownership",
                "Free Detailing - Exterior and Interior",
                "Free Registration LTO Insurance and Notarial Fee",
                "Free Dashcam",
                "Free Leather key holder",
                "Free Matting",
                "Free Brand-New Battery"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        {requirements[0].title}
                    </h2>
                    <ul className="space-y-3">
                        {requirements[0].items.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <svg 
                                    className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth="2" 
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span className="text-gray-600">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        {freebies[0].title}
                    </h2>
                    <ul className="space-y-3">
                        {freebies[0].items.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <svg 
                                    className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth="2" 
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span className="text-gray-600">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default LoanRequirements;