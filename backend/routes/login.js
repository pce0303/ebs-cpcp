import express from 'express';
import axios from 'axios';
import session from 'express-session';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.use(session({
  secret: process.env.SESSION_SECRET || 'session-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

router.get('/login', (req, res) => {
  let url = `https://accounts.google.com/o/oauth2/v2/auth`;
  url += `?client_id=${process.env.GOOGLE_CLIENT_ID}`;
  url += `&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}`;
  url += `&response_type=code`;
  url += `&scope=email profile`;
  res.redirect(url);
});

router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  console.log(`code: ${code}`);
  
  try {
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    const accessToken = tokenResponse.data.access_token;

    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    req.session.user = userInfoResponse.data;
    console.log(`User Info:`, userInfoResponse.data);

    console.log('로그인 성공');
    res.redirect('/');
  } catch (error) {
    console.error('Error retrieving access token:', error.response ? error.response.data : error.message);
    res.redirect('/?error=' + encodeURIComponent('Error retrieving access token'));
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('로그아웃 중 오류');
    }
    console.log('로그아웃 성공');
    res.redirect('/');
  });
});

router.get('/info', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
    console.log('유저 정보 전달 완료');
  } else {
    res.status(404).json({ message: '로그인되지 않음' });
  }
});

export default router;
