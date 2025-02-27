import React from 'react'
import Navbar from './components/Navbar';
import Home from './components/Home';
import Collection from './components/Collection';
import Sell from './components/Sell';
import AboutUs from './components/AboutUs';

const App = () => {
  return (
    <div>
    <Navbar />
    <Home />
    <Collection />
    <Sell />
    <AboutUs />
   </div>
    
  )
}

export default App