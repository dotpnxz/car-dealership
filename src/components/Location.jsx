import React from 'react';

const Location = () => {
  return (
    <div id="location" className="w-full min-h-screen bg-gray-200 py-16">
      <div className="max-w-[1240px] mx-auto px-8">
        <h2 className="text-5xl font-bold text-center mb-12">OUR LOCATION</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map Section */}
          <div className="w-full">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3856.7781000836326!2d120.2873001757765!3d14.837706871226246!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x339670fdbe9762f9%3A0x4850c8475104a86f!2s19%20Ramos%20St%2C%20Olongapo%2C%20Zambales!5e0!3m2!1sen!2sph!4v1741700764776!5m2!1sen!2sph" 
              width="100%" 
              height="450" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg shadow-lg"
            />
          </div>

          {/* Address Information */}
          <div className="bg-gray-100 p-8 rounded-lg shadow-lg">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold text-red-600">Full Address:</h3>
                <p className="text-xl mt-2">W-19 ramos st West bajac bajac, Olongapo, Philippines</p>
              </div>
              
              <div>
                <h3 className="text-2xl font-semibold text-red-600">Landmark:</h3>
                <p className="text-xl mt-2">near Victory Liner Terminal</p>
              </div>
              
              <div>
                <h3 className="text-2xl font-semibold text-red-600">Need Help Finding Us?</h3>
                <p className="text-xl mt-2">Call us at +63 962 123 4321</p>
              </div>
              
              <div>
                <h3 className="text-2xl font-semibold text-red-600">Business Hours:</h3>
                <div className="text-xl mt-2">
                  <p>Monday - Saturday: 8:00 AM - 5:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Location; 