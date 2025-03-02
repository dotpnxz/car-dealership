import React from 'react'
import Navbar from './components/Navbar';
import Home from './components/Home';
import Collection from './components/Collection';
import Sell from './components/Sell';
import AboutUs from './components/AboutUs';
import Footer from './components/Footer';
import ContactUs from './components/ContactUs';

const App = () => {
  return (
    <div>
    <Navbar />
    <Home />
    <Collection />
    <Sell />
    <AboutUs />
    <ContactUs />
    <Footer />
    
   </div>
    
  )
}

export default App