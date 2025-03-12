import mysql from 'mysql2';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'your_database',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to the MySQL database.');
});

export default db;