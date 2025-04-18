import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Collection from './components/Collection';
import Sell from './components/Sell';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import BookVisit from './components/BookVisit';
import Location from './components/Location';
import Footer from './components/Footer';
import ReserveNow from './components/reservenow'; // Fixed import
import Recommendation from './components/recommendation'; 
import RegistrationForm from './components/RegistrationForm'; 
import LoginForm from './components/LoginForm'; 
const MainContent = () => {
  const location = useLocation();

  React.useEffect(() => {
    const section = location.pathname.slice(1) || 'home';
    const element = document.getElementById(section);
    if (element) {
      const navbarHeight = 128; // 8rem = 128px
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  }, [location]);

  return (
    <main className="flex-grow">
      <Routes>
        <Route path="/book-visit" element={<BookVisit />} />
        <Route path="/reservenow" element={<ReserveNow />} />
        <Route path="/recommendation" element={<Recommendation />} />
        <Route path="/RegistrationForm" element={<RegistrationForm />} />
        <Route path="/LoginForm" element={<LoginForm />} />
        <Route path="*" element={
          <>
            <Home />
            <Collection />
            <Sell />
            <AboutUs />
            <Location />
            <ContactUs />
          </>
        } />
      </Routes>
    </main>
  );
};

const App = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Router>
        <Navbar />
        <MainContent />
        <Footer />
      </Router>
    </div>
  );
};

export default App;
