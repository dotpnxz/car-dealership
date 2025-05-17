import React from 'react';

const AvailProcess = () => {
    const steps = [
        {
            number: "1",
            title: "CHOOSE A UNIT",
            description: "Choose a unit that you want to get from us."
        },
        {
            number: "2",
            title: "RESERVATIONS",
            description: "We will ask for a reservation fee to hold the unit for you while we are processing your application thru our tie up Financing Company. Minimum of 10,000php and is DEDUCTIBLE from the DOWNPAYMENT."
        },
        {
            number: "3",
            title: "SUBMIT THE REQUIREMENTS",
            description: "Submit all the required documents to our webiste or office for verification and processing of your application with our financing partner."
        },
        {
            number: "4",
            title: "RELEASING",
            description: "We can only release the unit once the Credit Advice is already released from our tie up financing."
        }
    ];

    const processNote = "WHOLE PROCESS TAKES 1-7 BUSINESS DAYS DEPENDING ON HOW COOPERATIVE CLIENT IS.";

    return (
        <div className="min-h-screen bg-gray-100 py-4 sm:py-8 px-3 sm:px-6">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-8 px-2">
                    How to Avail Financing?
                </h1>

                <div className="space-y-4 sm:space-y-6">
                    {steps.map((step) => (
                        <div key={step.number} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <span className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-red-600 text-white rounded-full text-sm sm:text-base font-bold">
                                        {step.number}
                                    </span>
                                </div>
                                <div className="ml-3 sm:ml-4">
                                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 sm:mb-2">
                                        {step.title}
                                    </h2>
                                    <p className="text-sm sm:text-base text-gray-600">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6 mt-6 sm:mt-8">
                        <p className="text-center text-sm sm:text-base font-semibold text-yellow-800">
                            {processNote}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AvailProcess;