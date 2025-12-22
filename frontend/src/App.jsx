import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Decision from './pages/Decision';
import { UserProvider } from './contexts/UserContext';

import Header from './components/Header';
import Login from './pages/Login';
import Footer from './components/Footer';
import MyDecisions from './pages/MyDecisions';
import MagicHandler from './pages/MagicHandler';

function App() {
  useEffect(() => {
    const version = "1.4.1";
    // Check various env naming conventions or defaults
    const mode = import.meta.env.MODE || 'production';
    const stage = mode === 'production' ? '' : ` (${mode})`;
    document.title = `Decide-O-Mat: ${version}${stage} - Group decisions made easy !`;
  }, []);

  return (
    <UserProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header />
          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/d/:id" element={<Decision />} />
              <Route path="/login" element={<Login />} />
              <Route path="/my-decisions" element={<MyDecisions />} />
              <Route path="/magic" element={<MagicHandler />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
