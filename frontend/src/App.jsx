import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/home'; // Home 컴포넌트
import Login from './pages/login'; // Login 컴포넌트
import Lecture from './pages/lecture'; // Lecture 컴포넌트
import './App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/course" element={<Lecture />} />
      </Routes>
    </Router>
  );
};

export default App;
