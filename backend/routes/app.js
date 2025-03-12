import express from 'express';
import path from 'path';
import loginRouter from './login';
import planRouter from './plans';

const PORT = 3000;
const __dirname = path.resolve();

app.use('/api/login', loginRouter);
app.use('/api/plans', planRouter);

app.use(express.static(path.join(__dirname, '../../frontend/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
