import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Decision from './pages/Decision';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/d/:id" element={<Decision />} />
      </Routes>
    </Router>
  );
}

export default App;
