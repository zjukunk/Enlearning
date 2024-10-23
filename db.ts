import mysql from 'mysql2';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '588614cax051311',
  database: 'enlearning'
});

export default pool.promise();