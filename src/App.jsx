import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';

function App() {
  return (
    <Router>
      <main className="min-h-screen flex flex-col">
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </div>
        {/* Spacer to push content below fixed Navbar if needed, or handle in page css */}
        {/* We'll handle spacing in individual pages or globally if Navbar is fixed/sticky */}

        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>

        <Footer />
      </main>
    </Router>
  );
}

export default App;
