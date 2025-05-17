import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Guide = () => {
    const [openSection, setOpenSection] = useState(null);

    const menuData = {
        'Explore Vehicles': {
            links: [
                { title: 'Hatchbacks & Sedans', path: '/collection' },
                { title: 'Crossovers & SUVs', path: '/collection' },
                { title: 'MPVs', path: '/collection' },
                { title: 'Vans & Pick-ups', path: '/collection' },
                { title: 'Electrified', path: '/collection' },
                { title: 'Gazoo Racing', path: '/collection' }
            ]
        },
        'Buying Guide': {
            links: [
                { title: 'Price List', path: '/collection' },
                { title: 'Payment Calculator', path: '/collection' },
                { title: 'Loan Requirements', path: '/loan-requirements' },
                { title: 'How To Avail', path: '/avail-process' } // Add this new link
            ]
        },
        'Discover MJ-AUTOLOVE': {
            links: [
                { title: 'Company Profile', path: '/about' },
                { title: 'Sustainability', path: '/about' },
            ]
        }
    };

    return (
        <div className="w-full">
            {/* Desktop View */}
            <div className="hidden lg:block bg-white">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-5 gap-8">
                        {Object.entries(menuData).map(([section, { links }]) => (
                            <div key={section}>
                                <h2 className="font-bold text-lg mb-4">{section}</h2>
                                <ul className="space-y-2">
                                    {links.map((link, index) => (
                                        <li key={index}>
                                            <Link 
                                                to={link.path}
                                                className="text-gray-600 hover:text-red-600"
                                            >
                                                {link.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden bg-white">
                {Object.entries(menuData).map(([section, { links }]) => (
                    <div key={section} className="border-b">
                        <button
                            onClick={() => setOpenSection(openSection === section ? null : section)}
                            className="w-full px-4 py-4 flex justify-between items-center"
                        >
                            <span className="font-semibold">{section}</span>
                            <span className={`transform transition-transform ${openSection === section ? 'rotate-180' : ''}`}>
                                ▼
                            </span>
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${openSection === section ? 'max-h-[500px]' : 'max-h-0'}`}>
                            <div className="px-4 py-2 bg-gray-50">
                                {links.map((link, index) => (
                                    <Link
                                        key={index}
                                        to={link.path}
                                        className="block py-2 text-gray-600 hover:text-red-600"
                                    >
                                        {link.title}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Guide;
