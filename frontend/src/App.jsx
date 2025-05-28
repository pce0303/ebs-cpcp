import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/home';
import Recommendations from './pages/recommendations';
import Plan from './pages/plan';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/plan" element={<Plan />} />
      </Routes>
    </Router>
  );
};

export default App;
