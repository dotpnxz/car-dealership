import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Location = () => {
  const position = [14.8297, 120.2828]; // Olongapo, Philippines coordinates

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Our Location</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* OpenStreetMap */}
        <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg relative">
          <MapContainer
            center={position}
            zoom={15}
            scrollWheelZoom={false}
            style={{ height: '400px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup>
                <div className="text-center">
                  <h3 className="font-bold">MJ-AUTOLOVE</h3>
                  <p>W-19 ramos st West bajac bajac,<br />Olongapo, Philippines</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* Address Information */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Visit Us</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Full Address:</h3>
              <p className="text-gray-600">
                W-19 ramos st West bajac bajac, Olongapo, Philippines
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Landmark:</h3>
              <p className="text-gray-600">near Victory Liner Terminal</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Need Help Finding Us?</h3>
              <p className="text-gray-600">Call us at +63 962 123 4321</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Location; 