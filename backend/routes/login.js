import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import axios from 'axios';
import session from 'express-session';
import pool from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth` +
              `?client_id=${process.env.GOOGLE_CLIENT_ID}` +
              `&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}` +
              `&response_type=code` +
              `&scope=email profile` +
              `&access_type=offline` +
              `&prompt=consent`;

  res.redirect(url);
});

router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  console.log(`OAuth code: ${code}`);

  try {
    // 1. Access Token 요청
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    const accessToken = tokenResponse.data.access_token;

    // 2. 사용자 정보 요청
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const { email, name } = userInfoResponse.data;
    console.log(`Google user info: ${name} (${email})`);

    // 3. DB 사용자 존재 여부 확인 및 삽입
    const [rows] = await pool.promise().query('SELECT * FROM user WHERE email = ?', [email]);

    if (rows.length === 0) {
      await pool.query('INSERT INTO user (email, name) VALUES (?, ?)', [email, name]);
      console.log(`New user added: ${name} (${email})`);
    } else {
      console.log(`User already exists: ${name} (${email})`);
    }

    // 4. 세션 저장
    req.session.user = { email, name };
    console.log(`로그인 성공: ${email}`);

    res.redirect('/');
  } catch (error) {
    console.error('Error during Google OAuth:', error.response?.data || error.message);
    res.redirect('/?error=' + encodeURIComponent('OAuth 에러'));
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('로그아웃 중 오류');
    }
    console.log('로그아웃 성공');
    res.redirect('/');
  });
});

router.get('/info', (req, res) => {
  if (req.session.user) {
    console.log('유저 정보 전달 완료:', req.session.user);
    res.json(req.session.user);
  } else {
    console.log('로그인 안됨');
    res.status(404).json({ message: '로그인되지 않음' });
  }
});

export default router;
