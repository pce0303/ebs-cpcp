import mysql from 'mysql2';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '0303',
  database: 'application',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to the MySQL database.');
});

export default db;