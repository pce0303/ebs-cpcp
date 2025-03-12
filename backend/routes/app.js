import express from 'express';
import path from 'path';
import loginRouter from './login';

const PORT = 3000;
const __dirname = path.resolve();

app.use('/login', loginRouter);

app.use(express.static(path.join(__dirname, '../../frontend/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
