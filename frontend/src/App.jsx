import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import { UserProvider } from './contexts/UserContext';

import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import Spinner from './components/Spinner';
import { ensureAppCheck } from './services/firebase';

const Decision = lazy(() => import('./pages/Decision'));
const Login = lazy(() => import('./pages/Login'));
const MyDecisions = lazy(() => import('./pages/MyDecisions'));
const MagicHandler = lazy(() => import('./pages/MagicHandler'));
const LegalPage = lazy(() => import('./pages/LegalPage'));

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const version = typeof __APP_VERSION__ !== 'undefined' ? 'v' + __APP_VERSION__ : 'v0.0.0';
    const mode = import.meta.env.MODE || 'production';
    const stage = mode === 'production' ? '' : ' (' + mode + ')';
    document.title = 'Decide-O-Mat: ' + version + stage + ' - Group decisions made easy!';

    const initAppCheck = async () => {
      await ensureAppCheck();
      setIsReady(true);
    };
    initAppCheck();
  }, []);

  if (!isReady) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Initializing Security...</div>;
  }

  return (
    <UserProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header />
          <div style={{ flex: 1 }}>
            <Suspense fallback={
              <div style={{ padding: '4rem', textAlign: 'center' }}>
                <Spinner size="lg" color="var(--color-primary)" />
              </div>
            }>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/d/:id" element={<Decision />} />
                <Route path="/login" element={<Login />} />
                <Route path="/my-decisions" element={<MyDecisions />} />
                <Route path="/magic" element={<MagicHandler />} />
                <Route path="/legal/:section" element={<LegalPage />} />
              </Routes>
            </Suspense>
          </div>
          <Footer />
          <CookieConsent />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
