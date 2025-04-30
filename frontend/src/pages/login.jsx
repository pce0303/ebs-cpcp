// src/pages/login.jsx
import React from 'react';

const Login = () => {
  const handleGoogleLogin = () => {
    const apiURL = 'http://localhost:3000/auth';
    window.location.href = `${apiURL}`
  };

  return (
    <div>
      <h2>로그인 페이지</h2>
      <button onClick={handleGoogleLogin}>구글 로그인</button>
    </div>
  );
};

export default Login;
